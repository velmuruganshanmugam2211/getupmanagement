import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />,
          danger: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />
        };

        const borderColors = {
          success: 'border-[#BBF7D0] dark:border-[#166534]',
          danger: 'border-[#FECACA] dark:border-[#991B1B]',
          warning: 'border-[#FDE68A] dark:border-[#92400E]',
          info: 'border-[#BFDBFE] dark:border-[#1E40AF]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border ${borderColors[toast.type]} shadow-md animate-in slide-in-from-bottom-2 fade-in duration-200`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
