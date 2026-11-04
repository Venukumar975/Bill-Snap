import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  KeyRound, 
  HardDrive, 
  ChevronRight, 
  Trash2,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { calculateBillsStorageSize, exportBillsToCSV } from '../services/storage';
import { 
  getActiveApiKey, 
  setActiveApiKey, 
  clearActiveApiKey, 
  testGeminiApiKey 
} from '../services/apiKeyManager';

export default function Sidebar({
  isOpen,
  onClose,
  activeModel,
  onOpenModelSettings,
  savedBills = [],
  onClearAllBills,
  onApiKeyUpdated
}) {
  const [exportMode, setExportMode] = useState('all'); // 'all' or 'range'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  // BYOK (Bring Your Own Key) State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Sync API key state on open
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getActiveApiKey());
      setKeyFeedback(null);
    }
  }, [isOpen]);

  // Calculate storage size directly from bills array
  const storageUsage = calculateBillsStorageSize(savedBills);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    try {
      const count = exportBillsToCSV(
        savedBills,
        exportMode === 'range' && startDate ? startDate : null,
        exportMode === 'range' && endDate ? endDate : null
      );
      setExportNotice(`Downloaded ${count} bills to CSV!`);
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to export CSV');
    }
  };

  const handleSaveAndTestKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      clearActiveApiKey();
      setKeyFeedback({ type: 'error', text: 'Please enter a valid Gemini API key' });
      return;
    }

    setIsTestingKey(true);
    setKeyFeedback(null);

    try {
      await testGeminiApiKey(trimmed);
      setActiveApiKey(trimmed);
      setKeyFeedback({ type: 'success', text: 'Key verified & saved to phone!' });
      if (onApiKeyUpdated) {
        onApiKeyUpdated(trimmed);
      }
      setTimeout(() => setKeyFeedback(null), 4000);
    } catch (err) {
      setKeyFeedback({ type: 'error', text: err.message || 'Invalid API key' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearKey = () => {
    clearActiveApiKey();
    setApiKeyInput('');
    setKeyFeedback({ type: 'success', text: 'API key removed from device.' });
    if (onApiKeyUpdated) {
      onApiKeyUpdated('');
    }
    setTimeout(() => setKeyFeedback(null), 3000);
  };

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
              <h2 className="text-base font-bold text-slate-900 leading-tight">Bill Snap</h2>
              <p className="text-[10px] text-slate-400 font-medium">Preferences & Tools</p>
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
          
          {/* SECTION 1: Export to CSV / Excel (Top User Action) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Export to CSV / Excel</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Excel Ready
              </span>
            </div>

            {/* Filter Mode Selector */}
            <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 text-[11px]">
              <button
                onClick={() => setExportMode('all')}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  exportMode === 'all' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Bills ({savedBills.length})
              </button>
              <button
                onClick={() => setExportMode('range')}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  exportMode === 'range' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Custom Date Range Inputs */}
            {exportMode === 'range' && (
              <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              disabled={savedBills.length === 0}
              onClick={handleExportCSV}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 text-slate-800 rounded-xl font-semibold text-xs hover:bg-slate-50 active:scale-95 transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              Download CSV File
            </button>

            {exportNotice && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {exportNotice}
              </p>
            )}
          </div>

          {/* SECTION 2: Local Device Storage (2-Column Stat Tile) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Local Device Storage</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Saved Bills
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {savedBills.length}
                </span>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Storage Used
                </span>
                <span className="text-base font-extrabold text-indigo-600 font-mono">
                  {storageUsage || '0 KB'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Stored privately on your device using on-device IndexedDB.
            </p>
          </div>

          {/* SECTION 3: AI Engine & Models */}
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

          {/* SECTION 4: API Key Configuration (BYOK - Bring Your Own Key) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Gemini API Key (BYOK)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                On-Device
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Saved strictly in your phone's browser <code className="text-indigo-600 font-mono text-[10px]">localStorage</code>. Never sent to any server.
            </p>

            {/* Input with Show/Hide Toggle */}
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Paste AI Studio API Key (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setKeyFeedback(null);
                }}
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-mono outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Action Buttons: Save & Verify / Clear */}
            <div className="flex gap-2 pt-0.5">
              <button
                disabled={isTestingKey || !apiKeyInput.trim()}
                onClick={handleSaveAndTestKey}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {isTestingKey ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Test</span>
                  </>
                )}
              </button>

              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition active:scale-95"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Key Verification Feedback Alert */}
            {keyFeedback && (
              <div className={`p-2 rounded-xl text-[11px] font-semibold flex items-start gap-1.5 ${
                keyFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {keyFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{keyFeedback.text}</span>
              </div>
            )}
          </div>

          {/* SECTION 5: Destructive Action (Safely placed at bottom) */}
          {savedBills.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all saved bills from this device?')) {
                    onClearAllBills();
                    onClose();
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl transition border border-red-200 bg-white shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Saved Bills
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
          <span className="text-[11px] text-slate-400 font-medium">
            Bill Snap • Offline Ready
          </span>
        </div>
      </div>
    </div>
  );
}
