import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  History,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

import ScoreGauge from '../components/ScoreGauge.jsx';
import StatCard from '../components/StatCard.jsx';
import ScanForm from '../components/ScanForm.jsx';
import ComplianceMatrix from '../components/ComplianceMatrix.jsx';

export default function Dashboard({
  metadata,
  summary,
  violations = [],
  recentScans = [],
  startNewScan,
  scanRunning,
  dynamicMetrics,
  switchScan,
  currentScanId,
}) {
  const navigate = useNavigate();

  // Severity metrics data for chart matching active dynamic metrics
  const severityChartData = [
    {
      name: 'Critical',
      count: dynamicMetrics?.activeCritical ?? summary?.severityBreakdown?.critical ?? 0,
      color: '#EF4444',
      description: 'Blocking barriers preventing core flow completion',
    },
    {
      name: 'Serious',
      count: dynamicMetrics?.activeSerious ?? summary?.severityBreakdown?.serious ?? 0,
      color: '#F97316',
      description: 'Significant hardship for assistive tech users',
    },
    {
      name: 'Moderate',
      count: dynamicMetrics?.activeModerate ?? summary?.severityBreakdown?.moderate ?? 0,
      color: '#F59E0B',
      description: 'Non-blocking usability friction and confusion',
    },
    {
      name: 'Minor',
      count: dynamicMetrics?.activeMinor ?? summary?.severityBreakdown?.minor ?? 0,
      color: '#3B82F6',
      description: 'Inconveniences or minor formatting deviations',
    },
  ];

  // Category chart data derived directly from summary or violations list
  const categoryData = useMemo(() => {
    if (summary?.categoryBreakdown && summary.categoryBreakdown.length > 0) {
      return summary.categoryBreakdown;
    }
    if (violations && violations.length > 0) {
      const counts = {};
      violations.forEach((v) => {
        const cat = v.category || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      return Object.entries(counts).map(([category, count]) => ({ category, count }));
    }
    return [
      { category: 'Color & Contrast', count: 0 },
      { category: 'Keyboard & Focus', count: 0 },
      { category: 'Forms & Controls', count: 0 },
      { category: 'Structure & Semantics', count: 0 },
    ];
  }, [summary, violations]);

  const CATEGORY_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B', '#10B981'];

  const handleSelectHistoryScan = (scanId, action = 'view') => {
    if (switchScan) {
      switchScan(scanId);
    }
    if (action === 'results') {
      navigate('/scan-results');
    } else if (action === 'fixes') {
      navigate('/fix-comparison');
    }
  };

  const activeScanId = currentScanId || metadata?.scanId;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome & Scan Initiation Strip */}
      <section className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0E1A38] to-slate-900 border border-slate-800 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>WCAG 2.2 Level AA Engine Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              AI-Powered Accessibility Audit &amp; Code Remediation
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Detect barrier violations against the latest W3C WCAG 2.2 standard, receive contextual code patches, and track compliance score improvements before pushing to production.
            </p>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Run Automated Accessibility Audit</span>
              <span className="text-[11px] text-blue-400 lowercase font-normal">
                {metadata?.isDemonstrationMockData ? 'mock demo enabled' : 'live api'}
              </span>
            </div>
            <ScanForm onSubmitScan={startNewScan} isScanning={scanRunning} />
          </div>
        </div>
      </section>

      {/* 2. Top Metric Row: Score & Severity Counts */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Overall Accessibility Score */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Overall Accessibility Score
          </span>
          <ScoreGauge score={dynamicMetrics?.dynamicScore ?? summary?.currentScore ?? 0} size="md" />
          <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
            <span>Target: <strong>90+ (AA)</strong></span>
            <button
              onClick={() => navigate('/fix-comparison')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>See Fix Impact</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Violations */}
        <div className="lg:col-span-1">
          <StatCard
            title="Total Violations"
            value={dynamicMetrics?.remainingViolationsCount ?? violations.length ?? 0}
            subtitle={`${dynamicMetrics?.resolvedCount ?? 0} of ${violations.length ?? 0} remediations applied`}
            colorScheme="blue"
            onClick={() => navigate('/scan-results')}
          />
        </div>

        {/* Critical */}
        <div className="lg:col-span-1">
          <StatCard
            title="Critical"
            value={dynamicMetrics?.activeCritical ?? summary?.severityBreakdown?.critical ?? 0}
            subtitle="Immediate keyboard traps & empty names"
            icon={AlertTriangle}
            colorScheme="rose"
            onClick={() => navigate('/scan-results?severity=critical')}
          />
        </div>

        {/* Serious */}
        <div className="lg:col-span-1">
          <StatCard
            title="Serious"
            value={dynamicMetrics?.activeSerious ?? summary?.severityBreakdown?.serious ?? 0}
            subtitle="Contrast, dragging & focus indicators"
            icon={AlertCircle}
            colorScheme="orange"
            onClick={() => navigate('/scan-results?severity=serious')}
          />
        </div>

        {/* Moderate & Minor */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Moderate
              </span>
              <span className="text-xl font-bold tabular-nums text-amber-400">
                {dynamicMetrics?.activeModerate ?? summary?.severityBreakdown?.moderate ?? 0}
              </span>
            </div>
            <Info className="w-5 h-5 text-amber-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Minor
              </span>
              <span className="text-xl font-bold tabular-nums text-blue-400">
                {dynamicMetrics?.activeMinor ?? summary?.severityBreakdown?.minor ?? 0}
              </span>
            </div>
            <HelpCircle className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </section>

      {/* 3. Accessibility Statistics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Distribution Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Detected Violations by Severity Level
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active barrier counts across audited components
              </p>
            </div>
            <button
              onClick={() => navigate('/scan-results')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 min-h-[256px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            ></span>
                            {data.name}: {data.count} issues
                          </div>
                          <p className="text-slate-400 max-w-xs">{data.description}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations by Category Pie / List */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Violations by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown across UI systems and WCAG criteria
            </p>
          </div>

          <div className="h-44 min-h-[176px] w-full my-2 flex items-center justify-center">
            {categoryData.some((c) => c.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="p-2 bg-slate-950 border border-slate-800 rounded shadow text-xs">
                            <span className="font-medium text-white">{data.name}: </span>
                            <span className="font-bold text-blue-400">{data.value} issues</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <span>Zero category violations detected</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            {categoryData.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  ></span>
                  <span className="text-slate-300">{cat.category}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-400">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WCAG 2.2 POUR Compliance Matrix */}
      <section>
        <ComplianceMatrix
          compliance={summary?.wcagCompliance}
          principles={summary?.principlesBreakdown}
        />
      </section>

      {/* 5. Recent Scan History Table with Clickable Selection */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Recent Accessibility Scan History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any scan below to load its corresponding audit results and fixes
            </p>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Full Compliance Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <th className="py-3 px-3">Target Domain</th>
                <th className="py-3 px-3">Repository</th>
                <th className="py-3 px-3">Standard</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3 text-center">Violations</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentScans.map((scan) => {
                const isActive = activeScanId === scan.id;
                return (
                  <tr
                    key={scan.id}
                    onClick={() => handleSelectHistoryScan(scan.id, 'view')}
                    className={`transition-colors cursor-pointer ${
                      isActive ? 'bg-blue-950/40 border-l-2 border-l-blue-500' : 'hover:bg-slate-850/60'
                    }`}
                  >
                    <td className="py-3.5 px-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className="truncate max-w-[200px]" title={scan.url}>
                          {scan.url.replace('https://', '')}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {scan.repo || 'manual-scan'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{scan.standard}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold font-mono text-xs tabular-nums ${
                          scan.score >= 80
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : scan.score >= 60
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {scan.score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                      <span className="text-white font-semibold">{scan.violationsCount}</span>
                      {scan.criticalCount > 0 && (
                        <span className="ml-1 text-[11px] text-rose-400 font-medium">
                          ({scan.criticalCount} crit)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 tabular-nums">
                      {scan.date}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectHistoryScan(scan.id, 'results')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium"
                          title="View detected accessibility violations"
                        >
                          Results
                        </button>
                        <button
                          onClick={() => handleSelectHistoryScan(scan.id, 'fixes')}
                          className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium"
                          title="Compare before and after code fixes"
                        >
                          Fixes
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
