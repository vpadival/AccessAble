import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[notification.type] || Info;

  const colorStyles = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80',
    error: 'bg-rose-950/90 text-rose-200 border-rose-800/80',
    info: 'bg-blue-950/90 text-blue-200 border-blue-800/80',
  }[notification.type] || 'bg-slate-900 text-slate-200 border-slate-700';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200 no-print">
      <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${colorStyles}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5 text-current" />
        <div className="flex-1 text-xs leading-relaxed font-medium">
          {notification.message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
