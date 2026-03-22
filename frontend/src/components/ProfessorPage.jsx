import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ─── Import ExamineeDetailPanel from same folder ───────────────────────────
// import ExamineeDetailPanel from "./ExamineeDetailPanel";
// import API_BASE_URL from "../apiBase";
const API_BASE_URL = "/api"; // placeholder

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#f8fafc",
  surface:  "#ffffff",
  surfaceAlt:"#f1f5f9",
  border:   "#e2e8f0",
  borderAlt:"#cbd5e1",
  text:     "#0f172a",
  textMid:  "#334155",
  textSoft: "#64748b",
  textMute: "#94a3b8",
  pass:     "#059669",
  passLight:"#d1fae5",
  fail:     "#dc2626",
  failLight:"#fee2e2",
  blue:     "#2563eb",
  blueLight:"#dbeafe",
  indigo:   "#4f46e5",
  indigoLight:"#e0e7ff",
  amber:    "#d97706",
  amberLight:"#fef3c7",
  teal:     "#0d9488",
  tealLight:"#ccfbf1",
  pink:     "#db2777",
  pinkLight:"#fce7f3",
  orange:   "#ea580c",
  orangeLight:"#ffedd5",
  shadow:   "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function pct(v) { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }

// ─── Mock data (same as original) ────────────────────────────────────────────
function buildMockData() {
  return {
    overview: {
      total_students: 87, total_passers: 61, total_failers: 26,
      overall_pass_rate: 70.1, avg_gwa_passers: 1.82, avg_gwa_failers: 2.41,
      avg_rating_passers: 78.4, avg_rating_failers: 63.1, passing_score: 70,
    },
    pass_rate_by_year: [
      { label: "2021", pass_rate: 62.5, total: 24, passers: 15, failers: 9 },
      { label: "2022", pass_rate: 68.0, total: 25, passers: 17, failers: 8 },
      { label: "2023", pass_rate: 71.4, total: 28, passers: 20, failers: 8 },
      { label: "2024", pass_rate: 80.0, total: 10, passers: 8,  failers: 2 },
    ],
    pass_rate_by_strand: [
      { label: "STEM",  pass_rate: 78.3, total: 46 },
      { label: "GAS",   pass_rate: 55.6, total: 18 },
      { label: "TVL",   pass_rate: 50.0, total: 8  },
      { label: "HUMSS", pass_rate: 60.0, total: 10 },
      { label: "ABM",   pass_rate: 40.0, total: 5  },
    ],
    pass_rate_by_review: [
      { label: "Attended Review",  pass_rate: 79.5, total: 44 },
      { label: "No Formal Review", pass_rate: 58.1, total: 43 },
    ],
    pass_rate_by_duration: [
      { label: "No Review",  pass_rate: 58.1, total: 43 },
      { label: "~3 Months", pass_rate: 72.2, total: 18 },
      { label: "~6 Months", pass_rate: 84.6, total: 26 },
    ],
    gwa_comparison: { passers: 1.82, failers: 2.41, passers_std: 0.31, failers_std: 0.44 },
    feature_importance: [
      { label: "EE Score",                              value: 0.142 },
      { label: "MATH Score",                            value: 0.131 },
      { label: "ESAS Score",                            value: 0.118 },
      { label: "GWA",                                   value: 0.094 },
      { label: "PS11 – Confident: Board Exam Problems", value: 0.041 },
      { label: "KN8 – Subjects Covered Board Topics",   value: 0.038 },
      { label: "MT4 – Follows Study Schedule",          value: 0.034 },
      { label: "KN1 – Strong Math Foundation",          value: 0.031 },
      { label: "PS5 – Solves Within Time Limit",        value: 0.028 },
      { label: "Review Duration",                       value: 0.026 },
    ],
    section_scores: [
      { label: "Knowledge",     pass: 72.4, fail: 54.1 },
      { label: "Prob. Solving", pass: 70.8, fail: 51.3 },
      { label: "Motivation",    pass: 80.2, fail: 66.9 },
      { label: "Mental Health", pass: 74.5, fail: 63.2 },
      { label: "Support",       pass: 76.1, fail: 68.4 },
      { label: "Curriculum",    pass: 69.3, fail: 60.8 },
      { label: "Faculty",       pass: 73.7, fail: 64.5 },
      { label: "Dept Review",   pass: 65.4, fail: 55.2 },
      { label: "Facilities",    pass: 62.8, fail: 57.1 },
      { label: "Inst. Culture", pass: 68.9, fail: 60.3 },
    ],
    weakest_questions: [
      { key: "FA2", label: "Labs equipped for practical learning",         avg: 2.71, section: "Facilities"  },
      { key: "DR3", label: "Mock exams reflected actual board difficulty", avg: 2.68, section: "Dept Review" },
      { key: "FA1", label: "Library had adequate review resources",        avg: 2.64, section: "Facilities"  },
      { key: "KN8", label: "Subjects covered board exam topics",           avg: 2.62, section: "Knowledge"   },
      { key: "DR1", label: "Dept conducted review programs",               avg: 2.58, section: "Dept Review" },
      { key: "CU3", label: "Syllabi aligned with board exam",              avg: 2.55, section: "Curriculum"  },
      { key: "FA4", label: "Study areas accessible for reviewers",         avg: 2.54, section: "Facilities"  },
      { key: "DR5", label: "Review conducted at right time before exam",   avg: 2.51, section: "Dept Review" },
      { key: "CU1", label: "Curriculum aligned with EE licensure exam",    avg: 2.49, section: "Curriculum"  },
      { key: "IC4", label: "Institution provides career guidance",         avg: 2.47, section: "Institution" },
    ],
    subject_trends_by_year: [
      { year: 2021, EE_avg: 62.1, MATH_avg: 70.3, ESAS_avg: 65.4 },
      { year: 2022, EE_avg: 65.8, MATH_avg: 72.1, ESAS_avg: 67.2, EE_delta: 3.7, MATH_delta: 1.8, ESAS_delta: 1.8 },
      { year: 2023, EE_avg: 68.4, MATH_avg: 74.9, ESAS_avg: 70.1, EE_delta: 2.6, MATH_delta: 2.8, ESAS_delta: 2.9 },
      { year: 2024, EE_avg: 72.0, MATH_avg: 78.5, ESAS_avg: 73.8, EE_delta: 3.6, MATH_delta: 3.6, ESAS_delta: 3.7 },
    ],
  };
}

// ─── Reusable UI primitives ──────────────────────────────────────────────────

function Card({ title, icon, subtitle, children, accent = T.blue, fullWidth = false, padding = "24px", className = "" }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      padding,
      boxShadow: T.shadow,
      gridColumn: fullWidth ? "1 / -1" : undefined,
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowMd}
      onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadow}
    >
      {(title || icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: subtitle ? "6px" : "20px" }}>
          {icon && (
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: `${accent}15`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0,
            }}>{icon}</div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}>{title}</h3>
          </div>
        </div>
      )}
      {subtitle && <p style={{ margin: "0 0 18px", fontSize: "12px", color: T.textSoft, lineHeight: 1.5 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, color = T.blue, delta, icon, trend }) {
  const isUp = delta > 0;
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      padding: "20px",
      boxShadow: T.shadow,
      borderTop: `3px solid ${color}`,
      transition: "all 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow;   e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
        {icon && <span style={{ fontSize: "18px", opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ margin: "0 0 4px", fontSize: "30px", fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {sub && <p style={{ margin: 0, fontSize: "12px", color: T.textMute }}>{sub}</p>}
        {delta !== undefined && (
          <span style={{
            fontSize: "11px", fontWeight: 700,
            color: delta === 0 ? T.textMute : isUp ? T.pass : T.fail,
            background: delta === 0 ? T.surfaceAlt : isUp ? T.passLight : T.failLight,
            padding: "2px 7px", borderRadius: "999px",
          }}>
            {delta === 0 ? "—" : isUp ? `▲ +${delta}` : `▼ ${delta}`}
          </span>
        )}
      </div>
    </div>
  );
}

function InsightBox({ insights = [] }) {
  if (!insights.length) return null;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.blueLight}, ${T.indigoLight})`,
      border: `1px solid ${T.blue}30`,
      borderRadius: "14px",
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>✨</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: T.blue, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Insights</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>{ins.icon || "💡"}</span>
            <p style={{ margin: 0, fontSize: "13px", color: T.textMid, lineHeight: 1.6 }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CHART_COLORS = [T.blue, T.pass, T.indigo, T.teal, T.pink, T.orange, T.amber];

const CustomTooltipStyle = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "10px",
  boxShadow: T.shadowMd,
  padding: "10px 14px",
  fontSize: "12px",
  color: T.text,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CustomTooltipStyle}>
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: T.textMid }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || T.text }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span> {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange }) {
  const select = (key, val) => onChange({ ...filters, [key]: val });
  const selectStyle = {
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px",
    padding: "8px 12px", fontSize: "13px", color: T.text, outline: "none",
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: T.shadow,
  };
  const toggleStyle = (active, color) => ({
    padding: "7px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: active ? 700 : 500,
    cursor: "pointer", border: `1px solid ${active ? color : T.border}`,
    background: active ? `${color}15` : T.surface,
    color: active ? color : T.textSoft,
    transition: "all 0.15s",
  });
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: "14px", padding: "14px 18px",
      display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
      boxShadow: T.shadow, marginBottom: "20px",
    }}>
      <span style={{ fontSize: "12px", fontWeight: 700, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em" }}>Filters</span>
      <select style={selectStyle} value={filters.year} onChange={e => select("year", e.target.value)}>
        <option value="">All Years</option>
        {["2021","2022","2023","2024"].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select style={selectStyle} value={filters.month} onChange={e => select("month", e.target.value)}>
        <option value="">All Months</option>
        {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
      </select>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: T.textSoft, fontWeight: 600, marginRight: "4px" }}>Review:</span>
        {[["all", "All"], ["yes", "Attended"], ["no", "Not Attended"]].map(([v, l]) => (
          <button key={v} style={toggleStyle(filters.review === v, T.blue)} onClick={() => select("review", v)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        <span style={{ fontSize: "12px", color: T.textSoft, fontWeight: 600, marginRight: "4px" }}>Subject:</span>
        {[["all", "All"], ["EE", "EE"], ["MATH", "Math"], ["ESAS", "ESAS"]].map(([v, l]) => (
          <button key={v} style={toggleStyle(filters.subject === v, T.indigo)} onClick={() => select("subject", v)}>{l}</button>
        ))}
      </div>
      <button
        onClick={() => onChange({ year: "", month: "", review: "all", subject: "all" })}
        style={{ marginLeft: "auto", fontSize: "12px", color: T.textSoft, background: "transparent", border: `1px solid ${T.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
      >✕ Clear</button>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
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
  const [filters, setFilters] = useState({ year: "", month: "", review: "all", subject: "all" });

  // Phase 4 state (kept as-is from original)
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
  const [, setReviewAnalysis] = useState(null);
  const [, setTimingAnalysis] = useState(null);
  const [timingModalOpen, setTimingModalOpen] = useState(false);
  const [selectedTimingAttempt, setSelectedTimingAttempt] = useState(null);
  const [selectedTimingData, setSelectedTimingData] = useState(null);
  const [selectedTimingLoading, setSelectedTimingLoading] = useState(false);
  const [test2025, setTest2025] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [, setTest2025Run] = useState(null);
  const [, setTest2025RunLoading] = useState(false);

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

  // eslint-disable-next-line no-unused-vars
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
      const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      a.href = url; a.download = `performance_report_${selectedYear}_${ts}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert("Could not download performance report."); }
    finally { setReportLoading(false); }
  }, [selectedYear]);

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
  }, [attPage, attFilter, selectedYear, activeTab, fetchAdminFromDb]);

  // ─── Derived / filtered data (useMemo to satisfy react-hooks/exhaustive-deps) ──
  const ov = useMemo(() => data?.overview ?? {}, [data]);

  const passByYear     = useMemo(() => data?.pass_rate_by_year     ?? [], [data]);
  const passByStrand   = useMemo(() => data?.pass_rate_by_strand   ?? [], [data]);
  const passByReview   = useMemo(() => data?.pass_rate_by_review   ?? [], [data]);
  const passByDuration = useMemo(() => data?.pass_rate_by_duration ?? [], [data]);
  const featureImp     = useMemo(() => data?.feature_importance    ?? [], [data]);
  const sectionScores  = useMemo(() => data?.section_scores        ?? [], [data]);
  const weakestQ       = useMemo(() => data?.weakest_questions     ?? [], [data]);
  const subjectTrends  = useMemo(() => data?.subject_trends_by_year ?? [], [data]);

  // Apply review / year filter
  const filteredPassByYear = useMemo(
    () => filters.year ? passByYear.filter(d => String(d.label) === filters.year) : passByYear,
    [filters.year, passByYear]
  );

  const filteredPassByReview = useMemo(() => {
    if (filters.review === "yes") return passByReview.filter(d => d.label.toLowerCase().includes("attended"));
    if (filters.review === "no")  return passByReview.filter(d => d.label.toLowerCase().includes("no formal"));
    return passByReview;
  }, [filters.review, passByReview]);

  // Subject filter
  const filteredSubjectTrends = useMemo(() => {
    const keys = filters.subject === "all"
      ? ["EE_avg", "MATH_avg", "ESAS_avg"]
      : [`${filters.subject}_avg`];
    return subjectTrends.map(row => {
      const base = { year: String(row.year) };
      keys.forEach(k => { base[k.replace("_avg", "")] = row[k]; });
      return base;
    });
  }, [filters.subject, subjectTrends]);

  // Auto AI insights
  const insights = useMemo(() => {
    const list = [];
    if (passByYear.length >= 2) {
      const oldest = passByYear[0];
      const newest = passByYear[passByYear.length - 1];
      const diff = newest.pass_rate - oldest.pass_rate;
      list.push({
        icon: diff > 0 ? "📈" : "📉",
        text: `Passing rate ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff).toFixed(1)}% from ${oldest.label} to ${newest.label}.`,
      });
    }
    if (subjectTrends.length >= 2) {
      const newest = subjectTrends[subjectTrends.length - 1];
      const candidates = [
        { id: "EE",   v: newest.EE_avg },
        { id: "MATH", v: newest.MATH_avg },
        { id: "ESAS", v: newest.ESAS_avg },
      ].sort((a, b) => a.v - b.v);
      list.push({ icon: "⚠️", text: `${candidates[0].id} has the lowest average score (${candidates[0].v}) — prioritize this subject.` });
    }
    if (passByReview.length >= 2) {
      const diff = passByReview[0].pass_rate - passByReview[1].pass_rate;
      list.push({ icon: "📚", text: `Students who attended formal review outperformed non-reviewers by ${Math.abs(diff).toFixed(1)}%.` });
    }
    if (ov.overall_pass_rate < 70)
      list.push({ icon: "🚨", text: `Overall pass rate is below the 70% threshold — immediate intervention recommended.` });
    else
      list.push({ icon: "✅", text: `Overall pass rate of ${pct(ov.overall_pass_rate)} meets the 70% passing benchmark.` });
    return list;
  }, [passByYear, subjectTrends, passByReview, ov]);

  // Scatter data — stable ref (no Math.random on every render)
  const scatterData = useMemo(
    () => passByYear.map((d, i) => ({
      actual: d.pass_rate,
      predicted: d.pass_rate + (i % 2 === 0 ? 3.2 : -2.8),
      year: d.label,
    })),
    [passByYear]
  );

  // Distribution for histogram
  const histogramData = [
    { range: "50–55", count: 3 }, { range: "55–60", count: 5 },
    { range: "60–65", count: 8 }, { range: "65–70", count: 11 },
    { range: "70–75", count: 14 }, { range: "75–80", count: 18 },
    { range: "80–85", count: 12 }, { range: "85–90", count: 8 },
    { range: "90–95", count: 5 }, { range: "95–100", count: 3 },
  ];

  const radarData = useMemo(
    () => sectionScores.slice(0, 7).map(s => ({ section: s.label, Passers: s.pass, Failers: s.fail })),
    [sectionScores]
  );

  const donutData = useMemo(() => [
    { name: "Passers", value: ov.total_passers || 61 },
    { name: "Failers", value: ov.total_failers || 26 },
  ], [ov]);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: T.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .dash-grid   { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .kpi-grid    { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:12px; margin-bottom:20px; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${T.borderAlt}; border-radius:99px; }
        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .tab-btn:hover { color:${T.blue} !important; }
        .filter-input { background:${T.surface}; border:1px solid ${T.border}; border-radius:8px; padding:7px 10px; color:${T.text}; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; box-shadow:${T.shadow}; }
        .filter-input:focus { border-color:${T.blue}; }
        .att-table { width:100%; border-collapse:collapse; font-size:12px; }
        .att-table th { padding:10px 12px; border-bottom:2px solid ${T.border}; text-align:left; color:${T.textSoft}; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; font-size:11px; }
        .att-table td { padding:10px 12px; border-bottom:1px solid ${T.border}; color:${T.textMid}; }
        .att-table tr:hover td { background:${T.surfaceAlt}; }
        @media(max-width:640px){ .dash-grid{grid-template-columns:1fr!important} .kpi-grid{grid-template-columns:repeat(2,1fr)!important} }
      `}</style>

      {/* ══ TOP NAVBAR ══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "68px",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {["/slsulogo.png", "/slsulogo1.png", "/slsulogo2.png"].map((src, idx) => (
              <img key={src} src={src} alt={`Logo ${idx + 1}`} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            ))}
          </div>
          <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: "14px" }}>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: T.text, letterSpacing: "-0.01em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Insights Dashboard
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: T.textSoft, letterSpacing: "0.04em" }}>Faculty Portal · SLSU IIEE</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={fetchAnalytics} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: "10px", padding: "8px 16px", color: T.textSoft,
            fontSize: "13px", cursor: "pointer", fontWeight: 500,
            boxShadow: T.shadow, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.blue; e.currentTarget.style.borderColor = T.blue; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textSoft; e.currentTarget.style.borderColor = T.border; }}
          >↻ Refresh</button>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: `${T.indigo}10`, border: `1px solid ${T.indigo}25`,
            borderRadius: "999px", padding: "7px 14px",
          }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: `${T.indigo}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🔬</div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: T.indigo }}>Faculty</span>
          </div>
          <button onClick={onLogout} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: "10px", padding: "8px 18px", color: T.textSoft,
            fontSize: "13px", cursor: "pointer", fontWeight: 500,
            boxShadow: T.shadow, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.fail; e.currentTarget.style.borderColor = `${T.fail}40`; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textSoft; e.currentTarget.style.borderColor = T.border; }}
          >Sign Out</button>
        </div>
      </nav>

      {/* ══ TAB BAR ══ */}
      <div style={{
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 20px", display: "flex", gap: "0", overflowX: "auto",
      }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding: "14px 18px", fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? T.blue : T.textSoft,
            borderBottom: activeTab === tab.id ? `2px solid ${T.blue}` : "2px solid transparent",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0", flexDirection: "column", gap: "16px" }}>
            <svg style={{ animation: "spin 0.8s linear infinite", width: "36px", height: "36px", color: T.blue }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".2"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: "14px", color: T.textSoft }}>Loading analytics…</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === "overview" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", color: T.text }}>Institutional Overview</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Aggregate statistics across all EE board exam takers. First-attempt outcomes only.</p>
                </div>

                <FilterPanel filters={filters} onChange={setFilters} />

                {/* KPI Row */}
                <div className="kpi-grid">
                  <MetricCard label="Total Students"    value={ov.total_students}         color={T.blue}   icon="👥" />
                  <MetricCard label="Total Passers"     value={ov.total_passers}           color={T.pass}   icon="✅" />
                  <MetricCard label="Total Failers"     value={ov.total_failers}           color={T.fail}   icon="❌" />
                  <MetricCard label="Pass Rate"         value={pct(ov.overall_pass_rate)}  color={ov.overall_pass_rate >= 70 ? T.pass : T.amber} icon="🎯" sub="Target: 70%" />
                  <MetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}    color={T.pass}   icon="📚" sub="1.0 = Highest" />
                  <MetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}    color={T.fail}   icon="📚" sub="1.0 = Highest" />
                </div>

                <div className="dash-grid" style={{ marginBottom: "16px" }}>
                  {/* Donut Chart */}
                  <Card title="Pass / Fail Distribution" icon="🥧" subtitle="Overall proportion of board exam outcomes">
                    <div style={{ width: "100%", height: 220 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                            <Cell fill={T.pass} />
                            <Cell fill={T.fail} />
                          </Pie>
                          <Tooltip contentStyle={CustomTooltipStyle} />
                          <Legend formatter={(val) => <span style={{ fontSize: "13px", color: T.textMid, fontWeight: 600 }}>{val}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      {[["Passers", ov.total_passers, T.pass, T.passLight], ["Failers", ov.total_failers, T.fail, T.failLight]].map(([label, val, color, bg]) => (
                        <div key={label} style={{ flex: 1, background: bg, borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                          <p style={{ margin: "0 0 2px", fontSize: "11px", color, fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
                          <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans'" }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Pass Rate by Year - Area chart */}
                  <Card title="Pass Rate Trend by Year" icon="📅" subtitle="Year-over-year pass rate progression">
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <AreaChart data={filteredPassByYear.map(d => ({ year: d.label, rate: d.pass_rate, total: d.total }))} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                          <defs>
                            <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={T.pass} stopOpacity={0.15} />
                              <stop offset="95%" stopColor={T.pass} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                          <XAxis dataKey="year" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[40, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "70% target", position: "right", fontSize: 10, fill: T.amber }} />
                          <Area type="monotone" dataKey="rate" name="Pass Rate %" stroke={T.pass} strokeWidth={2.5} fill="url(#passGrad)" dot={{ fill: T.pass, r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* GWA Comparison */}
                  <Card title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA = better (Philippine 1.0 scale)">
                    <div style={{ width: "100%", height: 180 }}>
                      <ResponsiveContainer>
                        <BarChart data={[{ name: "Passers", GWA: ov.avg_gwa_passers }, { name: "Failers", GWA: ov.avg_gwa_failers }]} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 13, fill: T.textMid, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 3]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="GWA" radius={[8, 8, 0, 0]}>
                            <Cell fill={T.pass} />
                            <Cell fill={T.fail} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ background: T.blueLight, borderRadius: "10px", padding: "10px 14px", marginTop: "12px", fontSize: "13px", color: T.textMid }}>
                      💡 Passers had a GWA <strong style={{ color: T.text }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} pts better</strong> than failers.
                    </div>
                  </Card>

                  {/* Review Attendance */}
                  <Card title="Review Attendance Impact" icon="📖" subtitle="Pass rate by formal review attendance">
                    <div style={{ width: "100%", height: 180 }}>
                      <ResponsiveContainer>
                        <BarChart data={filteredPassByReview.map(d => ({ name: d.label, rate: d.pass_rate, n: d.total }))} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textMid }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" strokeWidth={1.5} />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[8, 8, 0, 0]} fill={T.blue} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Review Duration */}
                  <Card title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review periods correlate with higher pass rates">
                    <div style={{ width: "100%", height: 180 }}>
                      <ResponsiveContainer>
                        <BarChart data={passByDuration.map(d => ({ name: d.label, rate: d.pass_rate, n: d.total }))} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textMid }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" strokeWidth={1.5} />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[8, 8, 0, 0]}>
                            {passByDuration.map((d, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Model Performance */}
                  <Card title="Model Performance" icon="📈" subtitle="Classifier and regressor metrics (Chapter 4)">
                    {modelInfo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { label: "Classification", items: [
                            { k: "Accuracy", v: modelInfo.classification.accuracy, pct: true },
                            { k: "F1-Score",  v: modelInfo.classification.f1,       pct: true },
                            { k: "CV Acc",    v: modelInfo.classification.cv_acc,   pct: true },
                          ]},
                          { label: "Regression A", items: [
                            { k: "MAE",  v: modelInfo.regression_a.mae  },
                            { k: "R²",   v: modelInfo.regression_a.r2   },
                            { k: "RMSE", v: modelInfo.regression_a.rmse },
                          ]},
                          { label: "Regression B", items: [
                            { k: "MAE",  v: modelInfo.regression_b.mae  },
                            { k: "R²",   v: modelInfo.regression_b.r2   },
                            { k: "RMSE", v: modelInfo.regression_b.rmse },
                          ]},
                        ].map((section, si) => (
                          <div key={si}>
                            <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em" }}>{section.label}</p>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {section.items.map((item, ii) => (
                                <div key={ii} style={{ background: T.surfaceAlt, borderRadius: "8px", padding: "8px 12px", flex: "1 1 auto", minWidth: "70px" }}>
                                  <p style={{ margin: "0 0 2px", fontSize: "10px", color: T.textSoft, fontWeight: 600 }}>{item.k}</p>
                                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: T.blue }}>
                                    {item.pct ? `${(item.v * 100).toFixed(1)}%` : item.v?.toFixed(3)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", color: T.textMute }}>Loading model metrics…</p>
                    )}
                  </Card>
                </div>

                {/* AI Insights */}
                <InsightBox insights={insights} />
              </div>
            )}

            {/* ══ PERFORMANCE TAB ══ */}
            {activeTab === "performance" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Performance Breakdown</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Pass rates by strand, survey section scores, and multi-year subject score analysis.</p>
                </div>

                <FilterPanel filters={filters} onChange={setFilters} />

                <div className="dash-grid">
                  {/* SHS Strand Breakdown */}
                  <Card title="Pass Rate by SHS Strand" icon="🎓" subtitle="Which track best prepares students for the EE board exam?">
                    <div style={{ width: "100%", height: 220 }}>
                      <ResponsiveContainer>
                        <BarChart data={passByStrand.map(d => ({ strand: d.label, rate: d.pass_rate, n: d.total }))} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <YAxis type="category" dataKey="strand" tick={{ fontSize: 13, fill: T.textMid, fontWeight: 600 }} axisLine={false} tickLine={false} width={50} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine x={70} stroke={T.amber} strokeDasharray="4 3" />
                          <Bar dataKey="rate" name="Pass Rate %" radius={[0, 6, 6, 0]}>
                            {passByStrand.map((d, i) => <Cell key={i} fill={d.pass_rate >= 70 ? T.pass : d.pass_rate >= 55 ? T.amber : T.fail} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: "14px", background: T.blueLight, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: T.textMid }}>
                      💡 STEM graduates led with <strong style={{ color: T.text }}>{pct(passByStrand[0]?.pass_rate)}</strong> pass rate — consistent with its math-heavy curriculum.
                    </div>
                  </Card>

                  {/* Subject Line Trend */}
                  <Card title="Subject Score Trends" icon="📐" subtitle="EE, MATH & ESAS average scores per cohort year" fullWidth>
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer>
                        <LineChart data={filteredSubjectTrends} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                          <XAxis dataKey="year" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[55, 85]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend formatter={v => <span style={{ fontSize: "12px", color: T.textMid, fontWeight: 600 }}>{v}</span>} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "Passing", position: "right", fontSize: 10, fill: T.amber }} />
                          {(filters.subject === "all" || filters.subject === "EE")   && <Line type="monotone" dataKey="EE"   name="EE"   stroke={T.blue}   strokeWidth={2.5} dot={{ fill: T.blue,   r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                          {(filters.subject === "all" || filters.subject === "MATH") && <Line type="monotone" dataKey="MATH" name="MATH" stroke={T.indigo} strokeWidth={2.5} dot={{ fill: T.indigo, r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                          {(filters.subject === "all" || filters.subject === "ESAS") && <Line type="monotone" dataKey="ESAS" name="ESAS" stroke={T.teal}   strokeWidth={2.5} dot={{ fill: T.teal,   r: 4, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "14px" }}>
                      {["EE","MATH","ESAS"].map((s, i) => {
                        const last  = subjectTrends[subjectTrends.length - 1];
                        const first = subjectTrends[0];
                        const v     = last?.[`${s}_avg`];
                        const delta = v - first?.[`${s}_avg`];
                        const col   = [T.blue, T.indigo, T.teal][i];
                        return (
                          <div key={s} style={{ background: `${col}08`, border: `1px solid ${col}20`, borderRadius: "10px", padding: "12px" }}>
                            <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: col, textTransform: "uppercase" }}>{s} (Latest)</p>
                            <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: 800, color: col }}>{v}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: delta >= 0 ? T.pass : T.fail, fontWeight: 600 }}>
                              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} pts overall
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Radar: Survey Section Scores */}
                  <Card title="Survey Sections: Passers vs Failers" icon="🕸️" subtitle="Radar view of section performance split by outcome" fullWidth>
                    <div style={{ width: "100%", height: 280 }}>
                      <ResponsiveContainer>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke={T.border} />
                          <PolarAngleAxis dataKey="section" tick={{ fontSize: 12, fill: T.textMid, fontWeight: 600 }} />
                          <PolarRadiusAxis tick={{ fontSize: 10, fill: T.textSoft }} domain={[40, 90]} tickCount={4} />
                          <Radar name="Passers" dataKey="Passers" stroke={T.pass} fill={T.pass} fillOpacity={0.12} strokeWidth={2} />
                          <Radar name="Failers" dataKey="Failers" stroke={T.fail} fill={T.fail} fillOpacity={0.10} strokeWidth={2} />
                          <Legend formatter={v => <span style={{ fontSize: "12px", color: T.textMid, fontWeight: 600 }}>{v}</span>} />
                          <Tooltip contentStyle={CustomTooltipStyle} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Score Distribution Histogram */}
                  <Card title="Predicted Score Distribution" icon="📊" subtitle="Distribution of predicted PRC total ratings across all examinees" fullWidth>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <BarChart data={histogramData} margin={{ top: 0, right: 20, bottom: 0, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                          <XAxis dataKey="range" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine x="70–75" stroke={T.amber} strokeDasharray="4 3" label={{ value: "Pass threshold", position: "top", fontSize: 10, fill: T.amber }} />
                          <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                            {histogramData.map((d, i) => {
                              const low = parseInt(d.range.split("–")[0]);
                              return <Cell key={i} fill={low >= 70 ? T.pass : low >= 60 ? T.amber : T.fail} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Scatter Plot: Actual vs Predicted */}
                  <Card title="Actual vs Predicted (Pass Rate)" icon="🎯" subtitle="Scatter showing model prediction accuracy across cohorts" fullWidth>
                    <div style={{ width: "100%", height: 220 }}>
                      <ResponsiveContainer>
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                          <XAxis type="number" dataKey="actual" name="Actual" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} label={{ value: "Actual %", position: "insideBottom", offset: -4, fontSize: 11, fill: T.textSoft }} domain={[50, 90]} />
                          <YAxis type="number" dataKey="predicted" name="Predicted" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} label={{ value: "Pred %", angle: -90, position: "insideLeft", fontSize: 11, fill: T.textSoft }} domain={[50, 90]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={CustomTooltipStyle} />
                          <ReferenceLine segment={[{ x: 50, y: 50 }, { x: 90, y: 90 }]} stroke={T.textMute} strokeDasharray="5 3" />
                          <ReferenceLine x={70} stroke={T.amber} strokeDasharray="4 3" strokeWidth={1} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" strokeWidth={1} />
                          <Scatter data={scatterData} fill={T.blue} fillOpacity={0.8} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: "12px", color: T.textSoft }}>Dashed diagonal = perfect prediction. Amber lines = 70% passing threshold.</p>
                  </Card>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <InsightBox insights={insights} />
                </div>
              </div>
            )}

            {/* ══ FEATURES TAB ══ */}
            {activeTab === "features" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Feature Importance</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Top predictors from the Random Forest classifier — what matters most for board exam success.</p>
                </div>
                <div className="dash-grid">
                  <Card title="Top 10 Predictors" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail prediction" fullWidth>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {featureImp.map((f, i) => {
                        const maxV  = featureImp[0]?.value ?? 1;
                        const pctW  = (f.value / maxV) * 100;
                        const color = i === 0 ? T.blue : i === 1 ? T.indigo : i === 2 ? T.teal : i < 4 ? T.amber : T.textMute;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                              width: "22px", height: "22px", borderRadius: "6px",
                              background: `${color}15`, border: `1px solid ${color}30`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "10px", fontWeight: 800, color, flexShrink: 0,
                            }}>{i + 1}</span>
                            <span style={{ flex: "0 0 240px", fontSize: "13px", color: T.textMid, lineHeight: 1.3 }}>{f.label}</span>
                            <div style={{ flex: 1, height: "10px", background: T.surfaceAlt, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pctW}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
                            </div>
                            <span style={{ width: "52px", fontSize: "12px", fontWeight: 800, color, textAlign: "right", flexShrink: 0 }}>{f.value.toFixed(4)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                      {[
                        { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS account for ~39% of total prediction importance." },
                        { icon: "📚", title: "GWA is #4", desc: "Academic GWA is the strongest non-exam predictor in the model." },
                        { icon: "🧠", title: "Survey Factors Matter", desc: "Confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
                      ].map((x, i) => (
                        <div key={i} style={{ background: T.surfaceAlt, borderRadius: "12px", padding: "16px", border: `1px solid ${T.border}` }}>
                          <p style={{ margin: "0 0 6px", fontSize: "18px" }}>{x.icon}</p>
                          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: T.text }}>{x.title}</p>
                          <p style={{ margin: 0, fontSize: "12px", color: T.textSoft, lineHeight: 1.5 }}>{x.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title="Feature Importance Chart" icon="📊" subtitle="Visual bar comparison of predictor weights">
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={featureImp.map(f => ({ name: f.label.split("–")[0].trim(), value: f.value }))} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10, fill: T.textSoft }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: T.textMid }} axisLine={false} tickLine={false} width={110} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Importance" radius={[0, 6, 6, 0]}>
                            {featureImp.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ CURRICULUM TAB ══ */}
            {activeTab === "curriculum" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Curriculum Gap Analysis</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Survey questions with the lowest scores — these pinpoint institutional weaknesses.</p>
                </div>
                <div style={{
                  background: T.amberLight, border: `1px solid ${T.amber}30`,
                  borderRadius: "14px", padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: T.amber }}>Objective 4 — Curriculum Weakness Indicators</p>
                    <p style={{ margin: 0, fontSize: "13px", color: T.textMid, lineHeight: 1.6 }}>
                      Items sorted by avg Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores = students <strong>disagreeing more</strong> = institutional gaps.
                    </p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "12px", marginBottom: "16px" }}>
                  {weakestQ.map((q, i) => {
                    const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
                    const sColor   = severity === "high" ? T.fail : severity === "medium" ? T.amber : T.orange;
                    const barPct   = ((q.avg - 1) / 3) * 100;
                    return (
                      <div key={i} style={{ background: T.surface, border: `1px solid ${sColor}30`, borderRadius: "14px", padding: "16px", boxShadow: T.shadow, borderLeft: `4px solid ${sColor}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${sColor}15`, color: sColor, border: `1px solid ${sColor}30` }}>{q.key}</span>
                            <span style={{ fontSize: "10px", color: T.textSoft, background: T.surfaceAlt, padding: "2px 7px", borderRadius: 999 }}>{q.section}</span>
                          </div>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: sColor, flexShrink: 0 }}>{q.avg.toFixed(2)}<span style={{ fontSize: "10px", color: T.textMute }}>/4</span></span>
                        </div>
                        <p style={{ margin: "0 0 10px", fontSize: "13px", color: T.textMid, lineHeight: 1.5 }}>{q.label}</p>
                        <div style={{ height: "6px", background: T.surfaceAlt, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${barPct}%`, background: sColor, borderRadius: 99, transition: "width 1s ease" }} />
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "11px", color: T.textMute }}>
                          {severity === "high" ? "🔴 Critical" : severity === "medium" ? "🟡 Moderate" : "🟠 Low concern"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Gap Summary Bar Chart */}
                <Card title="Gap Summary by Category" icon="📋" subtitle="Average concern level per institutional category" fullWidth>
                  {(() => {
                    const counts = {};
                    weakestQ.forEach(q => {
                      if (!counts[q.section]) counts[q.section] = { count: 0, avgTotal: 0 };
                      counts[q.section].count++;
                      counts[q.section].avgTotal += q.avg;
                    });
                    const cats = Object.entries(counts)
                      .map(([label, v]) => ({ label, count: v.count, avg: +(v.avgTotal / v.count).toFixed(2) }))
                      .sort((a, b) => b.avg - a.avg);
                    return (
                      <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                          <BarChart data={cats} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: T.textMid }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} domain={[2, 3]} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={2.5} stroke={T.amber} strokeDasharray="4 3" label={{ value: "Concern threshold", position: "right", fontSize: 10, fill: T.amber }} />
                            <Bar dataKey="avg" name="Avg Score" radius={[6, 6, 0, 0]}>
                              {cats.map((d, i) => <Cell key={i} fill={d.avg >= 2.65 ? T.fail : d.avg >= 2.55 ? T.amber : T.orange} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                  <div style={{ marginTop: "12px", background: T.amberLight, borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: T.textMid, lineHeight: 1.6 }}>
                    🎯 <strong style={{ color: T.text }}>Key Finding:</strong> Facilities and Dept. Review items score highest (most disagreement), signaling critical institutional gaps that require immediate action.
                  </div>
                </Card>
              </div>
            )}

            {/* ══ CLASSIFICATION METRICS TAB ══ */}
            {activeTab === "classification_metrics" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Classification Metrics</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>System metrics for the Pass/Fail prediction model.</p>
                </div>
                <div className="kpi-grid" style={{ marginBottom: "20px" }}>
                  {[
                    { label: "Accuracy", v: modelInfo?.classification?.accuracy, color: T.blue },
                    { label: "Precision", v: modelInfo?.classification?.precision, color: T.indigo },
                    { label: "Recall",   v: modelInfo?.classification?.recall,    color: T.teal },
                    { label: "F1-Score", v: modelInfo?.classification?.f1,        color: T.pass },
                  ].map((m, i) => (
                    <MetricCard key={i} label={m.label} value={typeof m.v === "number" ? pct(m.v * 100) : "—"} color={m.color} />
                  ))}
                </div>
                <div className="dash-grid">
                  <Card title="Metrics Reference" icon="🎯" subtitle="When and why each metric is used" fullWidth>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: T.surfaceAlt }}>
                            {["Metric", "Current Value", "Focus", "Best Used When"].map(h => (
                              <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: T.textMid, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${T.border}` }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Accuracy",  modelInfo?.classification?.accuracy,  "Overall correctness",         "Balanced classes"],
                            ["Precision", modelInfo?.classification?.precision, "Avoid false positives",       "Fraud / spam detection"],
                            ["Recall",    modelInfo?.classification?.recall,    "Catch all positive cases",    "Medical / safety-critical"],
                            ["F1-Score",  modelInfo?.classification?.f1,        "Precision-recall balance",    "Imbalanced data"],
                          ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? T.surface : T.surfaceAlt }}>
                              <td style={{ padding: "12px 14px", fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.border}` }}>{row[0]}</td>
                              <td style={{ padding: "12px 14px", fontWeight: 800, color: T.blue, borderBottom: `1px solid ${T.border}` }}>
                                {typeof row[1] === "number" ? pct(row[1] * 100) : "—"}
                              </td>
                              <td style={{ padding: "12px 14px", color: T.textMid, borderBottom: `1px solid ${T.border}` }}>{row[2]}</td>
                              <td style={{ padding: "12px 14px", color: T.textSoft, borderBottom: `1px solid ${T.border}` }}>{row[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {modelInfo?.dataset_size && (
                      <p style={{ marginTop: "12px", fontSize: "13px", color: T.textSoft }}>
                        Dataset size: <strong style={{ color: T.text }}>{modelInfo.dataset_size}</strong> records.
                      </p>
                    )}
                  </Card>

                  {/* Confusion Matrix Visual */}
                  <Card title="Confusion Matrix (Training)" icon="🧾" subtitle="Visual heatmap of model predictions vs actuals">
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "3px", maxWidth: "320px", margin: "8px auto 0" }}>
                      <div />
                      <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", fontWeight: 700, color: T.fail }}>Pred: FAIL</div>
                      <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", fontWeight: 700, color: T.pass }}>Pred: PASS</div>
                      {[["Actual: FAIL", 18, 8, T.fail], ["Actual: PASS", 5, 56, T.pass]].map(([lbl, tn, tp, color]) => (
                        <>
                          <div key={lbl} style={{ display: "flex", alignItems: "center", padding: "8px", fontSize: "12px", fontWeight: 700, color }}>{lbl}</div>
                          <div style={{ background: `${T.pass}20`, border: `1px solid ${T.pass}30`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontSize: "22px", fontWeight: 800, color: T.pass }}>{tn}</div>
                          <div style={{ background: `${T.fail}10`, border: `1px solid ${T.fail}20`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontSize: "22px", fontWeight: 800, color: T.fail }}>{tp}</div>
                        </>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ REGRESSION METRICS TAB ══ */}
            {activeTab === "regression_metrics" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Regression Metrics</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>System metrics for the PRC rating prediction models.</p>
                </div>
                <div className="kpi-grid" style={{ marginBottom: "20px" }}>
                  {[
                    { label: "Model A — MAE",  v: modelInfo?.regression_a?.mae,  color: T.blue   },
                    { label: "Model A — R²",   v: modelInfo?.regression_a?.r2,   color: T.indigo },
                    { label: "Model B — MAE",  v: modelInfo?.regression_b?.mae,  color: T.teal   },
                    { label: "Model B — R²",   v: modelInfo?.regression_b?.r2,   color: T.orange },
                  ].map((m, i) => (
                    <MetricCard key={i} label={m.label} value={typeof m.v === "number" ? m.v.toFixed(4) : "—"} color={m.color} />
                  ))}
                </div>
                <div className="dash-grid">
                  <Card title="Regression Metrics Reference" icon="📐" subtitle="Error behavior and optimization goals" fullWidth>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: T.surfaceAlt }}>
                            {["Metric", "Model A", "Model B", "Units", "Outlier Sensitivity", "Goal"].map(h => (
                              <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: T.textMid, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${T.border}` }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["MAE",      modelInfo?.regression_a?.mae,  modelInfo?.regression_b?.mae,  "Same as target", "Low",      "Minimize avg error"],
                            ["RMSE",     modelInfo?.regression_a?.rmse, modelInfo?.regression_b?.rmse, "Same as target", "High",     "Avoid large errors"],
                            ["R² Score", modelInfo?.regression_a?.r2,   modelInfo?.regression_b?.r2,   "None (0–1)",     "Moderate", "Maximize explained variance"],
                          ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? T.surface : T.surfaceAlt }}>
                              <td style={{ padding: "12px 14px", fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.border}` }}>{row[0]}</td>
                              <td style={{ padding: "12px 14px", fontWeight: 800, color: T.blue, borderBottom: `1px solid ${T.border}` }}>{typeof row[1] === "number" ? row[1].toFixed(4) : "—"}</td>
                              <td style={{ padding: "12px 14px", fontWeight: 800, color: T.indigo, borderBottom: `1px solid ${T.border}` }}>{typeof row[2] === "number" ? row[2].toFixed(4) : "—"}</td>
                              <td style={{ padding: "12px 14px", color: T.textMid, borderBottom: `1px solid ${T.border}` }}>{row[3]}</td>
                              <td style={{ padding: "12px 14px", color: T.textSoft, borderBottom: `1px solid ${T.border}` }}>{row[4]}</td>
                              <td style={{ padding: "12px 14px", color: T.textSoft, borderBottom: `1px solid ${T.border}` }}>{row[5]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card title="Actual vs Predicted Scatter (Regression)" icon="🔵" subtitle="Model precision across cohorts — diagonal = perfect prediction" fullWidth>
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer>
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                          <XAxis type="number" dataKey="actual" name="Actual" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} label={{ value: "Actual Rating", position: "insideBottom", offset: -10, fontSize: 11, fill: T.textSoft }} domain={[55, 90]} />
                          <YAxis type="number" dataKey="predicted" name="Predicted" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} label={{ value: "Predicted Rating", angle: -90, position: "insideLeft", fontSize: 11, fill: T.textSoft }} domain={[55, 90]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={CustomTooltipStyle} />
                          <ReferenceLine segment={[{ x: 55, y: 55 }, { x: 90, y: 90 }]} stroke={T.textBorderAlt} strokeDasharray="5 3" strokeWidth={1.5} />
                          <ReferenceLine x={70} stroke={T.amber} strokeDasharray="4 3" />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" />
                          <Scatter data={scatterData} fill={T.indigo} fillOpacity={0.8} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ CORRELATION TAB ══ */}
            {activeTab === "correlation" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Correlation Matrix</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Pearson correlations between key academic variables and exam outcome.</p>
                </div>
                <Card title="Correlation Matrix" icon="🧮" subtitle="Strength of linear relationships between variables" fullWidth>
                  {correlation ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>
                        <thead>
                          <tr>
                            <th style={{ padding: "10px 12px", borderBottom: `2px solid ${T.border}`, textAlign: "left", color: T.textSoft, fontWeight: 700, fontSize: "11px" }}>Variable</th>
                            {(correlation.columns ?? []).map(col => (
                              <th key={col} style={{ padding: "10px 12px", borderBottom: `2px solid ${T.border}`, textAlign: "right", color: T.textSoft, fontWeight: 700, fontSize: "11px" }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(correlation.matrix ?? []).map((row, ri) => (
                            <tr key={row.row} style={{ background: ri % 2 === 0 ? T.surface : T.surfaceAlt }}>
                              <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.text }}>{row.row}</td>
                              {(correlation.columns ?? []).map(col => {
                                const val    = row[col];
                                const absVal = Math.abs(val);
                                const isDiag = col === row.row;
                                const color  = isDiag ? T.textMute : absVal >= 0.7 ? T.pass : absVal >= 0.4 ? T.amber : T.textSoft;
                                const bg     = isDiag ? "transparent" : absVal >= 0.7 ? `${T.pass}10` : absVal >= 0.4 ? `${T.amber}10` : "transparent";
                                return (
                                  <td key={col} style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, textAlign: "right", fontWeight: absVal >= 0.4 && !isDiag ? 800 : 400, color, background: bg }}>
                                    {val.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", color: T.textMute }}>Correlation data not available. Check backend connection.</p>
                  )}
                  <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {[
                      { label: "Strong (≥ 0.7)", color: T.pass, bg: T.passLight },
                      { label: "Moderate (0.4–0.7)", color: T.amber, bg: T.amberLight },
                      { label: "Weak (< 0.4)", color: T.textSoft, bg: T.surfaceAlt },
                    ].map((l, i) => (
                      <span key={i} style={{ fontSize: "12px", fontWeight: 600, color: l.color, background: l.bg, padding: "4px 12px", borderRadius: "999px" }}>{l.label}</span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ══ 2025 FINAL DEFENSE TAB ══ */}
            {activeTab === "test2025" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>2025 Final Defense</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).</p>
                </div>
                {testLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", color: T.textSoft }}>Loading 2025 metrics…</div>
                ) : test2025?.error ? (
                  <div style={{ background: T.failLight, border: `1px solid ${T.fail}30`, borderRadius: "14px", padding: "16px 20px" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: T.fail }}>{test2025.error}</p>
                  </div>
                ) : test2025 ? (
                  <>
                    <div className="kpi-grid" style={{ marginBottom: "20px" }}>
                      <MetricCard label="Test Accuracy" value={pct((test2025.classification?.accuracy ?? 0) * 100)} color={(test2025.classification?.accuracy ?? 0) >= 0.9 ? T.pass : T.amber} icon="🎯" />
                      <MetricCard label="Precision"     value={pct((test2025.classification?.precision ?? 0) * 100)} color={T.blue}   icon="🔬" />
                      <MetricCard label="Recall"        value={pct((test2025.classification?.recall ?? 0) * 100)}    color={T.indigo} icon="🧲" />
                      <MetricCard label="F1-Score"      value={pct((test2025.classification?.f1 ?? 0) * 100)}        color={T.teal}   icon="⚖️" />
                    </div>
                    <div className="dash-grid" style={{ marginBottom: "16px" }}>
                      {[["Regression A", test2025.regression?.a], ["Regression B", test2025.regression?.b]].map(([label, reg], i) => (
                        <Card key={i} title={label} icon={i === 0 ? "📉" : "🧠"} subtitle={i === 0 ? "Model 2A — EE+MATH+ESAS+GWA" : "Model 2B — GWA+Survey only"}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[["R²", reg?.r2, 4], ["MAE", reg?.mae, 4], ["MSE", reg?.mse, 4], ["RMSE", reg?.rmse, 4]].map(([k, v, d]) => (
                              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.surfaceAlt, borderRadius: "8px" }}>
                                <span style={{ fontSize: "13px", color: T.textMid, fontWeight: 600 }}>{k}</span>
                                <span style={{ fontSize: "16px", fontWeight: 800, color: T.blue }}>{num(v, d)}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}

                      <Card title="Confusion Matrix" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth>
                        {test2025.confusion_matrix ? (
                          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "4px", maxWidth: "340px", margin: "0 auto" }}>
                            <div />
                            <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", fontWeight: 700, color: T.fail }}>Pred: FAIL</div>
                            <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", fontWeight: 700, color: T.pass }}>Pred: PASS</div>
                            <div style={{ display: "flex", alignItems: "center", fontSize: "12px", fontWeight: 700, color: T.fail }}>Actual: FAIL</div>
                            <div style={{ background: T.passLight, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontSize: "26px", fontWeight: 800, color: T.pass }}>{test2025.confusion_matrix.actual_fail.pred_fail}</div>
                            <div style={{ background: T.failLight, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontSize: "26px", fontWeight: 800, color: T.fail }}>{test2025.confusion_matrix.actual_fail.pred_pass}</div>
                            <div style={{ display: "flex", alignItems: "center", fontSize: "12px", fontWeight: 700, color: T.pass }}>Actual: PASS</div>
                            <div style={{ background: T.failLight, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontSize: "26px", fontWeight: 800, color: T.fail }}>{test2025.confusion_matrix.actual_pass.pred_fail}</div>
                            <div style={{ background: T.passLight, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontSize: "26px", fontWeight: 800, color: T.pass }}>{test2025.confusion_matrix.actual_pass.pred_pass}</div>
                          </div>
                        ) : <p style={{ margin: 0, fontSize: "13px", color: T.textMute }}>Confusion matrix not available.</p>}
                      </Card>
                    </div>

                    {/* Row-level check */}
                    <Card title="Select a 2025 Examinee" icon="🧪" subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers" fullWidth>
                      {/* ExamineeDetailPanel placeholder */}
                      <p style={{ fontSize: "13px", color: T.textSoft }}>
                        Import and render <code>{"<ExamineeDetailPanel />"}</code> here. Records: {test2025Records?.length ?? 0} loaded.
                      </p>
                    </Card>
                  </>
                ) : <p style={{ fontSize: "13px", color: T.textMute }}>No 2025 defense metrics available.</p>}
              </div>
            )}

            {/* ══ TRENDS & MONITORING TAB ══ */}
            {activeTab === "trends" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>Trends & Monitoring</h2>
                  <p style={{ margin: 0, fontSize: "14px", color: T.textSoft }}>Live data from the prediction database — attempts, monthly summaries, and AI trend insights.</p>
                </div>

                {/* Usage Summary */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)">
                    {usageLoading ? (
                      <p style={{ margin: 0, fontSize: "13px", color: T.textMute }}>Loading…</p>
                    ) : usageSummary ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button onClick={downloadPerformanceReport} disabled={reportLoading} style={{
                            background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px",
                            padding: "8px 16px", color: T.textSoft, fontSize: "13px", cursor: reportLoading ? "not-allowed" : "pointer",
                            boxShadow: T.shadow, fontWeight: 500, transition: "all 0.15s", opacity: reportLoading ? 0.7 : 1,
                          }}>
                            {reportLoading ? "Preparing…" : "⬇ Download Performance Report"}
                          </button>
                        </div>
                        <div className="kpi-grid">
                          <MetricCard label="Total Predictions" value={usageSummary.total_predictions} color={T.blue} />
                          <MetricCard label="Active Users" value={usageSummary.active_users} color={T.pass} sub="distinct students" />
                        </div>
                        {(usageSummary.predictions_by_day ?? []).length > 0 && (
                          <Card title="Daily Prediction Volume" subtitle="Last 10 days" icon="📅">
                            <div style={{ width: "100%", height: 160 }}>
                              <ResponsiveContainer>
                                <BarChart data={(usageSummary.predictions_by_day ?? []).slice(-10).map(d => ({ day: d.day?.slice(5) ?? "—", total: d.total ?? 0 }))} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="total" name="Predictions" radius={[4, 4, 0, 0]} fill={T.blue} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>
                        )}
                        {(usageSummary.active_users_recent ?? []).length > 0 && (
                          <div>
                            <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em" }}>Most Active Students</p>
                            <table className="att-table">
                              <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                              <tbody>
                                {(usageSummary.active_users_recent ?? []).map((u, i) => (
                                  <tr key={i}>
                                    <td style={{ fontWeight: 700 }}>{u.name || u.user_id || "—"}</td>
                                    <td>{u.attempts ?? 0}</td>
                                    <td>{u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : <p style={{ fontSize: "13px", color: T.textMute }}>No usage data yet.</p>}
                  </Card>
                </div>

                {/* AI Insights */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="AI Trend Insights" icon="✨" subtitle="AI-generated summary of year-over-year prediction trends">
                    {insightsLoading ? (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: `2px solid ${T.blue}30`, borderTopColor: T.blue, animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: "13px", color: T.textSoft }}>Generating AI summary…</span>
                      </div>
                    ) : trendInsights ? (
                      <div>
                        {(trendInsights.stats?.years ?? []).length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "10px", marginBottom: "14px" }}>
                            {trendInsights.stats.years.map((yr, i) => (
                              <div key={i} style={{ background: `${T.blue}08`, border: `1px solid ${T.blue}20`, borderRadius: "10px", padding: "12px" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "11px", color: T.textSoft }}>{yr.year}</p>
                                <p style={{ margin: "0 0 1px", fontSize: "22px", fontWeight: 800, color: yr.pass_rate >= 70 ? T.pass : T.amber }}>{yr.pass_rate.toFixed(1)}%</p>
                                <p style={{ margin: 0, fontSize: "11px", color: T.textMute }}>{yr.total} attempts · avg {yr.avg_rating.toFixed(1)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background: T.blueLight, border: `1px solid ${T.blue}20`, borderRadius: "10px", padding: "14px 16px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p>
                          <p style={{ margin: 0, fontSize: "13px", color: T.textMid, lineHeight: 1.7 }}>{trendInsights.summary}</p>
                        </div>
                        <button onClick={fetchTrendInsights} style={{ marginTop: "10px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "6px 14px", color: T.blue, fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>↻ Refresh Insights</button>
                      </div>
                    ) : <p style={{ fontSize: "13px", color: T.textMute }}>No trend data yet.</p>}
                  </Card>
                </div>

                {/* Yearly Pass/Fail from DB */}
                {(yearlyPF ?? []).length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <Card title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions">
                      <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                          <BarChart data={(yearlyPF ?? []).map(yr => ({
                            year: yr.year,
                            Pass: yr.pass_count,
                            Fail: yr.fail_count,
                          }))} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: T.textSoft }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend formatter={v => <span style={{ fontSize: "12px", color: T.textMid, fontWeight: 600 }}>{v}</span>} />
                            <Bar dataKey="Pass" stackId="a" fill={T.pass} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Fail" stackId="a" fill={T.fail} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Monthly Summary */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <label style={{ fontSize: "13px", color: T.textSoft, fontWeight: 600 }}>Year:</label>
                      <select className="filter-input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    {(monthly ?? []).length > 0 ? (
                      <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                          <BarChart data={(monthly ?? []).map(m => ({ month: MONTH_NAMES[m.month - 1], Pass: m.pass_count, Fail: m.fail_count }))} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: T.textSoft }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend formatter={v => <span style={{ fontSize: "12px", color: T.textMid, fontWeight: 600 }}>{v}</span>} />
                            <Bar dataKey="Pass" stackId="a" fill={T.pass} />
                            <Bar dataKey="Fail" stackId="a" fill={T.fail} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", color: T.textMute }}>No data for {selectedYear}. Students need to submit predictions first.</p>
                    )}
                  </Card>
                </div>

                {/* Attempts Table */}
                <Card title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <label style={{ fontSize: "12px", color: T.textSoft, fontWeight: 600 }}>Year:</label>
                      <input className="filter-input" type="number" placeholder="e.g. 2025" value={attFilter.year}
                        onChange={e => { setAttFilter(f => ({ ...f, year: e.target.value })); setAttPage(1); }}
                        style={{ width: "90px" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <label style={{ fontSize: "12px", color: T.textSoft, fontWeight: 600 }}>Month:</label>
                      <input className="filter-input" type="number" placeholder="1–12" min="1" max="12" value={attFilter.month}
                        onChange={e => { setAttFilter(f => ({ ...f, month: e.target.value })); setAttPage(1); }}
                        style={{ width: "70px" }} />
                    </div>
                    <button onClick={() => { setAttFilter({ year: "", month: "" }); setAttPage(1); }} style={{
                      background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px",
                      padding: "6px 12px", color: T.textSoft, fontSize: "12px", cursor: "pointer",
                    }}>✕ Clear</button>
                    {attempts && <span style={{ fontSize: "12px", color: T.textMute, marginLeft: "auto" }}>{attempts.total} total · Page {attPage}</span>}
                  </div>

                  {attempts && (attempts.items ?? []).length > 0 ? (
                    <>
                      <div style={{ overflowX: "auto" }}>
                        <table className="att-table">
                          <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>User ID</th></tr></thead>
                          <tbody>
                            {(attempts.items ?? []).map((item, i) => (
                              <tr key={i}>
                                <td style={{ color: T.textSoft }}>{new Date(item.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                <td>
                                  <span style={{
                                    fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                                    background: item.label === "PASSED" ? T.passLight : T.failLight,
                                    color: item.label === "PASSED" ? T.pass : T.fail,
                                    border: `1px solid ${item.label === "PASSED" ? T.pass : T.fail}30`,
                                  }}>{item.label}</span>
                                </td>
                                <td style={{ fontWeight: 700, color: item.probability_pass >= 0.7 ? T.pass : item.probability_pass >= 0.5 ? T.amber : T.fail }}>
                                  {(item.probability_pass * 100).toFixed(1)}%
                                </td>
                                <td style={{ color: item.predicted_rating_a >= 70 ? T.pass : item.predicted_rating_a >= 60 ? T.amber : T.fail }}>
                                  {item.predicted_rating_a?.toFixed(1) ?? "—"}
                                </td>
                                <td style={{ color: T.textMute, fontSize: "11px" }}>{item.user_id ? item.user_id.slice(0, 8) + "…" : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center", justifyContent: "flex-end" }}>
                        {[
                          ["← Prev", () => setAttPage(p => Math.max(1, p - 1)), attPage === 1],
                          ["Next →", () => setAttPage(p => p + 1), attPage >= Math.ceil(((attempts.total) || 1) / 20)],
                        ].map(([label, fn, disabled]) => (
                          <button key={label} onClick={fn} disabled={disabled} style={{
                            background: disabled ? T.surfaceAlt : T.surface,
                            border: `1px solid ${T.border}`, borderRadius: "8px",
                            padding: "7px 16px", color: disabled ? T.textMute : T.textMid,
                            fontSize: "13px", cursor: disabled ? "not-allowed" : "pointer",
                            fontWeight: 600, boxShadow: disabled ? "none" : T.shadow,
                          }}>{label}</button>
                        ))}
                        <span style={{ fontSize: "12px", color: T.textMute, padding: "0 8px" }}>
                          Page {attPage} / {Math.ceil(((attempts.total) || 1) / 20)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: "32px", textAlign: "center" }}>
                      <p style={{ fontSize: "14px", color: T.textSoft }}>No prediction attempts found.</p>
                      <p style={{ fontSize: "12px", color: T.textMute, marginTop: "4px" }}>Students need to log in and submit predictions first.</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* ══ TIMING MODAL ══ */}
      {timingModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setTimingModalOpen(false)}
        >
          <div
            style={{ width: "min(1000px,96vw)", maxHeight: "85vh", overflow: "auto", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "20px", boxShadow: T.shadowLg }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: T.text }}>Attempt Timer Drill-down</p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textSoft }}>{selectedTimingAttempt?.name || "Unknown"} · {selectedTimingAttempt?.attempt_id?.slice(0, 8)}</p>
              </div>
              <button onClick={() => setTimingModalOpen(false)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "7px 14px", color: T.textMid, cursor: "pointer", fontWeight: 600 }}>Close</button>
            </div>
            {selectedTimingLoading ? (
              <p style={{ color: T.textSoft }}>Loading timing details…</p>
            ) : selectedTimingData?.error ? (
              <p style={{ color: T.fail }}>{selectedTimingData.error}</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="att-table">
                  <thead><tr><th>Question</th><th>Section</th><th>Order</th><th>Duration (sec)</th><th>Expected Range</th><th>Human-like?</th></tr></thead>
                  <tbody>
                    {(selectedTimingData?.items ?? []).map((t, i) => (
                      <tr key={i}>
                        <td>{t.question_key}</td>
                        <td>{t.step_id || "—"}</td>
                        <td>{t.question_index ?? "—"}</td>
                        <td>{t.duration_sec ?? "—"}</td>
                        <td>{t.expected_min_sec != null ? `${t.expected_min_sec}–${t.expected_max_sec}` : "—"}</td>
                        <td style={{ color: t.is_human_like ? T.pass : T.fail, fontWeight: 700 }}>{t.is_human_like ? "Yes" : "No"}</td>
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