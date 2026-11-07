import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  onClick,
}) {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      valueColor: 'text-white',
    },
    rose: {
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      valueColor: 'text-rose-400',
    },
    orange: {
      iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      valueColor: 'text-orange-400',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      valueColor: 'text-amber-400',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-slate-850' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums tracking-tight ${scheme.valueColor}`}>
              {value}
            </span>
            {trend && (
              <span className="text-xs font-semibold text-emerald-400">
                {trend}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-400 leading-normal border-t border-slate-800/80 pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
