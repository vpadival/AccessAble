import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  downloadJsonReport,
  downloadHtmlReport,
  calculateRoadmapPhases,
} from '../utils/exportHelpers.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import SeverityBadge from '../components/SeverityBadge.jsx';
import { formatDate } from '../utils/formatters.js';

export default function Reports({
  metadata,
  summary,
  violations = [],
  fixComparison,
  dynamicMetrics,
  appliedFixIds = new Set(),
  toggleFixApplied,
  allData,
}) {
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const navigate = useNavigate();

  // Safely guard all incoming props against null or undefined
  const safeViolations = useMemo(() => {
    if (Array.isArray(violations)) return violations;
    if (allData && Array.isArray(allData.violations)) return allData.violations;
    return [];
  }, [violations, allData]);

  const safeAppliedFixIds = useMemo(() => {
    const raw = appliedFixIds || (allData && allData.appliedFixIds);
    if (raw instanceof Set) return raw;
    if (Array.isArray(raw)) return new Set(raw);
    return new Set();
  }, [appliedFixIds, allData]);

  const safeSummary = summary || (allData && allData.summary) || {};
  const safeMetadata = metadata || (allData && allData.metadata) || {};
  const safeFixComparison = fixComparison || (allData && allData.fixComparison) || {};

  // Dynamically calculate the three roadmap phases from actual audit violations & applied patches
  const roadmap = useMemo(() => {
    return calculateRoadmapPhases(safeViolations, safeAppliedFixIds);
  }, [safeViolations, safeAppliedFixIds]);

  const defaultPhase = {
    id: 'phase1',
    name: 'Phase 1 · Immediate (Sprint 1)',
    title: 'Blocker Resolution',
    severityGroup: 'Critical',
    total: 0,
    resolved: 0,
    remaining: 0,
    percentage: 0,
    status: 'Pending',
    description: 'No critical blocker issues detected.',
    violations: [],
  };

  const phase1 = roadmap?.phase1 || defaultPhase;
  const phase2 = roadmap?.phase2 || {
    ...defaultPhase,
    id: 'phase2',
    name: 'Phase 2 · Short Term (Sprint 2)',
    title: 'Serious Usability Barriers',
    severityGroup: 'Serious',
    description: 'No serious usability barrier issues detected.',
  };
  const phase3 = roadmap?.phase3 || {
    ...defaultPhase,
    id: 'phase3',
    name: 'Phase 3 · Maintenance & AAA',
    title: 'Semantics & Polish',
    severityGroup: 'Moderate & Minor',
    description: 'No moderate or minor issues detected.',
  };

  const reportPayload = useMemo(() => {
    return {
      metadata: safeMetadata,
      summary: safeSummary,
      violations: safeViolations,
      fixComparison: safeFixComparison,
      dynamicMetrics: dynamicMetrics || (allData && allData.dynamicMetrics) || {},
      appliedFixIds: Array.from(safeAppliedFixIds),
      remediationRoadmap: roadmap,
      ...(allData || {}),
    };
  }, [safeMetadata, safeSummary, safeViolations, safeFixComparison, dynamicMetrics, safeAppliedFixIds, roadmap, allData]);

  const handleDownloadHtml = () => {
    setDownloadingFormat('html');
    setTimeout(() => {
      downloadHtmlReport(
        reportPayload,
        `AccessAble-Audit-Report-${Date.now()}.html`
      );
      setDownloadingFormat(null);
    }, 400);
  };

  const handleDownloadJson = () => {
    setDownloadingFormat('json');
    setTimeout(() => {
      downloadJsonReport(
        reportPayload,
        `AccessAble-Audit-Report-${Date.now()}.json`
      );
      setDownloadingFormat(null);
    }, 300);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div className="audit-report-container space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Report Actions */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101C38] to-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 bg-blue-950/80 border border-blue-800">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Conformance Certificate &amp; Audit Report</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Accessibility Audit Executive Report
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete W3C WCAG 2.2 Level AA compliance findings, severity breakdown, remediation steps, and exportable documentation for engineering teams and stakeholders.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadHtml}
              disabled={downloadingFormat === 'html'}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingFormat === 'html' ? 'Generating HTML...' : 'Download HTML Report'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={downloadingFormat === 'json'}
              className="px-3.5 py-2.5 text-xs font-medium rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>{downloadingFormat === 'json' ? 'Exporting...' : 'Download JSON'}</span>
            </button>

            <button
              onClick={handleShareLink}
              type="button"
              className="px-3 py-2.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy shareable link"
            >
              {shareCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Executive Summary Card */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Audit Parameters &amp; Metadata
          </h3>
          <span className="text-xs text-slate-400">
            Engine: {safeMetadata?.auditEngine || 'AccessAble Core v2.4'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Target Website
            </span>
            <div className="font-semibold text-white truncate text-sm">
              {safeMetadata?.targetUrl || 'Audited Domain'}
            </div>
            <span className="text-[11px] text-slate-400">
              {safeMetadata?.pagesScanned ?? 0} pages audited
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Audit Timestamp
            </span>
            <div className="font-semibold text-white text-sm">
              {formatDate(safeMetadata?.timestamp)}
            </div>
            <span className="text-[11px] text-slate-400">
              Duration: {safeMetadata?.durationSeconds ?? 0}s
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] uppercase font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Audit Standard
            </span>
            <div className="font-semibold text-white text-sm">
              {safeMetadata?.standard || 'WCAG 2.2 Level AA'}
            </div>
            <span className="text-[11px] text-slate-400">
              W3C WAI Conformance Standard
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Audited DOM Nodes
            </span>
            <div className="font-semibold text-white text-sm tabular-nums">
              {safeMetadata?.domNodesAudited?.toLocaleString() ?? '0'} nodes
            </div>
            <span className="text-[11px] text-slate-400">
              Interactive &amp; Static Elements
            </span>
          </div>
        </div>

        {/* Score & Summary Banner */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="text-center md:border-r border-slate-800/80 pr-4">
            <span className="text-[11px] uppercase font-semibold text-slate-400 block mb-2">
              Accessibility Score
            </span>
            <ScoreGauge score={safeSummary?.currentScore ?? 0} size="md" />
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-base font-semibold text-white">
              Executive Evaluation Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The audited website achieves an accessibility score of <strong className="text-amber-400">{safeSummary?.currentScore ?? 0}/100</strong>, indicating that several non-conforming elements introduce barriers for people with disabilities. In particular, <strong className="text-rose-400">{safeSummary?.severityBreakdown?.critical ?? 0} critical blockers</strong> directly hinder keyboard navigation and assistive technology users.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Level A Pass: <strong>{safeSummary?.wcagCompliance?.levelA?.percentage ?? 0}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Level AA Pass: <strong>{safeSummary?.wcagCompliance?.levelAA?.percentage ?? 0}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Projected Post-Remediation: <strong className="text-emerald-400">{safeFixComparison?.after?.score ?? safeFixComparison?.projectedScore ?? 0}/100</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Severity Breakdown Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-rose-400 uppercase tracking-wider">Critical Issues</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {safeSummary?.severityBreakdown?.critical ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Immediate compliance violations preventing core user workflows.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-orange-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-orange-400 uppercase tracking-wider">Serious Issues</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {safeSummary?.severityBreakdown?.serious ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Substantial usability barriers for motor and visual impairment users.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-amber-400 uppercase tracking-wider">Moderate Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {safeSummary?.severityBreakdown?.moderate ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Interaction friction, missing skip links, or skipped heading levels.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-blue-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-blue-400 uppercase tracking-wider">Minor Issues</span>
            <AlertTriangle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {safeSummary?.severityBreakdown?.minor ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Formatting advisory points and enhanced state descriptions.
          </p>
        </div>
      </section>

      {/* 4. Categorized WCAG Violations Table */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            WCAG 2.2 Violations &amp; Recommended Improvements
          </h3>
          <span className="text-xs text-slate-400">
            {safeViolations.length} Items Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <th className="py-3 px-3 w-12">#</th>
                <th className="py-3 px-3 w-28">Severity</th>
                <th className="py-3 px-3 w-64">Criterion &amp; Element</th>
                <th className="py-3 px-3">Impact &amp; Recommended Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {safeViolations.map((v, idx) => (
                <tr key={v?.id || idx} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-3">
                    <SeverityBadge severity={v?.severity || 'minor'} size="sm" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{v?.title || 'Accessibility Issue'}</div>
                    <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                      {v?.wcagCriterion || 'WCAG 2.2'} (Level {v?.wcagLevel || 'AA'})
                    </div>
                    <code className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-1 inline-block truncate max-w-xs">
                      {v?.elementSelector || 'N/A'}
                    </code>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-slate-300 text-xs leading-relaxed mb-1.5">
                      {v?.explanation || ''}
                    </p>
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-900/50">
                      <strong>Recommended Solution:</strong> {v?.recommendedSolution || 'Apply WCAG recommended pattern.'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Recommended Remediation Roadmap */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Recommended Remediation Roadmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized sprint implementation plan synchronized with active audit findings and applied patches
            </p>
          </div>

          <button
            onClick={() => navigate('/fix-comparison')}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 transition-colors"
          >
            <span>Test &amp; Apply Patches in Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Phase 1 · Immediate (Sprint 1) - Critical Blockers */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800 tracking-wider">
                  Phase 1 · Immediate (Sprint 1)
                </span>

                {/* Visual Status Indicator */}
                {phase1.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Completed
                  </span>
                ) : phase1.status === 'In Progress' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-800">
                    <Clock className="w-3 h-3 text-blue-400" />
                    In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-700">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Blocker Resolution</h4>
                <span className="text-xs font-mono font-semibold text-rose-400">
                  {phase1.total} Critical Issue{phase1.total === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs">
                {phase1.description}
              </p>

              {/* Criteria Pills */}
              {(phase1.violations || []).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {Array.from(new Set((phase1.violations || []).map((v) => v?.wcagCriterion).filter(Boolean))).slice(0, 3).map((crit) => (
                    <span key={crit} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      {crit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Completion Progress */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {phase1.resolved} of {phase1.total} resolved
                </span>
                <span className="font-mono font-bold text-white">
                  {phase1.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    phase1.status === 'Completed'
                      ? 'bg-emerald-500'
                      : phase1.status === 'In Progress'
                      ? 'bg-blue-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${phase1.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {phase1.remaining === 0
                    ? 'All critical blockers resolved'
                    : `${phase1.remaining} critical issue${phase1.remaining === 1 ? '' : 's'} remaining`}
                </span>
                <span>Sprint 1 Goal</span>
              </div>
            </div>
          </div>

          {/* Phase 2 · Short Term (Sprint 2) - Serious Usability Barriers */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-950 text-orange-400 border border-orange-800 tracking-wider">
                  Phase 2 · Short Term (Sprint 2)
                </span>

                {/* Visual Status Indicator */}
                {phase2.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Completed
                  </span>
                ) : phase2.status === 'In Progress' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-800">
                    <Clock className="w-3 h-3 text-blue-400" />
                    In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-700">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Serious Usability Barriers</h4>
                <span className="text-xs font-mono font-semibold text-orange-400">
                  {phase2.total} Serious Issue{phase2.total === 1 ? '' : 's'}
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs">
                {phase2.description}
              </p>

              {/* Criteria Pills */}
              {(phase2.violations || []).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {Array.from(new Set((phase2.violations || []).map((v) => v?.wcagCriterion).filter(Boolean))).slice(0, 3).map((crit) => (
                    <span key={crit} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      {crit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Completion Progress */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {phase2.resolved} of {phase2.total} resolved
                </span>
                <span className="font-mono font-bold text-white">
                  {phase2.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    phase2.status === 'Completed'
                      ? 'bg-emerald-500'
                      : phase2.status === 'In Progress'
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${phase2.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {phase2.remaining === 0
                    ? 'All serious barriers resolved'
                    : `${phase2.remaining} serious barrier${phase2.remaining === 1 ? '' : 's'} remaining`}
                </span>
                <span>Sprint 2 Goal</span>
              </div>
            </div>
          </div>

          {/* Phase 3 · Maintenance & AAA - Semantics & Polish */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950 text-blue-400 border border-blue-800 tracking-wider">
                  Phase 3 · Maintenance &amp; AAA
                </span>

                {/* Visual Status Indicator */}
                {phase3.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Completed
                  </span>
                ) : phase3.status === 'In Progress' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-800">
                    <Clock className="w-3 h-3 text-blue-400" />
                    In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-700">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Semantics &amp; Polish</h4>
                <span className="text-xs font-mono font-semibold text-blue-400">
                  {phase3.total} Moderate &amp; Minor
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs">
                {phase3.description}
              </p>

              {/* Criteria Pills */}
              {(phase3.violations || []).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {Array.from(new Set((phase3.violations || []).map((v) => v?.wcagCriterion).filter(Boolean))).slice(0, 3).map((crit) => (
                    <span key={crit} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      {crit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Completion Progress */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {phase3.resolved} of {phase3.total} resolved
                </span>
                <span className="font-mono font-bold text-white">
                  {phase3.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    phase3.status === 'Completed'
                      ? 'bg-emerald-500'
                      : phase3.status === 'In Progress'
                      ? 'bg-blue-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${phase3.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {phase3.remaining === 0
                    ? 'All polish items addressed'
                    : `${phase3.remaining} issue${phase3.remaining === 1 ? '' : 's'} remaining`}
                </span>
                <span>Ongoing Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
