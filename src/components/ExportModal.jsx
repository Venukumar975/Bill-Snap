import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { exportBillsToCSV, exportBillsToExcel } from '../services/storage';

export default function ExportModal({
  isOpen,
  onClose,
  savedBills = []
}) {
  const [format, setFormat] = useState('excel'); // 'excel' | 'csv'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'range'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text: '' }

  if (!isOpen) return null;

  const handleExport = () => {
    setNotice(null);
    try {
      const from = filterMode === 'range' && startDate ? startDate : null;
      const to = filterMode === 'range' && endDate ? endDate : null;

      let count = 0;
      if (format === 'excel') {
        count = exportBillsToExcel(savedBills, from, to);
      } else {
        count = exportBillsToCSV(savedBills, from, to);
      }

      setNotice({
        type: 'success',
        text: `Exported ${count} bills to ${format.toUpperCase()}!`
      });
      setTimeout(() => {
        setNotice(null);
        onClose();
      }, 1500);
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.message || 'Export failed'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Bills</h3>
              <p className="text-[11px] text-slate-400 font-medium">Download spreadsheet reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Format Selector (Excel vs CSV) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select File Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 active:scale-[0.98] ${
                  format === 'excel'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    format === 'excel' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  {format === 'excel' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Excel (.xlsx)</p>
                  <p className="text-[10px] text-slate-500 font-medium">Formatted spreadsheet</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 active:scale-[0.98] ${
                  format === 'csv'
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    format === 'csv' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  {format === 'csv' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">CSV (.csv)</p>
                  <p className="text-[10px] text-slate-500 font-medium">Universal light format</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Filter Selection */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Filter Records
            </label>
            <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Bills ({savedBills.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('range')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  filterMode === 'range'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Custom Range Inputs */}
            {filterMode === 'range' && (
              <div className="grid grid-cols-2 gap-2 pt-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notice Feedback */}
          {notice && (
            <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
          <button
            disabled={savedBills.length === 0}
            onClick={handleExport}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-white rounded-2xl font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 ${
              format === 'excel'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download {format.toUpperCase()} File</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 font-semibold text-xs hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
