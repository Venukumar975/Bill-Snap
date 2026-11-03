import React, { useState, useRef } from 'react';
import { Plus, Camera, Image as ImageIcon, X } from 'lucide-react';

export default function AddBillFAB({ onImageSelected }) {
  const [isOpen, setIsOpen] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected({
        file,
        dataUrl: reader.result,
        name: file.name
      });
      setIsOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      {/* Hidden Native File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dimmed backdrop when FAB menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Menu Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {/* Speed-dial options when opened */}
        {isOpen && (
          <div className="flex flex-col gap-2 items-end mb-1 animate-slide-up">
            {/* Option 1: Take Photo */}
            <button
              onClick={() => {
                cameraInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-800 rounded-2xl font-bold text-xs shadow-xl border border-slate-200/80 active:scale-95 transition hover:bg-slate-50"
            >
              <span>Take Photo</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
            </button>

            {/* Option 2: Gallery */}
            <button
              onClick={() => {
                galleryInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-800 rounded-2xl font-bold text-xs shadow-xl border border-slate-200/80 active:scale-95 transition hover:bg-slate-50"
            >
              <span>Choose from Gallery</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* The Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all duration-200 active:scale-95 ${
            isOpen 
              ? 'bg-slate-800 shadow-slate-900/20 rotate-0' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
          }`}
          title="Add Bill"
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Bill</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
