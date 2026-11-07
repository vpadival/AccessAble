import React, { useState } from 'react';
import { Check, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CodeDiffViewer({
  affectedCode,
  proposedFix,
  selector,
  isApplied = false,
  onToggleApply,
  showApplyButton = true,
}) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'

  const handleCopy = () => {
    navigator.clipboard.writeText(proposedFix || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden text-xs">
      {/* Header Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Selector:
          </span>
          <code className="text-blue-300 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60 truncate">
            {selector || 'element'}
          </code>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'unified' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unified View
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            title="Copy accessible code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Fix</span>
              </>
            )}
          </button>

          {/* Apply patch toggle */}
          {showApplyButton && onToggleApply && (
            <button
              type="button"
              onClick={onToggleApply}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                isApplied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Apply Patch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Display Body */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 font-mono text-[12px] leading-relaxed">
          {/* Current / Violating Code */}
          <div className="p-3.5 bg-rose-950/15 overflow-x-auto">
            <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-rose-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Current Inaccessible Markup
              </span>
              <span className="text-[10px] uppercase text-rose-500/80">Issue</span>
            </div>
            <pre className="text-rose-200 whitespace-pre-wrap">{affectedCode}</pre>
          </div>

          {/* Suggested Accessible Fix */}
          <div className="p-3.5 bg-emerald-950/15 overflow-x-auto">
            <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                WCAG 2.2 Compliant Code Fix
              </span>
              <span className="text-[10px] uppercase text-emerald-500/80">Recommended</span>
            </div>
            <pre className="text-emerald-200 whitespace-pre-wrap">{proposedFix}</pre>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="p-4 font-mono text-[12px] leading-relaxed overflow-x-auto divide-y divide-slate-900">
          <div className="pb-3 text-rose-300 bg-rose-950/20 p-3 rounded mb-2 border-l-2 border-rose-500">
            <div className="text-[10px] uppercase font-sans text-rose-400 font-semibold mb-1">
              - Removed (Inaccessible)
            </div>
            <pre className="whitespace-pre-wrap">{affectedCode}</pre>
          </div>
          <div className="pt-3 text-emerald-300 bg-emerald-950/20 p-3 rounded border-l-2 border-emerald-500">
            <div className="text-[10px] uppercase font-sans text-emerald-400 font-semibold mb-1">
              + Added (WCAG 2.2 Compliant)
            </div>
            <pre className="whitespace-pre-wrap">{proposedFix}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
