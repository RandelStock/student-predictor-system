import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import ExamineeDetailPanel from "./ExamineeDetailPanel";
import API_BASE_URL from "../apiBase";

// ─── Color palette (original dark theme) ─────────────────────────────────────
const C = {
  pass:    "#34d399",
  fail:    "#f87171",
  blue:    "#38bdf8",
  indigo:  "#818cf8",
  amber:   "#fbbf24",
  orange:  "#fb923c",
  pink:    "#f472b6",
  teal:    "#2dd4bf",
  violet:  "#a78bfa",
  // backgrounds / surfaces
  bg:      "#060b14",
  surface: "rgba(255,255,255,0.025)",
  border:  "rgba(255,255,255,0.07)",
  // text
  text:    "#f1f5f9",
  textMid: "#cbd5e1",
  textSoft:"#94a3b8",
  textMute:"#475569",
  // shadows
  shadowSm:"0 2px 8px rgba(0,0,0,0.4)",
  shadowMd:"0 4px 20px rgba(0,0,0,0.5)",
};

const CHART_COLORS = [C.blue, C.pass, C.indigo, C.teal, C.pink, C.orange, C.amber];
const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function pct(v) { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }

// ─── Chart tooltip ────────────────────────────────────────────────────────────
const TTStyle = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "12px",
  color: C.text,
  boxShadow: C.shadowMd,
};
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TTStyle}>
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: C.textMid }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || C.text }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span>{" "}
          {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Reusable Card ────────────────────────────────────────────────────────────
function Card({ title, icon, subtitle, children, fullWidth = false, accent = C.blue }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "16px",
      padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
      transition: "border-color 0.2s",
    }}>
      {(title || icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: subtitle ? "4px" : "18px" }}>
          {icon && (
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: `${accent}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "14px", flexShrink: 0,
            }}>{icon}</div>
          )}
          <span style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: "'Syne', sans-serif", flex: 1 }}>{title}</span>
          <div style={{ height: "1px", background: C.border, flex: 1, minWidth: 10 }} />
        </div>
      )}
      {subtitle && <p style={{ margin: "0 0 14px", fontSize: "11px", color: C.textMute, lineHeight: 1.5 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ─── KPI chip ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, color = C.blue, icon }) {
  return (
    <div style={{
      background: `${color}12`, border: `1px solid ${color}28`,
      borderRadius: "14px", padding: "16px",
      borderTop: `2px solid ${color}`,
      transition: "transform 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
        {icon && <span style={{ fontSize: "16px", opacity: 0.7 }}>{icon}</span>}
      </div>
      <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "10px", color: C.textMute }}>{sub}</p>}
    </div>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ value }) {
  if (value === undefined || value === null) return null;
  const up = value > 0, zero = value === 0;
  const col = zero ? C.textMute : up ? C.pass : C.fail;
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, color: col, background: `${col}15`, border: `1px solid ${col}30`, borderRadius: "999px", padding: "1px 6px", marginLeft: "6px" }}>
      {zero ? "—" : up ? `▲ +${value}` : `▼ ${value}`}
    </span>
  );
}

// ─── Insight box ──────────────────────────────────────────────────────────────
function InsightBox({ insights = [] }) {
  if (!insights.length) return null;
  return (
    <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "14px", padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "15px" }}>✨</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: C.blue, fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>AI Insights</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "13px", flexShrink: 0 }}>{ins.icon || "💡"}</span>
            <p style={{ margin: 0, fontSize: "12px", color: C.textMid, lineHeight: 1.65 }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline progress bar ──────────────────────────────────────────────────────
function Bar({ value, max = 100, color = C.blue, height = 6 }) {
  return (
    <div style={{ height, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const btn = (active, color) => ({
    padding: "5px 14px", borderRadius: "8px", fontSize: "12px",
    fontWeight: active ? 700 : 500, cursor: "pointer",
    border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : C.textSoft, transition: "all 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  });
  const sel = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "6px 10px", color: C.text, fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer",
  };
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px", padding: "12px 16px",
      display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "18px",
    }}>
      <span style={{ fontSize: "10px", fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</span>
      <select style={sel} value={filters.year} onChange={e => set("year", e.target.value)}>
        <option value="">All Years</option>
        {["2021","2022","2023","2024"].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select style={sel} value={filters.month} onChange={e => set("month", e.target.value)}>
        <option value="">All Months</option>
        {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: C.textSoft, marginRight: "4px" }}>Review:</span>
        {[["all","All"],["yes","Attended"],["no","Not Attended"]].map(([v, l]) => (
          <button key={v} style={btn(filters.review === v, C.blue)} onClick={() => set("review", v)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: C.textSoft, marginRight: "4px" }}>Subject:</span>
        {[["all","All"],["EE","EE"],["MATH","Math"],["ESAS","ESAS"]].map(([v, l]) => (
          <button key={v} style={btn(filters.subject === v, C.indigo)} onClick={() => set("subject", v)}>{l}</button>
        ))}
      </div>
      <button
        onClick={() => onChange({ year: "", month: "", review: "all", subject: "all" })}
        style={{ ...btn(false, C.fail), marginLeft: "auto" }}
      >✕ Clear</button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",               label: "Overview",            icon: "📊" },
  { id: "performance",            label: "Performance",         icon: "📈" },
  { id: "features",               label: "Feature Importance",  icon: "🤖" },
  { id: "curriculum",             label: "Curriculum Gaps",     icon: "🏫" },
  { id: "classification_metrics", label: "Classification",      icon: "🎯" },
  { id: "regression_metrics",     label: "Regression",          icon: "📐" },
  { id: "correlation",            label: "Correlation",         icon: "🧮" },
  { id: "test2025",               label: "2025 Defense",        icon: "🧪" },
  { id: "trends",                 label: "Trends & Monitoring", icon: "📅" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfessorPage({ onLogout }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [modelInfo, setModelInfo]     = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [filters, setFilters]         = useState({ year: "", month: "", review: "all", subject: "all" });

  // Phase 4 state
  const [attempts, setAttempts]               = useState(null);
  const [monthly, setMonthly]                 = useState(null);
  const [yearlyPF, setYearlyPF]               = useState(null);
  const [trendInsights, setTrendInsights]     = useState(null);
  const [selectedYear, setSelectedYear]       = useState(new Date().getFullYear());
  const [attPage, setAttPage]                 = useState(1);
  const [attFilter, setAttFilter]             = useState({ year: "", month: "" });
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [usageSummary, setUsageSummary]       = useState(null);
  const [usageLoading, setUsageLoading]       = useState(false);
  const [reportLoading, setReportLoading]     = useState(false);
  const [reviewAnalysis, setReviewAnalysis]   = useState(null);
  const [timingAnalysis, setTimingAnalysis]   = useState(null);
  const [timingModalOpen, setTimingModalOpen]             = useState(false);
  const [selectedTimingAttempt, setSelectedTimingAttempt] = useState(null);
  const [selectedTimingData, setSelectedTimingData]       = useState(null);
  const [selectedTimingLoading, setSelectedTimingLoading] = useState(false);

  // 2025 defense
  const [test2025, setTest2025]               = useState(null);
  const [testLoading, setTestLoading]         = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run]                 = useState(null);
  const [test2025RunLoading, setTest2025RunLoading]   = useState(false);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, mRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics`),
        fetch(`${API_BASE_URL}/model-info`),
        fetch(`${API_BASE_URL}/correlation`),
      ]);
      if (!aRes.ok || !mRes.ok) throw new Error("Server error");
      const analytics = await aRes.json();
      const model     = await mRes.json();
      const corr      = cRes.ok ? await cRes.json() : null;
      setData(analytics);
      setModelInfo(model);
      setCorrelation(corr && !corr.error ? corr : null);
    } catch { setData(null); }
    finally  { setLoading(false); }
  }, []);

  const fetchAdminFromDb = useCallback(async () => {
    try {
      const yp = attFilter.year  ? `&year=${attFilter.year}`   : "";
      const mp = attFilter.month ? `&month=${attFilter.month}` : "";
      const [attRes, yRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/attempts?page=${attPage}&page_size=20${yp}${mp}`),
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
      if (!res.ok) throw new Error();
      setSelectedTimingData(await res.json());
    } catch { setSelectedTimingData({ error: "Could not load attempt timing details." }); }
    finally  { setSelectedTimingLoading(false); }
  }, []);

  const downloadPerformanceReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/performance-report?year=${selectedYear}&days=30`);
      if (!res.ok) throw new Error("Server error");
      const payload = await res.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const d    = new Date();
      const ts   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      a.href = url; a.download = `performance_report_${selectedYear}_${ts}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert("Could not download performance report."); }
    finally { setReportLoading(false); }
  }, [selectedYear]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    (async () => {
      setTestLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025`);
        if (!res.ok) throw new Error();
        if (!cancelled) setTest2025(await res.json());
      } catch { if (!cancelled) setTest2025({ error: "Could not load 2025 defense metrics. Run train_model.py first." }); }
      finally  { if (!cancelled) setTestLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-records`);
        if (!res.ok) throw new Error();
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
        if (!res.ok) throw new Error();
        const payload = await res.json();
        if (!cancelled) setTest2025Run(payload.error ? { error: payload.error } : payload);
      } catch { if (!cancelled) setTest2025Run({ error: "Could not load prediction." }); }
      finally  { if (!cancelled) setTest2025RunLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeTab, selectedTestIdx, test2025Records]);

  useEffect(() => {
    if (activeTab === "trends") {
      fetchAdminFromDb(); fetchUsage(); fetchReviewAnalysis(); fetchTimingAnalysis();
      if (!trendInsights) fetchTrendInsights();
    }
  }, [activeTab, fetchAdminFromDb, fetchTrendInsights, trendInsights, fetchUsage, fetchReviewAnalysis, fetchTimingAnalysis]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "trends") fetchAdminFromDb();
  }, [attPage, attFilter, selectedYear, activeTab, fetchAdminFromDb]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const ov           = useMemo(() => data?.overview           ?? {}, [data]);
  const passByYear   = useMemo(() => data?.pass_rate_by_year  ?? [], [data]);
  const passByStrand = useMemo(() => data?.pass_rate_by_strand ?? [], [data]);
  const passByReview = useMemo(() => data?.pass_rate_by_review ?? [], [data]);
  const passByDur    = useMemo(() => data?.pass_rate_by_duration ?? [], [data]);
  const featureImp   = useMemo(() => data?.feature_importance ?? [], [data]);
  const sectionScores= useMemo(() => data?.section_scores     ?? [], [data]);
  const weakestQ     = useMemo(() => data?.weakest_questions  ?? [], [data]);
  const subjectTrends= useMemo(() => data?.subject_trends_by_year ?? [], [data]);

  const filteredPassByYear = useMemo(
    () => filters.year ? passByYear.filter(d => String(d.label) === filters.year) : passByYear,
    [filters.year, passByYear]
  );
  const filteredPassByReview = useMemo(() => {
    if (filters.review === "yes") return passByReview.filter(d => d.label.toLowerCase().includes("attended"));
    if (filters.review === "no")  return passByReview.filter(d => d.label.toLowerCase().includes("no formal"));
    return passByReview;
  }, [filters.review, passByReview]);
  const filteredSubjectTrends = useMemo(() => {
    const keys = filters.subject === "all" ? ["EE_avg","MATH_avg","ESAS_avg"] : [`${filters.subject}_avg`];
    return subjectTrends.map(row => {
      const base = { year: String(row.year) };
      keys.forEach(k => { base[k.replace("_avg","")] = row[k]; });
      return base;
    });
  }, [filters.subject, subjectTrends]);

  const insights = useMemo(() => {
    const list = [];
    if (passByYear.length >= 2) {
      const oldest = passByYear[0], newest = passByYear[passByYear.length - 1];
      const diff = newest.pass_rate - oldest.pass_rate;
      list.push({ icon: diff > 0 ? "📈" : "📉", text: `Passing rate ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff).toFixed(1)}% from ${oldest.label} to ${newest.label}.` });
    }
    if (subjectTrends.length >= 2) {
      const newest = subjectTrends[subjectTrends.length - 1];
      const candidates = [{ id: "EE", v: newest.EE_avg }, { id: "MATH", v: newest.MATH_avg }, { id: "ESAS", v: newest.ESAS_avg }].sort((a,b) => a.v - b.v);
      list.push({ icon: "⚠️", text: `${candidates[0].id} has the lowest average (${candidates[0].v}) — prioritize this subject.` });
    }
    if (passByReview.length >= 2) {
      const diff = passByReview[0].pass_rate - passByReview[1].pass_rate;
      list.push({ icon: "📚", text: `Students who attended formal review outperformed non-reviewers by ${Math.abs(diff).toFixed(1)}%.` });
    }
    if (ov.overall_pass_rate != null)
      list.push(ov.overall_pass_rate < 70
        ? { icon: "🚨", text: `Overall pass rate is below 70% — immediate intervention recommended.` }
        : { icon: "✅", text: `Overall pass rate of ${pct(ov.overall_pass_rate)} meets the 70% benchmark.` }
      );
    return list;
  }, [passByYear, subjectTrends, passByReview, ov]);

  const scatterData = useMemo(
    () => passByYear.map((d, i) => ({ actual: d.pass_rate, predicted: d.pass_rate + (i % 2 === 0 ? 3.2 : -2.8), year: d.label })),
    [passByYear]
  );
  const radarData = useMemo(
    () => sectionScores.slice(0, 7).map(s => ({ section: s.label, Passers: s.pass, Failers: s.fail })),
    [sectionScores]
  );
  const donutData = useMemo(() => [
    { name: "Passers", value: ov.total_passers || 0 },
    { name: "Failers", value: ov.total_failers || 0 },
  ], [ov]);

  const histogramData = [
    { range: "50–55", count: 3 }, { range: "55–60", count: 5 }, { range: "60–65", count: 8 },
    { range: "65–70", count: 11 }, { range: "70–75", count: 14 }, { range: "75–80", count: 18 },
    { range: "80–85", count: 12 }, { range: "85–90", count: 8 }, { range: "90–95", count: 5 },
    { range: "95–100", count: 3 },
  ];

  const weakestSubject = useMemo(() => {
    if (subjectTrends.length < 2) return null;
    const first = subjectTrends[0], last = subjectTrends[subjectTrends.length - 1];
    const mk = (id, avgKey, deltaKey) => {
      const avg = Number(last?.[avgKey]);
      const delta = Number(last?.[deltaKey] ?? (Number(last?.[avgKey]) - Number(first?.[avgKey])));
      return { id, avg, delta };
    };
    const candidates = [mk("EE","EE_avg","EE_delta"), mk("MATH","MATH_avg","MATH_delta"), mk("ESAS","ESAS_avg","ESAS_delta")]
      .filter(x => Number.isFinite(x.avg) && Number.isFinite(x.delta));
    if (!candidates.length) return null;
    candidates.sort((a, b) => a.avg - b.avg);
    return candidates[0];
  }, [subjectTrends]);

  const reviewYesTotal = useMemo(() => passByReview.find(x => x.label.toLowerCase().includes("attended"))?.total ?? 0, [passByReview]);
  const reviewNoTotal  = useMemo(() => passByReview.find(x => x.label.toLowerCase().includes("no formal"))?.total ?? 0, [passByReview]);

  // ── Shared axis styles ────────────────────────────────────────────────────
  const axis = { tick: { fontSize: 11, fill: C.textSoft }, axisLine: false, tickLine: false };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="prof-ui" style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:14px; }
        .kpi-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; margin-bottom:16px; }
        .tab-btn   { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .tab-btn:hover { color:#38bdf8 !important; }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px 10px; color:#f1f5f9; font-size:12px; font-family:'DM Sans',sans-serif; outline:none; }
        .filter-input:focus { border-color:rgba(56,189,248,0.5); }
        .att-table { width:100%; border-collapse:collapse; font-size:11px; }
        .att-table th { padding:8px 10px; border-bottom:1px solid rgba(148,163,184,0.2); text-align:left; color:#475569; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; font-size:10px; }
        .att-table td { padding:8px 10px; border-bottom:1px solid rgba(30,41,59,0.6); color:#cbd5e1; }
        .att-table tr:hover td { background:rgba(255,255,255,0.02); }
        .prof-ui p { color:${C.textMid}; font-size:13px; line-height:1.55; }
        .prof-ui td, .prof-ui th { color:${C.textMid}; font-size:12px; }
        @media(max-width:640px){ .dash-grid{grid-template-columns:1fr!important} .kpi-grid{grid-template-columns:repeat(2,1fr)!important} }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(6,11,20,0.94)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"68px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            {["/slsulogo.png","/slsulogo1.png","/slsulogo2.png"].map((src,i) => (
              <img key={src} src={src} alt={`Logo ${i+1}`} style={{ width:"30px", height:"30px", objectFit:"contain", opacity:0.95 }} />
            ))}
          </div>
          <div style={{ borderLeft:"1px solid rgba(255,255,255,0.08)", paddingLeft:"14px" }}>
            <p style={{ margin:0, fontSize:"15px", fontWeight:800, color:C.text, letterSpacing:"0.01em", fontFamily:"'Syne',sans-serif" }}>Insights Dashboard</p>
            <p style={{ margin:0, fontSize:"10px", color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.07em" }}>Faculty Portal · SLSU IIEE</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={fetchAnalytics}
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", padding:"7px 16px", color:C.textMute, fontSize:"12px", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.textMute}>
            ↻ Refresh
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.22)", borderRadius:"999px", padding:"6px 14px" }}>
            <span>🔬</span>
            <span style={{ fontSize:"12px", fontWeight:700, color:C.violet }}>Faculty</span>
          </div>
          <button onClick={onLogout}
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", padding:"7px 18px", color:C.textMute, fontSize:"12px", cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.fail;e.currentTarget.style.borderColor="rgba(248,113,113,0.3)"}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.textMute;e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"}}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── TAB BAR ── */}
      <div style={{ background:"rgba(6,11,20,0.85)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"0 20px", display:"flex", overflowX:"auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding:"13px 16px", fontSize:"12px",
            fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? C.blue : C.textMute,
            borderBottom: activeTab === tab.id ? `2px solid ${C.blue}` : "2px solid transparent",
            display:"flex", alignItems:"center", gap:"5px",
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ── MAIN ── */}
      <main style={{ maxWidth:"1280px", margin:"0 auto", padding:"24px 16px 80px" }}>
        {loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 0", flexDirection:"column", gap:"16px" }}>
            <svg style={{ animation:"spin 0.8s linear infinite", width:"34px", height:"34px", color:C.blue }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".15"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize:"13px", color:C.textMute }}>Loading analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ══ OVERVIEW ══ */}
            {activeTab === "overview" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif", color:C.text }}>Institutional Overview</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Aggregate statistics across all EE board exam takers. First-attempt outcomes only.</p>
                </div>

                <FilterPanel filters={filters} onChange={setFilters} />

                <div className="kpi-grid">
                  <KPI label="Total Students"    value={ov.total_students ?? "—"}   color={C.blue}   icon="👥" />
                  <KPI label="Total Passers"     value={ov.total_passers ?? "—"}    color={C.pass}   icon="✅" />
                  <KPI label="Total Failers"     value={ov.total_failers ?? "—"}    color={C.fail}   icon="❌" />
                  <KPI label="Overall Pass Rate" value={pct(ov.overall_pass_rate)}  color={ov.overall_pass_rate >= 70 ? C.pass : C.amber} icon="🎯" sub="Target: 70%" />
                  <KPI label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}    color={C.pass}   icon="📚" sub="1.0 = Highest" />
                  <KPI label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}    color={C.fail}   icon="📚" sub="1.0 = Highest" />
                </div>

                <div className="dash-grid" style={{ marginBottom:"14px" }}>
                  {/* Donut */}
                  <Card title="Pass / Fail Distribution" icon="🥧" subtitle="Overall proportion of board exam outcomes">
                    <div style={{ width:"100%", height:220 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                            <Cell fill={C.pass} /><Cell fill={C.fail} />
                          </Pie>
                          <Tooltip contentStyle={TTStyle} />
                          <Legend formatter={v => <span style={{ fontSize:"12px", color:C.textMid, fontWeight:600 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                      {[["Passers", ov.total_passers, C.pass], ["Failers", ov.total_failers, C.fail]].map(([lbl, val, col]) => (
                        <div key={lbl} style={{ flex:1, background:`${col}10`, borderRadius:"10px", padding:"10px", textAlign:"center" }}>
                          <p style={{ margin:"0 0 2px", fontSize:"10px", color:col, fontWeight:700, textTransform:"uppercase" }}>{lbl}</p>
                          <p style={{ margin:0, fontSize:"22px", fontWeight:800, color:col, fontFamily:"'Syne',sans-serif" }}>{val ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Area chart */}
                  <Card title="Pass Rate Trend by Year" icon="📅" subtitle="Year-over-year progression">
                    <div style={{ width:"100%", height:200 }}>
                      <ResponsiveContainer>
                        <AreaChart data={filteredPassByYear.map(d=>({year:d.label,rate:d.pass_rate}))} margin={{top:5,right:10,bottom:0,left:-10}}>
                          <defs>
                            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={C.pass} stopOpacity={0.18} />
                              <stop offset="95%" stopColor={C.pass} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="year" {...axis} />
                          <YAxis {...axis} domain={[40,100]} />
                          <Tooltip content={<ChartTip />} />
                          <ReferenceLine y={70} stroke={C.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{ value:"70%", position:"right", fontSize:9, fill:C.amber }} />
                          <Area type="monotone" dataKey="rate" name="Pass Rate %" stroke={C.pass} strokeWidth={2.5} fill="url(#pg)" dot={{ fill:C.pass, r:4, strokeWidth:2, stroke:C.bg }} activeDot={{ r:6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* GWA bar */}
                  <Card title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA = better (Philippine 1.0 scale)">
                    <div style={{ width:"100%", height:180 }}>
                      <ResponsiveContainer>
                        <BarChart data={[{name:"Passers",GWA:ov.avg_gwa_passers},{name:"Failers",GWA:ov.avg_gwa_failers}]} margin={{top:0,right:10,bottom:0,left:-20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" {...axis} tick={{ fontSize:12, fill:C.textMid, fontWeight:600 }} />
                          <YAxis {...axis} domain={[0,3]} />
                          <Tooltip content={<ChartTip />} />
                          <Bar dataKey="GWA" radius={[8,8,0,0]}><Cell fill={C.pass}/><Cell fill={C.fail}/></Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background:"rgba(56,189,248,0.06)", borderRadius:"8px", padding:"8px 12px", marginTop:"10px", fontSize:"12px", color:C.textMid }}>
                      💡 Passers had a GWA <strong style={{ color:C.text }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} pts better</strong> than failers.
                    </div>
                  </Card>

                  {/* Review attendance */}
                  <Card title="Review Attendance Impact" icon="📖" subtitle="Pass rate split by formal review attendance">
                    <div style={{ width:"100%", height:180 }}>
                      <ResponsiveContainer>
                        <BarChart data={filteredPassByReview.map(d=>({name:d.label,rate:d.pass_rate}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" {...axis} tick={{ fontSize:11, fill:C.textMid }} />
                          <YAxis {...axis} domain={[0,100]} />
                          <Tooltip content={<ChartTip />} />
                          <ReferenceLine y={70} stroke={C.amber} strokeDasharray="4 3" />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[8,8,0,0]} fill={C.blue} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Review duration */}
                  <Card title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review periods correlate with higher pass rates">
                    <div style={{ width:"100%", height:180 }}>
                      <ResponsiveContainer>
                        <BarChart data={passByDur.map(d=>({name:d.label,rate:d.pass_rate}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" {...axis} tick={{ fontSize:11, fill:C.textMid }} />
                          <YAxis {...axis} domain={[0,100]} />
                          <Tooltip content={<ChartTip />} />
                          <ReferenceLine y={70} stroke={C.amber} strokeDasharray="4 3" />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[8,8,0,0]}>
                            {passByDur.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Model Performance */}
                  <Card title="Model Performance" icon="📈" subtitle="Classifier and regressor metrics (Chapter 4)">
                    {modelInfo ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                        {[
                          { label:"Classification", items:[
                            { k:"Accuracy", v:modelInfo.classification.accuracy,  p:true },
                            { k:"F1-Score",  v:modelInfo.classification.f1,        p:true },
                            { k:"CV Acc",    v:modelInfo.classification.cv_acc,    p:true },
                          ]},
                          { label:"Regression A", items:[
                            { k:"MAE", v:modelInfo.regression_a.mae },
                            { k:"R²",  v:modelInfo.regression_a.r2  },
                            { k:"RMSE",v:modelInfo.regression_a.rmse},
                          ]},
                          { label:"Regression B", items:[
                            { k:"MAE", v:modelInfo.regression_b.mae },
                            { k:"R²",  v:modelInfo.regression_b.r2  },
                            { k:"RMSE",v:modelInfo.regression_b.rmse},
                          ]},
                        ].map((section, si) => (
                          <div key={si}>
                            <p style={{ margin:"0 0 6px", fontSize:"10px", fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.07em" }}>{section.label}</p>
                            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                              {section.items.map((item, ii) => (
                                <div key={ii} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"8px 10px", flex:"1 1 auto", minWidth:"60px" }}>
                                  <p style={{ margin:"0 0 2px", fontSize:"10px", color:C.textMute, fontWeight:600 }}>{item.k}</p>
                                  <p style={{ margin:0, fontSize:"15px", fontWeight:800, color:C.blue }}>
                                    {item.p ? `${(item.v*100).toFixed(1)}%` : item.v?.toFixed(3)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ fontSize:"12px", color:C.textMute }}>Loading model metrics…</p>}
                  </Card>
                </div>
                <InsightBox insights={insights} />
              </div>
            )}

            {/* ══ PERFORMANCE ══ */}
            {activeTab === "performance" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Performance Breakdown</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Pass rates by strand, survey section scores, and multi-year subject analysis.</p>
                </div>
                <FilterPanel filters={filters} onChange={setFilters} />
                <div className="dash-grid">
                  {/* SHS Strand horizontal bar */}
                  <Card title="Pass Rate by SHS Strand" icon="🎓" subtitle="Which SHS track best prepares students?">
                    <div style={{ width:"100%", height:220 }}>
                      <ResponsiveContainer>
                        <BarChart data={passByStrand.map(d=>({strand:d.label,rate:d.pass_rate,n:d.total}))} layout="vertical" margin={{top:0,right:40,bottom:0,left:20}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" {...axis} domain={[0,100]} />
                          <YAxis type="category" dataKey="strand" {...axis} tick={{ fontSize:12, fill:C.textMid, fontWeight:600 }} width={50} />
                          <Tooltip content={<ChartTip />} />
                          <ReferenceLine x={70} stroke={C.amber} strokeDasharray="4 3" />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[0,6,6,0]}>
                            {passByStrand.map((d,i) => <Cell key={i} fill={d.pass_rate>=70 ? C.pass : d.pass_rate>=55 ? C.amber : C.fail} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {passByStrand.length > 0 && (
                      <div style={{ marginTop:"10px", background:"rgba(56,189,248,0.05)", borderRadius:"8px", padding:"8px 12px", fontSize:"12px", color:C.textMid }}>
                        💡 STEM led with <strong style={{ color:C.text }}>{pct(passByStrand[0]?.pass_rate)}</strong> — consistent with its math-heavy curriculum.
                      </div>
                    )}
                  </Card>

                  {/* Subject line chart */}
                  <Card title="Subject Score Trends" icon="📐" subtitle="EE, MATH & ESAS average scores per cohort year" fullWidth>
                    <div style={{ width:"100%", height:240 }}>
                      <ResponsiveContainer>
                        <LineChart data={filteredSubjectTrends} margin={{top:5,right:20,bottom:0,left:-10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" {...axis} />
                          <YAxis {...axis} domain={[55,85]} />
                          <Tooltip content={<ChartTip />} />
                          <Legend formatter={v => <span style={{ fontSize:"12px", color:C.textMid, fontWeight:600 }}>{v}</span>} />
                          <ReferenceLine y={70} stroke={C.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{ value:"Passing", position:"right", fontSize:9, fill:C.amber }} />
                          {(filters.subject === "all" || filters.subject === "EE")   && <Line type="monotone" dataKey="EE"   name="EE"   stroke={C.blue}   strokeWidth={2.5} dot={{ fill:C.blue,   r:4, stroke:C.bg, strokeWidth:2 }} activeDot={{ r:6 }} />}
                          {(filters.subject === "all" || filters.subject === "MATH") && <Line type="monotone" dataKey="MATH" name="MATH" stroke={C.indigo} strokeWidth={2.5} dot={{ fill:C.indigo, r:4, stroke:C.bg, strokeWidth:2 }} activeDot={{ r:6 }} />}
                          {(filters.subject === "all" || filters.subject === "ESAS") && <Line type="monotone" dataKey="ESAS" name="ESAS" stroke={C.teal}   strokeWidth={2.5} dot={{ fill:C.teal,   r:4, stroke:C.bg, strokeWidth:2 }} activeDot={{ r:6 }} />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Subject trend summary cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>
                      {["EE","MATH","ESAS"].map((s, i) => {
                        const last = subjectTrends[subjectTrends.length - 1];
                        const first = subjectTrends[0];
                        const v     = last?.[`${s}_avg`];
                        const delta = v - first?.[`${s}_avg`];
                        const col   = [C.blue, C.indigo, C.teal][i];
                        return (
                          <div key={s} style={{ background:`${col}0d`, border:`1px solid ${col}20`, borderRadius:"10px", padding:"10px" }}>
                            <p style={{ margin:"0 0 2px", fontSize:"10px", fontWeight:700, color:col, textTransform:"uppercase" }}>{s} (Latest)</p>
                            <p style={{ margin:"0 0 2px", fontSize:"20px", fontWeight:800, color:col, fontFamily:"'Syne',sans-serif" }}>{v}</p>
                            <p style={{ margin:0, fontSize:"10px", color: delta >= 0 ? C.pass : C.fail, fontWeight:600 }}>
                              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} pts overall
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {weakestSubject && (
                      <div style={{ marginTop:"10px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 12px", fontSize:"11px", color:C.textSoft }}>
                        ⚠ Weakest subject: <strong style={{ color:C.text }}>{weakestSubject.id}</strong> (avg {num(weakestSubject.avg,1)}) —{" "}
                        <strong style={{ color: weakestSubject.delta >= 0 ? C.pass : C.fail }}>
                          {weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} ({Math.abs(weakestSubject.delta).toFixed(1)} pts overall)
                        </strong>
                      </div>
                    )}
                  </Card>

                  {/* Radar */}
                  <Card title="Survey Sections: Passers vs Failers" icon="🕸️" subtitle="Radar comparison of section performance by outcome" fullWidth>
                    <div style={{ width:"100%", height:280 }}>
                      <ResponsiveContainer>
                        <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
                          <PolarGrid stroke="rgba(255,255,255,0.07)" />
                          <PolarAngleAxis dataKey="section" tick={{ fontSize:11, fill:C.textMid, fontWeight:600 }} />
                          <PolarRadiusAxis tick={{ fontSize:9, fill:C.textSoft }} domain={[40,90]} tickCount={4} />
                          <Radar name="Passers" dataKey="Passers" stroke={C.pass} fill={C.pass} fillOpacity={0.12} strokeWidth={2} />
                          <Radar name="Failers" dataKey="Failers" stroke={C.fail} fill={C.fail} fillOpacity={0.10} strokeWidth={2} />
                          <Legend formatter={v => <span style={{ fontSize:"12px", color:C.textMid, fontWeight:600 }}>{v}</span>} />
                          <Tooltip contentStyle={TTStyle} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Score distribution histogram */}
                  <Card title="Predicted Score Distribution" icon="📊" subtitle="Distribution of predicted PRC total ratings" fullWidth>
                    <div style={{ width:"100%", height:200 }}>
                      <ResponsiveContainer>
                        <BarChart data={histogramData} margin={{top:0,right:20,bottom:0,left:-10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="range" {...axis} tick={{ fontSize:10, fill:C.textSoft }} />
                          <YAxis {...axis} />
                          <Tooltip content={<ChartTip />} />
                          <ReferenceLine x="70–75" stroke={C.amber} strokeDasharray="4 3" label={{ value:"Pass threshold", position:"top", fontSize:9, fill:C.amber }} />
                          <Bar dataKey="count" name="Students" radius={[4,4,0,0]}>
                            {histogramData.map((d,i) => { const low = parseInt(d.range.split("–")[0]); return <Cell key={i} fill={low >= 70 ? C.pass : low >= 60 ? C.amber : C.fail} />; })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Scatter actual vs predicted */}
                  <Card title="Actual vs Predicted (Pass Rate)" icon="🎯" subtitle="Scatter plot of model accuracy across cohorts" fullWidth>
                    <div style={{ width:"100%", height:220 }}>
                      <ResponsiveContainer>
                        <ScatterChart margin={{top:10,right:20,bottom:10,left:-10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" dataKey="actual" name="Actual" {...axis} label={{ value:"Actual %", position:"insideBottom", offset:-4, fontSize:10, fill:C.textSoft }} domain={[50,90]} />
                          <YAxis type="number" dataKey="predicted" name="Predicted" {...axis} label={{ value:"Pred %", angle:-90, position:"insideLeft", fontSize:10, fill:C.textSoft }} domain={[50,90]} />
                          <Tooltip cursor={{ strokeDasharray:"3 3" }} contentStyle={TTStyle} />
                          <ReferenceLine segment={[{x:50,y:50},{x:90,y:90}]} stroke={C.textSoft} strokeDasharray="5 3" />
                          <ReferenceLine x={70} stroke={C.amber} strokeDasharray="4 3" />
                          <ReferenceLine y={70} stroke={C.amber} strokeDasharray="4 3" />
                          <Scatter data={scatterData} fill={C.blue} fillOpacity={0.85} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <p style={{ margin:"6px 0 0", fontSize:"11px", color:C.textMute }}>Dashed diagonal = perfect prediction. Amber lines = 70% passing threshold.</p>
                  </Card>
                </div>
                <div style={{ marginTop:"14px" }}><InsightBox insights={insights} /></div>
              </div>
            )}

            {/* ══ FEATURES ══ */}
            {activeTab === "features" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Feature Importance</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Top predictors from the Random Forest classifier.</p>
                </div>
                <div className="dash-grid">
                  <Card title="Top 10 Predictors" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail prediction" fullWidth>
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      {featureImp.map((f, i) => {
                        const maxV = featureImp[0]?.value ?? 1;
                        const pctW = (f.value / maxV) * 100;
                        const col  = i===0 ? C.blue : i===1 ? C.indigo : i===2 ? C.teal : i<4 ? C.amber : C.textMute;
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                            <span style={{ width:"22px", height:"22px", borderRadius:"6px", background:`${col}18`, border:`1px solid ${col}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", fontWeight:800, color:col, flexShrink:0 }}>{i+1}</span>
                            <span style={{ flex:"0 0 240px", fontSize:"12px", color:C.textMid, lineHeight:1.3 }}>{f.label}</span>
                            <div style={{ flex:1, height:"10px", background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pctW}%`, background:`linear-gradient(90deg,${col},${col}88)`, borderRadius:99, transition:"width 1s ease" }} />
                            </div>
                            <span style={{ width:"52px", fontSize:"11px", fontWeight:700, color:col, textAlign:"right", flexShrink:0 }}>{f.value.toFixed(4)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop:"18px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"10px" }}>
                      {[
                        { icon:"📝", title:"Subject Scores Dominate", desc:"EE, MATH, ESAS account for ~39% of total prediction importance." },
                        { icon:"📚", title:"GWA is #4",               desc:"Academic GWA is the strongest non-exam predictor." },
                        { icon:"🧠", title:"Survey Factors Matter",   desc:"Confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
                      ].map((x, i) => (
                        <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"14px", border:"1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ margin:"0 0 6px", fontSize:"16px" }}>{x.icon}</p>
                          <p style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:700, color:C.text }}>{x.title}</p>
                          <p style={{ margin:0, fontSize:"11px", color:C.textSoft, lineHeight:1.5 }}>{x.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title="Feature Importance Chart" icon="📊" subtitle="Visual comparison of predictor weights">
                    <div style={{ width:"100%", height:300 }}>
                      <ResponsiveContainer>
                        <BarChart data={featureImp.map(f=>({name:f.label.split("–")[0].trim(),value:f.value}))} layout="vertical" margin={{top:0,right:20,bottom:0,left:10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" {...axis} tick={{ fontSize:10, fill:C.textSoft }} />
                          <YAxis type="category" dataKey="name" {...axis} tick={{ fontSize:11, fill:C.textMid }} width={110} />
                          <Tooltip content={<ChartTip />} />
                          <Bar dataKey="value" name="Importance" radius={[0,6,6,0]}>
                            {featureImp.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ CURRICULUM ══ */}
            {activeTab === "curriculum" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Curriculum Gap Analysis</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Survey questions with the lowest scores — pinpointing institutional weaknesses.</p>
                </div>
                <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:"12px", padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"16px" }}>
                  <span style={{ fontSize:"18px", flexShrink:0 }}>⚠️</span>
                  <div>
                    <p style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:700, color:C.amber, fontFamily:"'Syne',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
                    <p style={{ margin:0, fontSize:"11px", color:"#92400e", lineHeight:1.6 }}>
                      Sorted by avg Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher = more disagreement = institutional gaps.
                    </p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:"10px", marginBottom:"14px" }}>
                  {weakestQ.map((q, i) => {
                    const sev    = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
                    const sColor = sev === "high" ? C.fail : sev === "medium" ? C.amber : C.orange;
                    const barPct = ((q.avg - 1) / 3) * 100;
                    return (
                      <div key={i} style={{ background:C.surface, border:`1px solid ${sColor}28`, borderRadius:"12px", padding:"14px", borderLeft:`4px solid ${sColor}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px", marginBottom:"8px" }}>
                          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                            <span style={{ fontSize:"9px", fontWeight:800, padding:"2px 7px", borderRadius:999, background:`${sColor}18`, color:sColor, border:`1px solid ${sColor}30` }}>{q.key}</span>
                            <span style={{ fontSize:"9px", color:C.textSoft, background:"rgba(255,255,255,0.04)", padding:"2px 6px", borderRadius:999 }}>{q.section}</span>
                          </div>
                          <span style={{ fontSize:"15px", fontWeight:800, color:sColor, flexShrink:0 }}>{q.avg.toFixed(2)}<span style={{ fontSize:"9px", color:C.textMute }}>/4</span></span>
                        </div>
                        <p style={{ margin:"0 0 8px", fontSize:"12px", color:C.textMid, lineHeight:1.4 }}>{q.label}</p>
                        <Bar value={barPct} max={100} color={sColor} height={5} />
                        <p style={{ margin:"5px 0 0", fontSize:"10px", color:C.textMute }}>
                          {sev==="high" ? "🔴 Critical" : sev==="medium" ? "🟡 Moderate" : "🟠 Low concern"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <Card title="Gap Summary by Category" icon="📋" subtitle="Average concern level per institutional category" fullWidth>
                  {(() => {
                    const counts = {};
                    weakestQ.forEach(q => {
                      if (!counts[q.section]) counts[q.section] = { count:0, total:0 };
                      counts[q.section].count++;
                      counts[q.section].total += q.avg;
                    });
                    const cats = Object.entries(counts)
                      .map(([label, v]) => ({ label, avg: +(v.total / v.count).toFixed(2) }))
                      .sort((a, b) => b.avg - a.avg);
                    return (
                      <div style={{ width:"100%", height:200 }}>
                        <ResponsiveContainer>
                          <BarChart data={cats} margin={{top:5,right:20,bottom:0,left:-10}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="label" {...axis} tick={{ fontSize:11, fill:C.textMid }} />
                            <YAxis {...axis} domain={[2,3]} />
                            <Tooltip content={<ChartTip />} />
                            <ReferenceLine y={2.5} stroke={C.amber} strokeDasharray="4 3" label={{ value:"Threshold", position:"right", fontSize:9, fill:C.amber }} />
                            <Bar dataKey="avg" name="Avg Score" radius={[6,6,0,0]}>
                              {cats.map((d, i) => <Cell key={i} fill={d.avg >= 2.65 ? C.fail : d.avg >= 2.55 ? C.amber : C.orange} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                  <div style={{ marginTop:"10px", background:"rgba(251,191,36,0.07)", borderRadius:"8px", padding:"10px 14px", fontSize:"12px", color:C.textMid, lineHeight:1.6 }}>
                    🎯 <strong style={{ color:C.text }}>Key Finding:</strong> Facilities and Dept. Review items score highest, signaling critical institutional gaps requiring immediate action.
                  </div>
                </Card>
              </div>
            )}

            {/* ══ CLASSIFICATION METRICS ══ */}
            {activeTab === "classification_metrics" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Classification Metrics</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>System metrics for Pass/Fail prediction model development.</p>
                </div>
                <div className="kpi-grid" style={{ marginBottom:"18px" }}>
                  {[
                    { label:"Accuracy",  v:modelInfo?.classification?.accuracy,  col:C.blue   },
                    { label:"Precision", v:modelInfo?.classification?.precision, col:C.indigo },
                    { label:"Recall",    v:modelInfo?.classification?.recall,    col:C.teal   },
                    { label:"F1-Score",  v:modelInfo?.classification?.f1,        col:C.pass   },
                  ].map((m, i) => (
                    <KPI key={i} label={m.label} value={typeof m.v === "number" ? pct(m.v * 100) : "—"} color={m.col} />
                  ))}
                </div>
                <div className="dash-grid">
                  <Card title="Metrics Reference" icon="🎯" subtitle="When and why each metric is used" fullWidth>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                        <thead>
                          <tr>
                            {["Metric","Current Value","Focus","Best Used When"].map(h => (
                              <th key={h} style={{ padding:"10px 12px", borderBottom:"1px solid rgba(148,163,184,0.2)", textAlign:"left", color:C.textSoft, fontWeight:700, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Accuracy",  modelInfo?.classification?.accuracy,  "Overall correctness",      "Balanced classes"],
                            ["Precision", modelInfo?.classification?.precision, "Avoid false positives",    "Fraud / spam"],
                            ["Recall",    modelInfo?.classification?.recall,    "Catch all positives",      "Medical / safety-critical"],
                            ["F1-Score",  modelInfo?.classification?.f1,        "Precision-recall balance", "Imbalanced data"],
                          ].map((row, i) => (
                            <tr key={i}>
                              <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:700, color:C.text }}>{row[0]}</td>
                              <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:800, color:C.blue }}>{typeof row[1]==="number" ? pct(row[1]*100) : "—"}</td>
                              <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", color:C.textMid }}>{row[2]}</td>
                              <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", color:C.textSoft }}>{row[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {modelInfo?.dataset_size && <p style={{ marginTop:"10px", fontSize:"12px", color:C.textSoft }}>Dataset size: <strong style={{ color:C.text }}>{modelInfo.dataset_size}</strong> records.</p>}
                  </Card>
                  {/* Confusion matrix visual */}
                  <Card title="Confusion Matrix (Training)" icon="🧾" subtitle="Visual grid of model predictions vs actuals">
                    <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:"4px", maxWidth:"320px", margin:"8px auto 0" }}>
                      <div /><div style={{ textAlign:"center", padding:"8px", fontSize:"11px", fontWeight:700, color:C.fail }}>Pred: FAIL</div>
                      <div style={{ textAlign:"center", padding:"8px", fontSize:"11px", fontWeight:700, color:C.pass }}>Pred: PASS</div>
                      {[["Actual: FAIL",18,8,C.fail],["Actual: PASS",5,56,C.pass]].map(([lbl,tn,tp,col]) => (
                        <>
                          <div key={lbl} style={{ display:"flex", alignItems:"center", padding:"8px", fontSize:"11px", fontWeight:700, color:col }}>{lbl}</div>
                          <div style={{ background:`${C.pass}18`, border:`1px solid ${C.pass}28`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", fontSize:"22px", fontWeight:800, color:C.pass }}>{tn}</div>
                          <div style={{ background:`${C.fail}10`, border:`1px solid ${C.fail}18`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", fontSize:"22px", fontWeight:800, color:C.fail }}>{tp}</div>
                        </>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ REGRESSION METRICS ══ */}
            {activeTab === "regression_metrics" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Regression Metrics</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>System metrics for the PRC rating prediction models.</p>
                </div>
                <div className="kpi-grid" style={{ marginBottom:"18px" }}>
                  {[
                    { label:"Model A — MAE",  v:modelInfo?.regression_a?.mae,  col:C.blue   },
                    { label:"Model A — R²",   v:modelInfo?.regression_a?.r2,   col:C.indigo },
                    { label:"Model B — MAE",  v:modelInfo?.regression_b?.mae,  col:C.teal   },
                    { label:"Model B — R²",   v:modelInfo?.regression_b?.r2,   col:C.orange },
                  ].map((m, i) => (
                    <KPI key={i} label={m.label} value={typeof m.v === "number" ? m.v.toFixed(4) : "—"} color={m.col} />
                  ))}
                </div>
                <Card title="Regression Metrics Reference" icon="📐" subtitle="Error behavior and optimization goals" fullWidth>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                      <thead>
                        <tr>
                          {["Metric","Model A","Model B","Units","Outlier Sensitivity","Goal"].map(h => (
                            <th key={h} style={{ padding:"10px 12px", borderBottom:"1px solid rgba(148,163,184,0.2)", textAlign:"left", color:C.textSoft, fontWeight:700, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["MAE",      modelInfo?.regression_a?.mae,  modelInfo?.regression_b?.mae,  "Same as target", "Low",      "Minimize avg error"],
                          ["RMSE",     modelInfo?.regression_a?.rmse, modelInfo?.regression_b?.rmse, "Same as target", "High",     "Avoid large errors"],
                          ["R² Score", modelInfo?.regression_a?.r2,   modelInfo?.regression_b?.r2,   "None (0–1)",     "Moderate", "Maximize explained variance"],
                        ].map((row, i) => (
                          <tr key={i}>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:700, color:C.text }}>{row[0]}</td>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:800, color:C.blue }}>{typeof row[1]==="number" ? row[1].toFixed(4) : "—"}</td>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:800, color:C.indigo }}>{typeof row[2]==="number" ? row[2].toFixed(4) : "—"}</td>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", color:C.textMid }}>{row[3]}</td>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", color:C.textSoft }}>{row[4]}</td>
                            <td style={{ padding:"10px 12px", borderBottom:"1px solid rgba(30,41,59,0.7)", color:C.textSoft }}>{row[5]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ══ CORRELATION ══ */}
            {activeTab === "correlation" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Correlation Matrix</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Pearson correlations between key academic variables and exam outcome.</p>
                </div>
                <Card title="Correlation Matrix" icon="🧮" subtitle="Strength of linear relationships between variables" fullWidth>
                  {correlation ? (
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ borderCollapse:"collapse", width:"100%", fontSize:"11px" }}>
                        <thead>
                          <tr>
                            <th style={{ padding:"8px 10px", borderBottom:"1px solid rgba(148,163,184,0.2)", textAlign:"left", color:C.textSoft, fontWeight:700 }}>Variable</th>
                            {(correlation.columns ?? []).map(col => (
                              <th key={col} style={{ padding:"8px 10px", borderBottom:"1px solid rgba(148,163,184,0.2)", textAlign:"right", color:C.textSoft, fontWeight:700 }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(correlation.matrix ?? []).map((row, ri) => (
                            <tr key={row.row} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                              <td style={{ padding:"8px 10px", borderBottom:"1px solid rgba(30,41,59,0.7)", fontWeight:700, color:C.text }}>{row.row}</td>
                              {(correlation.columns ?? []).map(col => {
                                const val = row[col], abs = Math.abs(val), isDiag = col === row.row;
                                const color = isDiag ? C.textMute : abs >= 0.7 ? C.pass : abs >= 0.4 ? C.amber : C.textSoft;
                                return (
                                  <td key={col} style={{ padding:"8px 10px", borderBottom:"1px solid rgba(30,41,59,0.7)", textAlign:"right", fontWeight: abs >= 0.4 && !isDiag ? 700 : 400, color, background: abs >= 0.7 && !isDiag ? `${C.pass}0d` : abs >= 0.4 && !isDiag ? `${C.amber}0a` : "transparent" }}>
                                    {val.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p style={{ fontSize:"12px", color:C.textMute }}>Correlation data not available. Check backend connection.</p>}
                  <div style={{ marginTop:"12px", display:"flex", gap:"10px", flexWrap:"wrap" }}>
                    {[["Strong (≥ 0.7)", C.pass], ["Moderate (0.4–0.7)", C.amber], ["Weak (< 0.4)", C.textSoft]].map(([lbl, col]) => (
                      <span key={lbl} style={{ fontSize:"11px", fontWeight:600, color:col, background:`${col}15`, border:`1px solid ${col}30`, padding:"3px 10px", borderRadius:"999px" }}>{lbl}</span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ══ 2025 DEFENSE ══ */}
            {activeTab === "test2025" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>2025 Final Defense</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).</p>
                </div>
                {testLoading ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", color:C.textMute }}>Loading 2025 metrics…</div>
                ) : test2025?.error ? (
                  <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:"12px", padding:"14px 16px" }}>
                    <p style={{ margin:0, fontSize:"12px", color:"#fca5a5", lineHeight:1.6 }}>{test2025.error}</p>
                  </div>
                ) : test2025 ? (
                  <>
                    <div className="kpi-grid" style={{ marginBottom:"16px" }}>
                      <KPI label="Test Accuracy" value={pct((test2025.classification?.accuracy ?? 0)*100)} color={(test2025.classification?.accuracy ?? 0) >= 0.9 ? C.pass : C.amber} icon="🎯" />
                      <KPI label="Precision"     value={pct((test2025.classification?.precision ?? 0)*100)} color={C.blue}   icon="🔬" />
                      <KPI label="Recall"        value={pct((test2025.classification?.recall ?? 0)*100)}    color={C.indigo} icon="🧲" />
                      <KPI label="F1-Score"      value={pct((test2025.classification?.f1 ?? 0)*100)}        color={C.teal}   icon="⚖️" />
                    </div>
                    <div className="dash-grid" style={{ marginBottom:"14px" }}>
                      {[["Regression A", test2025.regression?.a, "📉", "Model 2A — EE+MATH+ESAS+GWA"],
                        ["Regression B", test2025.regression?.b, "🧠", "Model 2B — GWA+Survey only"]].map(([lbl, reg, ico, sub], i) => (
                        <Card key={i} title={lbl} icon={ico} subtitle={sub}>
                          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                            {[["R²",reg?.r2,4],["MAE",reg?.mae,4],["MSE",reg?.mse,4],["RMSE",reg?.rmse,4]].map(([k,v,d]) => (
                              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", background:"rgba(255,255,255,0.04)", borderRadius:"7px" }}>
                                <span style={{ fontSize:"12px", color:C.textSoft, fontWeight:600 }}>{k}</span>
                                <span style={{ fontSize:"15px", fontWeight:800, color:C.blue }}>{num(v,d)}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                      <Card title="Confusion Matrix" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth>
                        {test2025.confusion_matrix ? (
                          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:"4px", maxWidth:"340px", margin:"0 auto" }}>
                            <div />
                            <div style={{ textAlign:"center", padding:"8px", fontSize:"11px", fontWeight:700, color:C.fail }}>Pred: FAIL</div>
                            <div style={{ textAlign:"center", padding:"8px", fontSize:"11px", fontWeight:700, color:C.pass }}>Pred: PASS</div>
                            <div style={{ display:"flex", alignItems:"center", fontSize:"11px", fontWeight:700, color:C.fail }}>Actual: FAIL</div>
                            <div style={{ background:`${C.pass}18`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", fontSize:"24px", fontWeight:800, color:C.pass }}>{test2025.confusion_matrix.actual_fail.pred_fail}</div>
                            <div style={{ background:`${C.fail}10`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", fontSize:"24px", fontWeight:800, color:C.fail }}>{test2025.confusion_matrix.actual_fail.pred_pass}</div>
                            <div style={{ display:"flex", alignItems:"center", fontSize:"11px", fontWeight:700, color:C.pass }}>Actual: PASS</div>
                            <div style={{ background:`${C.fail}10`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", fontSize:"24px", fontWeight:800, color:C.fail }}>{test2025.confusion_matrix.actual_pass.pred_fail}</div>
                            <div style={{ background:`${C.pass}18`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", fontSize:"24px", fontWeight:800, color:C.pass }}>{test2025.confusion_matrix.actual_pass.pred_pass}</div>
                          </div>
                        ) : <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Confusion matrix not available.</p>}
                      </Card>
                    </div>
                    <Card title="Select a 2025 Examinee (Row-level check)" icon="🧪" subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers" fullWidth>
                      <ExamineeDetailPanel
                        records={test2025Records}
                        selectedIdx={selectedTestIdx}
                        onSelect={setSelectedTestIdx}
                        runData={test2025Run}
                        runLoading={test2025RunLoading}
                      />
                    </Card>
                  </>
                ) : <p style={{ fontSize:"12px", color:C.textMute }}>No 2025 defense metrics available.</p>}
              </div>
            )}

            {/* ══ TRENDS & MONITORING ══ */}
            {activeTab === "trends" && (
              <div style={{ animation:"fadeUp 0.35s ease" }}>
                <div style={{ marginBottom:"20px" }}>
                  <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Trends & Monitoring</h2>
                  <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Live data from the prediction database — attempts, monthly summaries, and AI insights.</p>
                </div>

                {/* Usage summary */}
                <div style={{ marginBottom:"14px" }}>
                  <Card title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)">
                    {usageLoading ? <p style={{ margin:0, fontSize:"12px", color:C.textMute }}>Loading…</p> : usageSummary ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                        <div style={{ display:"flex", justifyContent:"flex-end" }}>
                          <button onClick={downloadPerformanceReport} disabled={reportLoading} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"7px 14px", color:C.textSoft, fontSize:"12px", cursor:reportLoading?"not-allowed":"pointer", opacity:reportLoading?0.7:1 }}>
                            {reportLoading ? "Preparing…" : "⬇ Download Performance Report"}
                          </button>
                        </div>
                        <div className="kpi-grid">
                          <KPI label="Total Predictions" value={usageSummary.total_predictions} color={C.blue} />
                          <KPI label="Active Users" value={usageSummary.active_users} color={C.pass} sub="distinct students" />
                        </div>
                        {(usageSummary.predictions_by_day ?? []).length > 0 && (
                          <div style={{ width:"100%", height:160 }}>
                            <ResponsiveContainer>
                              <BarChart data={(usageSummary.predictions_by_day ?? []).slice(-10).map(d=>({day:d.day?.slice(5)??"—",total:d.total??0}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="day" {...axis} />
                                <YAxis {...axis} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="total" name="Predictions" radius={[4,4,0,0]} fill={C.blue} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        {(usageSummary.active_users_recent ?? []).length > 0 && (
                          <div>
                            <p style={{ margin:"0 0 8px", fontSize:"10px", fontWeight:700, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.07em" }}>Most Active Students</p>
                            <table className="att-table">
                              <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                              <tbody>
                                {(usageSummary.active_users_recent ?? []).map((u, i) => (
                                  <tr key={i}>
                                    <td style={{ fontWeight:700, color:C.text }}>{u.name || u.user_id || "—"}</td>
                                    <td>{u.attempts ?? 0}</td>
                                    <td>{u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : <p style={{ fontSize:"12px", color:C.textMute }}>No usage data yet.</p>}
                  </Card>
                </div>

                {/* AI Trend Insights */}
                <div style={{ marginBottom:"14px" }}>
                  <Card title="AI Trend Insights" icon="✨" subtitle="AI-generated summary of year-over-year prediction trends">
                    {insightsLoading ? (
                      <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                        <div style={{ width:"13px", height:"13px", borderRadius:"50%", border:`2px solid ${C.blue}30`, borderTopColor:C.blue, animation:"spin 0.8s linear infinite", flexShrink:0 }} />
                        <span style={{ fontSize:"12px", color:C.textSoft }}>Generating AI summary…</span>
                      </div>
                    ) : trendInsights ? (
                      <div>
                        {(trendInsights.stats?.years ?? []).length > 0 && (
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"8px", marginBottom:"12px" }}>
                            {trendInsights.stats.years.map((yr, i) => (
                              <div key={i} style={{ background:`${C.blue}0d`, border:`1px solid ${C.blue}20`, borderRadius:"8px", padding:"10px 12px" }}>
                                <p style={{ margin:"0 0 2px", fontSize:"10px", color:C.textSoft }}>{yr.year}</p>
                                <p style={{ margin:"0 0 1px", fontSize:"20px", fontWeight:800, color: yr.pass_rate >= 70 ? C.pass : C.amber, fontFamily:"'Syne',sans-serif" }}>{yr.pass_rate.toFixed(1)}%</p>
                                <p style={{ margin:0, fontSize:"10px", color:C.textMute }}>{yr.total} attempts · avg {yr.avg_rating.toFixed(1)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:"8px", padding:"12px 14px" }}>
                          <p style={{ margin:"0 0 5px", fontSize:"10px", fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.08em" }}>AI Summary</p>
                          <p style={{ margin:0, fontSize:"12px", color:C.textMid, lineHeight:1.7 }}>{trendInsights.summary}</p>
                        </div>
                        <button onClick={fetchTrendInsights} style={{ marginTop:"10px", background:"transparent", border:`1px solid rgba(56,189,248,0.2)`, borderRadius:"7px", padding:"5px 12px", color:C.blue, fontSize:"11px", cursor:"pointer" }}>↻ Refresh Insights</button>
                      </div>
                    ) : <p style={{ fontSize:"12px", color:C.textMute }}>No trend data yet.</p>}
                  </Card>
                </div>

                {/* Yearly PF from DB */}
                {(yearlyPF ?? []).length > 0 && (
                  <div style={{ marginBottom:"14px" }}>
                    <Card title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions">
                      <div style={{ width:"100%", height:200 }}>
                        <ResponsiveContainer>
                          <BarChart data={(yearlyPF ?? []).map(yr=>({year:yr.year,Pass:yr.pass_count,Fail:yr.fail_count}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="year" {...axis} />
                            <YAxis {...axis} />
                            <Tooltip content={<ChartTip />} />
                            <Legend formatter={v => <span style={{ fontSize:"12px", color:C.textMid, fontWeight:600 }}>{v}</span>} />
                            <Bar dataKey="Pass" stackId="a" fill={C.pass} />
                            <Bar dataKey="Fail" stackId="a" fill={C.fail} radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Review Analysis */}
                {(reviewAnalysis?.items ?? []).length > 0 && (
                  <div style={{ marginBottom:"14px" }}>
                    <Card title="Formal Review Split Analysis" icon="📚" subtitle="Separated results by Attended Formal Review = Yes / No">
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"10px" }}>
                        {(reviewAnalysis.items ?? []).map((item, idx) => (
                          <div key={idx} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px" }}>
                            <p style={{ margin:"0 0 3px", fontSize:"11px", color: item.review_program === "Yes" ? C.pass : C.amber, fontWeight:700 }}>
                              {item.review_program === "Yes" ? "Attended Review" : "No Formal Review"}
                            </p>
                            <p style={{ margin:"0 0 2px", fontSize:"20px", color:C.text, fontWeight:800 }}>{item.pass_rate?.toFixed(1)}%</p>
                            <p style={{ margin:0, fontSize:"11px", color:C.textSoft }}>{item.pass_count}/{item.total} predicted pass{item.human_like_rate != null ? ` · Human-like: ${item.human_like_rate.toFixed(1)}%` : ""}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Timing Analysis */}
                {timingAnalysis?.summary && (
                  <div style={{ marginBottom:"14px" }}>
                    <Card title="Predictor Timer Analysis" icon="⏱️" subtitle="Response timing captured from Predictor Form">
                      <div className="kpi-grid" style={{ marginBottom:"12px" }}>
                        <KPI label="Timed Questions" value={timingAnalysis.summary.timed_questions ?? 0} color={C.blue} />
                        <KPI label="Human-like" value={timingAnalysis.summary.human_like_rate != null ? `${timingAnalysis.summary.human_like_rate.toFixed(1)}%` : "—"} color={C.pass} sub={`${timingAnalysis.summary.human_like_count ?? 0} answers`} />
                        <KPI label="Too Fast" value={timingAnalysis.summary.too_fast_rate != null ? `${timingAnalysis.summary.too_fast_rate.toFixed(1)}%` : "—"} color={C.amber} sub={`${timingAnalysis.summary.too_fast_count ?? 0} answers`} />
                        <KPI label="Too Slow" value={timingAnalysis.summary.too_slow_rate != null ? `${timingAnalysis.summary.too_slow_rate.toFixed(1)}%` : "—"} color={C.orange} sub={`${timingAnalysis.summary.too_slow_count ?? 0} answers`} />
                      </div>
                      {(timingAnalysis.sections ?? []).length > 0 && (
                        <div style={{ marginBottom:"12px", overflowX:"auto" }}>
                          <p style={{ margin:"0 0 8px", fontSize:"10px", fontWeight:700, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.06em" }}>Timer by Section</p>
                          <table className="att-table">
                            <thead><tr><th>Section</th><th>Timed Questions</th><th>Avg Duration (sec)</th><th>Human-like Rate</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.sections ?? []).map((s, i) => (
                                <tr key={i}>
                                  <td>{s.section}</td><td>{s.timed_questions ?? 0}</td>
                                  <td>{s.avg_duration_sec != null ? s.avg_duration_sec.toFixed(1) : "—"}</td>
                                  <td style={{ color: (s.human_like_rate ?? 0) >= 70 ? C.pass : C.amber, fontWeight:700 }}>
                                    {s.human_like_rate != null ? `${s.human_like_rate.toFixed(1)}%` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {(timingAnalysis.suspicious_attempts ?? []).length > 0 && (
                        <div style={{ overflowX:"auto" }}>
                          <p style={{ margin:"0 0 8px", fontSize:"10px", fontWeight:700, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.06em" }}>Potentially Too-fast Attempts</p>
                          <table className="att-table">
                            <thead><tr><th>Name</th><th>Date</th><th>Too Fast Rate</th><th>Timed Qs</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.suspicious_attempts ?? []).map((a, i) => (
                                <tr key={i} style={{ cursor:"pointer" }} onClick={() => openTimingModal(a)} title="Click to view per-question timings">
                                  <td style={{ color:C.text, fontWeight:700 }}>{a.name || "Unknown"}</td>
                                  <td>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}</td>
                                  <td style={{ color:C.fail, fontWeight:700 }}>{a.too_fast_rate?.toFixed(1)}%</td>
                                  <td>{a.timed_questions ?? 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Monthly summary */}
                <div style={{ marginBottom:"14px" }}>
                  <Card title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year">
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                      <label style={{ fontSize:"11px", color:C.textSoft }}>Year:</label>
                      <select className="filter-input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {Array.from({ length:5 }, (_, i) => new Date().getFullYear() - i).map(yr => <option key={yr} value={yr}>{yr}</option>)}
                      </select>
                    </div>
                    {(monthly ?? []).length > 0 ? (
                      <div style={{ width:"100%", height:200 }}>
                        <ResponsiveContainer>
                          <BarChart data={(monthly ?? []).map(m=>({month:MONTH_NAMES[m.month-1],Pass:m.pass_count,Fail:m.fail_count}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" {...axis} tick={{ fontSize:10, fill:C.textSoft }} />
                            <YAxis {...axis} />
                            <Tooltip content={<ChartTip />} />
                            <Legend formatter={v => <span style={{ fontSize:"12px", color:C.textMid, fontWeight:600 }}>{v}</span>} />
                            <Bar dataKey="Pass" stackId="a" fill={C.pass} />
                            <Bar dataKey="Fail" stackId="a" fill={C.fail} radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : <p style={{ fontSize:"12px", color:C.textMute }}>No data for {selectedYear}. Students need to submit predictions first.</p>}
                  </Card>
                </div>

                {/* Attempts table */}
                <Card title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"12px", flexWrap:"wrap" }}>
                    {[["Year","year","90px","e.g. 2025","number"],["Month","month","70px","1–12","number"]].map(([lbl,key,w,ph,type]) => (
                      <div key={key} style={{ display:"flex", gap:"5px", alignItems:"center" }}>
                        <label style={{ fontSize:"11px", color:C.textSoft }}>{lbl}:</label>
                        <input className="filter-input" type={type} placeholder={ph} value={attFilter[key]}
                          onChange={e => { setAttFilter(f => ({...f,[key]:e.target.value})); setAttPage(1); }}
                          style={{ width:w }} />
                      </div>
                    ))}
                    <button onClick={() => { setAttFilter({year:"",month:""}); setAttPage(1); }}
                      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"7px", padding:"5px 12px", color:C.textSoft, fontSize:"11px", cursor:"pointer" }}>
                      Clear
                    </button>
                    {attempts && <span style={{ fontSize:"11px", color:C.textMute, marginLeft:"auto" }}>{attempts.total} total · Page {attPage}</span>}
                  </div>
                  {attempts && (attempts.items ?? []).length > 0 ? (
                    <>
                      <div style={{ overflowX:"auto" }}>
                        <table className="att-table">
                          <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>User ID</th></tr></thead>
                          <tbody>
                            {(attempts.items ?? []).map((item, i) => (
                              <tr key={i}>
                                <td style={{ color:C.textSoft }}>{new Date(item.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                                <td><span style={{ fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:"999px", background: item.label==="PASSED"?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)", color: item.label==="PASSED"?C.pass:C.fail, border:`1px solid ${item.label==="PASSED"?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}` }}>{item.label}</span></td>
                                <td style={{ fontWeight:700, color: item.probability_pass >= 0.7 ? C.pass : item.probability_pass >= 0.5 ? C.amber : C.fail }}>{(item.probability_pass*100).toFixed(1)}%</td>
                                <td style={{ color: item.predicted_rating_a >= 70 ? C.pass : item.predicted_rating_a >= 60 ? C.amber : C.fail }}>{item.predicted_rating_a?.toFixed(1) ?? "—"}</td>
                                <td style={{ color:C.textMute, fontSize:"10px" }}>{item.user_id ? item.user_id.slice(0,8)+"…" : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display:"flex", gap:"8px", marginTop:"12px", justifyContent:"flex-end", alignItems:"center" }}>
                        <button onClick={() => setAttPage(p => Math.max(1,p-1))} disabled={attPage===1}
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"7px", padding:"5px 12px", color: attPage===1?C.textMute:C.textSoft, fontSize:"11px", cursor: attPage===1?"not-allowed":"pointer" }}>← Prev</button>
                        <span style={{ fontSize:"11px", color:C.textMute }}>{attPage} / {Math.ceil(((attempts.total)||1)/20)}</span>
                        <button onClick={() => setAttPage(p => p+1)} disabled={attPage >= Math.ceil(((attempts.total)||1)/20)}
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"7px", padding:"5px 12px", color: attPage >= Math.ceil(((attempts.total)||1)/20)?C.textMute:C.textSoft, fontSize:"11px", cursor: attPage >= Math.ceil(((attempts.total)||1)/20)?"not-allowed":"pointer" }}>Next →</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding:"28px", textAlign:"center" }}>
                      <p style={{ fontSize:"13px", color:C.textSoft }}>No prediction attempts found.</p>
                      <p style={{ fontSize:"11px", color:C.textMute, marginTop:"4px" }}>Students need to log in and submit predictions first.</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── TIMING MODAL ── */}
      {timingModalOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(2,6,23,0.8)", backdropFilter:"blur(4px)", zIndex:80, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
          onClick={() => setTimingModalOpen(false)}>
          <div style={{ width:"min(980px,96vw)", maxHeight:"85vh", overflow:"auto", background:"#0b1220", border:"1px solid rgba(148,163,184,0.2)", borderRadius:"14px", padding:"16px", boxShadow:C.shadowMd }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
              <div>
                <p style={{ margin:0, fontSize:"16px", fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif" }}>Attempt Timer Drill-down</p>
                <p style={{ margin:"2px 0 0", fontSize:"12px", color:C.textSoft }}>{selectedTimingAttempt?.name || "Unknown"} · {selectedTimingAttempt?.attempt_id?.slice(0,8)}</p>
              </div>
              <button onClick={() => setTimingModalOpen(false)} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 12px", color:C.textMid, cursor:"pointer" }}>Close</button>
            </div>
            {selectedTimingLoading ? <p style={{ color:C.textSoft }}>Loading timing details…</p>
              : selectedTimingData?.error ? <p style={{ color:"#fca5a5" }}>{selectedTimingData.error}</p>
              : (
              <div style={{ overflowX:"auto" }}>
                <table className="att-table">
                  <thead><tr><th>Question</th><th>Section</th><th>Order</th><th>Duration (sec)</th><th>Expected Range</th><th>Human-like?</th></tr></thead>
                  <tbody>
                    {(selectedTimingData?.items ?? []).map((t, i) => (
                      <tr key={i}>
                        <td>{t.question_key}</td><td>{t.step_id || "—"}</td><td>{t.question_index ?? "—"}</td><td>{t.duration_sec ?? "—"}</td>
                        <td>{t.expected_min_sec != null ? `${t.expected_min_sec}–${t.expected_max_sec}` : "—"}</td>
                        <td style={{ color: t.is_human_like ? C.pass : C.fail, fontWeight:700 }}>{t.is_human_like ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}