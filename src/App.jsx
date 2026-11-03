import React from 'react';
import { Camera, Image as ImageIcon, ReceiptText, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      {/* Mobile Screen Container */}
      <main className="w-full max-w-md h-screen sm:h-[844px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="px-5 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Bill Snap</h1>
              <p className="text-xs text-slate-500 font-medium">Smart Receipt Scanner</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            PWA Ready
          </span>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <ReceiptText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">No bills saved yet</h2>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Snap a photo of your receipt or pick one from your phone gallery to extract details instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition">
              <Camera className="w-4 h-4" />
              Snap Bill
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 active:scale-95 transition">
              <ImageIcon className="w-4 h-4" />
              Gallery
            </button>
          </div>
        </div>

        {/* Bottom Bar Info */}
        <footer className="px-5 py-3 border-t border-slate-100 text-center bg-slate-50 text-xs text-slate-400">
          Ready for camera capture & AI extraction
        </footer>
      </main>
    </div>
  );
}
