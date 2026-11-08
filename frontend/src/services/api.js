/**
 * AccessAble API Service Layer & Data Transformation Adapters
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Single Source of Truth for all Network Communication.
 * 2. Strict Separation of Concerns: UI components never speak to HTTP endpoints
 *    nor do they parse raw backend payloads directly.
 * 3. Configurable Contract Adapters: Backend responses are normalized via
 *    transformer functions. When backend and frontend developers adjust the
 *    contract, modifications are confined exclusively to this file.
 * 4. Painless Mock-to-Production Transition: Switch between realistic mock data
 *    and real backend services via environment variables or runtime config.
 *
 * ============================================================================
 * PROPOSED API CONTRACT (v1)
 * ============================================================================
 *
 * 1. POST /api/v1/scans
 *    Request Body:
 *      {
 *        "targetUrl": "https://example.com",
 *        "repoUrl": "https://github.com/org/repo", // optional
 *        "standard": "WCAG 2.2 Level AA",
 *        "scanDepth": 15
 *      }
 *    Response (201/200):
 *      {
 *        "scanId": "scan-abc123",
 *        "status": "completed", // "queued" | "running" | "completed" | "failed"
 *        "targetUrl": "https://example.com",
 *        "timestamp": "2026-11-05T03:30:00Z"
 *      }
 *
 * 2. GET /api/v1/scans/:scanId
 *    Response (200):
 *      {
 *        "metadata": { "scanId", "targetUrl", "standard", "pagesScanned", "domNodesAudited", ... },
 *        "summary": { "currentScore", "totalViolations", "severityBreakdown", "principlesBreakdown", ... },
 *        "violations": [ { "id", "title", "severity", "wcagCriterion", "affectedHtml", "proposedFixHtml", ... } ]
 *      }
 *
 * 3. GET /api/v1/scans/:scanId/fixes
 *    Response (200):
 *      {
 *        "comparison": { "before": {...}, "after": {...}, "improvementPercentage": 38.2, ... },
 *        "violations": [ ... ]
 *      }
 *
 * 4. GET /api/v1/scans/:scanId/report
 *    Response (200):
 *      {
 *        "metadata": {...},
 *        "summary": {...},
 *        "violations": [...],
 *        "fixComparison": {...}
 *      }
 *
 * 5. GET /api/v1/scans
 *    Response (200):
 *      {
 *        "scans": [ { "id", "url", "score", "violationsCount", "criticalCount", "date", ... } ]
 *      }
 */

import {
  MOCK_SCAN_METADATA,
  MOCK_SUMMARY,
  MOCK_VIOLATIONS,
  MOCK_RECENT_SCANS,
  MOCK_FIX_COMPARISON,
  MOCK_SCANS_DB,
} from '../data/mockData.js';

// ============================================================================
// CONFIGURATION LAYER
// ============================================================================

export const API_CONFIG = {
  baseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  useMockData: import.meta.env?.VITE_ENABLE_MOCK_DATA === 'true',
  timeoutMs: Number(import.meta.env?.VITE_SCAN_TIMEOUT_MS) || 30000,
  endpoints: {
    scans: '/scans',
    scanById: (id) => `/scans/${encodeURIComponent(id)}`,
    scanFixes: (id) => `/scans/${encodeURIComponent(id)}/fixes`,
    scanReport: (id) => `/scans/${encodeURIComponent(id)}/report`,
    health: '/health',
  },
};

/**
 * Programmatic runtime configuration switcher.
 * Useful for switching mock/live modes in test suites or settings panels.
 */
export function configureApi(options = {}) {
  if (typeof options.useMockData === 'boolean') {
    API_CONFIG.useMockData = options.useMockData;
  }
  if (typeof options.baseUrl === 'string') {
    API_CONFIG.baseUrl = options.baseUrl;
  }
  if (typeof options.timeoutMs === 'number') {
    API_CONFIG.timeoutMs = options.timeoutMs;
  }
}

// ============================================================================
// DATA TRANSFORMATION / NORMALIZATION ADAPTERS
// (Shields UI components from backend schema changes)
// ============================================================================

/**
 * Normalizes a single accessibility violation record.
 * Handles both camelCase and snake_case backend keys gracefully.
 */
export function normalizeViolation(raw = {}) {
  return {
    id: raw.id || raw.violation_id || `VIOL-${Math.random().toString(36).substr(2, 6)}`,
    title: raw.title || raw.name || raw.summary || 'Unspecified Accessibility Violation',
    severity: (raw.severity || 'minor').toLowerCase(),
    wcagCriterion: raw.wcagCriterion || raw.wcag_criterion || raw.criterion || 'WCAG 2.2 Conformance',
    wcagLevel: raw.wcagLevel || raw.wcag_level || raw.level || 'AA',
    wcagVersion: raw.wcagVersion || raw.wcag_version || '2.2',
    principle: raw.principle || 'Operable',
    category: raw.category || raw.group || 'General',
    pageUrl: raw.pageUrl || raw.page_url || raw.target_url || '',
    elementSelector: raw.elementSelector || raw.element_selector || raw.selector || 'body',
    affectedHtml: raw.affectedHtml || raw.affected_html || raw.html || '<!-- Element not available -->',
    proposedFixHtml: raw.proposedFixHtml || raw.proposed_fix_html || raw.suggested_patch || raw.fix || '<!-- Suggested fix not available -->',
    explanation: raw.explanation || raw.impact_explanation || raw.description || 'No detailed barrier explanation provided.',
    recommendedSolution: raw.recommendedSolution || raw.recommended_solution || raw.remediation || 'Remediate element to comply with WCAG 2.2 standards.',
    impactScore: Number(raw.impactScore || raw.impact_score || 5),
    isApplied: Boolean(raw.isApplied || raw.is_applied || false),
    suggestedBy: raw.suggestedBy || raw.suggested_by || 'AccessAble Core Engine',
  };
}

/**
 * Normalizes scan metadata.
 */
export function normalizeMetadata(raw = {}) {
  return {
    isDemonstrationMockData: Boolean(raw.isDemonstrationMockData ?? API_CONFIG.useMockData),
    disclaimer: raw.disclaimer || 'AccessAble Accessibility Audit Data.',
    scanId: raw.scanId || raw.scan_id || 'scan-demo',
    timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
    targetUrl: raw.targetUrl || raw.target_url || 'https://shopflow-demo.store',
    repoUrl: raw.repoUrl || raw.repo_url || null,
    standard: raw.standard || raw.audit_standard || 'WCAG 2.2 Level AA',
    auditEngine: raw.auditEngine || raw.audit_engine || 'AccessAble Core',
    finalUrl: raw.finalUrl || raw.targetUrl || raw.target_url || '',
    readinessWarning: raw.readinessWarning || null,
    pagesScanned: Number(raw.pagesScanned || raw.pages_scanned || 1),
    domNodesAudited: Number(raw.domNodesAudited || raw.dom_nodes_audited || 100),
    durationSeconds: Number(raw.durationSeconds || raw.duration_seconds || 10),
  };
}

/**
 * Normalizes summary scoring metrics and breakdowns.
 */
export function normalizeSummary(raw = {}) {
  const defaultSeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const rawSev = raw.severityBreakdown || raw.severity_breakdown || defaultSeverity;

  const defaultCompliance = {
    levelA: { percentage: 0, passed: 0, total: 0 },
    levelAA: { percentage: 0, passed: 0, total: 0 },
    levelAAA: { percentage: 0, passed: 0, total: 0 },
  };

  return {
    currentScore: Number(raw.currentScore ?? raw.current_score ?? raw.score ?? 0),
    projectedScore: Number(raw.projectedScore ?? raw.projected_score ?? 90),
    scoreRating: raw.scoreRating || raw.score_rating || 'Audited',
    totalViolations: Number(raw.totalViolations ?? raw.total_violations ?? 0),
    severityBreakdown: {
      critical: Number(rawSev.critical ?? 0),
      serious: Number(rawSev.serious ?? 0),
      moderate: Number(rawSev.moderate ?? 0),
      minor: Number(rawSev.minor ?? 0),
    },
    wcagCompliance: raw.wcagCompliance || raw.wcag_compliance || defaultCompliance,
    principlesBreakdown: Array.isArray(raw.principlesBreakdown || raw.principles_breakdown)
      ? (raw.principlesBreakdown || raw.principles_breakdown).map((p) => ({
          name: p.name || 'Principle',
          score: Number(p.score ?? 0),
          violations: Number(p.violations ?? 0),
          maxScore: 100,
          passRate: Number(p.passRate ?? p.pass_rate ?? 0),
        }))
      : [],
    categoryBreakdown: Array.isArray(raw.categoryBreakdown || raw.category_breakdown)
      ? (raw.categoryBreakdown || raw.category_breakdown).map((c) => ({
          category: c.category || c.name || 'General',
          count: Number(c.count ?? 0),
        }))
      : [],
  };
}

/**
 * Normalizes fix comparison response.
 */
export function normalizeFixComparison(raw = {}) {
  const before = raw.before || {};
  const after = raw.after || {};

  return {
    scanId: raw.scanId || raw.scan_id || 'scan-latest',
    targetUrl: raw.targetUrl || raw.target_url || '',
    before: {
      score: Number(before.score ?? 68),
      totalViolations: Number(before.totalViolations ?? before.total_violations ?? 25),
      critical: Number(before.critical ?? 4),
      serious: Number(before.serious ?? 7),
      moderate: Number(before.moderate ?? 9),
      minor: Number(before.minor ?? 5),
      wcagAAPassRate: Number(before.wcagAAPassRate ?? before.wcag_aa_pass_rate ?? 64),
    },
    after: {
      score: Number(after.score ?? 94),
      totalViolations: Number(after.totalViolations ?? after.total_violations ?? 2),
      critical: Number(after.critical ?? 0),
      serious: Number(after.serious ?? 0),
      moderate: Number(after.moderate ?? 1),
      minor: Number(after.minor ?? 1),
      wcagAAPassRate: Number(after.wcagAAPassRate ?? after.wcag_aa_pass_rate ?? 96),
    },
    improvementPercentage: Number(raw.improvementPercentage ?? raw.improvement_percentage ?? 38.2),
    violationsResolved: Number(raw.violationsResolved ?? raw.violations_resolved ?? 23),
    remainingViolations: Number(raw.remainingViolations ?? raw.remaining_violations ?? 2),
    severityComparison: Array.isArray(raw.severityComparison || raw.severity_comparison)
      ? raw.severityComparison || raw.severity_comparison
      : [],
    principlesComparison: Array.isArray(raw.principlesComparison || raw.principles_comparison)
      ? raw.principlesComparison || raw.principles_comparison
      : [],
  };
}

/**
 * Normalizes recent scans list.
 */
export function normalizeRecentScans(rawList = []) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => ({
    id: item.id || item.scan_id || `scan-${Math.random().toString(36).substr(2, 6)}`,
    url: item.url || item.target_url || 'https://unknown.site',
    repo: item.repo || item.repo_url || 'manual-scan',
    score: Number(item.score ?? 0),
    violationsCount: Number(item.violationsCount ?? item.violations_count ?? 0),
    criticalCount: Number(item.criticalCount ?? item.critical_count ?? 0),
    status: item.status || 'Completed',
    date: item.date || item.created_at || 'Recently',
    standard: item.standard || 'WCAG 2.2 AA',
  }));
}

/**
 * Serializes scan initiation request payload for the backend.
 */
export function serializeScanPayload(uiInput = {}) {
  return {
    targetUrl: uiInput.targetUrl?.trim(),
    repoUrl: uiInput.repoUrl?.trim() || null,
    standard: uiInput.standard || 'WCAG 2.2 Level AA',
    scanDepth: Number(uiInput.depth || 15),
  };
}

// ============================================================================
// HTTP CLIENT HELPER
// ============================================================================

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ============================================================================
// PUBLIC API SERVICE FUNCTIONS
// ============================================================================

/**
 * 1. Request an Accessibility Audit Scan
 * @param {Object} scanInput - { targetUrl, repoUrl, standard, depth }
 * @returns {Promise<Object>} normalized scan initiation response
 */
export async function requestScan(scanInput) {
  const serialized = serializeScanPayload(scanInput);

  if (API_CONFIG.useMockData) {
    await delay(1000);
    const mockScanId = `scan-${Date.now().toString(36)}`;

    // Register synthesized scan in database so it can be selected immediately
    const generatedScan = {
      metadata: {
        isDemonstrationMockData: true,
        disclaimer: "Demonstration audit data for testing UI/UX and remediation workflows.",
        scanId: mockScanId,
        timestamp: new Date().toISOString(),
        targetUrl: serialized.targetUrl,
        repoUrl: serialized.repoUrl,
        standard: serialized.standard,
        auditEngine: "AccessAble Core v2.4 (Simulated Engine)",
        pagesScanned: serialized.scanDepth,
        domNodesAudited: serialized.scanDepth * 280,
        durationSeconds: 12.5,
      },
      summary: {
        currentScore: 71,
        projectedScore: 95,
        scoreRating: "Needs Improvement",
        totalViolations: 18,
        severityBreakdown: { critical: 3, serious: 5, moderate: 6, minor: 4 },
        wcagCompliance: {
          levelA: { percentage: 84, passed: 28, total: 33 },
          levelAA: { percentage: 68, passed: 19, total: 28 },
          levelAAA: { percentage: 42, passed: 10, total: 24 },
        },
        principlesBreakdown: [
          { name: "Perceivable", score: 74, violations: 5, maxScore: 100, passRate: 80 },
          { name: "Operable", score: 65, violations: 7, maxScore: 100, passRate: 71 },
          { name: "Understandable", score: 78, violations: 4, maxScore: 100, passRate: 85 },
          { name: "Robust", score: 82, violations: 2, maxScore: 100, passRate: 90 },
        ],
        categoryBreakdown: [
          { category: "Color & Contrast", count: 5 },
          { category: "Keyboard & Focus", count: 6 },
          { category: "Forms & Controls", count: 4 },
          { category: "Target Size (2.2)", count: 3 },
        ],
      },
      violations: MOCK_VIOLATIONS.slice(0, 18).map((v) => ({
        ...v,
        pageUrl: v.pageUrl.replace('https://shopflow-demo.store', serialized.targetUrl),
      })),
      fixComparison: {
        scanId: mockScanId,
        targetUrl: serialized.targetUrl,
        before: { score: 71, totalViolations: 18, critical: 3, serious: 5, moderate: 6, minor: 4, wcagAAPassRate: 68 },
        after: { score: 95, totalViolations: 1, critical: 0, serious: 0, moderate: 1, minor: 0, wcagAAPassRate: 97 },
        improvementPercentage: 33.8,
        violationsResolved: 17,
        remainingViolations: 1,
        severityComparison: [
          { severity: "Critical", before: 3, after: 0 },
          { severity: "Serious", before: 5, after: 0 },
          { severity: "Moderate", before: 6, after: 1 },
          { severity: "Minor", before: 4, after: 0 },
        ],
        principlesComparison: [
          { principle: "Perceivable", before: 74, after: 97 },
          { principle: "Operable", before: 65, after: 94 },
          { principle: "Understandable", before: 78, after: 96 },
          { principle: "Robust", before: 82, after: 95 },
        ],
      },
    };

    MOCK_SCANS_DB[mockScanId] = generatedScan;

    return {
      success: true,
      isMock: true,
      scanId: mockScanId,
      status: 'completed',
      message: 'Demonstration scan completed via simulated engine.',
      targetUrl: serialized.targetUrl,
      repoUrl: serialized.repoUrl,
      standard: serialized.standard,
      timestamp: new Date().toISOString(),
      scanData: generatedScan,
    };
  }

  try {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scans, {
      method: 'POST',
      body: JSON.stringify(serialized),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const raw = await response.json();
    return {
      success: true,
      isMock: false,
      scanId: raw.scanId || raw.scan_id || `scan-${Date.now()}`,
      status: raw.status || 'completed',
      targetUrl: serialized.targetUrl,
      timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
    };
  } catch (error) {
    if (!API_CONFIG.useMockData) throw error;
    console.warn(`[AccessAble API] requestScan failed on live backend, falling back to mock:`, error.message);
    await delay(600);
    const mockScanId = `scan-${Date.now().toString(36)}`;
    return {
      success: true,
      isMock: true,
      fallbackNotice: 'Live backend unreachable. Rendered simulated audit.',
      scanId: mockScanId,
      status: 'completed',
      targetUrl: serialized.targetUrl,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 2. Retrieve Scan Results by Scan ID
 * @param {string} scanId
 * @returns {Promise<Object>} { success, isMock, metadata, summary, violations }
 */
export async function getScanResults(scanId = 'latest') {
  if (API_CONFIG.useMockData) {
    await delay(300);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      metadata: normalizeMetadata(selectedRecord.metadata),
      summary: normalizeSummary(selectedRecord.summary),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
    };
  }

  try {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scanById(scanId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const raw = await response.json();
    if (raw.status === 'failed') throw new Error(raw.error || 'Scan failed');
    if (raw.status === 'scanning' || raw.status === 'queued') {
      throw new Error('Scan is still running');
    }
    return {
      success: true,
      isMock: false,
      metadata: normalizeMetadata(raw.metadata || raw),
      summary: normalizeSummary(raw.summary || raw),
      violations: (raw.violations || raw.issues || []).map(normalizeViolation),
    };
  } catch (error) {
    if (!API_CONFIG.useMockData) throw error;
    console.warn(`[AccessAble API] getScanResults(${scanId}) failed, serving mock:`, error.message);
    await delay(250);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      metadata: normalizeMetadata(selectedRecord.metadata),
      summary: normalizeSummary(selectedRecord.summary),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
    };
  }
}

/**
 * 3. Retrieve Fix & Remediation Comparison Data
 * @param {string} scanId
 * @returns {Promise<Object>} { success, isMock, comparison, violations }
 */
export async function getFixComparison(scanId = 'latest') {
  if (API_CONFIG.useMockData) {
    await delay(250);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      comparison: normalizeFixComparison(selectedRecord.fixComparison),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
    };
  }

  try {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scanFixes(scanId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const raw = await response.json();
    return {
      success: true,
      isMock: false,
      comparison: normalizeFixComparison(raw.comparison || raw),
      violations: (raw.violations || raw.issues || []).map(normalizeViolation),
    };
  } catch (error) {
    if (!API_CONFIG.useMockData) throw error;
    console.warn(`[AccessAble API] getFixComparison(${scanId}) failed, serving mock:`, error.message);
    await delay(200);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      comparison: normalizeFixComparison(selectedRecord.fixComparison),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
    };
  }
}

/**
 * 4. Retrieve or Generate Report Data
 * @param {string} scanId
 * @returns {Promise<Object>} { success, isMock, metadata, summary, violations, fixComparison }
 */
export async function getReport(scanId = 'latest') {
  if (API_CONFIG.useMockData) {
    await delay(300);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      metadata: normalizeMetadata(selectedRecord.metadata),
      summary: normalizeSummary(selectedRecord.summary),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
      fixComparison: normalizeFixComparison(selectedRecord.fixComparison),
    };
  }

  try {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scanReport(scanId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const raw = await response.json();
    if (raw.status === 'failed') throw new Error(raw.error || 'Scan failed');
    if (raw.status === 'scanning' || raw.status === 'queued') {
      throw new Error('Scan is still running');
    }
    return {
      success: true,
      isMock: false,
      metadata: normalizeMetadata(raw.metadata || raw),
      summary: normalizeSummary(raw.summary || raw),
      violations: (raw.violations || raw.issues || []).map(normalizeViolation),
      fixComparison: normalizeFixComparison(raw.fixComparison || raw.comparison || {}),
    };
  } catch (error) {
    if (!API_CONFIG.useMockData) throw error;
    console.warn(`[AccessAble API] getReport(${scanId}) failed, serving mock:`, error.message);
    await delay(250);
    const selectedRecord = (scanId && MOCK_SCANS_DB[scanId]) || MOCK_SCANS_DB['scan-2026-0492-acc'];
    return {
      success: true,
      isMock: true,
      metadata: normalizeMetadata(selectedRecord.metadata),
      summary: normalizeSummary(selectedRecord.summary),
      violations: (selectedRecord.violations || []).map(normalizeViolation),
      fixComparison: normalizeFixComparison(selectedRecord.fixComparison),
    };
  }
}

/**
 * 5. Retrieve Recent Scan History
 * @returns {Promise<Object>} { success, isMock, scans }
 */
export async function getRecentScans() {
  if (API_CONFIG.useMockData) {
    await delay(200);
    return {
      success: true,
      isMock: true,
      scans: normalizeRecentScans(MOCK_RECENT_SCANS),
    };
  }

  try {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scans);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const raw = await response.json();
    return {
      success: true,
      isMock: false,
      scans: normalizeRecentScans(raw.scans || raw.data || raw),
    };
  } catch (error) {
    if (!API_CONFIG.useMockData) throw error;
    console.warn(`[AccessAble API] getRecentScans failed, serving mock:`, error.message);
    await delay(150);
    return {
      success: true,
      isMock: true,
      scans: normalizeRecentScans(MOCK_RECENT_SCANS),
    };
  }
}

/**
 * 6. Health Check / Status test
 */
export async function testApiConnection() {
  try {
    const res = await fetchWithTimeout(API_CONFIG.endpoints.health, { timeout: 3000 });
    return { isOnline: res.ok, status: res.status, url: API_CONFIG.baseUrl };
  } catch {
    return { isOnline: false, status: 0, url: API_CONFIG.baseUrl };
  }
}

export default {
  API_CONFIG,
  configureApi,
  requestScan,
  getScanResults,
  getFixComparison,
  getReport,
  getRecentScans,
  testApiConnection,
};

export async function waitForScan(scanId, timeoutMs = 120000) {
  if (API_CONFIG.useMockData) return;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await fetchWithTimeout(API_CONFIG.endpoints.scanById(scanId));
    if (!response.ok) throw new Error(`Scan lookup failed: ${response.status}`);
    const raw = await response.json();
    if (raw.status === 'completed') return;
    if (raw.status === 'failed') throw new Error(raw.error || 'Scan failed');
    await delay(500);
  }
  throw new Error('Scan timed out');
}
