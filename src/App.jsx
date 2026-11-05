import React, { useState, useEffect } from 'react';
import { 
  ReceiptText, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Cpu, 
  Menu, 
  RefreshCw,
  TrendingUp,
  Receipt,
  PieChart,
  ChevronRight,
  X,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import ImagePicker from './components/ImagePicker';
import AddBillFAB from './components/AddBillFAB';
import BillResult from './components/BillResult';
import BillCard from './components/BillCard';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import CategoryBreakdownModal from './components/CategoryBreakdownModal';
import BatchReview from './components/BatchReview';
import { extractBillData } from './services/ai';
import { initModelEngine, getCachedModels, refreshModelEngine, getDynamicBatchLimit } from './services/modelManager';
import { saveBill, getAllBills, deleteBill, clearAllBills } from './services/storage';
import { getActiveApiKey } from './services/apiKeyManager';
import { classifyReceiptLocally } from './services/localModelService';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // On-Device AI Local Verification State
  const [localVerification, setLocalVerification] = useState(null);
  const [isVerifyingLocal, setIsVerifyingLocal] = useState(false);

  // Saved Bills State (from IndexedDB)
  const [savedBills, setSavedBills] = useState([]);
  const [isLoadingBills, setIsLoadingBills] = useState(true);

  // Model Engine & Navigation State
  const [activeModel, setActiveModel] = useState(null);
  const [fallbackModels, setFallbackModels] = useState([]);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshingEngine, setIsRefreshingEngine] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  // Batch Processing State (Gallery Multi-Select)
  const [batchItems, setBatchItems] = useState(null);
  const [batchLimitNotice, setBatchLimitNotice] = useState(null);
  const [limitExceededWarning, setLimitExceededWarning] = useState(null);

  const dynamicBatchLimit = getDynamicBatchLimit(getActiveApiKey());

  const handleLimitExceeded = ({ selectedCount, limit }) => {
    setLimitExceededWarning(
      `Limit Exceeded: You selected ${selectedCount} receipts. Your safe limit is ${limit} bills (based on active AI models). Please select up to ${limit}.`
    );
    setTimeout(() => {
      setLimitExceededWarning(null);
    }, 6000);
  };

  // Load Saved Bills from IndexedDB on startup
  useEffect(() => {
    async function loadBills() {
      try {
        const bills = await getAllBills();
        setSavedBills(bills);
      } catch (err) {
        console.error('Failed to load bills from IndexedDB:', err);
      } finally {
        setIsLoadingBills(false);
      }
    }
    loadBills();
  }, []);

  // Background Model Engine Initialization (Reads strictly from localStorage BYOK)
  useEffect(() => {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      setIsEngineReady(false);
      return;
    }

    const cached = getCachedModels(apiKey);
    if (cached && cached.length > 0) {
      setActiveModel(cached[0]);
      setFallbackModels(cached);
      setIsEngineReady(true);
      return;
    }

    initModelEngine(
      apiKey,
      (firstModel) => {
        setActiveModel(firstModel);
        setIsEngineReady(true);
      },
      (allModels) => {
        setFallbackModels(allModels);
      }
    ).catch((err) => {
      console.warn('[App] Engine init warning:', err.message);
    });
  }, []);

  const handleManualRefreshEngine = async () => {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      alert('Please enter your Gemini API key in the sidebar menu first.');
      return;
    }

    setIsRefreshingEngine(true);
    try {
      const refreshed = await refreshModelEngine(
        apiKey,
        (firstModel) => setActiveModel(firstModel),
        (allModels) => setFallbackModels(allModels)
      );
      if (refreshed && refreshed.length > 0) {
        setActiveModel(refreshed[0]);
        setFallbackModels(refreshed);
      }
    } catch (err) {
      alert(`Refresh failed: ${err.message}`);
    } finally {
      setIsRefreshingEngine(false);
    }
  };

  const handleApiKeyChange = async (newKey) => {
    if (!newKey) {
      setActiveModel(null);
      setFallbackModels([]);
      setIsEngineReady(false);
      return;
    }

    setIsRefreshingEngine(true);
    try {
      await initModelEngine(
        newKey,
        (firstModel) => {
          setActiveModel(firstModel);
          setIsEngineReady(true);
        },
        (allModels) => {
          setFallbackModels(allModels);
        }
      );
    } catch (err) {
      console.warn('Engine init with new key failed:', err.message);
    } finally {
      setIsRefreshingEngine(false);
    }
  };

  const handleImageSelected = async (imageObj) => {
    setSelectedImage(imageObj);
    setAnalysisResult(null);
    setErrorMessage(null);
    setLocalVerification(null);
    setIsVerifyingLocal(true);

    try {
      const res = await classifyReceiptLocally(imageObj.dataUrl);
      setLocalVerification(res);
    } catch (err) {
      console.warn('Local on-device verification skipped:', err);
      setLocalVerification({ isSupported: false, isValidBill: true });
    } finally {
      setIsVerifyingLocal(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setLocalVerification(null);
    setIsVerifyingLocal(false);
  };

  const handleAnalyze = async (bypassLocalCheck = false) => {
    if (!selectedImage?.dataUrl) return;

    // If local verification hasn't completed yet and wasn't explicitly bypassed, run it
    let verification = localVerification;
    if (!verification && !bypassLocalCheck) {
      setIsVerifyingLocal(true);
      try {
        verification = await classifyReceiptLocally(selectedImage.dataUrl);
        setLocalVerification(verification);
      } catch (e) {
        verification = { isSupported: false, isValidBill: true };
      } finally {
        setIsVerifyingLocal(false);
      }
    }

    // If local verification explicitly determined it's NOT a bill and user didn't bypass, halt
    if (verification && !verification.isValidBill && !bypassLocalCheck) {
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const data = await extractBillData(selectedImage.dataUrl);
      if (data._usedModel) {
        setActiveModel(data._usedModel);
      }
      if (verification) {
        data._localVerification = verification;
      }
      setAnalysisResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze bill. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveBill = async (billData) => {
    try {
      const saved = await saveBill(billData);
      setSavedBills((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
      handleReset();
    } catch (err) {
      alert(`Failed to save bill: ${err.message}`);
    }
  };

  // ==============================================================
  // BATCH PROCESSING HANDLERS (Gallery Multi-Select)
  // ==============================================================
  const handleBatchSelected = async ({ items, totalSelected, batchLimit }) => {
    if (!items || items.length === 0) return;

    // Reset single-image mode
    setSelectedImage(null);
    setAnalysisResult(null);

    if (totalSelected > batchLimit) {
      setBatchLimitNotice(
        `Selected ${totalSelected} receipts. Processing first ${items.length} to stay within safe model concurrency.`
      );
    } else {
      setBatchLimitNotice(null);
    }

    const apiKey = getActiveApiKey();
    const models = getCachedModels(apiKey) || [activeModel || 'gemini-2.5-flash'];

    // Map each item with dynamic sharded model assignment
    const initialBatch = items.map((img, idx) => ({
      id: `batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: img.name,
      file: img.file,
      dataUrl: img.dataUrl,
      assignedModel: models[idx % models.length],
      localStatus: 'checking',
      localVerification: null,
      aiStatus: 'idle',
      analysis: null,
      errorMessage: null
    }));

    setBatchItems(initialBatch);

    // Process each item through cascaded pipeline
    initialBatch.forEach(async (batchItem) => {
      // 1. Local MobileNetV3 Check
      let verification = null;
      try {
        verification = await classifyReceiptLocally(batchItem.dataUrl);
      } catch (e) {
        verification = { isSupported: false, isValidBill: true };
      }

      const isLocalValid = verification ? verification.isValidBill : true;

      if (!isLocalValid && !verification?.bypassed) {
        // Soft rejection state
        setBatchItems((prev) =>
          prev
            ? prev.map((it) =>
                it.id === batchItem.id
                  ? { ...it, localStatus: 'invalid', localVerification: verification }
                  : it
              )
            : null
        );
        return;
      }

      // Mark locally valid and start AI extraction
      setBatchItems((prev) =>
        prev
          ? prev.map((it) =>
              it.id === batchItem.id
                ? {
                    ...it,
                    localStatus: 'valid',
                    localVerification: verification,
                    aiStatus: 'analyzing'
                  }
                : it
            )
          : null
      );

      // 2. Multimodal AI Extraction with dynamically assigned model
      try {
        const data = await extractBillData(batchItem.dataUrl, apiKey, batchItem.assignedModel);
        if (verification) {
          data._localVerification = verification;
        }
        setBatchItems((prev) =>
          prev
            ? prev.map((it) =>
                it.id === batchItem.id
                  ? { ...it, aiStatus: 'done', analysis: data }
                  : it
              )
            : null
        );
      } catch (err) {
        setBatchItems((prev) =>
          prev
            ? prev.map((it) =>
                it.id === batchItem.id
                  ? { ...it, aiStatus: 'error', errorMessage: err.message || 'Extraction failed' }
                  : it
              )
            : null
        );
      }
    });
  };

  const handleUpdateBatchItem = (id, updatedItem) => {
    setBatchItems((prev) =>
      prev ? prev.map((it) => (it.id === id ? updatedItem : it)) : null
    );
  };

  const handleRemoveBatchItem = (id) => {
    setBatchItems((prev) => {
      if (!prev) return null;
      const next = prev.filter((it) => it.id !== id);
      return next.length > 0 ? next : null;
    });
  };

  const handleRetryBatchItem = async (id, bypassLocal = false) => {
    const item = batchItems?.find((it) => it.id === id);
    if (!item) return;

    setBatchItems((prev) =>
      prev
        ? prev.map((it) =>
            it.id === id
              ? { ...it, localStatus: 'valid', aiStatus: 'analyzing', errorMessage: null }
              : it
          )
        : null
    );

    const apiKey = getActiveApiKey();
    try {
      const data = await extractBillData(item.dataUrl, apiKey, item.assignedModel);
      if (item.localVerification) {
        data._localVerification = item.localVerification;
      }
      setBatchItems((prev) =>
        prev
          ? prev.map((it) =>
              it.id === id
                ? { ...it, aiStatus: 'done', analysis: data }
                : it
            )
          : null
      );
    } catch (err) {
      setBatchItems((prev) =>
        prev
          ? prev.map((it) =>
              it.id === id
                ? { ...it, aiStatus: 'error', errorMessage: err.message || 'Retry failed' }
                : it
            )
          : null
      );
    }
  };

  const handleSaveAllBatchBills = async (validItems) => {
    try {
      for (const item of validItems) {
        const analysis = item.analysis;
        const billData = {
          merchant: analysis.merchant?.value || item.name || 'Store',
          date: analysis.date?.value || new Date().toISOString().split('T')[0],
          totalAmount: parseFloat(analysis.total_amount?.value) || 0,
          currency: analysis.total_amount?.currency || '₹',
          category: analysis.category || 'Other',
          imageDataUrl: item.dataUrl,
          confidence: {
            merchant: analysis.merchant?.confidence,
            date: analysis.date?.confidence,
            total_amount: analysis.total_amount?.confidence
          }
        };
        await saveBill(billData);
      }

      const refreshed = await getAllBills();
      setSavedBills(refreshed);
      setBatchItems(null);
      setBatchLimitNotice(null);
    } catch (err) {
      alert(`Error saving batch bills: ${err.message}`);
    }
  };

  const handleCancelBatch = () => {
    setBatchItems(null);
    setBatchLimitNotice(null);
  };

  const handleDeleteBill = async (id) => {
    try {
      await deleteBill(id);
      setSavedBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(`Failed to delete bill: ${err.message}`);
    }
  };

  const handleClearAllBills = async () => {
    try {
      await clearAllBills();
      setSavedBills([]);
    } catch (err) {
      alert(`Failed to clear bills: ${err.message}`);
    }
  };

  // Calculate Total Spending & Filtered Bills
  const totalSpend = savedBills.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const primaryCurrency = savedBills[0]?.currency || '₹';
  const displayBills = activeCategoryFilter 
    ? savedBills.filter((b) => (b.category || 'Other') === activeCategoryFilter)
    : savedBills;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center sm:p-4">
      {/* Mobile Screen Container */}
      <main className="w-full max-w-md h-screen sm:h-[844px] bg-white sm:rounded-3xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/60">
        
        {/* Header (Permanently Fixed Top) */}
        <header className="px-4 pt-5 pb-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            {/* 3 Horizontal Lines (Opens Slide-over Sidebar) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition active:scale-95 shadow-xs"
              title="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Bill Snap Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-indigo-100/50 shrink-0">
                <img 
                  src="/favicon.png" 
                  alt="Bill Snap" 
                  className="w-full h-full object-cover" 
                />
                {/* Live Scanning Laser Beam */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none animate-scan-laser" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Bill Snap</h1>
                <p className="text-[10px] text-slate-400 font-medium">Smart Receipt Scanner</p>
              </div>
            </div>
          </div>

          {/* Dynamic Model Status Pill */}
          <button
            onClick={() => (activeModel ? setIsSettingsOpen(true) : setIsSidebarOpen(true))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition active:scale-95"
          >
            {isRefreshingEngine ? (
              <>
                <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                <span className="text-indigo-600 font-bold">Checking...</span>
              </>
            ) : isEngineReady && activeModel ? (
              <>
                <Cpu className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[100px]">{activeModel.replace('gemini-', '')}</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3 h-3 text-amber-500" />
                <span className="text-amber-700 font-semibold">Set API Key</span>
              </>
            )}
          </button>
        </header>

        {/* Floating Limit Exceeded Banner / Toast */}
        {limitExceededWarning && (
          <div className="mx-4 mt-2 p-3 bg-amber-500 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold animate-slide-down z-30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
              <span>{limitExceededWarning}</span>
            </div>
            <button
              onClick={() => setLimitExceededWarning(null)}
              className="p-1 hover:bg-amber-600 rounded-lg text-white/80 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: HOME FEED (When no image is currently being processed) */}
        {/* ============================================================== */}
        {!selectedImage && !batchItems && (
          <>
            {savedBills.length === 0 ? (
              /* Empty State when zero bills exist */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <ReceiptText className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">No bills saved yet</h2>
                <p className="text-sm text-slate-500 max-w-xs mb-8">
                  Take a clear photo of your receipt or select one from your gallery to view and save it.
                </p>

                <div className="w-full max-w-xs">
                  <ImagePicker 
                    onImageSelected={handleImageSelected} 
                    onBatchSelected={handleBatchSelected}
                    onLimitExceeded={handleLimitExceeded}
                    batchLimit={dynamicBatchLimit}
                  />
                </div>
              </div>
            ) : (
              /* Fixed Dashboard + Scrollable Feed Layout */
              <div className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* 1. FIXED TOP HERO AREA (Never scrolls / Non-movable) */}
                <div className="px-4 pt-3 pb-2 shrink-0 bg-white z-10">
                  {/* The Gorgeous Royal Indigo/Purple Gradient Hero Card */}
                  <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    {/* Subtle decorative glow in corner */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Total Tracked Spending
                      </span>
                      <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                        {savedBills.length} {savedBills.length === 1 ? 'bill' : 'bills'}
                      </span>
                    </div>

                    <div className="text-3xl font-black tracking-tight drop-shadow-xs">
                      {primaryCurrency} {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* Category Breakdown Trigger Pill */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/15">
                      <span className="text-[11px] text-indigo-100 font-medium">
                        {new Set(savedBills.map((b) => b.category || 'Other')).size} categories tracked
                      </span>
                      <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md rounded-full text-[11px] font-bold text-white transition shadow-2xs cursor-pointer"
                      >
                        <PieChart className="w-3.5 h-3.5" />
                        <span>By Category</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Non-movable "Recent Bills" Title (Invisible container with exact text height) */}
                  <div className="pt-2.5 pb-1 px-1 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 leading-none">
                      <Receipt className="w-3.5 h-3.5" />
                      {activeCategoryFilter ? `${activeCategoryFilter} (${displayBills.length})` : 'Recent Bills'}
                    </h3>
                    {activeCategoryFilter && (
                      <button
                        onClick={() => setActiveCategoryFilter(null)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition active:scale-95"
                      >
                        <span>Show All</span>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. SCROLLABLE BILLS FEED (ONLY the bills scroll!) */}
                <div className="flex-1 overflow-y-auto px-4 pt-1 pb-24 space-y-2.5">
                  {displayBills.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-600">No bills found in {activeCategoryFilter}</p>
                      <button
                        onClick={() => setActiveCategoryFilter(null)}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        View all {savedBills.length} bills
                      </button>
                    </div>
                  ) : (
                    displayBills.map((bill) => (
                      <BillCard 
                        key={bill.id} 
                        bill={bill} 
                        onDelete={handleDeleteBill} 
                      />
                    ))
                  )}
                </div>

                {/* 4. Floating Action Button (FAB) */}
                <AddBillFAB 
                  onImageSelected={handleImageSelected} 
                  onBatchSelected={handleBatchSelected}
                  onLimitExceeded={handleLimitExceeded}
                  batchLimit={dynamicBatchLimit}
                />
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: Image Preview & Analyze Screen                         */}
        {/* ============================================================== */}
        {selectedImage && !analysisResult && !batchItems && (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Image Preview
              </span>
              <button
                disabled={isAnalyzing}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>

            {/* White Card with Image Preview */}
            <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center overflow-hidden max-h-[460px] relative">
              <img
                src={selectedImage.dataUrl}
                alt="Captured receipt preview"
                className={`max-h-full max-w-full object-contain rounded-xl transition ${isAnalyzing ? 'opacity-40 blur-[1px]' : ''}`}
              />

              {/* Loading Scanner Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-[3px] z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-3 animate-bounce">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {localVerification?.isValidBill ? 'Extracting Line Items...' : 'Reading Receipt...'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                    {localVerification?.isValidBill && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ Edge Verified ({localVerification.latencyMs}ms)
                      </span>
                    )}
                    <span>→ Gemini Cloud Extraction</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live On-Device Status Indicator */}
            {isVerifyingLocal && (
              <div className="mt-2.5 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-700 animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                  <span className="font-semibold">On-Device AI:</span>
                  <span>Verifying receipt locally...</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-500 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                  MobileNetV3
                </span>
              </div>
            )}

            {/* Validated On-Device Receipt Badge */}
            {!isVerifyingLocal && localVerification?.isValidBill && !localVerification?.bypassed && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Verified Receipt</span>
                    <span className="text-emerald-700 ml-1.5 font-medium">({localVerification.confidencePct}% confidence)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  {localVerification.latencyMs}ms
                </div>
              </div>
            )}

            {/* Soft Rejection Card with User Override */}
            {!isVerifyingLocal && localVerification && !localVerification.isValidBill && (
              <div className="mt-2.5 p-3.5 bg-amber-50/95 border border-amber-200 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Receipt Not Detected (Confidence: {localVerification.confidencePct || 0}%)
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      This doesn't look like a standard bill. Tap Scan Anyway if this is a valid receipt.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition active:scale-95 text-center"
                  >
                    Pick Another
                  </button>
                  <button
                    disabled={isAnalyzing || !isEngineReady}
                    onClick={() => handleAnalyze(true)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Scan Anyway
                  </button>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Error:</span> {errorMessage}
                </div>
              </div>
            )}

            {/* Primary Analyze Button (When Validated or Pending) */}
            {(!localVerification || localVerification.isValidBill) && (
              <div className="pt-3.5">
                <button
                  disabled={isAnalyzing || !isEngineReady || isVerifyingLocal}
                  onClick={() => handleAnalyze(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : !isEngineReady ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting AI Engine...
                    </>
                  ) : isVerifyingLocal ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Checking Receipt Locally...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Bill with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: Analysis Results (Review & Fix Screen)                 */}
        {/* ============================================================== */}
        {selectedImage && analysisResult && !batchItems && (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col">
            <BillResult
              imageDataUrl={selectedImage.dataUrl}
              analysis={analysisResult}
              onSave={handleSaveBill}
              onReset={handleReset}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: Batch Review Screen (Gallery Multi-Select)             */}
        {/* ============================================================== */}
        {batchItems && batchItems.length > 0 && (
          <BatchReview
            batchItems={batchItems}
            onUpdateItem={handleUpdateBatchItem}
            onRemoveItem={handleRemoveBatchItem}
            onRetryItem={handleRetryBatchItem}
            onSaveAll={handleSaveAllBatchBills}
            onCancel={handleCancelBatch}
            batchLimitNotice={batchLimitNotice}
          />
        )}

        {/* Slide-over Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeModel={activeModel}
          onOpenModelSettings={() => setIsSettingsOpen(true)}
          savedBills={savedBills}
          onClearAllBills={handleClearAllBills}
          onApiKeyUpdated={handleApiKeyChange}
        />

        {/* Settings / Model Queue Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          activeModel={activeModel}
          fallbackModels={fallbackModels}
          onRefreshEngine={handleManualRefreshEngine}
          isRefreshing={isRefreshingEngine}
        />

        {/* Category Spending Breakdown Modal */}
        <CategoryBreakdownModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          bills={savedBills}
          onSelectCategory={(cat) => setActiveCategoryFilter(cat)}
          activeFilterCategory={activeCategoryFilter}
        />
      </main>
    </div>
  );
}
