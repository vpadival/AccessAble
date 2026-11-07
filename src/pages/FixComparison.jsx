import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCompare,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

import ScoreGauge from '../components/ScoreGauge.jsx';
import CodeDiffViewer from '../components/CodeDiffViewer.jsx';
import SeverityBadge from '../components/SeverityBadge.jsx';

export default function FixComparison({
  fixComparison,
  violations = [],
  appliedFixIds,
  toggleFixApplied,
  dynamicMetrics,
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'critical-serious' | 'applied' | 'suggested'

  const comparison = fixComparison || {
    before: { score: 0, totalViolations: 0, critical: 0, serious: 0, moderate: 0, minor: 0, wcagAAPassRate: 0 },
    after: { score: 0, totalViolations: 0, critical: 0, serious: 0, moderate: 0, minor: 0, wcagAAPassRate: 0 },
    improvementPercentage: 0,
    severityComparison: [],
    principlesComparison: [],
  };

  // Severity Before vs After chart data derived from comparison
  const severityChartData = [
    {
      severity: 'Critical',
      Before: comparison.before?.critical ?? 0,
      'Projected After': comparison.after?.critical ?? 0,
      'Live Applied': dynamicMetrics?.activeCritical ?? 0,
    },
    {
      severity: 'Serious',
      Before: comparison.before?.serious ?? 0,
      'Projected After': comparison.after?.serious ?? 0,
      'Live Applied': dynamicMetrics?.activeSerious ?? 0,
    },
    {
      severity: 'Moderate',
      Before: comparison.before?.moderate ?? 0,
      'Projected After': comparison.after?.moderate ?? 0,
      'Live Applied': dynamicMetrics?.activeModerate ?? 0,
    },
    {
      severity: 'Minor',
      Before: comparison.before?.minor ?? 0,
      'Projected After': comparison.after?.minor ?? 0,
      'Live Applied': dynamicMetrics?.activeMinor ?? 0,
    },
  ];

  // Principle Comparison Data from API service normalizer
  const principleComparison = comparison.principlesComparison || [];

  // Filtered violations to compare
  const displayViolations = violations.filter((v) => {
    const isApplied = appliedFixIds.has(v.id);
    if (filterMode === 'critical-serious') {
      return v.severity === 'critical' || v.severity === 'serious';
    }
    if (filterMode === 'applied') return isApplied;
    if (filterMode === 'suggested') return !isApplied;
    return true;
  });

  const handleApplyAll = () => {
    violations.forEach((v) => {
      if (!appliedFixIds.has(v.id)) {
        toggleFixApplied(v.id);
      }
    });
  };

  const handleResetAll = () => {
    violations.forEach((v) => {
      if (appliedFixIds.has(v.id)) {
        toggleFixApplied(v.id);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Live Remediation Control */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1E48] to-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>+{comparison.improvementPercentage}% Projected Compliance Gain</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Before &amp; After Remediation Analysis
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify how resolving identified barriers directly raises your accessibility score. Test applying suggested patches in real time or view the side-by-side code diffs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyAll}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply All Suggested Patches ({violations.length})</span>
            </button>
            <button
              onClick={handleResetAll}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Before vs After Score & KPI Comparison Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Before Score */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
            Initial Scan (Before Fixes)
          </span>
          <ScoreGauge
            score={comparison.before?.score ?? 0}
            size="md"
            subtitle={`${comparison.before?.totalViolations ?? violations.length} Active Violations`}
          />
          <div className="mt-4 pt-3 border-t border-slate-800 w-full text-xs text-slate-400 flex justify-between">
            <span>WCAG 2.2 AA Pass:</span>
            <strong className="text-slate-200">{comparison.before?.wcagAAPassRate ?? 0}%</strong>
          </div>
        </div>

        {/* Dynamic / Live Score with Applied Fixes */}
        <div className="p-6 rounded-xl bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-600/60 shadow-lg flex flex-col items-center justify-center text-center relative">
          <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
            Live Workspace Sandbox
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
            Dynamic Score (Current Patch State)
          </span>
          <ScoreGauge
            score={dynamicMetrics.dynamicScore}
            size="md"
            subtitle={`${appliedFixIds.size} of ${violations.length} Patches Applied`}
          />
          <div className="mt-4 pt-3 border-t border-blue-900/60 w-full text-xs text-slate-300 flex justify-between">
            <span>Remaining Issues:</span>
            <strong className="text-amber-400 font-mono">{dynamicMetrics.remainingViolationsCount}</strong>
          </div>
        </div>

        {/* Projected After Score */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            Projected Goal (Full Remediation)
          </span>
          <ScoreGauge
            score={comparison.after?.score ?? 0}
            size="md"
            subtitle={`${comparison.after?.totalViolations ?? 0} Advisory Items Remaining`}
          />
          <div className="mt-4 pt-3 border-t border-slate-800 w-full text-xs text-slate-400 flex justify-between">
            <span>WCAG 2.2 AA Pass:</span>
            <strong className="text-emerald-400">{comparison.after?.wcagAAPassRate ?? 0}%</strong>
          </div>
        </div>
      </section>

      {/* 3. Visual Comparison Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Reduction Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Severity Reduction Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of violation counts across Before, Projected, and Live Applied states
              </p>
            </div>
            {dynamicMetrics?.activeCritical === 0 ? (
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                Critical Blockers Eliminated (0 Remaining)
              </span>
            ) : (
              <span className="text-xs text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                {dynamicMetrics.activeCritical} Critical Remaining
              </span>
            )}
          </div>

          <div className="h-64 min-h-[256px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="severity"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs space-y-1.5">
                          <div className="font-bold text-white">{label} Severity</div>
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center justify-between gap-4">
                              <span style={{ color: p.color }}>{p.name}:</span>
                              <strong className="text-white font-mono">{p.value} issues</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="Before" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Live Applied" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected After" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* POUR Principles Progress */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              WCAG Principles Conformance Lift
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Before vs After percentage gain by POUR pillar
            </p>
          </div>

          <div className="space-y-4 my-auto py-2">
            {principleComparison.map((p) => (
              <div key={p.principle} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{p.principle}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">{p.before}%</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-emerald-400 font-bold">{p.after}%</span>
                    <span className="text-[10px] text-emerald-500 font-semibold">
                      (+{p.after - p.before}%)
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-slate-600 rounded-full opacity-60"
                    style={{ width: `${p.before}%` }}
                  ></div>
                  <div
                    className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${p.after}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
            Remediating critical and serious issues eliminates primary compliance barriers for keyboard and assistive technology users.
          </div>
        </div>
      </section>

      {/* 4. Proposed Code Fixes & Remediation Inspection */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-blue-400" />
              Proposed Code Fixes &amp; Applied Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review accessible markup replacements. Toggle individual patches to simulate workspace improvements.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Fixes ({violations.length})
            </button>
            <button
              onClick={() => setFilterMode('critical-serious')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'critical-serious' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical &amp; Serious ({violations.filter((v) => v.severity === 'critical' || v.severity === 'serious').length})
            </button>
            <button
              onClick={() => setFilterMode('applied')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'applied' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Applied ({appliedFixIds.size})
            </button>
            <button
              onClick={() => setFilterMode('suggested')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'suggested' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suggested ({violations.length - appliedFixIds.size})
            </button>
          </div>
        </div>

        {/* Fix Cards List */}
        <div className="space-y-4">
          {displayViolations.map((v) => {
            const isApplied = appliedFixIds.has(v.id);
            return (
              <div
                key={v.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={v.severity} size="sm" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {v.title}
                      </h4>
                      <div className="text-xs text-blue-400 font-medium">
                        {v.wcagCriterion} (Level {v.wcagLevel})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-medium ${
                        isApplied
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isApplied ? 'Applied to Workspace' : 'Suggested Recommendation'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Remediation Strategy:</strong> {v.recommendedSolution}
                </p>

                <CodeDiffViewer
                  affectedCode={v.affectedHtml}
                  proposedFix={v.proposedFixHtml}
                  selector={v.elementSelector}
                  isApplied={isApplied}
                  onToggleApply={() => toggleFixApplied(v.id)}
                  showApplyButton={true}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
