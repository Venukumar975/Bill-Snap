import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  Check, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { 
  getActiveApiKey, 
  setActiveApiKey, 
  clearActiveApiKey, 
  testGeminiApiKey 
} from '../services/apiKeyManager';

export default function ApiKeyModal({
  isOpen,
  onClose,
  onApiKeyUpdated
}) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null);
  const [isKeyVerified, setIsKeyVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getActiveApiKey();
      setApiKeyInput(current);
      setIsKeyVerified(Boolean(current));
      setKeyFeedback(null);
      setShowApiKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      clearActiveApiKey();
      setIsKeyVerified(false);
      setKeyFeedback({ type: 'error', text: 'Please enter a valid Gemini API key' });
      return;
    }

    setIsTestingKey(true);
    setKeyFeedback(null);

    try {
      await testGeminiApiKey(trimmed);
      setActiveApiKey(trimmed);
      setIsKeyVerified(true);
      setKeyFeedback({ type: 'success', text: 'Key verified & saved to device!' });
      if (onApiKeyUpdated) {
        onApiKeyUpdated(trimmed);
      }
      setTimeout(() => {
        setKeyFeedback(null);
        onClose();
      }, 1500);
    } catch (err) {
      setIsKeyVerified(false);
      setKeyFeedback({ type: 'error', text: err.message || 'Verification failed. Please check key.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClear = () => {
    clearActiveApiKey();
    setApiKeyInput('');
    setIsKeyVerified(false);
    setKeyFeedback({ type: 'success', text: 'API key removed from device.' });
    if (onApiKeyUpdated) {
      onApiKeyUpdated('');
    }
    setTimeout(() => setKeyFeedback(null), 2500);
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
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              isKeyVerified ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}>
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gemini API Key</h3>
              <p className="text-[11px] text-slate-400 font-medium">BYOK • On-Device Storage</p>
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
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-600">Current Status</span>
            {isKeyVerified ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Verified & Connected
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-200/60 border border-slate-300 px-2 py-0.5 rounded-full">
                Key Required
              </span>
            )}
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Stored strictly in your phone's browser <code className="text-slate-700 font-mono text-[11px]">localStorage</code>. Never sent to any third-party server.
            </p>
          </div>

          {/* Key Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setKeyFeedback(null);
                }}
                className="w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 font-mono outline-none focus:border-indigo-500 transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Notice */}
          {keyFeedback && (
            <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              keyFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {keyFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{keyFeedback.text}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              disabled={isTestingKey || !apiKeyInput.trim()}
              onClick={handleSaveAndTest}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-100 transition active:scale-95 disabled:opacity-50"
            >
              {isTestingKey ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Test</span>
                </>
              )}
            </button>
            {(apiKeyInput || isKeyVerified) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition active:scale-95 shadow-2xs"
              >
                Clear
              </button>
            )}
          </div>
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
