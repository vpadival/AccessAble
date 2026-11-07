import React from 'react';
import { AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';

export default function SeverityBadge({ severity = 'minor', size = 'md' }) {
  const norm = (severity || '').toLowerCase();

  const getStyle = () => {
    switch (norm) {
      case 'critical':
        return {
          label: 'Critical',
          Icon: AlertTriangle,
          className: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
          dot: 'bg-rose-500',
        };
      case 'serious':
        return {
          label: 'Serious',
          Icon: AlertCircle,
          className: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
          dot: 'bg-orange-500',
        };
      case 'moderate':
        return {
          label: 'Moderate',
          Icon: Info,
          className: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'minor':
      default:
        return {
          label: 'Minor',
          Icon: HelpCircle,
          className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
          dot: 'bg-blue-400',
        };
    }
  };

  const { label, Icon, className, dot } = getStyle();
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded ${
        isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
