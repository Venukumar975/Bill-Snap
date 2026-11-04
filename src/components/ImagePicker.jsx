import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function ImagePicker({ onImageSelected }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read the selected image into a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected({
        file,
        dataUrl: reader.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);

    // Reset input value so user can pick the same file again if desired
    e.target.value = '';
  };

  return (
    <div className="w-full">
      {/* 1. Camera Input with direct environment capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2. Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition"
        >
          <Camera className="w-5 h-5" />
          Snap Bill
        </button>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 active:scale-95 transition"
        >
          <ImageIcon className="w-5 h-5" />
          Gallery
        </button>
      </div>
    </div>
  );
}
