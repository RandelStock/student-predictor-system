/**
 * ProfessorPage.jsx  —  FIXED
 *
 * Fixes:
 *  1. White screen on correlation / classification / regression / test2025 / trends
 *     → those tabs no longer gated behind `&& data`
 *  2. Removed page header banner from ProfessorSidebarLayout (see that file)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import API_BASE_URL from "../apiBase";
import ProfessorSidebarLayout from "./professor/ProfessorSidebarLayout";
import ProfessorTimingModal from "./professor/ProfessorTimingModal";
import ModelOverviewDashboard from "./professor/ModelOverviewDashboard";
import ProfessorPerformanceDashboard from "./professor/ProfessorPerformanceDashboard";
import ProfessorFeaturesDashboard from "./professor/ProfessorFeaturesDashboard";
import ProfessorCurriculumDashboard from "./professor/ProfessorCurriculumDashboard";
import ProfessorClassificationMetricsDashboard from "./professor/ProfessorClassificationMetricsDashboard";
import ProfessorRegressionMetricsDashboard from "./professor/ProfessorRegressionMetricsDashboard";
import ProfessorCorrelationDashboard from "./professor/ProfessorCorrelationDashboard";
import ProfessorTest2025Dashboard from "./professor/ProfessorTest2025Dashboard";
import ProfessorTrendsDashboard from "./professor/ProfessorTrendsDashboard";
import {
  c,
  buildMockData,
  generateInsights,
} from "./professor/ProfessorShared";

export default function ProfessorPage({ onLogout }) {

  // ── State (unchanged) ────────────────────────────────────────────────────
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("model_overview");
  const [modelInfo, setModelInfo]     = useState(null);
  const [correlation, setCorrelation] = useState(null);

  const [attempts, setAttempts]           = useState(null);
  const [monthly, setMonthly]             = useState(null);
  const [yearlyPF, setYearlyPF]           = useState(null);
  const [trendInsights, setTrendInsights] = useState(null);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [attPage, setAttPage]             = useState(1);
  const [attFilter, setAttFilter]         = useState({ year: "", month: "" });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [usageSummary, setUsageSummary]   = useState(null);
  const [usageLoading, setUsageLoading]   = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reviewAnalysis, setReviewAnalysis] = useState(null);
  const [timingAnalysis, setTimingAnalysis] = useState(null);
  const [timingModalOpen, setTimingModalOpen] = useState(false);
  const [selectedTimingAttempt, setSelectedTimingAttempt] = useState(null);
  const [selectedTimingData, setSelectedTimingData]       = useState(null);
  const [selectedTimingLoading, setSelectedTimingLoading] = useState(false);

  const [test2025, setTest2025]               = useState(null);
  const [testLoading, setTestLoading]         = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run]         = useState(null);
  const [test2025RunLoading, setTest2025RunLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [dashFilters, setDashFilters] = useState({ year: "", month: "", review: "", subject: "" });

  // ── Fetch logic (unchanged) ───────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, modelRes, corrRes, dashRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics`),
        fetch(`${API_BASE_URL}/model-info`),
        fetch(`${API_BASE_URL}/correlation`),
        fetch(`${API_BASE_URL}/dashboard`),
      ]);
      if (!analyticsRes.ok || !modelRes.ok) throw new Error("Server error");
      const analytics = await analyticsRes.json();
      const model     = await modelRes.json();
      const corr      = corrRes.ok ? await corrRes.json() : null;
      const dash      = dashRes.ok ? await dashRes.json() : {};
      const mock = buildMockData();
      setData({ ...mock, ...analytics });
      setModelInfo(model);
      setCorrelation(corr && !corr.error ? corr : null);
      setDashboardData(dash);                                     // ← ADD THIS
    } catch {
      setData(buildMockData());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminFromDb = useCallback(async () => {
    try {
      const yearParam  = attFilter.year  ? `&year=${attFilter.year}`   : "";
      const monthParam = attFilter.month ? `&month=${attFilter.month}` : "";
      const [attRes, yRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/attempts?page=${attPage}&page_size=20${yearParam}${monthParam}`),
        fetch(`${API_BASE_URL}/admin/pass-fail-by-year`),
      ]);
      if (attRes.ok) setAttempts(await attRes.json());
      if (yRes.ok)   setYearlyPF(await yRes.json());
      if (selectedYear) {
        const mRes = await fetch(`${API_BASE_URL}/admin/monthly-summary?year=${selectedYear}`);
        if (mRes.ok) setMonthly(await mRes.json());
      }
    } catch (e) { console.error("Admin fetch error:", e); }
  }, [attPage, attFilter, selectedYear]);

  const fetchTrendInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/trend-insights`);
      if (res.ok) setTrendInsights(await res.json());
    } catch (e) { console.error("Trend insights error:", e); }
    finally { setInsightsLoading(false); }
  }, []);

  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/usage-summary?days=30`);
      if (res.ok) setUsageSummary(await res.json());
    } catch (e) { console.error("Usage summary error:", e); }
    finally { setUsageLoading(false); }
  }, []);

  const fetchReviewAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/review-analysis`);
      if (res.ok) setReviewAnalysis(await res.json());
    } catch (e) { console.error("Review analysis error:", e); }
  }, []);

  const fetchTimingAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/timing-analysis?limit=10`);
      if (res.ok) setTimingAnalysis(await res.json());
    } catch (e) { console.error("Timing analysis error:", e); }
  }, []);

  const openTimingModal = useCallback(async (attempt) => {
    if (!attempt?.attempt_id) return;
    setTimingModalOpen(true);
    setSelectedTimingAttempt(attempt);
    setSelectedTimingData(null);
    setSelectedTimingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/attempt-timings?attempt_id=${encodeURIComponent(attempt.attempt_id)}`);
      if (!res.ok) throw new Error("Failed");
      setSelectedTimingData(await res.json());
    } catch { setSelectedTimingData({ error: "Could not load attempt timing details." }); }
    finally { setSelectedTimingLoading(false); }
  }, []);

  const downloadPerformanceReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/performance-report?year=${selectedYear}&days=30`);
      if (!res.ok) throw new Error("Server error");
      const payload = await res.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      const ts = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      a.href = url;
      a.download = `performance_report_${selectedYear}_${ts}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Report error:", e);
      alert("Could not download performance report.");
    } finally { setReportLoading(false); }
  }, [selectedYear]);

  // ── Effects (unchanged) ───────────────────────────────────────────────────
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    (async () => {
      setTestLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025`);
        if (!res.ok) throw new Error("Server error");
        if (!cancelled) setTest2025(await res.json());
      } catch { if (!cancelled) setTest2025({ error: "Could not load 2025 defense metrics." }); }
      finally { if (!cancelled) setTestLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-records`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) { setTest2025Records(payload.error ? null : payload.items || []); setSelectedTestIdx(0); }
      } catch { if (!cancelled) setTest2025Records([]); }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025" || !test2025Records?.length) return;
    let cancelled = false;
    (async () => {
      setTest2025RunLoading(true); setTest2025Run(null);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-predict?idx=${selectedTestIdx}`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) setTest2025Run(payload.error ? { error: payload.error } : payload);
      } catch { if (!cancelled) setTest2025Run({ error: "Could not load prediction." }); }
      finally { if (!cancelled) setTest2025RunLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTab, selectedTestIdx, test2025Records]);

  useEffect(() => {
    if (activeTab === "trends") {
      fetchAdminFromDb(); fetchUsage(); fetchReviewAnalysis(); fetchTimingAnalysis();
      if (!trendInsights) fetchTrendInsights();
    }
  }, [activeTab, fetchAdminFromDb, fetchTrendInsights, trendInsights, fetchUsage, fetchReviewAnalysis, fetchTimingAnalysis]);

  useEffect(() => {
    if (activeTab === "trends") fetchAdminFromDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attPage, attFilter, selectedYear, activeTab]);

  // ── Derived data (unchanged) ──────────────────────────────────────────────
  const ov            = useMemo(() => data?.overview ?? {},                 [data]);
  const passByYear    = useMemo(() => data?.pass_rate_by_year     ?? [],    [data]);
  const passByStrand  = useMemo(() => data?.pass_rate_by_strand   ?? [],    [data]);
  const passByReview  = useMemo(() => data?.pass_rate_by_review   ?? [],    [data]);
  const passByDur     = useMemo(() => data?.pass_rate_by_duration ?? [],    [data]);
  const featureImp    = useMemo(() => data?.feature_importance    ?? [],    [data]);
  const sectionScores = useMemo(() => data?.section_scores        ?? [],    [data]);
  const weakestQ      = useMemo(() => data?.weakest_questions     ?? [],    [data]);
  const subjectTrends = useMemo(() => data?.subject_trends_by_year ?? [],   [data]);

  const reviewYesTotal = useMemo(() => passByReview.find(x => String(x.label).toLowerCase().includes("attended"))?.total ?? 0, [passByReview]);
  const reviewNoTotal  = useMemo(() => passByReview.find(x => String(x.label).toLowerCase().includes("no formal"))?.total ?? 0, [passByReview]);

  const filteredReview = useMemo(() => {
    if (!dashFilters.review) return passByReview;
    return passByReview.filter(x => {
      if (dashFilters.review === "Yes") return x.label?.toLowerCase().includes("attended");
      if (dashFilters.review === "No")  return x.label?.toLowerCase().includes("no formal");
      return true;
    });
  }, [passByReview, dashFilters.review]);

  const filteredYears = useMemo(() => {
    if (!dashFilters.year) return passByYear;
    return passByYear.filter(x => String(x.label) === String(dashFilters.year));
  }, [passByYear, dashFilters.year]);

  const availableYears = useMemo(() =>
    [...new Set([...passByYear.map(x => x.label), ...subjectTrends.map(x => String(x.year))])].sort(),
    [passByYear, subjectTrends]
  );

  const filteredSubjectTrends = useMemo(() => {
    if (!dashFilters.year) return subjectTrends;
    return subjectTrends.filter(x => String(x.year) === String(dashFilters.year));
  }, [subjectTrends, dashFilters.year]);

  const weakestSubject = useMemo(() => {
    if (!subjectTrends.length) return null;
    const first = subjectTrends[0];
    const last  = subjectTrends[subjectTrends.length - 1];
    const mk = (id, avgKey, deltaKey) => ({ id, avg: Number(last?.[avgKey]), delta: Number(last?.[deltaKey] ?? (Number(last?.[avgKey]) - Number(first?.[avgKey]))) });
    return [mk("EE","EE_avg","EE_delta"), mk("MATH","MATH_avg","MATH_delta"), mk("ESAS","ESAS_avg","ESAS_delta")]
      .filter(x => Number.isFinite(x.avg))
      .sort((a, b) => a.avg - b.avg)[0] ?? null;
  }, [subjectTrends]);

  const localInsights = useMemo(() => generateInsights(data, dashFilters), [data, dashFilters]);

  const scatterData = useMemo(() => dashboardData?.scatterData ?? [], [dashboardData]);

  const pieData = useMemo(() => [
    { name: "Passers", value: Number(ov.total_passers || 0), color: c.pass },
    { name: "Failers", value: Number(ov.total_failers || 0), color: c.fail },
  ], [ov]);

  const reviewPieData = useMemo(() => [
    { name: "Attended Review", value: reviewYesTotal, color: c.teal },
    { name: "No Review",       value: reviewNoTotal,  color: c.amber },
  ], [reviewYesTotal, reviewNoTotal]);

  const sharedProps = { dashFilters, setDashFilters, availableYears, localInsights };

  // ── Loading spinner ───────────────────────────────────────────────────────
  const loadingSpinner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
      <svg style={{ animation: "spin 0.8s linear infinite", width: 36, height: 36, color: "#F5C518" }} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".15"/>
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <p style={{ fontSize: 14, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>Loading analytics…</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ProfessorSidebarLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={fetchAnalytics}
      onLogout={onLogout}
    >
      {/* Show spinner while main analytics load */}
      {loading && loadingSpinner}

      {/* ── Tabs that need `data` from /analytics ── */}
      {!loading && data && (
        <div className="fade-in">
          {activeTab === "model_overview" && (
            <ModelOverviewDashboard
              {...sharedProps}
              ov={ov}
              pieData={pieData}
              reviewPieData={reviewPieData}
              filteredYears={filteredYears}
              passByYear={passByYear}
              filteredReview={filteredReview}
              passByDur={passByDur}
              modelInfo={modelInfo}
              passByStrand={passByStrand}
              sectionScores={sectionScores}
              weakestQ={weakestQ}
              subjectTrends={subjectTrends}
              filteredSubjectTrends={filteredSubjectTrends}
              correlation={correlation}
              scatterData={scatterData}
              passByPeriod={dashboardData?.passByPeriod ?? []}    // ← ADD
              subjectByYear={dashboardData?.subjectByYear ?? []}  // ← ADD
            />
          )}

          {activeTab === "performance" && (
            <ProfessorPerformanceDashboard
              {...sharedProps}
              passByStrand={passByStrand}
              sectionScores={sectionScores}
              subjectTrends={subjectTrends}
              filteredSubjectTrends={filteredSubjectTrends}
              weakestSubject={weakestSubject}
            />
          )}

          {activeTab === "features" && (
            <ProfessorFeaturesDashboard featureImp={featureImp} />
          )}

          {activeTab === "curriculum" && (
            <ProfessorCurriculumDashboard weakestQ={weakestQ} />
          )}
        </div>
      )}

      {/* ── Tabs with their OWN fetch — NOT gated behind `data` ── */}
      {!loading && (
        <div className="fade-in">
          {activeTab === "classification_metrics" && (
            <ProfessorClassificationMetricsDashboard modelInfo={modelInfo} />
          )}

          {activeTab === "regression_metrics" && (
            <ProfessorRegressionMetricsDashboard modelInfo={modelInfo} />
          )}

          {activeTab === "correlation" && (
            <ProfessorCorrelationDashboard correlation={correlation} />
          )}

          {activeTab === "test2025" && (
            <ProfessorTest2025Dashboard
              testLoading={testLoading}
              test2025={test2025}
              scatterData={scatterData}
              test2025Records={test2025Records}
              selectedTestIdx={selectedTestIdx}
              setSelectedTestIdx={setSelectedTestIdx}
              test2025Run={test2025Run}
              test2025RunLoading={test2025RunLoading}
            />
          )}

          {activeTab === "trends" && (
            <ProfessorTrendsDashboard
              usageLoading={usageLoading}
              usageSummary={usageSummary}
              downloadPerformanceReport={downloadPerformanceReport}
              reportLoading={reportLoading}
              insightsLoading={insightsLoading}
              trendInsights={trendInsights}
              fetchTrendInsights={fetchTrendInsights}
              yearlyPF={yearlyPF}
              reviewAnalysis={reviewAnalysis}
              timingAnalysis={timingAnalysis}
              openTimingModal={openTimingModal}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              monthly={monthly}
              attFilter={attFilter}
              setAttFilter={setAttFilter}
              setAttPage={setAttPage}
              attempts={attempts}
              attPage={attPage}
            />
          )}
        </div>
      )}

      {/* Timing modal */}
      <ProfessorTimingModal
        attempt={selectedTimingAttempt}
        open={timingModalOpen}
        loading={selectedTimingLoading}
        data={selectedTimingData}
        onClose={() => setTimingModalOpen(false)}
      />
    </ProfessorSidebarLayout>
  );
}