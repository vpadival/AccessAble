/**
 * AccessAble Report Export Utilities
 * Generates and downloads enterprise-grade JSON and standalone HTML reports.
 */

export function calculateRoadmapPhases(violations = [], appliedFixIds = new Set()) {
  const safeViolations = Array.isArray(violations) ? violations : [];
  const appliedSet = appliedFixIds instanceof Set
    ? appliedFixIds
    : new Set(Array.isArray(appliedFixIds) ? appliedFixIds : []);

  // Phase 1: Critical Issues (Sprint 1 · Immediate Blockers)
  const p1Violations = safeViolations.filter((v) => v && v.severity === 'critical');
  const p1Total = p1Violations.length;
  const p1Resolved = p1Violations.filter((v) => v && v.id && appliedSet.has(v.id)).length;
  const p1Remaining = Math.max(0, p1Total - p1Resolved);
  const p1Percentage = p1Total === 0 ? 100 : Math.round((p1Resolved / p1Total) * 100);
  const p1Status = p1Total === 0 || p1Resolved === p1Total ? 'Completed' : (p1Resolved > 0 ? 'In Progress' : 'Pending');

  // Phase 2: Serious Issues (Sprint 2 · Short Term Barriers)
  const p2Violations = safeViolations.filter((v) => v && v.severity === 'serious');
  const p2Total = p2Violations.length;
  const p2Resolved = p2Violations.filter((v) => v && v.id && appliedSet.has(v.id)).length;
  const p2Remaining = Math.max(0, p2Total - p2Resolved);
  const p2Percentage = p2Total === 0 ? 100 : Math.round((p2Resolved / p2Total) * 100);
  const p2Status = p2Total === 0 || p2Resolved === p2Total ? 'Completed' : (p2Resolved > 0 ? 'In Progress' : 'Pending');

  // Phase 3: Moderate & Minor Issues (Sprint 3 · Maintenance & AAA)
  const p3Violations = safeViolations.filter((v) => v && (v.severity === 'moderate' || v.severity === 'minor'));
  const p3Total = p3Violations.length;
  const p3Resolved = p3Violations.filter((v) => v && v.id && appliedSet.has(v.id)).length;
  const p3Remaining = Math.max(0, p3Total - p3Resolved);
  const p3Percentage = p3Total === 0 ? 100 : Math.round((p3Resolved / p3Total) * 100);
  const p3Status = p3Total === 0 || p3Resolved === p3Total ? 'Completed' : (p3Resolved > 0 ? 'In Progress' : 'Pending');

  // Helper to generate dynamic contextual descriptions from actual violation records
  const summarizeCriteria = (items, fallback) => {
    if (!items || !items.length) return fallback;
    const criteria = Array.from(new Set(items.map((i) => i.wcagCriterion).filter(Boolean))).slice(0, 3);
    const titles = Array.from(new Set(items.map((i) => (i.title || '').toLowerCase()).filter(Boolean))).slice(0, 2);
    const criteriaText = criteria.length > 0 ? `across ${criteria.join(', ')}` : 'criteria';
    const titlesText = titles.length > 0 ? `: addresses ${titles.join(' and ')}` : '';
    return `Resolve ${items.length} detected violation${items.length === 1 ? '' : 's'} ${criteriaText}${titlesText}.`;
  };

  const p1Desc = p1Total === 0
    ? 'Zero critical blockers detected in audited components.'
    : summarizeCriteria(p1Violations, `Resolve all ${p1Total} critical blocker issues preventing core keyboard and screen reader access.`);

  const p2Desc = p2Total === 0
    ? 'Zero serious usability barriers detected in audited components.'
    : summarizeCriteria(p2Violations, `Resolve all ${p2Total} serious usability barriers including contrast, focus indicators, and drag controls.`);

  const p3Desc = p3Total === 0
    ? 'Zero moderate or minor issues detected in audited components.'
    : summarizeCriteria(p3Violations, `Address ${p3Total} moderate and minor improvements to semantics, skip links, and help mechanisms.`);

  return {
    phase1: {
      id: 'phase1',
      name: 'Phase 1 · Immediate (Sprint 1)',
      title: 'Blocker Resolution',
      severityGroup: 'Critical',
      total: p1Total,
      resolved: p1Resolved,
      remaining: p1Remaining,
      percentage: p1Percentage,
      status: p1Status,
      description: p1Desc,
      violations: p1Violations,
    },
    phase2: {
      id: 'phase2',
      name: 'Phase 2 · Short Term (Sprint 2)',
      title: 'Serious Usability Barriers',
      severityGroup: 'Serious',
      total: p2Total,
      resolved: p2Resolved,
      remaining: p2Remaining,
      percentage: p2Percentage,
      status: p2Status,
      description: p2Desc,
      violations: p2Violations,
    },
    phase3: {
      id: 'phase3',
      name: 'Phase 3 · Maintenance & AAA',
      title: 'Semantics & Polish',
      severityGroup: 'Moderate & Minor',
      total: p3Total,
      resolved: p3Resolved,
      remaining: p3Remaining,
      percentage: p3Percentage,
      status: p3Status,
      description: p3Desc,
      violations: p3Violations,
    },
  };
}

export function downloadJsonReport(auditData, filename = 'AccessAble-Audit-Report.json') {
  const violations = auditData.violations || [];
  const appliedFixIds = auditData.appliedFixIds || [];
  const roadmap = calculateRoadmapPhases(violations, appliedFixIds);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    generator: 'AccessAble AI Accessibility Auditing Platform',
    complianceStandard: 'WCAG 2.2 AA',
    audit: {
      ...auditData,
      appliedFixIds: Array.from(appliedFixIds),
      remediationRoadmap: roadmap,
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateHtmlReport(auditData) {
  const meta = auditData.metadata || {};
  const summary = auditData.summary || {};
  const violations = auditData.violations || [];
  const fixes = auditData.fixComparison || {};

  const generatedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const violationRows = (Array.isArray(violations) ? violations : []).map((v, i) => {
    if (!v) return '';
    const sev = (v.severity || 'moderate').toLowerCase();
    const title = v.title || 'Accessibility Issue';
    const criterion = v.wcagCriterion || 'WCAG 2.2';
    const level = v.wcagLevel || 'AA';
    const selector = v.elementSelector || 'N/A';
    const explanation = v.explanation || '';
    const solution = v.recommendedSolution || 'Apply WCAG recommended pattern.';

    return `
    <tr class="violation-row ${sev}">
      <td class="num">${i + 1}</td>
      <td>
        <span class="badge ${sev}">${sev.toUpperCase()}</span>
      </td>
      <td>
        <strong>${title}</strong>
        <div class="criterion">${criterion} (${level})</div>
        <div class="selector"><code>${selector}</code></div>
      </td>
      <td>
        <p class="desc">${explanation}</p>
        <div class="solution"><strong>Remediation:</strong> ${solution}</div>
      </td>
    </tr>
  `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AccessAble Compliance Report - ${meta.targetUrl || 'Audit'}</title>
  <style>
    :root {
      --navy: #0B132B;
      --navy-light: #1C2541;
      --blue: #2563EB;
      --text: #0F172A;
      --text-muted: #64748B;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --border: #E2E8F0;
      --critical: #EF4444;
      --serious: #F97316;
      --moderate: #F59E0B;
      --minor: #3B82F6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    header {
      background: var(--navy);
      color: #FFFFFF;
      padding: 36px 40px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 16px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand span { color: #60A5FA; }
    .generated-date { font-size: 13px; color: #94A3B8; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .target-url { font-size: 15px; color: #94A3B8; }
    .target-url a { color: #60A5FA; text-decoration: none; }

    .content { padding: 40px; }

    .score-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
      padding: 24px;
      background: #F1F5F9;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .score-card { text-align: center; }
    .score-num { font-size: 44px; font-weight: 800; color: var(--navy); }
    .score-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--navy);
      margin: 36px 0 16px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 8px;
    }

    .severity-pills {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .pill {
      flex: 1;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }
    .pill.critical { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
    .pill.serious { background: #FFEDD5; color: #9A3412; border: 1px solid #FDBA74; }
    .pill.moderate { background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
    .pill.minor { background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      font-size: 14px;
    }
    th {
      background: #F8FAFC;
      font-weight: 600;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .badge.critical { background: #EF4444; color: #FFF; }
    .badge.serious { background: #F97316; color: #FFF; }
    .badge.moderate { background: #F59E0B; color: #FFF; }
    .badge.minor { background: #3B82F6; color: #FFF; }

    .criterion { font-size: 12px; color: var(--blue); font-weight: 600; margin-top: 4px; }
    .selector code {
      font-family: monospace;
      font-size: 12px;
      background: #F1F5F9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #334155;
      display: inline-block;
      margin-top: 4px;
    }
    .solution {
      margin-top: 8px;
      padding: 8px 12px;
      background: #EFF6FF;
      border-left: 3px solid var(--blue);
      border-radius: 0 4px 4px 0;
      font-size: 13px;
    }

    .roadmap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .roadmap-card {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .phase-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .phase-pill {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .phase-pill.p1 { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
    .phase-pill.p2 { background: #FFEDD5; color: #9A3412; border: 1px solid #FDBA74; }
    .phase-pill.p3 { background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }

    .status-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .status-tag.completed { background: #DCFCE7; color: #166534; border: 1px solid #86EFAC; }
    .status-tag.in-progress { background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }
    .status-tag.pending { background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }

    .roadmap-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .roadmap-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 14px;
    }
    .progress-bar-wrap {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 5px;
      font-weight: 600;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: #E2E8F0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .progress-fill.completed { background: #10B981; }
    .progress-fill.in-progress { background: #2563EB; }
    .progress-fill.p1 { background: #EF4444; }
    .progress-fill.p2 { background: #F97316; }
    .progress-fill.p3 { background: #3B82F6; }

    footer {
      padding: 24px 40px;
      background: #F8FAFC;
      border-top: 1px solid var(--border);
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { background: white; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .container { border: none; box-shadow: none; max-width: 100%; }
      .no-print { display: none; }
      .roadmap-card { break-inside: avoid; page-break-inside: avoid; }
      tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div class="brand">AccessAble<span>.ai</span></div>
        <div class="generated-date">Generated: ${generatedDate}</div>
      </div>
      <h1>Website Accessibility Conformance Audit</h1>
      <div class="target-url">Audit Target: <strong>${meta.targetUrl || 'Audited Target'}</strong> · Standard: <strong>${meta.standard || 'WCAG 2.2 AA'}</strong></div>
    </header>

    <div class="content">
      <div class="score-banner">
        <div class="score-card">
          <div class="score-num">${summary.currentScore ?? 0}/100</div>
          <div class="score-label">Accessibility Score</div>
        </div>
        <div class="score-card">
          <div class="score-num" style="color: #EF4444;">${summary.totalViolations ?? violations.length ?? 0}</div>
          <div class="score-label">Total Violations</div>
        </div>
        <div class="score-card">
          <div class="score-num" style="color: #10B981;">${fixes.after?.score ?? fixes.projectedScore ?? 0}/100</div>
          <div class="score-label">Projected Post-Fix</div>
        </div>
        <div class="score-card">
          <div class="score-num" style="color: #2563EB;">+${fixes.improvementPercentage ?? 0}%</div>
          <div class="score-label">Compliance Gain</div>
        </div>
      </div>

      <h2 class="section-title">Severity Breakdown</h2>
      <div class="severity-pills">
        <div class="pill critical">Critical: ${summary.severityBreakdown?.critical ?? 0} issues</div>
        <div class="pill serious">Serious: ${summary.severityBreakdown?.serious ?? 0} issues</div>
        <div class="pill moderate">Moderate: ${summary.severityBreakdown?.moderate ?? 0} issues</div>
        <div class="pill minor">Minor: ${summary.severityBreakdown?.minor ?? 0} issues</div>
      </div>

      <h2 class="section-title">Recommended Remediation Roadmap</h2>
      <div class="roadmap-grid">
        ${(() => {
          const rm = calculateRoadmapPhases(violations, auditData.appliedFixIds);
          const phases = [
            { key: 'phase1', data: rm.phase1, pillClass: 'p1', fillClass: rm.phase1.status === 'Completed' ? 'completed' : (rm.phase1.status === 'In Progress' ? 'in-progress' : 'p1') },
            { key: 'phase2', data: rm.phase2, pillClass: 'p2', fillClass: rm.phase2.status === 'Completed' ? 'completed' : (rm.phase2.status === 'In Progress' ? 'in-progress' : 'p2') },
            { key: 'phase3', data: rm.phase3, pillClass: 'p3', fillClass: rm.phase3.status === 'Completed' ? 'completed' : (rm.phase3.status === 'In Progress' ? 'in-progress' : 'p3') },
          ];

          return phases.map((p) => `
            <div class="roadmap-card">
              <div>
                <div class="phase-badge-row">
                  <span class="phase-pill ${p.pillClass}">${p.data.name}</span>
                  <span class="status-tag ${p.data.status === 'Completed' ? 'completed' : (p.data.status === 'In Progress' ? 'in-progress' : 'pending')}">
                    ${p.data.status === 'Completed' ? '✓ ' : (p.data.status === 'In Progress' ? '⏱ ' : '○ ')}${p.data.status}
                  </span>
                </div>
                <div class="roadmap-title">
                  <span>${p.data.title}</span>
                  <span style="font-family: monospace; font-size: 12px; color: var(--text-muted);">${p.data.resolved}/${p.data.total}</span>
                </div>
                <p class="roadmap-desc">${p.data.description}</p>
              </div>

              <div class="progress-bar-wrap">
                <div class="progress-header">
                  <span>Progress (${p.data.resolved}/${p.data.total} resolved)</span>
                  <span style="font-family: monospace; font-weight: 700;">${p.data.percentage}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill ${p.fillClass}" style="width: ${p.data.percentage}%;"></div>
                </div>
              </div>
            </div>
          `).join('');
        })()}
      </div>

      <h2 class="section-title">Detailed Accessibility Violations &amp; Recommended Solutions</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th style="width: 100px;">Severity</th>
            <th style="width: 320px;">Issue &amp; Selector</th>
            <th>Impact &amp; Recommended Remediation</th>
          </tr>
        </thead>
        <tbody>
          ${violationRows}
        </tbody>
      </table>
    </div>

    <footer>
      <div>AccessAble Accessibility Audit Platform · Conforms to W3C WAI Guidelines</div>
      <div>Confidential Audit Report</div>
    </footer>
  </div>
</body>
</html>`;
}

export function downloadHtmlReport(auditData, filename = 'AccessAble-Audit-Report.html') {
  const htmlContent = generateHtmlReport(auditData);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
