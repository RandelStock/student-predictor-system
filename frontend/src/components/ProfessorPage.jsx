import { useState, useEffect, useCallback, useMemo } from "react";
import ExamineeDetailPanel from "./ExamineeDetailPanel";
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
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#f8fafc" }}>
                    Institutional Overview
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    Aggregate statistics across all EE board exam takers. First-attempt outcomes only.
                  </p>
                </div>

                {/* Filter Panel */}
                <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />

                {/* AI Insights */}
                <InsightBox insights={localInsights} />

                {/* KPI Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
                  <MetricCard label="Total Students"    value={ov.total_students}             color={c.blue}   icon="👥" />
                  <MetricCard label="Total Passers"     value={ov.total_passers}              color={c.pass}   icon="✅" />
                  <MetricCard label="Total Failers"     value={ov.total_failers}              color={c.fail}   icon="❌" />
                  <MetricCard label="Overall Pass Rate" value={pct(ov.overall_pass_rate)}     color={ov.overall_pass_rate >= 70 ? c.pass : c.amber} icon="📊" />
                  <MetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}       color={c.pass}   icon="🎓" sub="1.0=Highest" />
                  <MetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}       color={c.fail}   icon="📉" sub="1.0=Highest" />
                </div>

                <div className="dash-grid">
                  {/* Pie: Pass/Fail Distribution */}
                  <ChartContainer title="Pass / Fail Distribution" icon="🥧" subtitle="Total passers and failers with percentage share" accent={c.pass}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                          paddingAngle={3} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={9}
                          formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Pie: Review Attendance */}
                  <ChartContainer title="Review Attendance Share" icon="📖" subtitle="Examinees who attended formal review vs not" accent={c.teal}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={reviewPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                          paddingAngle={3} dataKey="value">
                          {reviewPieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={9}
                          formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Bar: Pass Rate by Year */}
                  <ChartContainer title="Pass Rate by Year" icon="📅" subtitle="Board exam performance trend per cohort year" accent={c.blue} fullWidth>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={filteredYears.length ? filteredYears : passByYear}
                        margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                        <ReferenceLine y={70} stroke={c.amber} strokeDasharray="5 3" label={{ value: "70% threshold", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
                        <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                          {(filteredYears.length ? filteredYears : passByYear).map((entry, index) => (
                            <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : entry.pass_rate >= 55 ? c.amber : c.fail} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Stacked Bar: Pass/Fail counts by Year */}
                  <ChartContainer title="Pass / Fail Counts by Year" icon="📦" subtitle="Stacked bar showing pass and fail composition per year" accent={c.indigo} fullWidth>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={(filteredYears.length ? filteredYears : passByYear).map(d => ({
                          label: d.label,
                          Passers: d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0)),
                          Failers: d.failers ?? ((d.total ?? 0) - Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0))),
                        }))}
                        margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                        <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Bar: Pass Rate by Review Attendance */}
                  <ChartContainer title="Pass Rate by Review Attendance" icon="🏫" subtitle="Did attending formal review improve results?" accent={c.teal}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={filteredReview} layout="vertical"
                        margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                        <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
                        <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                          {filteredReview.map((entry, index) => (
                            <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : c.fail} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Bar: Pass Rate by Review Duration */}
                  <ChartContainer title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review programs correlate with higher pass rates" accent={c.orange}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={passByDur} layout="vertical"
                        margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                        <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
                        <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                          {passByDur.map((entry, index) => (
                            <Cell key={index} fill={[c.fail, c.amber, c.pass][index] || c.blue} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* GWA Comparison */}
                  <ChartContainer title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA is better in PH grading (1.0 = highest)" accent={c.indigo}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "Passers Avg GWA", value: ov.avg_gwa_passers, color: c.pass },
                        { label: "Failers Avg GWA",  value: ov.avg_gwa_failers,  color: c.fail },
                      ].map((x, i) => (
                        <div key={i} style={{
                          flex: 1, background: `${x.color}0d`, border: `1px solid ${x.color}25`,
                          borderRadius: 14, padding: "16px", textAlign: "center",
                        }}>
                          <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>{x.label}</p>
                          <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: x.color, fontFamily: "'Syne',sans-serif" }}>{num(x.value)}</p>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={110}>
                      <BarChart data={[{ name: "Passers", value: ov.avg_gwa_passers }, { name: "Failers", value: ov.avg_gwa_failers }]}
                        margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 3]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(2)} />} />
                        <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
                          <Cell fill={c.pass} />
                          <Cell fill={c.fail} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 10 }}>
                      💡 GWA gap: <strong style={{ color: "#f1f5f9" }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} points</strong> — strong predictor.
                    </div>
                  </ChartContainer>

                  {/* Model Performance */}
                  <ChartContainer title="Model Performance Summary" icon="📈" subtitle="Random Forest classification & regression metrics" accent={c.blue}>
                    {modelInfo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { label: "Classification Accuracy", value: modelInfo.classification?.accuracy, max: 1, color: c.blue },
                          { label: "Classification F1",        value: modelInfo.classification?.f1,       max: 1, color: c.indigo },
                          { label: "CV Accuracy",              value: modelInfo.classification?.cv_acc,    max: 1, color: c.teal },
                          { label: "CV F1",                    value: modelInfo.classification?.cv_f1,     max: 1, color: c.pass },
                        ].map((m, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{pct((m.value ?? 0) * 100)}</span>
                            </div>
                            <Bar value={(m.value ?? 0) * 100} color={m.color} height={7} />
                          </div>
                        ))}
                        <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            { label: "Reg A — MAE",  v: modelInfo.regression_a?.mae,  d: 2 },
                            { label: "Reg A — R²",   v: modelInfo.regression_a?.r2,   d: 3 },
                            { label: "Reg B — MAE",  v: modelInfo.regression_b?.mae,  d: 2 },
                            { label: "Reg B — R²",   v: modelInfo.regression_b?.r2,   d: 3 },
                          ].map((m, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "8px 10px" }}>
                              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{m.label}</p>
                              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{num(m.v, m.d)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "#64748b" }}>Loading model metrics…</p>
                    )}
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                PERFORMANCE TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "performance" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Performance Breakdown</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pass rates by SHS strand, survey section scores, and subject score trends by year.</p>
                </div>

                <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
                <InsightBox insights={localInsights} />

                <div className="dash-grid">
                  {/* Pass Rate by Strand */}
                  <ChartContainer title="Pass Rate by SHS Strand" icon="🎓" subtitle="Senior High School track performance comparison" accent={c.teal}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={passByStrand} layout="vertical"
                        margin={{ top: 4, right: 30, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                        <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
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
            {activeTab === "features" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Feature Importance</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Top predictors from the Random Forest classifier — what matters most for passing the EE board exam.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartContainer title="Top 10 Predictors (Ranked)" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail" fullWidth={false} accent={c.blue}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {featureImp.map((f, i) => {
                        const maxV = featureImp[0]?.value ?? 1;
                        const color = i === 0 ? c.blue : i === 1 ? c.indigo : i === 2 ? c.teal : i < 4 ? c.amber : "#475569";
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 22, height: 22, borderRadius: 7, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</span>
                            <span style={{ flex: "0 0 210px", fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{f.label}</span>
                            <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${(f.value / maxV) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, transition: "width 1s ease" }} />
                            </div>
                            <span style={{ width: 54, fontSize: 11, fontWeight: 700, color, textAlign: "right", flexShrink: 0 }}>{f.value.toFixed(4)}</span>
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
            {activeTab === "curriculum" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Curriculum Gap Analysis</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Survey items with the lowest scores — indicating institutional weaknesses.</p>
                </div>
                <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#fcd34d", fontFamily: "'Syne',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                      Items sorted by average Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores mean more disagreement — institutional gaps.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <ChartContainer title="Weakest Survey Items" icon="🔎" subtitle="Top 10 items with highest disagreement score" accent={c.fail}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={weakestQ.map(q => ({ name: q.key, avg: q.avg, label: q.label, section: q.section }))}
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
            {activeTab === "classification_metrics" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Classification Metrics</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Model performance on Pass/Fail prediction task.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Accuracy",  value: modelInfo?.classification?.accuracy,  color: c.blue   },
                    { label: "Precision", value: modelInfo?.classification?.precision,  color: c.indigo },
                    { label: "Recall",    value: modelInfo?.classification?.recall,     color: c.teal   },
                    { label: "F1-Score",  value: modelInfo?.classification?.f1,         color: c.pass   },
                    { label: "CV Acc",    value: modelInfo?.classification?.cv_acc,     color: c.amber  },
                    { label: "CV F1",     value: modelInfo?.classification?.cv_f1,      color: c.orange },
                  ].map((m, i) => (
                    <MetricCard key={i} label={m.label} value={typeof m.value === "number" ? pct(m.value * 100) : "—"} color={m.color} icon={["🎯","🔬","📡","⚖️","🔄","📊"][i]} />
                  ))}
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
            {activeTab === "regression_metrics" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Regression Metrics</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>System metrics for rating prediction model development (Model A & B).</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Reg A — MAE",  value: num(modelInfo?.regression_a?.mae, 2), color: c.blue   },
                    { label: "Reg A — RMSE", value: num(modelInfo?.regression_a?.rmse, 2), color: c.indigo },
                    { label: "Reg A — R²",   value: num(modelInfo?.regression_a?.r2,  3), color: c.pass   },
                    { label: "Reg B — MAE",  value: num(modelInfo?.regression_b?.mae, 2), color: c.teal   },
                    { label: "Reg B — RMSE", value: num(modelInfo?.regression_b?.rmse, 2), color: c.amber  },
                    { label: "Reg B — R²",   value: num(modelInfo?.regression_b?.r2,  3), color: c.orange },
                  ].map((m, i) => (
                    <MetricCard key={i} label={m.label} value={m.value} color={m.color} icon={["📉","📈","🎯","📉","📈","🎯"][i]} />
                  ))}
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
            {activeTab === "correlation" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Correlation Matrix</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pearson correlations between key academic variables and exam outcome.</p>
                </div>
                <ChartContainer title="Correlation Matrix" icon="🧮" subtitle="Pearson correlations between key academic variables and exam outcome" fullWidth accent={c.blue}>
                  {correlation ? (
                    <>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 11 }}>Variable</th>
                              {(correlation.columns ?? []).map(col => (
                                <th key={col} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>{col}</th>
                              ))}
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
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>2025 Final Defense</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).</p>
                </div>

                {testLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#64748b" }}>Loading 2025 metrics…</div>
                ) : test2025?.error ? (
                  <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: "14px 18px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{test2025.error}</p>
                  </div>
                ) : test2025 ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
                      <MetricCard label="Test Accuracy" value={pct((test2025.classification?.accuracy ?? 0) * 100)} color={(test2025.classification?.accuracy ?? 0) >= 0.9 ? c.pass : c.amber} icon="🎯" />
                      <MetricCard label="Precision"     value={pct((test2025.classification?.precision ?? 0) * 100)} color={c.blue}   icon="🔬" />
                      <MetricCard label="Recall"        value={pct((test2025.classification?.recall ?? 0) * 100)}    color={c.indigo} icon="📡" />
                      <MetricCard label="F1-Score"      value={pct((test2025.classification?.f1 ?? 0) * 100)}        color={c.teal}   icon="⚖️" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <ChartContainer title="Regression A (EE+MATH+ESAS+GWA)" icon="📉" subtitle="Predicted PRC TOTAL RATING — model 2A" accent={c.blue}>
                        {[["R²","r2",4],["MAE","mae",4],["MSE","mse",4],["RMSE","rmse",4]].map(([label, key, d]) => (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: c.blue, fontFamily: "'Syne',sans-serif" }}>{num(test2025.regression?.a?.[key], d)}</span>
                          </div>
                        ))}
                      </ChartContainer>

                      <ChartContainer title="Regression B (GWA + Survey only)" icon="🧠" subtitle="Predicted PRC TOTAL RATING — model 2B (no subjects)" accent={c.indigo}>
                        {[["R²","r2",4],["MAE","mae",4],["MSE","mse",4],["RMSE","rmse",4]].map(([label, key, d]) => (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: c.indigo, fontFamily: "'Syne',sans-serif" }}>{num(test2025.regression?.b?.[key], d)}</span>
                          </div>
                        ))}
                      </ChartContainer>
                    </div>

                    {/* Scatter: Actual vs Predicted */}
                    {scatterData.length > 0 && (
                      <ChartContainer title="Actual vs Predicted Scores" icon="🎯" subtitle="Scatter plot — dots closer to diagonal = better prediction" fullWidth accent={c.teal}>
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart margin={{ top: 12, right: 24, left: -8, bottom: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" dataKey="actual" name="Actual" domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Actual Score", position: "insideBottom", offset: -5, fill: "#475569", fontSize: 11 }} />
                            <YAxis type="number" dataKey="predicted" name="Predicted" domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Predicted Score", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                            <Tooltip content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0]?.payload;
                              return (
                                <div style={{ background: "#0f1a2e", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                                  <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>Actual: <strong style={{ color: "#f1f5f9" }}>{d.actual?.toFixed(2)}</strong></p>
                                  <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>Predicted: <strong style={{ color: "#f1f5f9" }}>{d.predicted?.toFixed(2)}</strong></p>
                                  <p style={{ margin: 0, color: d.passed ? c.pass : c.fail }}>{d.passed ? "✅ Passed" : "❌ Failed"}</p>
                                </div>
                              );
                            }} />
                            <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Perfect prediction", position: "insideTopLeft", fill: "#475569", fontSize: 10 }} />
                            <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" label={{ value: "70% pass threshold", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
                            <ReferenceLine y={70} stroke={c.amber} strokeDasharray="4 3" />
                            <Scatter data={scatterData.filter(d => d.passed)} fill={c.pass} fillOpacity={0.75} r={4} name="Passed" />
                            <Scatter data={scatterData.filter(d => !d.passed)} fill={c.fail} fillOpacity={0.75} r={4} name="Failed" />
                            <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}

                    {/* Confusion Matrix */}
                    <ChartContainer title="Confusion Matrix (Pass/Fail)" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth accent={c.fail}>
                      {test2025.confusion_matrix ? (
                        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                          {/* Visual heatmap */}
                          <div>
                            <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confusion Matrix Heatmap</p>
                            <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: 4 }}>
                              <div />
                              <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "4px 8px" }}>Pred FAIL</div>
                              <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "4px 8px" }}>Pred PASS</div>
                              <div style={{ fontSize: 11, color: c.fail, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center" }}>Act FAIL</div>
                              {[
                                { v: test2025.confusion_matrix.actual_fail.pred_fail, good: true },
                                { v: test2025.confusion_matrix.actual_fail.pred_pass, good: false },
                              ].map((cell, i) => (
                                <div key={i} style={{
                                  width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
                                  background: cell.good ? `${c.pass}20` : `${c.fail}15`,
                                  border: `1px solid ${cell.good ? c.pass : c.fail}30`,
                                  borderRadius: 10, fontSize: 22, fontWeight: 800, color: cell.good ? c.pass : c.fail, fontFamily: "'Syne',sans-serif",
                                }}>{cell.v}</div>
                              ))}
                              <div style={{ fontSize: 11, color: c.pass, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center" }}>Act PASS</div>
                              {[
                                { v: test2025.confusion_matrix.actual_pass.pred_fail, good: false },
                                { v: test2025.confusion_matrix.actual_pass.pred_pass, good: true },
                              ].map((cell, i) => (
                                <div key={i} style={{
                                  width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center",
                                  background: cell.good ? `${c.pass}20` : `${c.fail}15`,
                                  border: `1px solid ${cell.good ? c.pass : c.fail}30`,
                                  borderRadius: 10, fontSize: 22, fontWeight: 800, color: cell.good ? c.pass : c.fail, fontFamily: "'Syne',sans-serif",
                                }}>{cell.v}</div>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                              <span style={{ fontSize: 11, color: c.pass }}><span style={{ width: 10, height: 10, borderRadius: 3, background: `${c.pass}20`, border: `1px solid ${c.pass}30`, display: "inline-block", marginRight: 5 }} />Correct</span>
                              <span style={{ fontSize: 11, color: c.fail }}><span style={{ width: 10, height: 10, borderRadius: 3, background: `${c.fail}15`, border: `1px solid ${c.fail}30`, display: "inline-block", marginRight: 5 }} />Misclassified</span>
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 11 }}>Actual \\ Predicted</th>
                                    <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>FAIL</th>
                                    <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>PASS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: c.fail }}>FAIL</td>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", fontWeight: 800, color: c.pass }}>{test2025.confusion_matrix.actual_fail.pred_fail}</td>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", color: c.fail }}>{test2025.confusion_matrix.actual_fail.pred_pass}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: c.pass }}>PASS</td>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", color: c.fail }}>{test2025.confusion_matrix.actual_pass.pred_fail}</td>
                                    <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", fontWeight: 800, color: c.pass }}>{test2025.confusion_matrix.actual_pass.pred_pass}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div style={{ marginTop: 12, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                              Parsed from <code style={{ color: "#94a3b8" }}>evaluation_report.txt</code>. Re-run <code style={{ color: "#94a3b8" }}>train_model.py</code> after dataset changes.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Confusion matrix not available.</p>
                      )}
                    </ChartContainer>

                    <ChartContainer title="Select a 2025 Examinee (Row-level check)" icon="🧪" subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers" fullWidth accent={c.teal}>
                      <ExamineeDetailPanel
                        records={test2025Records}
                        selectedIdx={selectedTestIdx}
                        onSelect={setSelectedTestIdx}
                        runData={test2025Run}
                        runLoading={test2025RunLoading}
                      />
                    </ChartContainer>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: "#64748b" }}>No 2025 defense metrics available.</p>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TRENDS & MONITORING TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "trends" && (
              <div className="fade-in">
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Trends & Monitoring</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Live data from the prediction database — student attempts, monthly summaries, and AI trend insights.</p>
                </div>

                {/* System Usage */}
                <ChartContainer title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)" fullWidth accent={c.blue}>
                  {usageLoading ? (
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Loading system usage…</p>
                  ) : usageSummary ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={downloadPerformanceReport} disabled={reportLoading}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 16px", color: "#94a3b8", fontSize: 12, cursor: reportLoading ? "not-allowed" : "pointer", opacity: reportLoading ? 0.6 : 1, fontFamily: "'DM Sans',sans-serif" }}>
                          {reportLoading ? "Preparing…" : "⬇ Download Performance Report"}
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12 }}>
                        <MetricCard label="Total Predictions" value={usageSummary.total_predictions} color={c.blue} icon="🔮" />
                        <MetricCard label="Active Users" value={usageSummary.active_users} color={c.pass} icon="👥" sub="distinct student users" />
                      </div>

                      {/* Predictions by Day */}
                      {(usageSummary.predictions_by_day ?? []).length > 0 && (
                        <div>
                          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Predictions by Day (last 10 days)</p>
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={(usageSummary.predictions_by_day ?? []).slice(-10).map(d => ({ day: d.day ? d.day.slice(5) : "—", total: d.total ?? 0 }))}
                              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="total" name="Predictions" fill={c.blue} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Most active students */}
                      {(usageSummary.active_users_recent ?? []).length > 0 && (
                        <div>
                          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Most Active Students</p>
                          <table className="att-table">
                            <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                            <tbody>
                              {(usageSummary.active_users_recent ?? []).map((u, i) => (
                                <tr key={i}>
                                  <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{u.name || u.user_id || "—"}</td>
                                  <td>{u.attempts ?? 0}</td>
                                  <td style={{ color: "#64748b" }}>{u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>No usage data yet.</p>
                  )}
                </ChartContainer>

                {/* AI Trend Insights */}
                <div style={{ marginTop: 14 }}>
                  <ChartContainer title="AI Trend Insights" icon="✨" subtitle="Groq AI summary of year-over-year prediction trends" fullWidth accent={c.blue}>
                    {insightsLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${c.blue}40`, borderTopColor: c.blue, animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: 12, color: "#64748b" }}>Generating AI summary…</span>
                      </div>
                    ) : trendInsights ? (
                      <div>
                        {(trendInsights.stats?.years ?? []).length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
                            {(trendInsights.stats.years ?? []).map((yr, i) => (
                              <div key={i} style={{ background: `${c.blue}0d`, border: `1px solid ${c.blue}25`, borderRadius: 10, padding: "10px 12px" }}>
                                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{yr.year}</p>
                                <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: yr.pass_rate >= 70 ? c.pass : c.amber, fontFamily: "'Syne',sans-serif" }}>{yr.pass_rate.toFixed(1)}%</p>
                                <p style={{ margin: 0, fontSize: 10, color: "#475569" }}>{yr.total} attempts · avg {yr.avg_rating?.toFixed(1)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "12px 14px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: c.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{trendInsights.summary}</p>
                        </div>
                        <button onClick={fetchTrendInsights} style={{ marginTop: 10, background: "transparent", border: `1px solid rgba(56,189,248,0.2)`, borderRadius: 8, padding: "5px 12px", color: c.blue, fontSize: 12, cursor: "pointer" }}>
                          ↻ Refresh Insights
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "#64748b" }}>No trend data yet. Submit more predictions to generate insights.</p>
                    )}
                  </ChartContainer>
                </div>

                {/* Yearly Pass/Fail from DB */}
                {(yearlyPF ?? []).length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <ChartContainer title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions" fullWidth accent={c.pass}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={(yearlyPF ?? []).map(yr => {
                            const total = yr.pass_count + yr.fail_count;
                            return { year: String(yr.year), Passers: yr.pass_count, Failers: yr.fail_count, passRate: total ? (yr.pass_count / total) * 100 : 0 };
                          })}
                          margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                          <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}

                {/* Review Split Analysis */}
                {(reviewAnalysis?.items ?? []).length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <ChartContainer title="Formal Review Split Analysis" icon="📚" subtitle="Separated results by Attended Formal Review = Yes / No" fullWidth accent={c.teal}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 14 }}>
                        {(reviewAnalysis.items ?? []).map((item, idx) => (
                          <div key={idx} style={{
                            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 12, padding: 16,
                          }}>
                            <p style={{ margin: "0 0 4px", fontSize: 12, color: item.review_program === "Yes" ? c.pass : c.amber, fontWeight: 700 }}>
                              {item.review_program === "Yes" ? "✅ Attended Review" : "⚠️ No Formal Review"}
                            </p>
                            <p style={{ margin: "0 0 2px", fontSize: 26, color: "#f1f5f9", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{item.pass_rate?.toFixed(1)}%</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                              {item.pass_count}/{item.total} predicted pass
                              {item.human_like_rate != null ? ` · Human-like timing: ${item.human_like_rate.toFixed(1)}%` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ChartContainer>
                  </div>
                )}

                {/* Timer Analysis */}
                {timingAnalysis?.summary && (
                  <div style={{ marginTop: 14 }}>
                    <ChartContainer title="Predictor Timer Analysis" icon="⏱️" subtitle="Response timing captured from Predictor Form" fullWidth accent={c.orange}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 16 }}>
                        <MetricCard label="Timed Questions" value={timingAnalysis.summary.timed_questions ?? 0} color={c.blue}   icon="⏱️" />
                        <MetricCard label="Human-like"      value={timingAnalysis.summary.human_like_rate != null ? `${timingAnalysis.summary.human_like_rate.toFixed(1)}%` : "—"} color={c.pass}   icon="🧑" sub={`${timingAnalysis.summary.human_like_count ?? 0} answers`} />
                        <MetricCard label="Too Fast"        value={timingAnalysis.summary.too_fast_rate != null ? `${timingAnalysis.summary.too_fast_rate.toFixed(1)}%` : "—"} color={c.amber}  icon="⚡" sub={`${timingAnalysis.summary.too_fast_count ?? 0} answers`} />
                        <MetricCard label="Too Slow"        value={timingAnalysis.summary.too_slow_rate != null ? `${timingAnalysis.summary.too_slow_rate.toFixed(1)}%` : "—"} color={c.orange} icon="🐢" sub={`${timingAnalysis.summary.too_slow_count ?? 0} answers`} />
                      </div>
                      {(timingAnalysis.sections ?? []).length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Timer by Section</p>
                          <table className="att-table">
                            <thead><tr><th>Section</th><th>Timed Qs</th><th>Avg Duration (sec)</th><th>Human-like Rate</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.sections ?? []).map((s, i) => (
                                <tr key={i}>
                                  <td>{s.section}</td>
                                  <td>{s.timed_questions ?? 0}</td>
                                  <td>{s.avg_duration_sec != null ? s.avg_duration_sec.toFixed(1) : "—"}</td>
                                  <td style={{ color: (s.human_like_rate ?? 0) >= 70 ? c.pass : c.amber, fontWeight: 700 }}>
                                    {s.human_like_rate != null ? `${s.human_like_rate.toFixed(1)}%` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {(timingAnalysis.suspicious_attempts ?? []).length > 0 && (
                        <div>
                          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Potentially Random / Too-fast Attempts</p>
                          <table className="att-table">
                            <thead><tr><th>Name</th><th>Date</th><th>Too Fast Rate</th><th>Timed Qs</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.suspicious_attempts ?? []).map((a, i) => (
                                <tr key={i} style={{ cursor: "pointer" }} onClick={() => openTimingModal(a)} title="Click to view per-question timings">
                                  <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{a.name || "Unknown"}</td>
                                  <td style={{ color: "#64748b" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                                  <td style={{ color: c.fail, fontWeight: 700 }}>{a.too_fast_rate?.toFixed(1)}%</td>
                                  <td>{a.timed_questions ?? 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </ChartContainer>
                  </div>
                )}

                {/* Monthly Summary */}
                <div style={{ marginTop: 14 }}>
                  <ChartContainer title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year" fullWidth accent={c.teal}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                      <label style={{ fontSize: 12, color: "#64748b" }}>Year:</label>
                      <select className="filter-input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    {(monthly ?? []).length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={(monthly ?? []).map(m => {
                            const total = m.total || 1;
                            return { month: MONTH_NAMES[m.month - 1], Passers: m.pass_count, Failers: m.fail_count, passRate: (m.pass_count / total) * 100 };
                          })}
                          margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                          <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p style={{ fontSize: 12, color: "#475569" }}>No data for {selectedYear}. Students need to submit predictions first.</p>
                    )}
                  </ChartContainer>
                </div>

                {/* Attempts Table */}
                <div style={{ marginTop: 14 }}>
                  <ChartContainer title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth accent={c.indigo}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label style={{ fontSize: 12, color: "#64748b" }}>Year:</label>
                        <input className="filter-input" type="number" placeholder="e.g. 2025" value={attFilter.year}
                          onChange={e => { setAttFilter(f => ({ ...f, year: e.target.value })); setAttPage(1); }}
                          style={{ width: 90 }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label style={{ fontSize: 12, color: "#64748b" }}>Month:</label>
                        <input className="filter-input" type="number" placeholder="1–12" min="1" max="12" value={attFilter.month}
                          onChange={e => { setAttFilter(f => ({ ...f, month: e.target.value })); setAttPage(1); }}
                          style={{ width: 70 }} />
                      </div>
                      <button onClick={() => { setAttFilter({ year: "", month: "" }); setAttPage(1); }}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
                        Clear
                      </button>
                      {attempts && (
                        <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>
                          {attempts.total} total · Page {attPage}
                        </span>
                      )}
                    </div>
                    {attempts && (attempts.items ?? []).length > 0 ? (
                      <>
                        <div style={{ overflowX: "auto" }}>
                          <table className="att-table">
                            <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>User ID</th></tr></thead>
                            <tbody>
                              {(attempts.items ?? []).map((item, i) => (
                                <tr key={i}>
                                  <td style={{ color: "#64748b" }}>{new Date(item.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                  <td>
                                    <span style={{
                                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                                      background: item.label === "PASSED" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                                      color: item.label === "PASSED" ? c.pass : c.fail,
                                      border: `1px solid ${item.label === "PASSED" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                                    }}>{item.label}</span>
                                  </td>
                                  <td style={{ fontWeight: 700, color: item.probability_pass >= 0.7 ? c.pass : item.probability_pass >= 0.5 ? c.amber : c.fail }}>
                                    {(item.probability_pass * 100).toFixed(1)}%
                                  </td>
                                  <td style={{ color: item.predicted_rating_a >= 70 ? c.pass : item.predicted_rating_a >= 60 ? c.amber : c.fail }}>
                                    {item.predicted_rating_a?.toFixed(1) ?? "—"}
                                  </td>
                                  <td style={{ color: "#475569", fontSize: 11 }}>{item.user_id ? item.user_id.slice(0, 8) + "…" : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "flex-end" }}>
                          <button onClick={() => setAttPage(p => Math.max(1, p - 1))} disabled={attPage === 1}
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: attPage === 1 ? "#334155" : "#94a3b8", fontSize: 12, cursor: attPage === 1 ? "not-allowed" : "pointer" }}>
                            ← Prev
                          </button>
                          <span style={{ fontSize: 12, color: "#475569" }}>{attPage} / {Math.ceil(((attempts.total) || 1) / 20)}</span>
                          <button onClick={() => setAttPage(p => p + 1)} disabled={attPage >= Math.ceil(((attempts.total) || 1) / 20)}
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: attPage >= Math.ceil(((attempts.total) || 1) / 20) ? "#334155" : "#94a3b8", fontSize: 12, cursor: attPage >= Math.ceil(((attempts.total) || 1) / 20) ? "not-allowed" : "pointer" }}>
                            Next →
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: "28px 0", textAlign: "center" }}>
                        <p style={{ fontSize: 14, color: "#475569" }}>No prediction attempts found.</p>
                        <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Students need to log in and submit predictions first.</p>
                      </div>
                    )}
                  </ChartContainer>
                </div>
              </div>
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