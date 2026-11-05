import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function ImagePicker({ onImageSelected, onBatchSelected, onLimitExceeded, batchLimit = 3 }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected({
        file,
        dataUrl: reader.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Strict Enforcement: If user picked more than batchLimit, do NOT proceed!
    if (files.length > batchLimit) {
      if (onLimitExceeded) {
        onLimitExceeded({ selectedCount: files.length, limit: batchLimit });
      } else {
        alert(`Limit Exceeded: You selected ${files.length} receipts. Your safe limit is ${batchLimit} bills (based on active AI models). Please select up to ${batchLimit}.`);
      }
      e.target.value = '';
      return;
    }

    // Case 1: Single file selected -> standard single-bill flow
    if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected({
          file,
          dataUrl: reader.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    // Case 2: Multi-file batch within safe limit
    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file,
            dataUrl: reader.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const readItems = await Promise.all(readPromises);

    if (onBatchSelected) {
      onBatchSelected({
        items: readItems,
        totalSelected: files.length,
        batchLimit
      });
    }

    e.target.value = '';
  };

  return (
    <div className="w-full">
      {/* 1. Camera Input with direct environment capture (single) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
      />

      {/* 2. Gallery Input (multiple allowed) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryChange}
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
