import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  FileDown,
} from 'lucide-react';

import ScoreGauge from '../components/ScoreGauge.jsx';
import IssueCard from '../components/IssueCard.jsx';
import { downloadHtmlReport } from '../utils/exportHelpers.js';

export default function ScanResults({
  metadata,
  summary,
  violations = [],
  appliedFixIds,
  toggleFixApplied,
  dynamicMetrics,
  allData,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters from query or state
  const initialSeverity = searchParams.get('severity') || 'all';
  const [selectedSeverity, setSelectedSeverity] = useState(initialSeverity);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'applied' | 'pending'

  useEffect(() => {
    const sev = searchParams.get('severity');
    if (sev) {
      setSelectedSeverity(sev.toLowerCase());
    } else {
      setSelectedSeverity('all');
    }
  }, [searchParams]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(violations.map((v) => v.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [violations]);

  // Filtered violations
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // Severity filter
      if (selectedSeverity !== 'all' && v.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }

      // Applied status filter
      const isApplied = appliedFixIds.has(v.id);
      if (statusFilter === 'applied' && !isApplied) return false;
      if (statusFilter === 'pending' && isApplied) return false;

      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesCriterion = v.wcagCriterion.toLowerCase().includes(query);
        const matchesSelector = v.elementSelector.toLowerCase().includes(query);
        const matchesExplanation = v.explanation.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCriterion && !matchesSelector && !matchesExplanation) {
          return false;
        }
      }

      return true;
    });
  }, [violations, selectedSeverity, selectedCategory, statusFilter, searchQuery, appliedFixIds]);

  const severityCounts = useMemo(() => {
    return {
      all: violations.length,
      critical: violations.filter((v) => v.severity === 'critical').length,
      serious: violations.filter((v) => v.severity === 'serious').length,
      moderate: violations.filter((v) => v.severity === 'moderate').length,
      minor: violations.filter((v) => v.severity === 'minor').length,
    };
  }, [violations]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Audit Header Banner */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                {metadata?.standard || 'WCAG 2.2 Level AA'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                Scan ID: {metadata?.scanId || 'scan-demo'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Audit Findings for {metadata?.targetUrl || 'shopflow-demo.store'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Found <strong className="text-white">{violations.length} total accessibility violations</strong> across {metadata?.pagesScanned ?? 0} audited page components. Expand each item below to view technical explanations, WCAG rules, and suggested code patches.
            </p>
          </div>

          <div className="flex items-center gap-6 self-start lg:self-auto shrink-0 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <ScoreGauge score={dynamicMetrics?.dynamicScore ?? summary?.currentScore ?? 0} size="sm" />
            <div className="text-xs space-y-1">
              <div className="text-slate-400">Remediations Applied:</div>
              <div className="text-base font-bold text-white tabular-nums">
                {appliedFixIds.size} / {violations.length}
              </div>
              <button
                onClick={() => navigate('/fix-comparison')}
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 pt-1"
              >
                <span>Compare Fixes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Severity Filter Bar */}
      <section className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Top search & quick options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by WCAG criterion, HTML selector, keyword, or barrier..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories ({violations.length})</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Remediation States</option>
              <option value="pending">Pending Remediation ({violations.length - appliedFixIds.size})</option>
              <option value="applied">Applied in Workspace ({appliedFixIds.size})</option>
            </select>
          </div>
        </div>

        {/* Severity Segmented Filter Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase text-slate-400 mr-1">
              Severity:
            </span>

            {[
              { id: 'all', label: 'All Issues', count: severityCounts.all, activeColor: 'bg-white text-slate-900' },
              { id: 'critical', label: 'Critical', count: severityCounts.critical, activeColor: 'bg-rose-600 text-white' },
              { id: 'serious', label: 'Serious', count: severityCounts.serious, activeColor: 'bg-orange-600 text-white' },
              { id: 'moderate', label: 'Moderate', count: severityCounts.moderate, activeColor: 'bg-amber-600 text-white' },
              { id: 'minor', label: 'Minor', count: severityCounts.minor, activeColor: 'bg-blue-600 text-white' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setSelectedSeverity(btn.id);
                  setSearchParams(btn.id === 'all' ? {} : { severity: btn.id });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                  selectedSeverity === btn.id
                    ? `${btn.activeColor} shadow-sm`
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
              >
                <span>{btn.label}</span>
                <span className="text-[11px] opacity-80 font-mono tabular-nums">
                  ({btn.count})
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredViolations.length}</strong> of {violations.length} issues
          </div>
        </div>
      </section>

      {/* 3. Violation Items List */}
      <section className="space-y-3">
        {filteredViolations.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">
              No matching accessibility issues found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria, severity tabs, or status filters.
            </p>
            <button
              onClick={() => {
                setSelectedSeverity('all');
                setSelectedCategory('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredViolations.map((violation, index) => (
            <IssueCard
              key={violation.id}
              violation={violation}
              isApplied={appliedFixIds.has(violation.id)}
              onToggleApply={toggleFixApplied}
              defaultExpanded={index === 0}
            />
          ))
        )}
      </section>
    </div>
  );
}
