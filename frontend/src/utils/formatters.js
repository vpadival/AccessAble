/**
 * AccessAble Formatter Utilities
 */

export function getScoreMetadata(score) {
  if (score >= 90) {
    return {
      status: 'Excellent',
      description: 'Meets WCAG 2.2 AA Conformance criteria with minimal barriers',
      color: '#10B981', // Emerald
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      bgGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
    };
  }
  if (score >= 75) {
    return {
      status: 'Moderate',
      description: 'Minor non-blocking issues detected; mostly compliant',
      color: '#3B82F6', // Blue
      textColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      bgGlow: 'shadow-[0_0_24px_rgba(59,130,246,0.25)]',
    };
  }
  if (score >= 55) {
    return {
      status: 'Needs Improvement',
      description: 'Multiple barriers impacting keyboard & assistive technology users',
      color: '#F59E0B', // Amber
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      bgGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
    };
  }
  return {
    status: 'Non-Compliant',
    description: 'Critical accessibility violations detected preventing basic navigation',
    color: '#EF4444', // Red
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    bgGlow: 'shadow-[0_0_24px_rgba(239,68,68,0.25)]',
  };
}

export function getSeverityConfig(severity) {
  const norm = (severity || '').toLowerCase();
  switch (norm) {
    case 'critical':
      return {
        label: 'Critical',
        color: '#EF4444',
        textColor: 'text-rose-400',
        badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
        dotClass: 'bg-rose-500',
        iconName: 'AlertTriangle',
        order: 1,
      };
    case 'serious':
      return {
        label: 'Serious',
        color: '#F97316',
        textColor: 'text-orange-400',
        badgeClass: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
        dotClass: 'bg-orange-500',
        iconName: 'AlertCircle',
        order: 2,
      };
    case 'moderate':
      return {
        label: 'Moderate',
        color: '#FBBF24',
        textColor: 'text-amber-300',
        badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
        dotClass: 'bg-amber-400',
        iconName: 'Info',
        order: 3,
      };
    case 'minor':
    default:
      return {
        label: 'Minor',
        color: '#60A5FA',
        textColor: 'text-blue-300',
        badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
        dotClass: 'bg-blue-400',
        iconName: 'HelpCircle',
        order: 4,
      };
  }
}

export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}
