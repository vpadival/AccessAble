import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runScan } from './scanner.js';
import { toFrontendReport } from './transformers/toFrontendFormat.js';
import { approvedUrl, productionHosts } from './deployment-policy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const production = process.env.NODE_ENV === 'production';
const hosts = productionHosts();
if (production && (!hosts.length || !process.env.ALLOWED_ORIGINS)) throw new Error('Set SCAN_ALLOWED_HOSTS and ALLOWED_ORIGINS in production');
let activeScans = 0;
let lastScanAt = 0;

// In-memory store for accessibility scans
const scans = new Map();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(x=>x.trim()) || ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed'));
    },
    credentials: true,
  })
);
app.disable('x-powered-by');
app.use(express.json({limit:'16kb'}));

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------

/**
 * Health check
 * GET /api/v1/health
 */
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Request an accessibility scan
 * POST /api/v1/scans
 */
app.post('/api/v1/scans', (req, res) => {
  const { targetUrl, repoUrl = null, standard = 'WCAG 2.2 Level AA' } = req.body || {};

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({
      error: 'Invalid request: "targetUrl" string is required.',
    });
  }

  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).json({
      error: `Invalid URL format: "${targetUrl}". Please include protocol (e.g. http:// or https://).`,
    });
  }

  if (production && !approvedUrl(targetUrl, hosts)) return res.status(403).json({error:'Target is not an operator-approved HTTPS demo host'});
  if (activeScans >= 1 || (production && Date.now() - lastScanAt < 15000)) return res.status(429).json({error:'Scanner busy; retry shortly'});
  activeScans++;
  lastScanAt = Date.now();
  if (scans.size >= 100) {
    const oldest = [...scans].find(([,entry]) => entry.status !== 'scanning');
    if (oldest) scans.delete(oldest[0]);
  }
  const scanId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date().toISOString();

  // Initialize scan entry in in-memory store
  scans.set(scanId, {
    scanId,
    targetUrl,
    repoUrl,
    standard,
    status: 'scanning',
    createdAt: timestamp,
    rawAxeResult: null,
    frontendReport: null,
    agentJob: null,
    error: null,
  });

  // Immediately respond with 202 Accepted
  res.status(202).json({
    scanId,
    status: 'scanning',
    targetUrl,
    timestamp,
  });

  // Asynchronously execute scanner and transformations
  (async () => {
    const startTime = Date.now();
    try {
      console.log(`[Scanner] Started scan ${scanId} for: ${targetUrl}`);
      const rawAxeResult = await runScan(targetUrl, production ? { allowedHosts: hosts } : {});
      const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));

      // 1. Transform to frontend report
      const frontendReport = toFrontendReport(rawAxeResult, {
        scanId,
        targetUrl,
        repoUrl,
        standard,
        durationSeconds,
      });

      // 2. Transform to agent job format (40 zeros placeholder for baseCommit)
      const agentJob = null; // Audit URL alone does not authorize source repair.

      // Update in-memory store with completed result
      scans.set(scanId, {
        scanId,
        targetUrl,
        repoUrl,
        standard,
        status: 'completed',
        createdAt: timestamp,
        completedAt: new Date().toISOString(),
        durationSeconds,
        rawAxeResult,
        frontendReport,
        agentJob,
        error: null,
      });

      console.log(`[Scanner] Completed scan ${scanId} in ${durationSeconds}s`);
    } catch (err) {
      console.error(`[Scanner] Scan ${scanId} failed:`, err.message);
      const entry = scans.get(scanId);
      if (entry) {
        entry.status = 'failed';
        entry.error = err.message;
      }
    } finally { activeScans--; }
  })();
});

/**
 * Get scan details
 * GET /api/v1/scans/:scanId
 */
app.get('/api/v1/scans/:scanId', (req, res) => {
  const { scanId } = req.params;
  const entry = scans.get(scanId);

  if (!entry) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  if (entry.status === 'scanning') {
    return res.status(200).json({ scanId, status: 'scanning' });
  }

  if (entry.status === 'failed') {
    return res.status(200).json({ scanId, status: 'failed', error: entry.error });
  }

  // Completed status: return full frontend report + status
  return res.status(200).json({
    status: 'completed',
    ...entry.frontendReport,
  });
});

/**
 * Get fix comparison for a scan
 * GET /api/v1/scans/:scanId/fixes
 */
app.get('/api/v1/scans/:scanId/fixes', (req, res) => {
  const { scanId } = req.params;
  const entry = scans.get(scanId);

  if (!entry) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  if (entry.status === 'scanning') {
    return res.status(202).json({ scanId, status: 'scanning' });
  }

  if (entry.status === 'failed') {
    return res.status(200).json({ scanId, status: 'failed', error: entry.error });
  }

  const { metadata, summary, violations } = entry.frontendReport;
  const beforeStats = {
    score: summary.currentScore,
    totalViolations: summary.totalViolations,
    critical: summary.severityBreakdown.critical,
    serious: summary.severityBreakdown.serious,
    moderate: summary.severityBreakdown.moderate,
    minor: summary.severityBreakdown.minor,
    wcagAAPassRate: summary.wcagCompliance?.levelAA?.percentage ?? 0,
  };

  // Stub comparison: after is a shallow copy of before with 0 reduced violations
  const afterStats = {
    ...beforeStats,
    totalViolations: beforeStats.totalViolations,
  };

  return res.status(200).json({
    note: 'No fixes applied yet',
    comparison: {
      scanId,
      targetUrl: metadata.targetUrl,
      before: beforeStats,
      after: afterStats,
      improvementPercentage: 0,
      violationsResolved: 0,
      remainingViolations: summary.totalViolations,
      severityComparison: [
        { severity: 'Critical', before: beforeStats.critical, after: beforeStats.critical },
        { severity: 'Serious', before: beforeStats.serious, after: beforeStats.serious },
        { severity: 'Moderate', before: beforeStats.moderate, after: beforeStats.moderate },
        { severity: 'Minor', before: beforeStats.minor, after: beforeStats.minor },
      ],
      principlesComparison: (summary.principlesBreakdown || []).map((p) => ({
        principle: p.name,
        before: p.score,
        after: p.score,
      })),
    },
    violations,
  });
});

/**
 * Get all completed scans history
 * GET /api/v1/scans
 */
app.get('/api/v1/scans', (req, res) => {
  const completedScans = [];

  for (const entry of scans.values()) {
    if (entry.status === 'completed' && entry.frontendReport) {
      const { metadata, summary } = entry.frontendReport;
      completedScans.push({
        id: entry.scanId,
        url: metadata.targetUrl,
        score: summary.currentScore,
        violationsCount: summary.totalViolations,
        criticalCount: summary.severityBreakdown.critical,
        status: 'Completed',
        date: entry.createdAt,
        standard: metadata.standard,
      });
    }
  }

  // Sort newest first by date
  completedScans.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ scans: completedScans });
});

// Report endpoint uses the same completed evidence as scan details.
app.get('/api/v1/scans/:scanId/report', (req, res) => {
  const entry = scans.get(req.params.scanId);
  if (!entry) return res.status(404).json({error:'Scan not found'});
  if (entry.status !== 'completed') return res.status(entry.status === 'failed' ? 422 : 202).json({status:entry.status,error:entry.error});
  return res.json({status:'completed',...entry.frontendReport});
});

// Start server
app.listen(PORT, process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1'), () => {
  console.log(`AccessAble Backend API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});

export default app;
