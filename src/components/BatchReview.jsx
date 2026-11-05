import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Trash2, 
  Edit3, 
  X, 
  Loader2, 
  Zap, 
  Store, 
  Calendar, 
  Coins, 
  Tag, 
  RotateCcw,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Groceries',
  'Utilities',
  'Shopping',
  'Travel',
  'Health',
  'Other'
];

const CATEGORY_EMOJIS = {
  Food: '🍔',
  Groceries: '🛒',
  Utilities: '💡',
  Shopping: '🛍️',
  Travel: '✈️',
  Health: '💊',
  Other: '📄'
};

export default function BatchReview({
  batchItems,
  onUpdateItem,
  onRemoveItem,
  onRetryItem,
  onSaveAll,
  onCancel,
  batchLimitNotice
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [editForm, setEditForm] = useState({
    merchant: '',
    date: '',
    amount: '',
    currency: '₹',
    category: 'Food'
  });

  // Open Edit Modal for a specific card
  const handleStartEdit = (item) => {
    if (!item.analysis) return;
    setEditingItem(item);
    setEditForm({
      merchant: item.analysis.merchant?.value || item.merchant || 'Store',
      date: item.analysis.date?.value || item.date || new Date().toISOString().split('T')[0],
      amount: item.analysis.total_amount?.value || item.totalAmount || '0.00',
      currency: item.analysis.total_amount?.currency || item.currency || '₹',
      category: item.analysis.category || item.category || 'Food'
    });
  };

  // Save changes from Edit Modal
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateItem(editingItem.id, {
      ...editingItem,
      isEdited: true,
      analysis: {
        ...editingItem.analysis,
        is_bill: true,
        category: editForm.category,
        merchant: {
          ...editingItem.analysis?.merchant,
          value: editForm.merchant,
          confidence: 'high'
        },
        date: {
          ...editingItem.analysis?.date,
          value: editForm.date,
          confidence: 'high'
        },
        total_amount: {
          ...editingItem.analysis?.total_amount,
          value: editForm.amount,
          currency: editForm.currency,
          confidence: 'high'
        }
      }
    });

    setEditingItem(null);
  };

  // Count ready bills
  const validReadyItems = batchItems.filter(
    (item) => item.aiStatus === 'done' && item.analysis?.is_bill
  );

  const totalCalculatedAmount = validReadyItems.reduce((acc, item) => {
    const val = parseFloat(item.analysis?.total_amount?.value) || 0;
    return acc + val;
  }, 0);

  const currencySymbol = validReadyItems[0]?.analysis?.total_amount?.currency || '₹';
  const isAnyProcessing = batchItems.some(
    (item) => item.aiStatus === 'analyzing' || item.localStatus === 'checking'
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/90 overflow-hidden">
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Batch Receipt Scanner</h2>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {validReadyItems.length} / {batchItems.length} Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Distributed parallel extraction via active models
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition active:scale-95"
          title="Cancel Batch"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Batch Limit Notice Pill (if user selected more than limit) */}
      {batchLimitNotice && (
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs text-amber-800 animate-fade-in shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-tight">{batchLimitNotice}</span>
        </div>
      )}

      {/* 3. The 2-Column Batch Triage Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {batchItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No images in batch.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-24">
            {batchItems.map((item, index) => {
              const isLocalChecking = item.localStatus === 'checking';
              const isLocalInvalid = item.localStatus === 'invalid';
              const isAiAnalyzing = item.aiStatus === 'analyzing';
              const isAiDone = item.aiStatus === 'done';
              const isAiError = item.aiStatus === 'error';
              const isValidBill = isAiDone && item.analysis?.is_bill;
              const isRejectedBill = isAiDone && !item.analysis?.is_bill;

              const merchantVal = item.analysis?.merchant?.value || '—';
              const amountVal = item.analysis?.total_amount?.value || '0.00';
              const currVal = item.analysis?.total_amount?.currency || '₹';
              const catVal = item.analysis?.category || 'Other';
              const catEmoji = CATEGORY_EMOJIS[catVal] || '📄';

              const hasUnsure =
                item.analysis?.merchant?.confidence === 'low' ||
                item.analysis?.date?.confidence === 'low' ||
                item.analysis?.total_amount?.confidence === 'low';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs flex flex-col ${
                    isValidBill
                      ? hasUnsure
                        ? 'border-amber-300 ring-1 ring-amber-100'
                        : 'border-emerald-300 ring-1 ring-emerald-50'
                      : isLocalInvalid || isRejectedBill
                      ? 'border-rose-200 bg-rose-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Dedicated Card Top Bar (Prevents overlapping on image) */}
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        #{index + 1}
                      </span>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                        {item.assignedModel?.replace('gemini-', '') || 'MobileNet'}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition active:scale-95"
                      title="Remove from batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Clean Framed Thumbnail Container (Tap to open full photo) */}
                  <div 
                    onClick={() => setSelectedPreview({
                      dataUrl: item.dataUrl,
                      title: item.analysis?.merchant?.value ? `${item.analysis.merchant.value} — Receipt #${index + 1}` : `Receipt #${index + 1}`
                    })}
                    className="relative h-28 w-full bg-slate-100/80 border-b border-slate-100 overflow-hidden flex items-center justify-center cursor-pointer group/thumb hover:brightness-95 transition"
                    title="Tap to view receipt photo"
                  >
                    <img
                      src={item.dataUrl}
                      alt={`Receipt ${index + 1}`}
                      className="h-full w-full object-contain p-1 pointer-events-none"
                    />

                    {/* Subtle hover eye icon */}
                    <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition pointer-events-none">
                      <Eye className="w-4 h-4 text-white drop-shadow-md" />
                    </div>

                    {/* Non-overlapping status badge pinned inside bottom of thumbnail */}
                    {isLocalChecking && (
                      <div className="absolute inset-x-2 bottom-2 bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xs pointer-events-none">
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                        <span>Checking locally...</span>
                      </div>
                    )}

                    {isAiAnalyzing && (
                      <div className="absolute inset-x-2 bottom-2 bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xs animate-pulse pointer-events-none">
                        <Sparkles className="w-3 h-3 animate-spin shrink-0" />
                        <span>Extracting with AI...</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    {/* STATE 1: Soft Rejection (Local Model says < 0.65) */}
                    {isLocalInvalid && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-1.5 text-amber-800 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-900 leading-tight">
                              Receipt Not Detected (Confidence: {item.localVerification?.confidencePct || 0}%)
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                              This doesn't look like a standard bill. Tap Scan Anyway if this is a valid receipt.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => onRetryItem(item.id, true)}
                            className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-xs active:scale-95"
                          >
                            <Sparkles className="w-3 h-3" />
                            Scan Anyway
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition active:scale-95"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 2: AI Rejected (Gemini says is_bill === false) */}
                    {isRejectedBill && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-1.5 text-rose-800 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">
                            {item.analysis?.rejection_reason || 'Not a valid bill.'}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition active:scale-95"
                        >
                          Remove from Batch
                        </button>
                      </div>
                    )}

                    {/* STATE 3: AI Extraction Error (With Friendly Offline Catch) */}
                    {isAiError && (
                      <div className="space-y-2">
                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">
                            {item.errorMessage?.includes('Internet') || item.errorMessage?.includes('network') || item.errorMessage?.includes('fetch')
                              ? 'No Internet Connection — Please connect to Wi-Fi or mobile data and tap Retry.'
                              : item.errorMessage || 'Extraction failed.'}
                          </span>
                        </div>
                        <button
                          onClick={() => onRetryItem(item.id, true)}
                          className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Retry Extraction
                        </button>
                      </div>
                    )}

                    {/* STATE 4: Successfully Extracted Valid Bill */}
                    {isValidBill && (
                      <div className="space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {item.analysis?.date?.value || 'Today'}
                            </span>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <span>{catEmoji}</span>
                              <span>{catVal}</span>
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={merchantVal}>
                            {merchantVal}
                          </h3>

                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-sm font-extrabold text-slate-900 font-mono">
                              {currVal}{amountVal}
                            </span>
                            {hasUnsure && (
                              <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Review unsure
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Edit Action Button */}
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="mt-2 w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          Edit Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200/90 px-4 py-3 shrink-0 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Batch Total ({validReadyItems.length} Valid):
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {currencySymbol}{totalCalculatedAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition active:scale-95"
          >
            Cancel
          </button>

          <button
            disabled={validReadyItems.length === 0 || isAnyProcessing}
            onClick={() => onSaveAll(validReadyItems)}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {isAnyProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Batch...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save All Valid Bills ({validReadyItems.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. Quick Inline Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden animate-scale-in">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                Edit Bill Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              {/* Merchant */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Store className="w-3 h-3 text-slate-400" />
                  Merchant / Store
                </label>
                <input
                  type="text"
                  required
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                    <Coins className="w-3 h-3 text-slate-400" />
                    Currency
                  </label>
                  <input
                    type="text"
                    value={editForm.currency}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-2 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-2 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_EMOJIS[c]} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Receipt Image Modal (Identical to BillCard modal) */}
      {selectedPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPreview(null)}
        >
          <div 
            className="relative max-w-sm max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800 truncate mr-2">{selectedPreview.title}</span>
              <button 
                onClick={() => setSelectedPreview(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition active:scale-95"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img 
                src={selectedPreview.dataUrl} 
                alt="Full receipt" 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
