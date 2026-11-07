import React from 'react';
import { getScoreMetadata } from '../utils/formatters.js';

export default function ScoreGauge({ score = 68, size = 'md', subtitle = 'out of 100 points' }) {
  const meta = getScoreMetadata(score);

  // SVG parameters based on size
  const config = {
    sm: { dimension: 90, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
    md: { dimension: 130, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-xs' },
    lg: { dimension: 170, stroke: 12, fontSize: 'text-5xl', labelSize: 'text-sm' },
  }[size] || { dimension: 130, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-xs' };

  const radius = (config.dimension - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={config.dimension}
          height={config.dimension}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke={meta.color}
            strokeWidth={config.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-extrabold text-white tabular-nums tracking-tight`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col items-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.badgeBg}`}>
          {meta.status}
        </span>
        {subtitle && (
          <span className="text-[11px] text-slate-400 mt-1 max-w-[180px] leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
