import React, { useState } from 'react';
import { Globe, GitBranch, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

export default function ScanForm({
  onSubmitScan,
  isScanning = false,
  isModal = false,
  onClose,
}) {
  const [targetUrl, setTargetUrl] = useState('https://shopflow-demo.store');
  const [repoUrl, setRepoUrl] = useState('https://github.com/shopflow-org/storefront');
  const [standard, setStandard] = useState('WCAG 2.2 Level AA');
  const [scanDepth, setScanDepth] = useState('15');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUrl) return;
    onSubmitScan({
      targetUrl,
      repoUrl,
      standard,
      depth: parseInt(scanDepth, 10),
    });
    if (onClose) onClose();
  };

  const sampleTargets = [
    { name: 'E-Commerce Storefront', url: 'https://shopflow-demo.store', repo: 'https://github.com/shopflow-org/storefront' },
    { name: 'Healthcare Portal', url: 'https://acme-health-portal.org', repo: 'https://github.com/acme-corp/patient-portal' },
    { name: 'Fintech App', url: 'https://fintech-loan-dashboard.io', repo: 'https://github.com/fintech-labs/borrower-ui' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Target URL */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Website URL to Audit <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-4 h-4" />
          </div>
          <input
            type="url"
            required
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://yourcompany.com"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Repository URL (Optional for code fix automation) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Git Repository URL (Optional for Code-Level PR Fixes)
          </label>
          <span className="text-[11px] text-slate-400">GitHub / GitLab</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/organization/repo"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Audit Settings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Compliance Standard
          </label>
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="WCAG 2.2 Level AA">WCAG 2.2 Level AA (Recommended)</option>
            <option value="WCAG 2.2 Level AAA">WCAG 2.2 Level AAA (Strict)</option>
            <option value="WCAG 2.1 Level AA">WCAG 2.1 Level AA (Legacy)</option>
            <option value="Section 508 / EN 301 549">Section 508 / EN 301 549</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Audit Crawl Scope
          </label>
          <select
            value={scanDepth}
            onChange={(e) => setScanDepth(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">Single Page + Critical Flows (5 pages)</option>
            <option value="15">Standard Sampling (15-20 pages)</option>
            <option value="50">Deep Crawl (Full Site Map)</option>
          </select>
        </div>
      </div>

      {/* Preset demo site picker for quick evaluation */}
      <div className="pt-2">
        <span className="text-[11px] font-medium text-slate-400 block mb-2">
          Or test with sample target presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleTargets.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setTargetUrl(item.url);
                setRepoUrl(item.repo);
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isScanning}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Auditing DOM &amp; WCAG Rules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Initiate Accessibility Scan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
