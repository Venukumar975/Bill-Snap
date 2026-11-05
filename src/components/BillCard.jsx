import React, { useState } from 'react';
import { 
  Trash2, 
  Calendar, 
  Tag, 
  Eye, 
  X,
  Store
} from 'lucide-react';

const CATEGORY_ICONS = {
  Food: '🍽️',
  Groceries: '🛒',
  Utilities: '💡',
  Shopping: '🛍️',
  Travel: '🚕',
  Health: '💊',
  Other: '📄'
};

export default function BillCard({ bill, onDelete }) {
  const [showFullImage, setShowFullImage] = useState(false);

  const categoryEmoji = CATEGORY_ICONS[bill.category] || '📄';

  return (
    <>
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition flex items-center gap-3.5 group">
        {/* Receipt Thumbnail (Tap to open full photo) */}
        {bill.imageDataUrl ? (
          <button 
            onClick={() => setShowFullImage(true)}
            className="w-14 h-16 rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden shrink-0 flex items-center justify-center relative active:scale-95 transition group/thumb"
            title="View receipt photo"
          >
            <img 
              src={bill.imageDataUrl} 
              alt={bill.merchant} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        ) : (
          <div className="w-14 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <Store className="w-5 h-5" />
          </div>
        )}

        {/* Bill Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {bill.merchant}
            </h4>
            <span className="text-sm font-bold text-slate-900 shrink-0 ml-2">
              {bill.currency} {Number(bill.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
              <span>{categoryEmoji}</span>
              <span>{bill.category}</span>
            </span>

            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {bill.date}
            </span>
          </div>
        </div>

        {/* Delete Action (Permanent red container with clear touch affordance) */}
        <button
          onClick={() => onDelete(bill.id)}
          className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 hover:bg-rose-100 flex items-center justify-center transition shrink-0 active:scale-90"
          title="Delete bill"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Full Receipt Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowFullImage(false)}
        >
          <div 
            className="relative max-w-sm max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800">{bill.merchant} — Photo</span>
              <button 
                onClick={() => setShowFullImage(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img 
                src={bill.imageDataUrl} 
                alt="Full receipt" 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
