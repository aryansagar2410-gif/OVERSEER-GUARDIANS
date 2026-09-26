import React from 'react';
import { ToastMessage } from '../types/inventory';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <aside
      aria-label="System notification"
      className="fixed bottom-6 right-4 sm:right-8 z-50 flex items-center gap-3 bg-[#2d3133] text-[#eff1f3] px-4 py-3 rounded-xl shadow-2xl border border-gray-700/60 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 max-w-md select-none"
    >
      <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] flex-shrink-0">
        <span className="material-symbols-outlined text-[20px]">check_circle</span>
      </div>
      <div className="flex flex-col pr-2 min-w-0">
        <div className="text-[13px] font-semibold text-[#eff1f3] truncate">{toast.title}</div>
        <div className="text-[11px] text-[#b7c8e1] flex items-center gap-1.5 mt-0.5">
          <span className="truncate">{toast.description}</span>
          <span>•</span>
          <span className="flex-shrink-0">{toast.timestamp}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#b7c8e1] hover:text-white ml-2 transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </aside>
  );
};
