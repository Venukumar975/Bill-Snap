import React from 'react';
import { 
  X, 
  Cpu, 
  Layers, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Database,
  ShieldCheck
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  activeModel,
  fallbackModels = [],
  onRefreshEngine,
  isRefreshing
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Engine & Fallback</h3>
              <p className="text-[11px] text-slate-400 font-medium">Model discovery & cache status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Active Model Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Active Slot Model
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {activeModel || 'Discovering...'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Primary model used for instant bill analysis
            </p>
          </div>

          {/* Fallback Queue Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Fallback Queue ({fallbackModels.length})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Auto-failover order
              </span>
            </div>

            {fallbackModels.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No fallback models cached yet
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {fallbackModels.map((model, idx) => {
                  const isActive = model === activeModel;
                  return (
                    <div 
                      key={model}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition border ${
                        isActive 
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{model}</span>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cache Status Badge */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 flex items-start gap-2.5">
            <Database className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Phone Storage Cache:</span> Models are cached locally on your device for 7 days to eliminate network latency and prevent wasted API quota on app startup.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
          <button
            disabled={isRefreshing}
            onClick={onRefreshEngine}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold text-xs hover:bg-slate-50 active:scale-95 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            {isRefreshing ? 'Refreshing Engine...' : 'Refresh Engine'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 font-semibold text-xs hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
