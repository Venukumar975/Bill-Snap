import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  KeyRound, 
  HardDrive, 
  ChevronRight, 
  Trash2,
  FileSpreadsheet,
  Check,
  Zap
} from 'lucide-react';
import { calculateBillsStorageSize } from '../services/storage';
import { getActiveApiKey } from '../services/apiKeyManager';
import { isLocalModelEnabled, setLocalModelEnabled } from '../services/localModelService';
import ExportModal from './ExportModal';
import ApiKeyModal from './ApiKeyModal';

export default function Sidebar({
  isOpen,
  onClose,
  activeModel,
  onOpenModelSettings,
  savedBills = [],
  onClearAllBills,
  onApiKeyUpdated
}) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [localModelActive, setLocalModelActive] = useState(true);

  // Sync API key & Local Model state on open
  useEffect(() => {
    if (isOpen) {
      const currentKey = getActiveApiKey();
      setIsKeyVerified(Boolean(currentKey));
      setLocalModelActive(isLocalModelEnabled());
    }
  }, [isOpen]);

  const handleToggleLocalModel = (nextVal) => {
    setLocalModelActive(nextVal);
    setLocalModelEnabled(nextVal);
  };

  // Calculate storage size directly from bills array
  const storageUsage = calculateBillsStorageSize(savedBills);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
        
        {/* Sidebar Header (Clean logo WITHOUT scan laser) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/favicon.png" 
              alt="Bill Snap" 
              className="w-8 h-8 rounded-xl shadow-md shadow-indigo-100/50 object-cover shrink-0" 
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Bill Snap</h2>
              <p className="text-xs text-slate-400 font-medium">Preferences & Tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Items in Ergonomic UX Hierarchy */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          
          {/* TIER 1: Export Bills Row (Opens Export Modal, 100% Zero-CLS) */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-white transition group active:scale-[0.99] shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">Export Bills</p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                    CSV / XLSX
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  All bills or date range export
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0 ml-2" />
          </button>

          {/* TIER 2: UNIFIED AI & ENGINE SETTINGS (Grouped List Architecture) */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 overflow-hidden divide-y divide-slate-200/60 shadow-2xs">
            {/* ROW 1: AI Engine & Models (Taps to open model queue) */}
            <button
              onClick={() => {
                onClose();
                onOpenModelSettings();
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white text-left transition group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition shadow-2xs ${
                  activeModel 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Engine & Models</p>
                  <p className={`text-xs font-semibold truncate max-w-[140px] transition ${
                    activeModel ? 'text-emerald-600' : 'text-slate-400 font-medium'
                  }`}>
                    {activeModel ? activeModel.replace('gemini-', '') : 'Connecting...'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </button>

            {/* ROW 2: Smart Pre-Filter Toggle (MobileNetV3 Edge Verification) */}
            <div className="p-3.5 flex items-center justify-between gap-2 bg-slate-50/50">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition shadow-2xs ${
                  localModelActive 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-900">Smart Pre-Filter</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition ${
                      localModelActive 
                        ? 'text-emerald-700 bg-emerald-100/70 border-emerald-300' 
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                      {localModelActive ? 'On' : 'Off'}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 leading-snug transition ${
                    localModelActive ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                  }`}>
                    {localModelActive ? 'On-device receipt check' : 'Direct cloud dispatch'}
                  </p>
                </div>
              </div>

              {/* Switch */}
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={localModelActive}
                  onClick={() => handleToggleLocalModel(!localModelActive)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer ${
                    localModelActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      localModelActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-extrabold font-mono transition ${
                  localModelActive ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {localModelActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* ROW 3: Gemini API Key (Opens ApiKeyModal, 100% Zero-CLS) */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="w-full p-3.5 flex items-center justify-between gap-2 hover:bg-white text-left transition group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition shadow-2xs ${
                  isKeyVerified 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 whitespace-nowrap">Gemini API Key</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isKeyVerified ? (
                      <>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          Verified
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold truncate">
                          Connected
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Key required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
            </button>
          </div>

          {/* TIER 3: ON-DEVICE STORAGE & DATA MANAGEMENT */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <HardDrive className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-800">On-Device Storage</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-400">IndexedDB</span>
            </div>

            {/* Asymmetric Side-by-Side Stat Containers */}
            <div className="flex items-center gap-2">
              <div className="w-[38%] bg-white rounded-xl py-2 px-3 border border-slate-200/80 flex items-center justify-between shadow-2xs shrink-0">
                <span className="text-xs font-semibold text-slate-500">Bills</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {savedBills.length}
                </span>
              </div>
              <div className="flex-1 bg-white rounded-xl py-2 px-3 border border-slate-200/80 flex items-center justify-between shadow-2xs min-w-0">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Used</span>
                <span className="text-sm font-extrabold text-indigo-600 font-mono whitespace-nowrap">
                  {storageUsage || '0 KB'}
                </span>
              </div>
            </div>

            {/* Red Destructive Action Container */}
            {savedBills.length > 0 && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all saved bills from this device?')) {
                      onClearAllBills();
                      onClose();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition active:scale-95 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Saved Bills
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">
            Bill Snap by Venu Kumar
          </span>
        </div>
      </div>

      {/* Export to CSV/Excel Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        savedBills={savedBills}
      />

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          const currentKey = getActiveApiKey();
          setIsKeyVerified(Boolean(currentKey));
        }}
        onApiKeyUpdated={(newKey) => {
          setIsKeyVerified(Boolean(newKey));
          if (onApiKeyUpdated) onApiKeyUpdated(newKey);
        }}
      />
    </div>
  );
}
