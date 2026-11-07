import React from 'react';
import { Eye, Hand, Brain, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ComplianceMatrix({ compliance, principles = [] }) {
  const principleIcons = {
    Perceivable: Eye,
    Operable: Hand,
    Understandable: Brain,
    Robust: Cpu,
  };

  return (
    <div className="space-y-6">
      {/* WCAG Levels Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-white">WCAG 2.2 Level A</span>
            <span className="tabular-nums font-mono text-emerald-400 font-medium">
              {compliance?.levelA?.percentage || 82}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${compliance?.levelA?.percentage || 82}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Minimum Baseline</span>
            <span>{compliance?.levelA?.passed || 27}/{compliance?.levelA?.total || 33} Passed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-white">WCAG 2.2 Level AA</span>
            <span className="tabular-nums font-mono text-blue-400 font-medium">
              {compliance?.levelAA?.percentage || 64}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${compliance?.levelAA?.percentage || 64}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Legal Standard (Target)</span>
            <span>{compliance?.levelAA?.passed || 18}/{compliance?.levelAA?.total || 28} Passed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-white">WCAG 2.2 Level AAA</span>
            <span className="tabular-nums font-mono text-amber-400 font-medium">
              {compliance?.levelAAA?.percentage || 38}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${compliance?.levelAAA?.percentage || 38}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Enhanced Standard</span>
            <span>{compliance?.levelAAA?.passed || 9}/{compliance?.levelAAA?.total || 24} Passed</span>
          </div>
        </div>
      </div>

      {/* 4 Core Principles Matrix */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Four Principles of Accessibility (POUR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((p) => {
            const Icon = principleIcons[p.name] || Eye;
            const isGood = p.score >= 75;

            return (
              <div
                key={p.name}
                className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {p.violations} active {p.violations === 1 ? 'violation' : 'violations'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white tabular-nums">
                    {p.score}/100
                  </div>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${
                      isGood
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : 'text-amber-400 bg-amber-950/60'
                    }`}
                  >
                    {isGood ? 'Conforming' : 'Remediation needed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
