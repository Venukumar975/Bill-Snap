import React, { useState } from 'react';
import { ReceiptText, RotateCcw, Sparkles } from 'lucide-react';
import ImagePicker from './components/ImagePicker';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageSelected = (imageObj) => {
    setSelectedImage(imageObj);
  };

  const handleRetake = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center sm:p-4">
      {/* Mobile Screen Container */}
      <main className="w-full max-w-md h-screen sm:h-[844px] bg-white sm:rounded-3xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/60">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Bill Snap</h1>
              <p className="text-xs text-slate-400 font-medium">Smart Receipt Scanner</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
          {!selectedImage ? (
            /* Empty State / Initial Pick View */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <ReceiptText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Snap or pick a bill</h2>
              <p className="text-sm text-slate-500 max-w-xs mb-8">
                Take a clear photo of your receipt or select one from your gallery to view it instantly.
              </p>

              <div className="w-full max-w-xs">
                <ImagePicker onImageSelected={handleImageSelected} />
              </div>
            </div>
          ) : (
            /* Instant Image Preview View */
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Image Preview
                </span>
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake / Change
                </button>
              </div>

              {/* White Card with Image */}
              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center overflow-hidden max-h-[500px]">
                <img
                  src={selectedImage.dataUrl}
                  alt="Captured receipt preview"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              </div>

              {/* Next Step Action Button */}
              <div className="pt-4">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze Bill (Coming Next)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-100 text-center bg-white text-xs text-slate-400">
          Pure White Theme • Modular Architecture
        </footer>
      </main>
    </div>
  );
}
