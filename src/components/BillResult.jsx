import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  Calendar, 
  Coins, 
  Tag, 
  RotateCcw, 
  Save, 
  HelpCircle,
  Zap
} from 'lucide-react';

export default function BillResult({ 
  imageDataUrl, 
  analysis, 
  onSave, 
  onReset 
}) {
  // Case 1: NOT a bill (Polite rejection with stable framed container)
  if (!analysis.is_bill) {
    return (
      <div className="flex-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-3">
          {/* Framed Image Container (Consistent height, no jump) */}
          <div className="h-[52vh] min-h-[420px] max-h-[560px] w-full shrink-0 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center overflow-hidden relative shadow-xs">
            <img 
              src={imageDataUrl} 
              alt="Rejected image preview" 
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>

          {/* In-place Rejection Card */}
          <div className="p-4 bg-rose-50/90 border border-rose-200/90 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200/60">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-950">Not a Bill or Receipt</p>
                <p className="text-xs font-medium text-rose-900 mt-1 leading-relaxed">
                  {analysis.rejection_reason || 
                    "This image does not appear to be a valid receipt or bill. Please select a clear receipt photo."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={onReset}
            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Pick Another Photo
          </button>
        </div>
      </div>
    );
  }

  // Case 2: IS a bill (Editable review state)
  const [merchant, setMerchant] = useState(analysis.merchant?.value || '');
  const [date, setDate] = useState(analysis.date?.value || '');
  const [amount, setAmount] = useState(analysis.total_amount?.value || '');
  const [currency, setCurrency] = useState(analysis.total_amount?.currency || '₹');
  const [category, setCategory] = useState(analysis.category || 'Food');

  const merchantConfidence = analysis.merchant?.confidence || 'high';
  const dateConfidence = analysis.date?.confidence || 'high';
  const amountConfidence = analysis.total_amount?.confidence || 'high';

  const hasUnsure = 
    merchantConfidence === 'low' || 
    dateConfidence === 'low' || 
    amountConfidence === 'low';

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        id: Date.now().toString(),
        merchant: merchant.trim() || 'Unknown Store',
        date: date || new Date().toISOString().split('T')[0],
        totalAmount: parseFloat(amount) || 0,
        currency,
        category,
        imageDataUrl,
        savedAt: new Date().toISOString()
      });
    }
  };

  return (
    <form onSubmit={handleSaveSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4 pb-4">
        {/* Pipeline Origin Badge (Edge + Cloud) */}
        {analysis?._localVerification && !analysis._localVerification.bypassed && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-700">Pipeline:</span>
              <span>Edge-Verified (MobileNetV3)</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {analysis._localVerification.latencyMs}ms
            </span>
          </div>
        )}

        {/* Confidence Notice Banner */}
        {hasUnsure ? (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">Review Unsure Fields:</span> Some fields are marked in amber because they were blurry or handwritten. You can tap and edit them before saving.
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            All details extracted with high confidence!
          </div>
        )}

        {/* Thumbnail preview */}
        <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 flex items-center justify-center">
          <img 
            src={imageDataUrl} 
            alt="Receipt thumbnail" 
            className="h-full w-full object-contain"
          />
        </div>

        {/* Field 1: Merchant */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              Merchant / Store
            </label>
            {merchantConfidence === 'low' ? (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Unsure — check
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confident
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition outline-none ${
              merchantConfidence === 'low'
                ? 'border-amber-300 bg-amber-50/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
            placeholder="Store Name"
          />
          {merchantConfidence === 'low' && analysis.merchant?.reason && (
            <p className="text-[11px] text-amber-600 mt-1 italic">{analysis.merchant.reason}</p>
          )}
        </div>

        {/* Field 2: Date */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date
            </label>
            {dateConfidence === 'low' ? (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Unsure — check
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confident
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition outline-none ${
              dateConfidence === 'low'
                ? 'border-amber-300 bg-amber-50/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
            placeholder="YYYY-MM-DD"
          />
          {dateConfidence === 'low' && analysis.date?.reason && (
            <p className="text-[11px] text-amber-600 mt-1 italic">{analysis.date.reason}</p>
          )}
        </div>

        {/* Field 3: Total Amount & Currency */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Total Amount
            </label>
            {amountConfidence === 'low' ? (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Unsure — check
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confident
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-16 px-3 py-2.5 rounded-xl border border-slate-200 text-center font-bold text-slate-700 bg-slate-50 focus:outline-none"
              placeholder="₹"
            />
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition outline-none ${
                amountConfidence === 'low'
                  ? 'border-amber-300 bg-amber-50/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
              placeholder="0.00"
            />
          </div>
          {amountConfidence === 'low' && analysis.total_amount?.reason && (
            <p className="text-[11px] text-amber-600 mt-1 italic">{analysis.total_amount.reason}</p>
          )}
        </div>

        {/* Field 4: Category */}
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category (Suggested by AI)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="Food">🍽️ Food & Dining</option>
            <option value="Groceries">🛒 Groceries & Supermarket</option>
            <option value="Utilities">💡 Utilities & Electricity</option>
            <option value="Shopping">🛍️ Shopping & Retail</option>
            <option value="Travel">🚕 Travel & Fuel</option>
            <option value="Health">💊 Health & Medical</option>
            <option value="Other">📄 Other</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 active:scale-95 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          Save Bill
        </button>
      </div>
    </form>
  );
}
