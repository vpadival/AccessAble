import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import SeverityBadge from './SeverityBadge.jsx';
import CodeDiffViewer from './CodeDiffViewer.jsx';

export default function IssueCard({
  violation,
  isApplied = false,
  onToggleApply,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className={`rounded-xl border transition-all ${
        expanded
          ? 'bg-slate-900 border-slate-700 shadow-md'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Clickable Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="pt-0.5 shrink-0">
            <SeverityBadge severity={violation.severity} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-400">
                {violation.wcagCriterion}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-medium text-slate-400">
                Level {violation.wcagLevel} (WCAG {violation.wcagVersion})
              </span>
              {violation.category && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-[11px] text-slate-400">
                    {violation.category}
                  </span>
                </>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
              {violation.title}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-xs">
                {violation.elementSelector}
              </span>
              {violation.pageUrl && (
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {violation.pageUrl.replace('https://shopflow-demo.store', '') || '/'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status / Expand Control */}
        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
          {isApplied ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fix Applied</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <span>Pending Fix</span>
            </span>
          )}

          <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Remediation Body */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4">
          {/* Explanation Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Why this is an accessibility barrier
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
              {violation.explanation}
            </p>
          </div>

          {/* Recommended Solution */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Recommended Remediation
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
              {violation.recommendedSolution}
            </p>
          </div>

          {/* Interactive Code Diff Viewer */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Code Patch Comparison
            </h4>
            <CodeDiffViewer
              affectedCode={violation.affectedHtml}
              proposedFix={violation.proposedFixHtml}
              selector={violation.elementSelector}
              isApplied={isApplied}
              onToggleApply={() => onToggleApply && onToggleApply(violation.id)}
              showApplyButton={true}
            />
          </div>
        </div>
      )}
    </article>
  );
}
