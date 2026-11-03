import React, { useState, useEffect } from 'react';
import { ReceiptText, RotateCcw, Sparkles, Loader2, AlertCircle, Cpu, Menu, RefreshCw } from 'lucide-react';
import ImagePicker from './components/ImagePicker';
import BillResult from './components/BillResult';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import { extractBillData } from './services/ai';
import { initModelEngine, getCachedModels, refreshModelEngine } from './services/modelManager';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Model Engine & UI Navigation State
  const [activeModel, setActiveModel] = useState(null);
  const [fallbackModels, setFallbackModels] = useState([]);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshingEngine, setIsRefreshingEngine] = useState(false);

  // Background Model Engine Initialization
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return;

    // Check 7-day cache first (instant hit)
    const cached = getCachedModels(apiKey);
    if (cached && cached.length > 0) {
      setActiveModel(cached[0]);
      setFallbackModels(cached);
      setIsEngineReady(true);
      return;
    }

    // Otherwise, discover in background without blocking user
    initModelEngine(
      apiKey,
      (firstModel) => {
        setActiveModel(firstModel);
        setIsEngineReady(true);
      },
      (allModels) => {
        setFallbackModels(allModels);
        console.log('[App] All fallback models ready:', allModels);
      }
    ).catch((err) => {
      console.warn('[App] Engine init warning:', err.message);
    });
  }, []);

  const handleManualRefreshEngine = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return;

    setIsRefreshingEngine(true);
    try {
      const refreshed = await refreshModelEngine(
        apiKey,
        (firstModel) => {
          setActiveModel(firstModel);
        },
        (allModels) => {
          setFallbackModels(allModels);
        }
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

  const handleImageSelected = (imageObj) => {
    setSelectedImage(imageObj);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage?.dataUrl) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const data = await extractBillData(selectedImage.dataUrl);
      if (data._usedModel) {
        setActiveModel(data._usedModel);
      }
      setAnalysisResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze bill. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveBill = (billData) => {
    alert(`Saved bill: ${billData.merchant} - ${billData.currency}${billData.totalAmount}`);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center sm:p-4">
      {/* Mobile Screen Container */}
      <main className="w-full max-w-md h-screen sm:h-[844px] bg-white sm:rounded-3xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/60">
        
        {/* Header */}
        <header className="px-4 pt-5 pb-3.5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {/* 3 Horizontal Lines (Opens Slide-over Sidebar) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition active:scale-95 shadow-sm"
              title="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Bill Snap Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Bill Snap</h1>
                <p className="text-[10px] text-slate-400 font-medium">Smart Receipt Scanner</p>
              </div>
            </div>
          </div>

          {/* Dynamic Model Status Pill with Real-time "Checking..." Feedback */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition active:scale-95"
          >
            {isRefreshingEngine ? (
              <>
                <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                <span className="text-indigo-600">Checking...</span>
              </>
            ) : isEngineReady && activeModel ? (
              <>
                <Cpu className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[100px]">{activeModel.replace('gemini-', '')}</span>
              </>
            ) : (
              <>
                <Cpu className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400">Connecting...</span>
              </>
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
          {/* View 1: Initial Empty / Pick View */}
          {!selectedImage && (
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
          )}

          {/* View 2: Image Preview & Analyze Action */}
          {selectedImage && !analysisResult && (
            <div className="flex-1 flex flex-col">
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
                  Change
                </button>
              </div>

              {/* White Card with Image Preview */}
              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center overflow-hidden max-h-[500px] relative">
                <img
                  src={selectedImage.dataUrl}
                  alt="Captured receipt preview"
                  className={`max-h-full max-w-full object-contain rounded-xl transition ${isAnalyzing ? 'opacity-40 blur-[1px]' : ''}`}
                />

                {/* Loading Scanner Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-3 animate-bounce">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Reading Receipt...</p>
                    <p className="text-xs text-slate-500 mt-1">Checking bill & extracting details</p>
                  </div>
                )}
              </div>

              {/* Error Message if API fails */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Error:</span> {errorMessage}
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <div className="pt-4">
                <button
                  disabled={isAnalyzing || !isEngineReady}
                  onClick={handleAnalyze}
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
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Bill
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* View 3: Analysis Results (Review & Fix Screen) */}
          {selectedImage && analysisResult && (
            <BillResult
              imageDataUrl={selectedImage.dataUrl}
              analysis={analysisResult}
              onSave={handleSaveBill}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-100 text-center bg-white text-xs text-slate-400">
          Pure White Theme • Modular Architecture
        </footer>

        {/* Slide-over Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeModel={activeModel}
          onOpenModelSettings={() => setIsSettingsOpen(true)}
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
      </main>
    </div>
  );
}
