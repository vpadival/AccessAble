import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  GitCompare,
  FileText,
  Accessibility,
  ExternalLink,
  Code2,
  CheckCircle2,
  X,
  History,
  ChevronDown,
} from 'lucide-react';

export default function Sidebar({
  metadata,
  summary,
  dynamicMetrics,
  recentScans = [],
  currentScanId,
  onSelectScan,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {},
}) {
  const violationsBadge = summary?.totalViolations != null ? String(summary.totalViolations) : null;
  const improvementBadge = dynamicMetrics && summary && dynamicMetrics.dynamicScore > summary.currentScore
    ? `+${dynamicMetrics.dynamicScore - summary.currentScore} pts`
    : null;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scan-results', label: 'Scan Results', icon: ShieldAlert, badge: violationsBadge },
    { to: '/fix-comparison', label: 'Fix Comparison', icon: GitCompare, badge: improvementBadge },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  const handleScanChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId && onSelectScan) {
      onSelectScan(selectedId);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop Static + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B132B] text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-screen transition-transform duration-200 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <NavLink
            to="/"
            onClick={onCloseMobileMenu}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                AccessAble
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                  2.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Accessibility Auditor</p>
            </div>
          </NavLink>

          {/* Close button for mobile screen */}
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Audit Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium tabular-nums bg-slate-900/60 text-slate-300 border border-slate-700/60">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Active Target Site & Quick Switcher */}
          <div className="pt-5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Audit Target</span>
            {recentScans.length > 1 && (
              <span className="text-[10px] text-blue-400 font-normal">
                {recentScans.length} scans
              </span>
            )}
          </div>

          <div className="mx-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-semibold">Active Domain</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>

            {/* Quick Audit Switcher Dropdown */}
            {recentScans.length > 0 && (
              <div className="relative">
                <select
                  value={currentScanId || metadata?.scanId || ''}
                  onChange={handleScanChange}
                  className="w-full pl-2.5 pr-7 py-1.5 bg-slate-950 border border-slate-700/80 rounded text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  aria-label="Switch active audit scan"
                >
                  {recentScans.map((scan) => (
                    <option key={scan.id} value={scan.id}>
                      {scan.url.replace('https://', '')} ({scan.score} pts)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>{metadata?.standard || 'WCAG 2.2 AA'}</span>
              <span>{metadata?.pagesScanned ?? 0} pages</span>
            </div>

            {metadata?.repoUrl && (
              <a
                href={metadata.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="pt-2 border-t border-slate-800 text-blue-400 hover:text-blue-300 flex items-center justify-between text-[11px]"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Code2 className="w-3 h-3" />
                  Repo linked
                </span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
        </nav>

        {/* Demonstration Mock Environment Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-blue-900/40 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Demonstration Mode
            </div>
            <p className="text-slate-400 leading-tight">
              Realistic mock data active. Production endpoints configured in <code className="text-slate-300">services/api.js</code>.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
