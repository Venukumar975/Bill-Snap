import React from 'react';
import { 
  X, 
  Cpu, 
  KeyRound, 
  HardDrive, 
  ReceiptText,
  ChevronRight,
  ShieldCheck,
  Trash2
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  activeModel,
  onOpenModelSettings,
  savedBillsCount = 0,
  onClearAllBills
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Sidebar Container */}
      <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Bill Snap</h2>
              <p className="text-[10px] text-slate-400 font-medium">Preferences & Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Section 1: AI Engine & Models */}
          <button
            onClick={() => {
              onClose();
              onOpenModelSettings();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50 text-left transition group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Engine & Models</p>
                <p className="text-[11px] text-indigo-600 font-medium truncate max-w-[130px]">
                  {activeModel ? activeModel.replace('gemini-', '') : 'Connecting...'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </button>

          {/* Section 2: API Configuration (Placeholder) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">API Key Configuration</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Default system key is active. Custom keys will be enabled here in future releases.
            </p>
            <input
              type="password"
              disabled
              value="••••••••••••••••••••••••••••"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white/80 text-xs text-slate-400 font-mono tracking-widest cursor-not-allowed"
            />
          </div>

          {/* Section 3: On-Device Storage (IndexedDB) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">IndexedDB Storage</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                {savedBillsCount} {savedBillsCount === 1 ? 'bill' : 'bills'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Saved bills and receipt photos are stored directly inside phone storage with no 5MB limit.
            </p>

            {savedBillsCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all saved bills?')) {
                    onClearAllBills();
                    onClose();
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition border border-red-200/60 bg-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Saved Bills
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              PWA v1.0.0
            </span>
            <span>Pure White UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
