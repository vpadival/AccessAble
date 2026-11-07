import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Globe,
  PlusCircle,
  Download,
  Menu,
} from 'lucide-react';
import { downloadHtmlReport } from '../utils/exportHelpers.js';

export default function Navbar({
  metadata,
  onOpenScanModal,
  allData,
  onToggleMobileMenu,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/scan-results':
        return { title: 'Accessibility Scan Results', breadcrumb: 'Audit / Scan Results' };
      case '/fix-comparison':
        return { title: 'Fix & Remediation Comparison', breadcrumb: 'Audit / Fix Comparison' };
      case '/reports':
        return { title: 'Compliance Reports & Export', breadcrumb: 'Audit / Reports' };
      case '/':
      default:
        return { title: 'Accessibility Overview Dashboard', breadcrumb: 'Audit / Dashboard' };
    }
  };

  const { title, breadcrumb } = getPageInfo();

  const handleQuickDownload = () => {
    if (allData) {
      downloadHtmlReport(allData, `AccessAble-Report-${Date.now()}.html`);
    } else {
      navigate('/reports');
    }
  };

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20">
      {/* Zone 1: Mobile Hamburger + Breadcrumb/Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate">
            <span>{breadcrumb}</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Target Site Context */}
      <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-white truncate max-w-[200px] xl:max-w-[300px]">
            {metadata?.targetUrl || 'https://shopflow-demo.store'}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-400 border border-blue-800/80">
          {metadata?.standard || 'WCAG 2.2 AA'}
        </span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleQuickDownload}
          title="Download standalone HTML audit report"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export HTML</span>
        </button>

        <button
          onClick={onOpenScanModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Audit Scan</span>
          <span className="xs:hidden">New</span>
        </button>
      </div>
    </header>
  );
}
