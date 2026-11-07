import AgentReview from './components/AgentReview.jsx';
import { API_CONFIG } from './services/api.js';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import ScanForm from './components/ScanForm.jsx';

import Dashboard from './pages/Dashboard.jsx';
import ScanResults from './pages/ScanResults.jsx';
import FixComparison from './pages/FixComparison.jsx';
import Reports from './pages/Reports.jsx';

import { useScanData } from './hooks/useScanData.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    currentScanId,
    switchScan,
    loading,
    scanRunning,
    error,
    metadata,
    summary,
    violations,
    recentScans,
    fixComparison,
    appliedFixIds,
    toggleFixApplied,
    dynamicMetrics,
    startNewScan,
    notification,
    clearNotification,
  } = useScanData();

  const allData = {
    metadata,
    summary,
    violations,
    fixComparison,
    appliedFixIds,
    dynamicMetrics,
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0B132B] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        {/* Sidebar with responsive mobile drawer support */}
        <Sidebar
          metadata={metadata}
          summary={summary}
          dynamicMetrics={dynamicMetrics}
          recentScans={recentScans}
          currentScanId={currentScanId}
          onSelectScan={switchScan}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <Navbar
            metadata={metadata}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            allData={allData}
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          />

          {/* Mandatory Central Demonstration Notice Banner */}
          {API_CONFIG.useMockData && !isBannerDismissed && (
            <div className="bg-[#101C38] border-b border-blue-900/40 px-6 py-2.5 text-xs text-blue-200 flex items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                <span>
                  <strong>AccessAble Demonstration Mode:</strong> All scores, DOM nodes, and WCAG 2.2 violations are realistic demonstration mock data for UI/UX evaluation. No real website was scanned. Connect production endpoints in <code className="text-white bg-slate-900 px-1 py-0.5 rounded">services/api.js</code>.
                </span>
              </div>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="text-slate-400 hover:text-white p-1 rounded"
                aria-label="Dismiss demonstration banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium">
                  Loading accessibility audit workspace...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-sm">
                <div className="font-bold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Audit Workspace Error
                </div>
                <p>{error}</p>
              </div>
            ) : (
              <ErrorBoundary>
                <Routes>
                  <Route path="/agent-review" element={<AgentReview />} />
                  <Route
                    path="/"
                    element={
                      <Dashboard
                        metadata={metadata}
                        summary={summary}
                        violations={violations}
                        recentScans={recentScans}
                        startNewScan={startNewScan}
                        scanRunning={scanRunning}
                        appliedFixIds={appliedFixIds}
                        dynamicMetrics={dynamicMetrics}
                        switchScan={switchScan}
                        currentScanId={currentScanId}
                      />
                    }
                  />
                  <Route
                    path="/scan-results"
                    element={
                      <ScanResults
                        metadata={metadata}
                        summary={summary}
                        violations={violations}
                        appliedFixIds={appliedFixIds}
                        toggleFixApplied={toggleFixApplied}
                        dynamicMetrics={dynamicMetrics}
                        allData={allData}
                      />
                    }
                  />
                  <Route
                    path="/fix-comparison"
                    element={
                      <FixComparison
                        fixComparison={fixComparison}
                        violations={violations}
                        appliedFixIds={appliedFixIds}
                        toggleFixApplied={toggleFixApplied}
                        dynamicMetrics={dynamicMetrics}
                      />
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <Reports
                        metadata={metadata}
                        summary={summary}
                        violations={violations}
                        fixComparison={fixComparison}
                        dynamicMetrics={dynamicMetrics}
                        appliedFixIds={appliedFixIds}
                        toggleFixApplied={toggleFixApplied}
                        allData={allData}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            )}
          </main>
        </div>

        {/* Modal: New Audit Scan Dialog */}
        {isScanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <span>Configure New Accessibility Audit</span>
                </div>
                <button
                  onClick={() => setIsScanModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ScanForm
                onSubmitScan={startNewScan}
                isScanning={scanRunning}
                isModal={true}
                onClose={() => setIsScanModalOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Non-blocking feedback toast */}
        <Toast notification={notification} onClose={clearNotification} />
      </div>
    </BrowserRouter>
  );
}
