import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getScanResults,
  getFixComparison,
  getRecentScans,
  requestScan,
  waitForScan,
  API_CONFIG,
} from '../services/api.js';

export function useScanData() {
  const [currentScanId, setCurrentScanId] = useState(API_CONFIG.useMockData ? 'scan-2026-0492-acc' : null);
  const [loading, setLoading] = useState(true);
  const [scanRunning, setScanRunning] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [fixComparison, setFixComparison] = useState(null);
  const [appliedFixIds, setAppliedFixIds] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Initial data load for default or selected scan
  const loadInitialData = useCallback(async (scanIdToLoad = currentScanId) => {
    setLoading(true);
    setError(null);
    try {
      if (!scanIdToLoad) {
        const history = await getRecentScans();
        setRecentScans(history.scans);
        if (history.scans.length) setCurrentScanId(history.scans[0].id);
        return;
      }
      const [resultsRes, fixRes, recentRes] = await Promise.all([
        getScanResults(scanIdToLoad),
        getFixComparison(scanIdToLoad),
        getRecentScans(),
      ]);

      if (resultsRes.success) {
        setMetadata(resultsRes.metadata);
        setSummary(resultsRes.summary);
        setViolations(resultsRes.violations);

        // Pre-apply fixed items from dataset
        const initialApplied = new Set(
          resultsRes.violations.filter((v) => v.isApplied).map((v) => v.id)
        );
        setAppliedFixIds(initialApplied);
      }

      if (fixRes.success) {
        setFixComparison(fixRes.comparison);
      }

      if (recentRes.success) {
        setRecentScans(recentRes.scans);
      }
    } catch (err) {
      setError(err.message || 'Failed to load accessibility scan data');
    } finally {
      setLoading(false);
    }
  }, [currentScanId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Switch to a specific scan from history
  const switchScan = useCallback(async (scanId) => {
    if (!scanId || scanId === currentScanId) return;
    setLoading(true);
    setError(null);
    try {
      const [resultsRes, fixRes] = await Promise.all([
        getScanResults(scanId),
        getFixComparison(scanId),
      ]);

      if (resultsRes.success) {
        setCurrentScanId(scanId);
        setMetadata(resultsRes.metadata);
        setSummary(resultsRes.summary);
        setViolations(resultsRes.violations);

        const initialApplied = new Set(
          resultsRes.violations.filter((v) => v.isApplied).map((v) => v.id)
        );
        setAppliedFixIds(initialApplied);

        setNotification({
          type: 'info',
          message: `Switched active audit to ${resultsRes.metadata.targetUrl} (${scanId}).`,
        });
      }

      if (fixRes.success) {
        setFixComparison(fixRes.comparison);
      }
    } catch (err) {
      setError(err.message || `Failed to switch to scan ${scanId}`);
    } finally {
      setLoading(false);
    }
  }, [currentScanId]);

  // Trigger a new accessibility scan
  const startNewScan = useCallback(async ({ targetUrl, repoUrl, standard, depth }) => {
    setScanRunning(true);
    setError(null);
    try {
      const res = await requestScan({ targetUrl, repoUrl, standard, depth });
      if (res.success) {
        await waitForScan(res.scanId);
        setCurrentScanId(res.scanId);

        // Fetch the newly generated scan records
        const [resultsRes, fixRes] = await Promise.all([
          getScanResults(res.scanId),
          getFixComparison(res.scanId),
        ]);

        if (resultsRes.success) {
          setMetadata(resultsRes.metadata);
          setSummary(resultsRes.summary);
          setViolations(resultsRes.violations);
          const initialApplied = new Set(
            resultsRes.violations.filter((v) => v.isApplied).map((v) => v.id)
          );
          setAppliedFixIds(initialApplied);
        }

        if (fixRes.success) {
          setFixComparison(fixRes.comparison);
        }

        // Prepend to recent scans list
        const newRecent = {
          id: res.scanId,
          url: targetUrl,
          repo: repoUrl ? repoUrl.replace('https://github.com/', '') : 'manual-audit',
          score: resultsRes.summary?.currentScore ?? 0,
          violationsCount: resultsRes.violations?.length ?? 0,
          criticalCount: resultsRes.summary?.severityBreakdown?.critical ?? 0,
          status: 'Completed',
          date: 'Just now',
          standard: standard || 'WCAG 2.2 AA',
        };
        setRecentScans((prev) => [newRecent, ...(prev || []).filter((s) => s.id !== res.scanId).slice(0, 4)]);

        setNotification({
          type: 'success',
          message: `Audit completed for ${targetUrl}${res.isMock ? ' (demonstration)' : ''}.`,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || 'Scan failed');
      setNotification({
        type: 'error',
        message: `Scan failed: ${err.message}`,
      });
      throw err;
    } finally {
      setScanRunning(false);
    }
  }, []);

  // Toggle fix application state
  const toggleFixApplied = useCallback((violationId) => {
    if (!API_CONFIG.useMockData) {
      setNotification({type:'info',message:'Source changes require a validated candidate and human review. No fix was applied.'});
      return;
    }
    setAppliedFixIds((prev) => {
      const next = new Set(prev);
      const isNowApplied = !next.has(violationId);
      if (isNowApplied) {
        next.add(violationId);
      } else {
        next.delete(violationId);
      }

      const viol = violations.find((v) => v.id === violationId);
      setNotification({
        type: isNowApplied ? 'success' : 'info',
        message: isNowApplied
          ? `Remediation patch applied for ${viol?.title || violationId}. Score updated!`
          : `Remediation patch reverted for ${viol?.title || violationId}.`,
      });

      return next;
    });
  }, [violations]);

  // Dynamically compute live scores and counts based on applied fixes
  const dynamicMetrics = useMemo(() => {
    if (!summary || !violations.length) {
      const baseScore = summary?.currentScore ?? 0;
      return {
        currentScore: baseScore,
        dynamicScore: baseScore,
        remainingViolationsCount: 0,
        resolvedCount: 0,
        activeCritical: 0,
        activeSerious: 0,
        activeModerate: 0,
        activeMinor: 0,
      };
    }

    const unapplied = violations.filter((v) => !appliedFixIds.has(v.id));
    const resolvedCount = appliedFixIds.size;

    const activeCritical = unapplied.filter((v) => v.severity === 'critical').length;
    const activeSerious = unapplied.filter((v) => v.severity === 'serious').length;
    const activeModerate = unapplied.filter((v) => v.severity === 'moderate').length;
    const activeMinor = unapplied.filter((v) => v.severity === 'minor').length;

    // Accurate score gain calculation:
    // Starts at summary.currentScore; when all violations are applied, reaches projectedScore
    const initialScore = summary.currentScore;
    const targetScore = summary.projectedScore || 94;
    const maxGain = Math.max(0, targetScore - initialScore);
    const gainPerFix = violations.length > 0 ? maxGain / violations.length : 0;
    const dynamicScore = Math.min(100, Math.round(initialScore + resolvedCount * gainPerFix));

    return {
      currentScore: initialScore,
      dynamicScore,
      remainingViolationsCount: unapplied.length,
      resolvedCount,
      activeCritical,
      activeSerious,
      activeModerate,
      activeMinor,
    };
  }, [summary, violations, appliedFixIds]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
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
    refreshData: loadInitialData,
  };
}
