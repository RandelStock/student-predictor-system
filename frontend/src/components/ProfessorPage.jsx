import { useState, useEffect, useCallback, useMemo } from "react";
import API_BASE_URL from "../apiBase";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import ProfessorTabsNav from "./professor/ProfessorTabsNav";
import ProfessorTimingModal from "./professor/ProfessorTimingModal";
import ModelOverviewDashboard from "./professor/ModelOverviewDashboard";
import ProfessorOverviewDashboard from "./professor/ProfessorOverviewDashboard";
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
  MONTH_NAMES,
  CHART_COLORS,
  pct,
  num,
  CustomTooltip,
  MetricCard,
  ChartContainer,
  FilterPanel,
  InsightBox,
  buildMockData,
  generateInsights,
} from "./professor/ProfessorShared";

// ── Main ProfessorPage ────────────────────────────────────────────────────────
export default function ProfessorPage({ onLogout }) {
  // ── ALL ORIGINAL STATE ────────────────────────────────────────────────────
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [modelInfo, setModelInfo]     = useState(null);
  const [correlation, setCorrelation] = useState(null);

  const [attempts, setAttempts]       = useState(null);
  const [monthly, setMonthly]         = useState(null);
  const [yearlyPF, setYearlyPF]       = useState(null);
  const [trendInsights, setTrendInsights] = useState(null);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [attPage, setAttPage]         = useState(1);
  const [attFilter, setAttFilter]     = useState({ year: "", month: "" });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reviewAnalysis, setReviewAnalysis] = useState(null);
  const [timingAnalysis, setTimingAnalysis] = useState(null);
  const [timingModalOpen, setTimingModalOpen] = useState(false);
  const [selectedTimingAttempt, setSelectedTimingAttempt] = useState(null);
  const [selectedTimingData, setSelectedTimingData] = useState(null);
  const [selectedTimingLoading, setSelectedTimingLoading] = useState(false);

  const [test2025, setTest2025] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run] = useState(null);
  const [test2025RunLoading, setTest2025RunLoading] = useState(false);

  // ── NEW: enhanced dashboard filters ──────────────────────────────────────
  const [dashFilters, setDashFilters] = useState({ year: "", month: "", review: "", subject: "" });

  // ── ALL ORIGINAL FETCH LOGIC (unchanged) ─────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, modelRes, corrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics`),
        fetch(`${API_BASE_URL}/model-info`),
        fetch(`${API_BASE_URL}/correlation`),
      ]);
      if (!analyticsRes.ok || !modelRes.ok) throw new Error("Server error");
      const analytics = await analyticsRes.json();
      const model     = await modelRes.json();
      const corr      = corrRes.ok ? await corrRes.json() : null;
      const mock = buildMockData();
      setData({ ...mock, ...analytics });
      setModelInfo(model);
      setCorrelation(corr && !corr.error ? corr : null);
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

  // ── safe data accessors ───────────────────────────────────────────────────
  
  const ov           = useMemo(() => data?.overview ?? {},                   [data]);
  const passByYear   = useMemo(() => data?.pass_rate_by_year     ?? [],      [data]);
  const passByStrand = useMemo(() => data?.pass_rate_by_strand   ?? [],      [data]);
  const passByReview = useMemo(() => data?.pass_rate_by_review   ?? [],      [data]);
  const passByDur    = useMemo(() => data?.pass_rate_by_duration ?? [],      [data]);
  const featureImp   = useMemo(() => data?.feature_importance    ?? [],      [data]);
  const sectionScores= useMemo(() => data?.section_scores        ?? [],      [data]);
  const weakestQ     = useMemo(() => data?.weakest_questions     ?? [],      [data]);
  const subjectTrends= useMemo(() => data?.subject_trends_by_year ?? [],     [data]);

  const reviewYesTotal = useMemo(() => passByReview.find(x => String(x.label).toLowerCase().includes("attended"))?.total ?? 0, [passByReview]);
  const reviewNoTotal  = useMemo(() => passByReview.find(x => String(x.label).toLowerCase().includes("no formal"))?.total ?? 0, [passByReview]);

  // ── filter pass_rate_by_review by dashFilter.review ──────────────────────
  const filteredReview = useMemo(() => {
    if (!dashFilters.review) return passByReview;
    return passByReview.filter(x => {
      if (dashFilters.review === "Yes") return x.label?.toLowerCase().includes("attended");
      if (dashFilters.review === "No")  return x.label?.toLowerCase().includes("no formal");
      return true;
    });
  }, [passByReview, dashFilters.review]);

  // ── filter pass_rate_by_year by dashFilter.year ───────────────────────────
  const filteredYears = useMemo(() => {
    if (!dashFilters.year) return passByYear;
    return passByYear.filter(x => String(x.label) === String(dashFilters.year));
  }, [passByYear, dashFilters.year]);

  // ── available years for dropdown ─────────────────────────────────────────
  const availableYears = useMemo(() => [...new Set([...passByYear.map(x => x.label), ...subjectTrends.map(x => String(x.year))])].sort(), [passByYear, subjectTrends]);

  // ── subject-filtered trends ───────────────────────────────────────────────
  const filteredSubjectTrends = useMemo(() => {
    if (!dashFilters.year) return subjectTrends;
    return subjectTrends.filter(x => String(x.year) === String(dashFilters.year));
  }, [subjectTrends, dashFilters.year]);

  // ── weakest subject ───────────────────────────────────────────────────────
  const weakestSubject = useMemo(() => {
    if (!subjectTrends.length) return null;
    const first = subjectTrends[0];
    const last  = subjectTrends[subjectTrends.length - 1];
    const mk = (id, avgKey, deltaKey) => ({ id, avg: Number(last?.[avgKey]), delta: Number(last?.[deltaKey] ?? (Number(last?.[avgKey]) - Number(first?.[avgKey]))) });
    return [mk("EE","EE_avg","EE_delta"), mk("MATH","MATH_avg","MATH_delta"), mk("ESAS","ESAS_avg","ESAS_delta")]
      .filter(x => Number.isFinite(x.avg))
      .sort((a, b) => a.avg - b.avg)[0] ?? null;
  }, [subjectTrends]);

  // ── local AI insights ─────────────────────────────────────────────────────
  const localInsights = useMemo(() => generateInsights(data, dashFilters), [data, dashFilters]);

  // ── scatter data for Actual vs Predicted (2025 defense) ──────────────────
  const scatterData = useMemo(() => {
    if (!test2025Records?.length) return [];
    return test2025Records.slice(0, 50).map((r, i) => ({
      actual: r.prc_total_rating ?? r.actual ?? 0,
      predicted: r.predicted_rating_a ?? r.predicted ?? 0,
      passed: r.label === "PASS" || r.label === "PASSED",
    }));
  }, [test2025Records]);

  // ── pie data ─────────────────────────────────────────────────────────────
  const pieData = useMemo(() => [
    { name: "Passers", value: Number(ov.total_passers || 0), color: c.pass },
    { name: "Failers", value: Number(ov.total_failers || 0), color: c.fail },
  ], [ov]);

  const reviewPieData = useMemo(() => [
    { name: "Attended Review", value: reviewYesTotal, color: c.teal },
    { name: "No Review", value: reviewNoTotal, color: c.amber },
  ], [reviewYesTotal, reviewNoTotal]);

  const TABS = [
    { id: "model_overview",         label: "Model Overview",        icon: "🧭" },
    { id: "overview",               label: "Overview",              icon: "📊" },
    { id: "performance",            label: "Performance",           icon: "📈" },
    { id: "features",               label: "Feature Importance",    icon: "🤖" },
    { id: "curriculum",             label: "Curriculum Gaps",       icon: "🏫" },
    { id: "classification_metrics", label: "Classification",        icon: "🎯" },
    { id: "regression_metrics",     label: "Regression",            icon: "📐" },
    { id: "correlation",            label: "Correlation",           icon: "🧮" },
    { id: "test2025",               label: "2025 Defense",          icon: "🧪" },
    { id: "trends",                 label: "Trends & Monitoring",   icon: "📅" },
  ];

  const TAB_DESCRIPTIONS = {
    model_overview: "Comprehensive model analysis: data patterns, reliability, correlations, and curriculum-linked insights.",
    overview: "Institution-level snapshot of outcomes, pass/fail distribution, review participation, and key KPI trends.",
    performance: "Detailed performance breakdown by strand, survey sections, and subject-score movement over time.",
    features: "Top model predictors ranked by importance to show which factors most influence pass/fail outcomes.",
    curriculum: "Curriculum gap view of weakest survey indicators to help prioritize intervention areas.",
    classification_metrics: "Classification quality metrics (accuracy, precision, recall, F1, and CV results) for pass/fail prediction.",
    regression_metrics: "Regression evaluation for score prediction models, including MAE, RMSE, and R² comparisons.",
    correlation: "Correlation matrix of major variables to reveal strength and direction of academic relationships.",
    test2025: "Held-out 2025 defense evaluation: generalization metrics, confusion matrix, and row-level checks.",
    trends: "Live operational monitoring for usage, yearly/monthly outcomes, timing behavior, and recent attempts.",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
        .tab-btn   { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}
        @media(max-width:640px){ .dash-grid{grid-template-columns:1fr !important} }
        .att-table { width:100%; border-collapse:collapse; font-size:12px; font-family:'DM Sans',sans-serif; }
        .att-table th { padding:10px 12px; border-bottom:1px solid rgba(148,163,184,0.15); text-align:left; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; font-size:10px; }
        .att-table td { padding:10px 12px; border-bottom:1px solid rgba(30,41,59,0.5); color:#cbd5e1; }
        .att-table tr:hover td { background:rgba(255,255,255,0.025); }
        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:7px 11px; color:#f1f5f9; font-size:12px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .filter-input:focus { border-color:rgba(56,189,248,0.5); }
        .prof-ui p { color:#dbeafe; font-size:14px; line-height:1.6; }
        .prof-ui td,.prof-ui th { color:#dbeafe; font-size:13px; }
        .prof-ui label { color:#cbd5e1; font-size:13px; }
        .fade-in { animation: fadeUp 0.4s ease; }
        .recharts-cartesian-grid line { stroke: rgba(255,255,255,0.06) !important; }
        .recharts-text { fill: #64748b !important; font-family: 'DM Sans',sans-serif !important; font-size: 11px !important; }
      `}</style>

      <ProfessorTabsNav
        activeTab={activeTab}
        tabs={TABS}
        onTabChange={setActiveTab}
        onRefresh={fetchAnalytics}
        onLogout={onLogout}
      />

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px 80px" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
            <svg style={{ animation: "spin 0.8s linear infinite", width: 36, height: 36, color: c.blue }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".15"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 14, color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>Loading analytics…</p>
          </div>
        )}

        {!loading && data && (
          <>
            <div
              className="fade-in"
              style={{
                marginBottom: 14,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(56,189,248,0.07)",
                border: "1px solid rgba(56,189,248,0.22)",
              }}
            >
              <p style={{ margin: "0 0 2px", fontSize: 11, color: c.blue, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                {TABS.find((t) => t.id === activeTab)?.label || "Dashboard"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.55 }}>
                {TAB_DESCRIPTIONS[activeTab] || "Dashboard description is not available."}
              </p>
            </div>

            {activeTab === "model_overview" && (
              <ModelOverviewDashboard
                dashFilters={dashFilters}
                setDashFilters={setDashFilters}
                availableYears={availableYears}
                localInsights={localInsights}
                ov={ov}
                passByYear={passByYear}
                passByStrand={passByStrand}
                passByReview={passByReview}
                passByDur={passByDur}
                sectionScores={sectionScores}
                weakestQ={weakestQ}
                subjectTrends={subjectTrends}
                filteredSubjectTrends={filteredSubjectTrends}
                correlation={correlation}
                scatterData={scatterData}
                pieData={pieData}
                reviewPieData={reviewPieData}
              />
            )}

            {/* ══════════════════════════════════════════════════════════════
                OVERVIEW TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <ProfessorOverviewDashboard
                dashFilters={dashFilters}
                setDashFilters={setDashFilters}
                availableYears={availableYears}
                localInsights={localInsights}
                ov={ov}
                pieData={pieData}
                reviewPieData={reviewPieData}
                filteredYears={filteredYears}
                passByYear={passByYear}
                filteredReview={filteredReview}
                passByDur={passByDur}
                modelInfo={modelInfo}
              />
            )}

            {/* ══════════════════════════════════════════════════════════════
                PERFORMANCE TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "performance" && (
              <ProfessorPerformanceDashboard
                dashFilters={dashFilters}
                setDashFilters={setDashFilters}
                availableYears={availableYears}
                localInsights={localInsights}
                passByStrand={passByStrand}
                sectionScores={sectionScores}
                subjectTrends={subjectTrends}
                filteredSubjectTrends={filteredSubjectTrends}
                weakestSubject={weakestSubject}
              />
            )}
            %`} />} />
                        <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
                        <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                          {passByStrand.map((entry, index) => (
                            <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : entry.pass_rate >= 55 ? c.amber : c.fail} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {passByStrand.length > 0 && (
                      <div style={{ marginTop: 10, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                        💡 STEM graduates lead with <strong style={{ color: "#f1f5f9" }}>{pct(passByStrand[0]?.pass_rate)}</strong>, aligned with its math-heavy curriculum.
                      </div>
                    )}
                  </ChartContainer>

                  {/* Section Scores Radar */}
                  <ChartContainer title="Survey Section Scores — Radar" icon="🕸️" subtitle="Passers vs Failers across all survey dimensions" accent={c.indigo}>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={sectionScores.map(s => ({ subject: s.label, Passers: s.pass, Failers: s.fail }))}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[40, 100]} tick={{ fill: "#475569", fontSize: 9 }} />
                        <Radar name="Passers" dataKey="Passers" stroke={c.pass} fill={c.pass} fillOpacity={0.15} />
                        <Radar name="Failers" dataKey="Failers" stroke={c.fail} fill={c.fail} fillOpacity={0.1} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Section Scores Bar */}
                  <ChartContainer title="Survey Section Scores — Comparison" icon="📊" subtitle="Average section score split by exam outcome" fullWidth accent={c.blue}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={sectionScores.map(s => ({ name: s.label, Passers: s.pass, Failers: s.fail }))}
                        margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                        <Bar dataKey="Passers" fill={c.pass} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Failers" fill={c.fail} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Subject Trends Line Chart */}
                  {subjectTrends.length > 0 && (
                    <ChartContainer title="Subject Score Trends by Year" icon="📐" subtitle="EE, MATH, ESAS average score trends over time" fullWidth accent={c.teal}>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={filteredSubjectTrends.length ? filteredSubjectTrends : subjectTrends}
                          margin={{ top: 8, right: 24, left: -8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[55, 85]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip formatter={(v) => `${v}`} />} />
                          <ReferenceLine y={70} stroke={c.amber} strokeDasharray="5 3" label={{ value: "70%", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
                          <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                          <Line type="monotone" dataKey="EE_avg"   name="EE"   stroke={c.blue}   strokeWidth={2.5} dot={{ fill: c.blue, r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="MATH_avg" name="MATH" stroke={c.indigo} strokeWidth={2.5} dot={{ fill: c.indigo, r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="ESAS_avg" name="ESAS" stroke={c.teal}   strokeWidth={2.5} dot={{ fill: c.teal, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>

                      {/* Subject summary chips */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                        {["EE", "MATH", "ESAS"].map((subj, i) => {
                          const last = subjectTrends[subjectTrends.length - 1];
                          const first = subjectTrends[0];
                          const totalDelta = last[`${subj}_avg`] - first[`${subj}_avg`];
                          const col = [c.blue, c.indigo, c.teal][i];
                          return (
                            <div key={subj} style={{ background: `${col}0d`, border: `1px solid ${col}25`, borderRadius: 12, padding: "12px 14px" }}>
                              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{subj} Trend</p>
                              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: col, fontFamily: "'Syne',sans-serif" }}>{last[`${subj}_avg`]}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 11, color: totalDelta >= 0 ? c.pass : c.fail }}>
                                {totalDelta >= 0 ? "▲" : "▼"} {Math.abs(totalDelta).toFixed(1)} pts overall
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {weakestSubject && (
                        <div style={{ marginTop: 12, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                          ⚠ Weakest subject: <strong style={{ color: "#f1f5f9" }}>{weakestSubject.id}</strong> (avg {num(weakestSubject.avg, 1)}) —{" "}
                          <strong style={{ color: weakestSubject.delta >= 0 ? c.pass : c.fail }}>
                            {weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} ({Math.abs(weakestSubject.delta).toFixed(1)} pts overall)
                          </strong>
                        </div>
                      )}
                    </ChartContainer>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                FEATURES TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "features" && <ProfessorFeaturesDashboard featureImp={featureImp} />}
            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ChartContainer>

                  <ChartContainer title="Feature Importance — Bar Chart" icon="📊" subtitle="Visual comparison of top predictors" accent={c.indigo}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={featureImp.slice(0, 8).map(f => ({ name: f.label.length > 18 ? f.label.slice(0, 18) + "…" : f.label, value: f.value }))}
                        layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
                        <Tooltip content={<CustomTooltip formatter={(v) => v.toFixed(4)} />} />
                        <Bar dataKey="value" name="Importance" radius={[0, 6, 6, 0]}>
                          {featureImp.slice(0, 8).map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
                  {[
                    { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS scores are the #1–3 predictors, accounting for ~39% of total importance." },
                    { icon: "📚", title: "GWA is #4", desc: "Academic performance (GWA) is the strongest non-exam predictor, confirming its role in the model." },
                    { icon: "🧠", title: "Survey Factors Matter", desc: "Problem-solving confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
                  ].map((x, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 16 }}>{x.icon}</p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{x.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>{x.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CURRICULUM TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "curriculum" && <ProfessorCurriculumDashboard weakestQ={weakestQ} />}
            
                        layout="vertical" margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[2, 3]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return (
                            <div style={{ background: "#0f1a2e", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f1f5f9", maxWidth: 220 }}>
                              <p style={{ margin: "0 0 4px", fontWeight: 700, color: c.fail }}>{d.name}</p>
                              <p style={{ margin: "0 0 2px", color: "#94a3b8" }}>{d.label}</p>
                              <p style={{ margin: 0 }}>Score: <strong style={{ color: c.fail }}>{d.avg?.toFixed(2)}/4</strong> · {d.section}</p>
                            </div>
                          );
                        }} />
                        <ReferenceLine x={2.5} stroke={c.amber} strokeDasharray="4 3" label={{ value: "2.5 critical", position: "insideTopRight", fill: c.amber, fontSize: 9 }} />
                        <Bar dataKey="avg" name="Avg Score" radius={[0, 5, 5, 0]}>
                          {weakestQ.map((entry, index) => (
                            <Cell key={index} fill={entry.avg >= 2.7 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="Gap Summary by Category" icon="📋" subtitle="Which categories have the most weak items?" accent={c.amber}>
                    {(() => {
                      const counts = {};
                      weakestQ.forEach(q => {
                        if (!counts[q.section]) counts[q.section] = { count: 0, avgTotal: 0 };
                        counts[q.section].count++;
                        counts[q.section].avgTotal += q.avg;
                      });
                      const cats = Object.entries(counts).map(([label, v]) => ({ label, count: v.count, avg: v.avgTotal / v.count })).sort((a, b) => b.avg - a.avg);
                      return (
                        <>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cats} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <YAxis domain={[2, 3]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip formatter={(v) => `${v?.toFixed(2)}/4`} />} />
                              <Bar dataKey="avg" name="Avg Score" radius={[5, 5, 0, 0]}>
                                {cats.map((entry, index) => (
                                  <Cell key={index} fill={entry.avg >= 2.65 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8, marginTop: 12 }}>
                            {cats.map((cat, i) => {
                              const sev = cat.avg >= 2.65 ? c.fail : cat.avg >= 2.55 ? c.amber : c.orange;
                              return (
                                <div key={i} style={{ background: `${sev}0d`, border: `1px solid ${sev}25`, borderRadius: 10, padding: "10px 12px" }}>
                                  <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{cat.label}</p>
                                  <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569" }}>{cat.count} weak item{cat.count > 1 ? "s" : ""}</p>
                                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: sev, fontFamily: "'Syne',sans-serif" }}>{num(cat.avg)}<span style={{ fontSize: 10, color: "#475569" }}>/4</span></p>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </ChartContainer>
                </div>

                {/* Weak items grid */}
                <ChartContainer title="Detailed Weak Survey Items" icon="📋" subtitle="All 10 weakest items with severity ratings" fullWidth accent={c.amber}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10 }}>
                    {weakestQ.map((q, i) => {
                      const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
                      const sColor = severity === "high" ? c.fail : severity === "medium" ? c.amber : c.orange;
                      const barPct = ((q.avg - 1) / 3) * 100;
                      return (
                        <div key={i} style={{ background: `${sColor}08`, border: `1px solid ${sColor}22`, borderRadius: 12, padding: 14 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: `${sColor}20`, color: sColor, border: `1px solid ${sColor}40`, flexShrink: 0 }}>{q.key}</span>
                              <span style={{ fontSize: 9, color: "#475569", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 999 }}>{q.section}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, background: `${sColor}15`, border: `1px solid ${sColor}30`, borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: sColor }}>{q.avg.toFixed(2)}</span>
                              <span style={{ fontSize: 9, color: `${sColor}99` }}>/4</span>
                            </div>
                          </div>
                          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#cbd5e1", lineHeight: 1.45 }}>{q.label}</p>
                          <Bar value={barPct} max={100} color={sColor} height={5} />
                          <p style={{ margin: "5px 0 0", fontSize: 10, color: "#475569" }}>
                            {severity === "high" ? "🔴 Critical — requires immediate attention" : severity === "medium" ? "🟡 Moderate — monitor and improve" : "🟠 Low concern — room for improvement"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                    🎯 <strong style={{ color: "#f1f5f9" }}>Key Finding:</strong> Facilities and Dept. Review items consistently score highest (most disagreement), suggesting physical resources and department-organized review programs are the most critical gaps.
                  </div>
                </ChartContainer>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CLASSIFICATION METRICS TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "classification_metrics" && <ProfessorClassificationMetricsDashboard modelInfo={modelInfo} />}
            
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartContainer title="Classification Metric Comparison" icon="📊" subtitle="Bar chart comparison of all classification metrics" accent={c.blue}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          { name: "Accuracy",  value: (modelInfo?.classification?.accuracy ?? 0) * 100 },
                          { name: "Precision", value: (modelInfo?.classification?.precision ?? 0) * 100 },
                          { name: "Recall",    value: (modelInfo?.classification?.recall ?? 0) * 100 },
                          { name: "F1-Score",  value: (modelInfo?.classification?.f1 ?? 0) * 100 },
                          { name: "CV Acc",    value: (modelInfo?.classification?.cv_acc ?? 0) * 100 },
                          { name: "CV F1",     value: (modelInfo?.classification?.cv_f1 ?? 0) * 100 },
                        ]}
                        margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(2)}%`} />} />
                        <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                          {[c.blue, c.indigo, c.teal, c.pass, c.amber, c.orange].map((color, i) => (
                            <Cell key={i} fill={color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="When to Use Each Metric" icon="📖" subtitle="Decision guide for model evaluation" accent={c.indigo}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                        <thead>
                          <tr>
                            {["METRIC", "SYSTEM VALUE", "FOCUS", "WHEN TO USE"].map(h => (
                              <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Accuracy",  modelInfo?.classification?.accuracy,  "Overall correctness",          "Balanced classes"],
                            ["Precision", modelInfo?.classification?.precision,  "Avoid false positives",        "Spam/fraud"],
                            ["Recall",    modelInfo?.classification?.recall,     "Catch all positives",          "Medical/safety"],
                            ["F1-Score",  modelInfo?.classification?.f1,         "Precision-recall balance",     "Imbalanced data"],
                          ].map((row, i) => (
                            <tr key={i}>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#f8fafc", fontWeight: 700 }}>{row[0]}</td>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.blue, fontWeight: 700 }}>{typeof row[1] === "number" ? pct(row[1] * 100) : "—"}</td>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1" }}>{row[2]}</td>
                              <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {modelInfo?.dataset_size && (
                      <p style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>Dataset size: <strong style={{ color: "#f8fafc" }}>{modelInfo.dataset_size}</strong> records.</p>
                    )}
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                REGRESSION METRICS TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "regression_metrics" && <ProfessorRegressionMetricsDashboard modelInfo={modelInfo} />}
            
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartContainer title="Model A vs Model B Comparison" icon="📊" subtitle="MAE, RMSE, R² side-by-side" accent={c.blue}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={[
                          { name: "MAE",  A: modelInfo?.regression_a?.mae,  B: modelInfo?.regression_b?.mae  },
                          { name: "RMSE", A: modelInfo?.regression_a?.rmse, B: modelInfo?.regression_b?.rmse },
                          { name: "R²",   A: modelInfo?.regression_a?.r2,   B: modelInfo?.regression_b?.r2   },
                        ]}
                        margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(4)} />} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>Model {v}</span>} />
                        <Bar dataKey="A" name="A" fill={c.blue}   radius={[4, 4, 0, 0]} />
                        <Bar dataKey="B" name="B" fill={c.indigo} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="Regression Metrics Reference" icon="📐" subtitle="Error types and optimization goals" accent={c.indigo}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                        <thead>
                          <tr>
                            {["METRIC", "MODEL A", "MODEL B", "UNITS", "SENSITIVITY", "GOAL"].map(h => (
                              <th key={h} style={{ padding: "9px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["MAE",      modelInfo?.regression_a?.mae,  modelInfo?.regression_b?.mae,  "Same as target",    "Low",      "Minimize avg error"],
                            ["RMSE",     modelInfo?.regression_a?.rmse, modelInfo?.regression_b?.rmse, "Same as target",    "High",     "Avoid large misses"],
                            ["R² Score", modelInfo?.regression_a?.r2,   modelInfo?.regression_b?.r2,   "None (Percentage)", "Moderate", "Maximize variance explained"],
                          ].map((row, i) => (
                            <tr key={i}>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#f8fafc", fontWeight: 700 }}>{row[0]}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.blue, fontWeight: 700 }}>{typeof row[1] === "number" ? row[1].toFixed(4) : "—"}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.indigo, fontWeight: 700 }}>{typeof row[2] === "number" ? row[2].toFixed(4) : "—"}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1" }}>{row[3]}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[4]}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[5]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CORRELATION TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "correlation" && <ProfessorCorrelationDashboard correlation={correlation} />}
            
                            </tr>
                          </thead>
                          <tbody>
                            {(correlation.matrix ?? []).map(row => (
                              <tr key={row.row}>
                                <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: "#f1f5f9" }}>{row.row}</td>
                                {(correlation.columns ?? []).map(col => {
                                  const val = row[col];
                                  const absVal = Math.abs(val);
                                  const isDiag = col === row.row;
                                  const color = isDiag ? "#475569" : absVal >= 0.7 ? c.pass : absVal >= 0.4 ? c.amber : "#94a3b8";
                                  const bg = isDiag ? "transparent" : absVal >= 0.7 ? `${c.pass}12` : absVal >= 0.4 ? `${c.amber}12` : "transparent";
                                  return (
                                    <td key={col} style={{
                                      padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)",
                                      textAlign: "right", fontWeight: absVal >= 0.4 && !isDiag ? 700 : 400,
                                      color, background: bg, borderRadius: absVal >= 0.4 ? 4 : 0,
                                    }}>{val.toFixed(2)}</td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                        💡 Values <strong style={{ color: c.pass }}>&gt; 0.7</strong> = strong correlation. <strong style={{ color: c.amber }}>0.4–0.7</strong> = moderate. Diagonal = 1.00 (self).
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: "#64748b" }}>Correlation data not available.</p>
                  )}
                </ChartContainer>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                2025 FINAL DEFENSE TAB
            ══════════════════════════════════════════════════════════════ */}
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

            {/* ══════════════════════════════════════════════════════════════
                TRENDS & MONITORING TAB
            ══════════════════════════════════════════════════════════════ */}
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
          </>
        )}
      </main>

      <ProfessorTimingModal
        attempt={selectedTimingAttempt}
        open={timingModalOpen}
        loading={selectedTimingLoading}
        data={selectedTimingData}
        onClose={() => setTimingModalOpen(false)}
      />
    </div>
  );
}

