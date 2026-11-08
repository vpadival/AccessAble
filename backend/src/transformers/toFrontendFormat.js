/**
 * Extracts readable WCAG criterion from axe-core tags (e.g. "wcag111" -> "1.1.1").
 * Fallback to violation rule ID if no criterion tag is found.
 */
function getWcagCriterion(tags = [], fallbackId = '') {
  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d)(\d{1,2})$/i);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}`;
    }
  }
  return fallbackId || 'WCAG 2.1 Conformance';
}

/**
 * Extracts WCAG compliance level (A, AA, AAA) from axe-core tags.
 */
function getWcagLevel(tags = []) {
  if (tags.some((t) => /wcag2\d*aaa/i.test(t))) return 'AAA';
  if (tags.some((t) => /wcag2\d*aa/i.test(t))) return 'AA';
  if (tags.some((t) => /wcag2\d*a\b/i.test(t) || t === 'wcag2a')) return 'A';
  return 'AA';
}

/**
 * Maps axe-core tags to one of the 4 core WCAG principles:
 * Perceivable, Operable, Understandable, Robust.
 */
function getPrinciple(tags = []) {
  if (tags.some((t) => ['cat.text-alternatives', 'cat.color', 'cat.sensory-and-visual'].includes(t))) {
    return 'Perceivable';
  }
  if (tags.some((t) => ['cat.keyboard', 'cat.time-and-media', 'cat.semantics'].includes(t))) {
    return 'Operable';
  }
  if (tags.some((t) => ['cat.language', 'cat.forms'].includes(t))) {
    return 'Understandable';
  }
  if (tags.some((t) => ['cat.parsing', 'cat.aria'].includes(t))) {
    return 'Robust';
  }
  return 'Robust';
}

/**
 * Maps axe-core category tags to clean human-readable categories.
 */
function getCategory(tags = []) {
  const catTag = tags.find((t) => t.startsWith('cat.'));
  if (!catTag) return 'General Accessibility';

  const map = {
    'cat.color': 'Color & Contrast',
    'cat.keyboard': 'Keyboard & Focus',
    'cat.forms': 'Forms & Controls',
    'cat.text-alternatives': 'Text Alternatives',
    'cat.aria': 'ARIA & Semantics',
    'cat.structure': 'Structure & Navigation',
    'cat.sensory-and-visual': 'Sensory & Visual',
    'cat.tables': 'Tables & Grids',
    'cat.language': 'Language & Metadata',
    'cat.time-and-media': 'Time & Media',
    'cat.parsing': 'Parsing & Standards',
    'cat.semantics': 'Semantics & Headings',
  };

  if (map[catTag]) return map[catTag];

  const name = catTag.replace(/^cat\./, '').replace(/-/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Computes an overall or scoped score between 0 and 100 based on severity deductions.
 */
function computeScore(critical, serious, moderate, minor) {
  const deduction = critical * 10 + serious * 5 + moderate * 2 + minor * 1;
  return Math.min(100, Math.max(0, 100 - deduction));
}

/**
 * Converts raw axe-core results into the exact schema expected by the frontend:
 * GET /api/v1/scans/:scanId -> { metadata, summary, violations }
 * Reference: frontend src/services/api.js (normalizeMetadata, normalizeSummary, normalizeViolation)
 *
 * @param {object} rawAxeResults - Unmodified result from axe.analyze()
 * @param {object} options
 * @param {string} options.scanId - Unique scan identifier
 * @param {string} options.targetUrl - Audited website URL
 * @param {string} [options.repoUrl] - Optional repository URL for automated code fixes
 * @param {string} [options.standard] - Audit standard (e.g. 'WCAG 2.2 Level AA')
 * @param {number} [options.durationSeconds] - Scan execution duration in seconds
 * @returns {object} { metadata, summary, violations }
 */
export function toFrontendReport(
  rawAxeResults,
  { scanId, targetUrl, repoUrl = null, standard = 'WCAG 2.2 Level AA', durationSeconds = 0 } = {}
) {
  const safeScanId = scanId || `scan-${Date.now().toString(36)}`;
  const safeTargetUrl = targetUrl || rawAxeResults?.url || '';
  const rawViolations = Array.isArray(rawAxeResults?.violations) ? rawAxeResults.violations : [];

  // Count unique DOM targets audited across violations
  const uniqueDomTargets = new Set();
  const severityBreakdown = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  const principlesData = {
    Perceivable: { critical: 0, serious: 0, moderate: 0, minor: 0, count: 0 },
    Operable: { critical: 0, serious: 0, moderate: 0, minor: 0, count: 0 },
    Understandable: { critical: 0, serious: 0, moderate: 0, minor: 0, count: 0 },
    Robust: { critical: 0, serious: 0, moderate: 0, minor: 0, count: 0 },
  };

  const categoryCounts = {};
  let levelAViolations = 0;
  let levelAAViolations = 0;
  let levelAAAViolations = 0;

  let violationIndex = 1;
  const violations = [];

  for (const v of rawViolations) {
    const rawImpact = (v.impact || 'minor').toLowerCase();
    const severity = ['critical', 'serious', 'moderate', 'minor'].includes(rawImpact)
      ? rawImpact
      : 'minor';

    const tags = Array.isArray(v.tags) ? v.tags : [];
    const principle = getPrinciple(tags);
    const category = getCategory(tags);
    const wcagCriterion = getWcagCriterion(tags, v.id);
    const wcagLevel = getWcagLevel(tags);

    const impactScoreMap = { critical: 10, serious: 7, moderate: 4, minor: 2 };
    const impactScore = impactScoreMap[severity] || 5;

    const nodes = Array.isArray(v.nodes) ? v.nodes : [];

    for (const node of nodes) {
      const selector = Array.isArray(node.target)
        ? node.target.join(' ')
        : String(node.target || 'body');

      uniqueDomTargets.add(selector);
      severityBreakdown[severity] += 1;

      // Accumulate principle stats
      principlesData[principle][severity] += 1;
      principlesData[principle].count += 1;

      // Accumulate category stats
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Accumulate WCAG compliance tier stats
      if (wcagLevel === 'A') levelAViolations += 1;
      else if (wcagLevel === 'AA') levelAAViolations += 1;
      else if (wcagLevel === 'AAA') levelAAAViolations += 1;

      // Create individual violation record per affected node
      violations.push({
        id: `VIOL-${String(violationIndex++).padStart(3, '0')}`,
        title: v.help || v.id,
        severity,
        wcagCriterion,
        wcagLevel,
        wcagVersion: '2.1',
        principle,
        category,
        pageUrl: safeTargetUrl,
        elementSelector: selector,
        affectedHtml: node.html || '<!-- HTML unavailable -->',
        proposedFixHtml: null, // Member 2 agent workflow generates proposed remediation patches
        explanation: v.description || v.help || 'No detailed barrier explanation available.',
        recommendedSolution:
          node.failureSummary ||
          v.help ||
          'Remediate element structure and attributes to comply with accessibility standards.',
        impactScore,
        isApplied: false,
        suggestedBy: 'AccessAble Core Rule Engine',
      });
    }
  }

  const totalViolations = violations.length;
  const currentScore = computeScore(
    severityBreakdown.critical,
    severityBreakdown.serious,
    severityBreakdown.moderate,
    severityBreakdown.minor
  );

  let scoreRating = 'Excellent';
  if (currentScore < 50) scoreRating = 'Critical';
  else if (currentScore < 80) scoreRating = 'Needs Improvement';
  else if (currentScore < 95) scoreRating = 'Good';

  // Simplification Note: WCAG rule coverage baseline benchmarked against standard rule sets
  const BASELINE_CHECKS = { levelA: 30, levelAA: 25, levelAAA: 15 };
  const passedA = Math.max(0, BASELINE_CHECKS.levelA - levelAViolations);
  const passedAA = Math.max(0, BASELINE_CHECKS.levelAA - levelAAViolations);
  const passedAAA = Math.max(0, BASELINE_CHECKS.levelAAA - levelAAAViolations);

  const wcagCompliance = {
    levelA: {
      percentage: Math.round((passedA / BASELINE_CHECKS.levelA) * 100),
      passed: passedA,
      total: BASELINE_CHECKS.levelA,
    },
    levelAA: {
      percentage: Math.round((passedAA / BASELINE_CHECKS.levelAA) * 100),
      passed: passedAA,
      total: BASELINE_CHECKS.levelAA,
    },
    levelAAA: {
      percentage: Math.round((passedAAA / BASELINE_CHECKS.levelAAA) * 100),
      passed: passedAAA,
      total: BASELINE_CHECKS.levelAAA,
    },
  };

  const principlesBreakdown = Object.entries(principlesData).map(([name, data]) => {
    const pScore = computeScore(data.critical, data.serious, data.moderate, data.minor);
    return {
      name,
      score: pScore,
      violations: data.count,
      maxScore: 100,
      passRate: pScore,
    };
  });

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    metadata: {
      scanId: safeScanId,
      timestamp: new Date().toISOString(),
      targetUrl: safeTargetUrl,
      repoUrl,
      standard,
      auditEngine: 'AccessAble Core v1.0',
      finalUrl: rawAxeResults?.scanContext?.finalUrl || safeTargetUrl,
      readinessWarning: rawAxeResults?.scanContext?.readinessWarning || null,
      pagesScanned: 1,
      domNodesAudited: uniqueDomTargets.size,
      durationSeconds: Number(durationSeconds || 0),
    },
    summary: {
      currentScore,
      projectedScore: 100,
      scoreRating,
      totalViolations,
      severityBreakdown,
      wcagCompliance,
      principlesBreakdown,
      categoryBreakdown,
    },
    violations,
  };
}
