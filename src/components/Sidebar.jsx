import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  KeyRound, 
  HardDrive, 
  ReceiptText, 
  ChevronRight, 
  Trash2,
  Download,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { calculateBillsStorageSize, exportBillsToCSV } from '../services/storage';

export default function Sidebar({
  isOpen,
  onClose,
  activeModel,
  onOpenModelSettings,
  savedBills = [],
  onClearAllBills
}) {
  const [exportMode, setExportMode] = useState('all'); // 'all' or 'range'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  // Directly calculate storage size from bills array (100% reliable offline & HTTP)
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

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Sidebar Container */}
      <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ReceiptText className="w-4 h-4" />
            </div>
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

        {/* Navigation / Content Items */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
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

          {/* Section 2: CSV Data Export with Date Filtering */}
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

          {/* Section 3: On-Device Storage (Approach 1: 2-Column Stat Tile) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Local Device Storage</span>
            </div>

            {/* Clean 2-Column Stat Card (Zero Text Wrapping!) */}
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

            {savedBills.length > 0 && (
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

          {/* Section 4: API Configuration (Placeholder) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">API Key Configuration</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              System Gemini key active via environment.
            </p>
            <input
              type="password"
              disabled
              value="••••••••••••••••••••••••••••"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white/80 text-xs text-slate-400 font-mono tracking-widest cursor-not-allowed"
            />
          </div>
        </div>

        {/* Sidebar Footer: Clean and Professional */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
          <span className="text-[11px] text-slate-400 font-medium">
            Bill Snap • Offline Ready
          </span>
        </div>
      </div>
    </div>
  );
}
