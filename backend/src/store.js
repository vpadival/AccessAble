/**
 * AccessAble In-Memory Storage
 * Persists active scans, reports, and agent job payloads across API sessions.
 */

class ScanStore {
  constructor() {
    this.scans = new Map();
    this.agentJobs = new Map();
    this.history = [];
    this.seedDefaults();
  }

  seedDefaults() {
    // Add default seed item so the frontend dashboard displays history immediately on launch
    const seedId = 'scan-demo-w3c-bad';
    const seedSummary = {
      currentScore: 28,
      projectedScore: 100,
      scoreRating: 'Critical',
      totalViolations: 67,
      severityBreakdown: { critical: 34, serious: 10, moderate: 23, minor: 0 },
      wcagCompliance: {
        levelA: { percentage: 0, passed: 0, total: 30 },
        levelAA: { percentage: 8, passed: 2, total: 25 },
        levelAAA: { percentage: 100, passed: 15, total: 15 },
      },
      principlesBreakdown: [
        { name: 'Perceivable', score: 0, violations: 35, maxScore: 100, passRate: 0 },
        { name: 'Operable', score: 19, violations: 30, maxScore: 100, passRate: 19 },
        { name: 'Understandable', score: 85, violations: 2, maxScore: 100, passRate: 85 },
        { name: 'Robust', score: 100, violations: 0, maxScore: 100, passRate: 100 },
      ],
      categoryBreakdown: [
        { category: 'Text Alternatives', count: 33 },
        { category: 'Keyboard & Focus', count: 29 },
        { category: 'Color & Contrast', count: 2 },
        { category: 'Structure & Navigation', count: 1 },
        { category: 'Language & Metadata', count: 1 },
        { category: 'Forms & Controls', count: 1 },
      ],
    };

    const seedReport = {
      metadata: {
        scanId: seedId,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        targetUrl: 'https://www.w3.org/WAI/demos/bad/before/home.html',
        repoUrl: 'https://github.com/vpadival/AccessAble',
        standard: 'WCAG 2.2 Level AA',
        auditEngine: 'AccessAble Core v1.0',
        pagesScanned: 1,
        domNodesAudited: 66,
        durationSeconds: 1.74,
      },
      summary: seedSummary,
      violations: [],
    };

    this.saveScan(seedId, seedReport);
  }

  saveScan(scanId, frontendReport, agentJob = null) {
    this.scans.set(scanId, frontendReport);
    if (agentJob) {
      this.agentJobs.set(scanId, agentJob);
    }

    const { metadata, summary } = frontendReport;
    const historyItem = {
      id: scanId,
      url: metadata.targetUrl,
      repo: metadata.repoUrl ? metadata.repoUrl.replace('https://github.com/', '') : 'manual-scan',
      score: summary.currentScore,
      violationsCount: summary.totalViolations,
      criticalCount: summary.severityBreakdown.critical,
      status: 'Completed',
      date: new Date(metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      standard: metadata.standard,
    };

    // Keep history sorted with newest first, deduplicate by id
    this.history = [historyItem, ...this.history.filter((item) => item.id !== scanId)].slice(0, 20);
  }

  getScan(scanId) {
    return this.scans.get(scanId) || null;
  }

  getAgentJob(scanId) {
    return this.agentJobs.get(scanId) || null;
  }

  getAllHistory() {
    return [...this.history];
  }
}

export const scanStore = new ScanStore();
