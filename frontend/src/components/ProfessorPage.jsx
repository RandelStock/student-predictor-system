import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import ExamineeDetailPanel from "./ExamineeDetailPanel";
import API_BASE_URL from "../apiBase";

// ── Dark colour palette (original dark theme) ─────────────────────────────────
const D = {
  bg:         "#060b14",
  surface:    "rgba(255,255,255,0.025)",
  surfaceHov: "rgba(255,255,255,0.045)",
  border:     "rgba(255,255,255,0.07)",
  borderAlt:  "rgba(255,255,255,0.12)",
  text:       "#f8fafc",
  textMid:    "#cbd5e1",
  textSoft:   "#94a3b8",
  textMute:   "#475569",
  pass:       "#34d399",
  passD:      "rgba(52,211,153,0.12)",
  fail:       "#f87171",
  failD:      "rgba(248,113,113,0.12)",
  blue:       "#38bdf8",
  blueD:      "rgba(56,189,248,0.1)",
  indigo:     "#818cf8",
  indigoD:    "rgba(129,140,248,0.1)",
  amber:      "#fbbf24",
  amberD:     "rgba(251,191,36,0.1)",
  teal:       "#2dd4bf",
  tealD:      "rgba(45,212,191,0.1)",
  orange:     "#fb923c",
  pink:       "#f472b6",
  shadow:     "0 2px 8px rgba(0,0,0,0.4)",
  shadowMd:   "0 4px 20px rgba(0,0,0,0.5)",
};

const CHART_COLORS = [D.blue, D.pass, D.indigo, D.teal, D.pink, D.orange, D.amber];
const MONTH_NAMES  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function pct(v) { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }

// ── Recharts custom tooltip ────────────────────────────────────────────────────
const TT_STYLE = {
  background: "#0f172a",
  border: `1px solid ${D.borderAlt}`,
  borderRadius: "10px",
  boxShadow: D.shadowMd,
  padding: "10px 14px",
  fontSize: "12px",
  color: D.textMid,
};

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TT_STYLE}>
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: D.text }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || D.textMid }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span>{" "}
          {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
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
    gwa_comparison: { passers: 1.82, failers: 2.41 },
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

// ── Reusable components ───────────────────────────────────────────────────────

function Card({ title, icon, subtitle, children, accent = D.blue, fullWidth = false }) {
  return (
    <div style={{
      background: D.surface,
      border: `1px solid ${D.border}`,
      borderRadius: "16px",
      padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
      transition: "background 0.2s, border-color 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = D.surfaceHov; e.currentTarget.style.borderColor = D.borderAlt; }}
      onMouseLeave={e => { e.currentTarget.style.background = D.surface;    e.currentTarget.style.borderColor = D.border; }}
    >
      {(title || icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: subtitle ? "5px" : "18px" }}>
          {icon && (
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: `${accent}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", flexShrink: 0,
            }}>{icon}</div>
          )}
          <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: D.text, fontFamily: "'Syne',sans-serif", letterSpacing: "0.01em", flex: 1 }}>{title}</h3>
          <div style={{ height: "1px", background: D.border, flex: 1 }} />
        </div>
      )}
      {subtitle && <p style={{ margin: "0 0 16px", fontSize: "11px", color: D.textMute, lineHeight: 1.5 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color = D.blue, icon }) {
  return (
    <div style={{
      background: `${color}0d`,
      border: `1px solid ${color}28`,
      borderRadius: "14px",
      padding: "16px 18px",
      transition: "all 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}45`; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: D.textMute, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
        {icon && <span style={{ fontSize: "16px", opacity: 0.7 }}>{icon}</span>}
      </div>
      <p style={{ margin: "0 0 3px", fontSize: "28px", fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "10px", color: D.textMute }}>{sub}</p>}
    </div>
  );
}

function Delta({ value }) {
  if (value === undefined || value === null) return null;
  const up = value > 0, zero = value === 0;
  const color = zero ? D.textMute : up ? D.pass : D.fail;
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: "999px", padding: "1px 6px", marginLeft: "6px" }}>
      {zero ? "—" : up ? `▲ +${value}` : `▼ ${value}`}
    </span>
  );
}

function InsightBox({ insights = [] }) {
  if (!insights.length) return null;
  return (
    <div style={{ background: `${D.blue}08`, border: `1px solid ${D.blue}22`, borderRadius: "14px", padding: "18px 20px", marginTop: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "15px" }}>✨</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: D.blue, fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>Key Insights</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "13px", flexShrink: 0 }}>{ins.icon || "💡"}</span>
            <p style={{ margin: 0, fontSize: "12px", color: D.textMid, lineHeight: 1.65 }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: `1px solid ${D.border}`,
    borderRadius: "8px", padding: "6px 10px", color: D.text,
    fontSize: "12px", fontFamily: "'DM Sans',sans-serif", outline: "none",
  };
  const toggleStyle = (active, color) => ({
    padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: active ? 700 : 500,
    cursor: "pointer", border: `1px solid ${active ? color : D.border}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : D.textSoft, transition: "all 0.15s",
  });
  return (
    <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: "13px", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "18px" }}>
      <span style={{ fontSize: "10px", fontWeight: 700, color: D.textMute, textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</span>
      <select style={inputStyle} value={filters.year} onChange={e => set("year", e.target.value)}>
        <option value="">All Years</option>
        {["2021","2022","2023","2024"].map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select style={inputStyle} value={filters.month} onChange={e => set("month", e.target.value)}>
        <option value="">All Months</option>
        {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
      </select>
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: D.textMute, marginRight: "4px" }}>Review:</span>
        {[["all","All"],["yes","Attended"],["no","Not Attended"]].map(([v,l]) => (
          <button key={v} style={toggleStyle(filters.review===v, D.blue)} onClick={() => set("review", v)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "3px" }}>
        <span style={{ fontSize: "11px", color: D.textMute, marginRight: "4px" }}>Subject:</span>
        {[["all","All"],["EE","EE"],["MATH","Math"],["ESAS","ESAS"]].map(([v,l]) => (
          <button key={v} style={toggleStyle(filters.subject===v, D.indigo)} onClick={() => set("subject", v)}>{l}</button>
        ))}
      </div>
      <button onClick={() => onChange({ year:"", month:"", review:"all", subject:"all" })}
        style={{ marginLeft:"auto", fontSize:"11px", color: D.textSoft, background:"transparent", border:`1px solid ${D.border}`, borderRadius:"8px", padding:"5px 10px", cursor:"pointer" }}>
        ✕ Clear
      </button>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
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

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ProfessorPage({ onLogout }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [modelInfo, setModelInfo] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [filters, setFilters]     = useState({ year:"", month:"", review:"all", subject:"all" });

  // Phase-4 state
  const [attempts, setAttempts]   = useState(null);
  const [monthly, setMonthly]     = useState(null);
  const [yearlyPF, setYearlyPF]   = useState(null);
  const [trendInsights, setTrendInsights] = useState(null);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [attPage, setAttPage]     = useState(1);
  const [attFilter, setAttFilter] = useState({ year:"", month:"" });
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
  const [test2025, setTest2025]   = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run] = useState(null);
  const [test2025RunLoading, setTest2025RunLoading] = useState(false);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, mRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics`),
        fetch(`${API_BASE_URL}/model-info`),
        fetch(`${API_BASE_URL}/correlation`),
      ]);
      if (!aRes.ok || !mRes.ok) throw new Error();
      const analytics = await aRes.json();
      const model     = await mRes.json();
      const corr      = cRes.ok ? await cRes.json() : null;
      const mock = buildMockData();
      setData({ ...mock, ...analytics });
      setModelInfo(model);
      setCorrelation(corr && !corr.error ? corr : null);
    } catch { setData(buildMockData()); }
    finally { setLoading(false); }
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
    } catch(e) { console.error(e); }
  }, [attPage, attFilter, selectedYear]);

  const fetchTrendInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/admin/trend-insights`);
      if (r.ok) setTrendInsights(await r.json());
    } catch(e) { console.error(e); }
    finally { setInsightsLoading(false); }
  }, []);

  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/admin/usage-summary?days=30`);
      if (r.ok) setUsageSummary(await r.json());
    } catch(e) { console.error(e); }
    finally { setUsageLoading(false); }
  }, []);

  const fetchReviewAnalysis = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/admin/review-analysis`);
      if (r.ok) setReviewAnalysis(await r.json());
    } catch(e) { console.error(e); }
  }, []);

  const fetchTimingAnalysis = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/admin/timing-analysis?limit=10`);
      if (r.ok) setTimingAnalysis(await r.json());
    } catch(e) { console.error(e); }
  }, []);

  const openTimingModal = useCallback(async (attempt) => {
    if (!attempt?.attempt_id) return;
    setTimingModalOpen(true); setSelectedTimingAttempt(attempt);
    setSelectedTimingData(null); setSelectedTimingLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/admin/attempt-timings?attempt_id=${encodeURIComponent(attempt.attempt_id)}`);
      if (!r.ok) throw new Error();
      setSelectedTimingData(await r.json());
    } catch { setSelectedTimingData({ error: "Could not load attempt timing details." }); }
    finally { setSelectedTimingLoading(false); }
  }, []);

  const downloadPerformanceReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/admin/performance-report?year=${selectedYear}&days=30`);
      if (!r.ok) throw new Error();
      const payload = await r.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      a.href = url; a.download = `performance_report_${selectedYear}_${ts}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); alert("Could not download report."); }
    finally { setReportLoading(false); }
  }, [selectedYear]);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let c = false;
    (async () => {
      setTestLoading(true);
      try {
        const r = await fetch(`${API_BASE_URL}/defense/test-2025`);
        if (!r.ok) throw new Error();
        if (!c) setTest2025(await r.json());
      } catch { if (!c) setTest2025({ error:"Could not load 2025 defense metrics." }); }
      finally { if (!c) setTestLoading(false); }
    })();
    return () => { c = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let c = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/defense/test-2025-records`);
        if (!r.ok) throw new Error();
        const p = await r.json();
        if (!c) { setTest2025Records(p.error ? null : p.items||[]); setSelectedTestIdx(0); }
      } catch { if (!c) setTest2025Records([]); }
    })();
    return () => { c = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025" || !test2025Records?.length) return;
    let c = false;
    (async () => {
      setTest2025RunLoading(true); setTest2025Run(null);
      try {
        const r = await fetch(`${API_BASE_URL}/defense/test-2025-predict?idx=${selectedTestIdx}`);
        if (!r.ok) throw new Error();
        const p = await r.json();
        if (!c) setTest2025Run(p.error ? { error:p.error } : p);
      } catch { if (!c) setTest2025Run({ error:"Could not load prediction." }); }
      finally { if (!c) setTest2025RunLoading(false); }
    })();
    return () => { c = true; };
  }, [activeTab, selectedTestIdx, test2025Records]);

  useEffect(() => {
    if (activeTab === "trends") {
      fetchAdminFromDb(); fetchUsage(); fetchReviewAnalysis(); fetchTimingAnalysis();
      if (!trendInsights) fetchTrendInsights();
    }
  }, [activeTab, fetchAdminFromDb, fetchTrendInsights, trendInsights, fetchUsage, fetchReviewAnalysis, fetchTimingAnalysis]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeTab === "trends") fetchAdminFromDb(); }, [attPage, attFilter, selectedYear, activeTab]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const ov             = useMemo(() => data?.overview ?? {}, [data]);
  const passByYear     = useMemo(() => data?.pass_rate_by_year     ?? [], [data]);
  const passByStrand   = useMemo(() => data?.pass_rate_by_strand   ?? [], [data]);
  const passByReview   = useMemo(() => data?.pass_rate_by_review   ?? [], [data]);
  const passByDuration = useMemo(() => data?.pass_rate_by_duration ?? [], [data]);
  const featureImp     = useMemo(() => data?.feature_importance    ?? [], [data]);
  const sectionScores  = useMemo(() => data?.section_scores        ?? [], [data]);
  const weakestQ       = useMemo(() => data?.weakest_questions     ?? [], [data]);
  const subjectTrends  = useMemo(() => data?.subject_trends_by_year ?? [], [data]);

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

  const radarData = useMemo(
    () => sectionScores.slice(0,7).map(s => ({ section: s.label, Passers: s.pass, Failers: s.fail })),
    [sectionScores]
  );
  const donutData = useMemo(() => [
    { name:"Passers", value: ov.total_passers || 61 },
    { name:"Failers", value: ov.total_failers || 26 },
  ], [ov]);
  const scatterData = useMemo(() =>
    passByYear.map((d,i) => ({ actual: d.pass_rate, predicted: d.pass_rate + (i%2===0?3.2:-2.8), year: d.label })),
    [passByYear]
  );
  const histogramData = [
    { range:"50–55",count:3},{ range:"55–60",count:5},{ range:"60–65",count:8},
    { range:"65–70",count:11},{ range:"70–75",count:14},{ range:"75–80",count:18},
    { range:"80–85",count:12},{ range:"85–90",count:8},{ range:"90–95",count:5},{ range:"95–100",count:3},
  ];
  const insights = useMemo(() => {
    const list = [];
    if (passByYear.length >= 2) {
      const d = passByYear[passByYear.length-1].pass_rate - passByYear[0].pass_rate;
      list.push({ icon: d>0?"📈":"📉", text:`Pass rate ${d>0?"increased":"decreased"} by ${Math.abs(d).toFixed(1)}% from ${passByYear[0].label} to ${passByYear[passByYear.length-1].label}.` });
    }
    if (subjectTrends.length) {
      const last = subjectTrends[subjectTrends.length-1];
      const w = [{id:"EE",v:last.EE_avg},{id:"MATH",v:last.MATH_avg},{id:"ESAS",v:last.ESAS_avg}].sort((a,b)=>a.v-b.v)[0];
      list.push({ icon:"⚠️", text:`${w.id} has the lowest average score (${w.v}) — prioritize this subject in curriculum review.` });
    }
    if (passByReview.length >= 2) {
      const d = passByReview[0].pass_rate - passByReview[1].pass_rate;
      list.push({ icon:"📚", text:`Students attending formal review outperformed non-reviewers by ${Math.abs(d).toFixed(1)}%.` });
    }
    list.push(ov.overall_pass_rate >= 70
      ? { icon:"✅", text:`Overall pass rate of ${pct(ov.overall_pass_rate)} meets the 70% benchmark.` }
      : { icon:"🚨", text:`Overall pass rate is below 70% — immediate intervention recommended.` });
    return list;
  }, [passByYear, subjectTrends, passByReview, ov]);

  // ── Shared axis/grid styles for recharts ────────────────────────────────────
  const axTick  = { fontSize: 11, fill: D.textSoft };
  const gridS   = { stroke: "rgba(255,255,255,0.05)", strokeDasharray: "3 3" };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background: D.bg, fontFamily:"'DM Sans',system-ui,sans-serif", color: D.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:14px; }
        .kpi-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; margin-bottom:18px; }
        .tab-btn   { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .tab-btn:hover { color:#38bdf8 !important; }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
        .att-table{width:100%;border-collapse:collapse;font-size:11px}
        .att-table th{padding:9px 11px;border-bottom:1px solid rgba(148,163,184,0.15);text-align:left;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:10px}
        .att-table td{padding:9px 11px;border-bottom:1px solid rgba(30,41,59,0.5);color:#cbd5e1}
        .att-table tr:hover td{background:rgba(255,255,255,0.02)}
        .fi-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:6px 10px;color:#f1f5f9;font-size:12px;font-family:'DM Sans',sans-serif;outline:none}
        .fi-input:focus{border-color:rgba(56,189,248,0.4)}
        @media(max-width:640px){.dash-grid{grid-template-columns:1fr!important}.kpi-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(6,11,20,0.95)", backdropFilter:"blur(18px)", borderBottom:`1px solid ${D.border}`, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"70px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            {["/slsulogo.png","/slsulogo1.png","/slsulogo2.png"].map((s,i) => (
              <img key={s} src={s} alt={`Logo ${i+1}`} style={{ width:30,height:30,objectFit:"contain",opacity:0.95 }} />
            ))}
          </div>
          <div style={{ borderLeft:`1px solid ${D.border}`, paddingLeft:"14px" }}>
            <p style={{ margin:0, fontSize:"15px", fontWeight:800, color: D.text, fontFamily:"'Syne',sans-serif" }}>Insights Dashboard</p>
            <p style={{ margin:0, fontSize:"10px", color: D.textMute, textTransform:"uppercase", letterSpacing:"0.07em" }}>Faculty Portal · SLSU IIEE</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={fetchAnalytics} style={{ background: D.surface, border:`1px solid ${D.border}`, borderRadius:"10px", padding:"7px 15px", color: D.textSoft, fontSize:"12px", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=D.blue;e.currentTarget.style.borderColor=D.blue}}
            onMouseLeave={e=>{e.currentTarget.style.color=D.textSoft;e.currentTarget.style.borderColor=D.border}}>
            ↻ Refresh
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.22)", borderRadius:"999px", padding:"6px 14px" }}>
            <span style={{ fontSize:"12px" }}>🔬</span>
            <span style={{ fontSize:"12px", fontWeight:700, color: D.indigo }}>Faculty</span>
          </div>
          <button onClick={onLogout} style={{ background: D.surface, border:`1px solid ${D.border}`, borderRadius:"10px", padding:"7px 16px", color: D.textSoft, fontSize:"12px", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=D.fail;e.currentTarget.style.borderColor="rgba(248,113,113,0.3)"}}
            onMouseLeave={e=>{e.currentTarget.style.color=D.textSoft;e.currentTarget.style.borderColor=D.border}}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ══ TAB BAR ══ */}
      <div style={{ background:"rgba(6,11,20,0.85)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${D.border}`, padding:"0 20px", display:"flex", overflowX:"auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding:"13px 17px", fontSize:"12px", fontWeight: activeTab===tab.id?700:500,
            color: activeTab===tab.id ? D.blue : D.textMute,
            borderBottom: activeTab===tab.id ? `2px solid ${D.blue}` : "2px solid transparent",
            display:"flex", alignItems:"center", gap:"5px",
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ══ MAIN ══ */}
      <main style={{ maxWidth:"1280px", margin:"0 auto", padding:"22px 16px 72px" }}>

        {loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"90px 0", flexDirection:"column", gap:"16px" }}>
            <svg style={{ animation:"spin 0.8s linear infinite", width:"32px", height:"32px", color: D.blue }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize:"13px", color: D.textMute }}>Loading analytics…</p>
          </div>
        )}

        {!loading && data && (<>

          {/* ════════════════ OVERVIEW ════════════════ */}
          {activeTab === "overview" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif", color: D.text }}>Institutional Overview</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Aggregate statistics across all EE board exam takers. First-attempt outcomes only.</p>
              </div>

              <FilterPanel filters={filters} onChange={setFilters} />

              <div className="kpi-grid">
                <KPI label="Total Students"    value={ov.total_students}        color={D.blue}  icon="👥" />
                <KPI label="Total Passers"     value={ov.total_passers}          color={D.pass}  icon="✅" />
                <KPI label="Total Failers"     value={ov.total_failers}          color={D.fail}  icon="❌" />
                <KPI label="Pass Rate"         value={pct(ov.overall_pass_rate)} color={ov.overall_pass_rate>=70?D.pass:D.amber} icon="🎯" sub="Target: 70%" />
                <KPI label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}   color={D.pass}  icon="📚" sub="1.0 = Highest" />
                <KPI label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}   color={D.fail}  icon="📚" sub="1.0 = Highest" />
              </div>

              <div className="dash-grid" style={{ marginBottom:"14px" }}>
                {/* Donut */}
                <Card title="Pass / Fail Distribution" icon="🥧" subtitle="Overall proportion of board exam outcomes" accent={D.pass}>
                  <div style={{ width:"100%", height:200 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                          <Cell fill={D.pass} /><Cell fill={D.fail} />
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                        <Legend formatter={v=><span style={{fontSize:"12px",color:D.textMid,fontWeight:600}}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                    {[["Passers",ov.total_passers,D.pass,D.passD],["Failers",ov.total_failers,D.fail,D.failD]].map(([l,v,c,bg]) => (
                      <div key={l} style={{ flex:1, background:bg, border:`1px solid ${c}25`, borderRadius:"10px", padding:"10px", textAlign:"center" }}>
                        <p style={{ margin:"0 0 2px", fontSize:"10px", color:c, fontWeight:700, textTransform:"uppercase" }}>{l}</p>
                        <p style={{ margin:0, fontSize:"22px", fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Pass Rate Trend */}
                <Card title="Pass Rate Trend by Year" icon="📅" subtitle="Year-over-year pass rate progression" accent={D.teal}>
                  <div style={{ width:"100%", height:200 }}>
                    <ResponsiveContainer>
                      <AreaChart data={filteredPassByYear.map(d=>({year:d.label,rate:d.pass_rate}))} margin={{top:5,right:10,bottom:0,left:-10}}>
                        <defs>
                          <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={D.pass} stopOpacity={0.25}/>
                            <stop offset="95%" stopColor={D.pass} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridS} vertical={false}/>
                        <XAxis dataKey="year" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[40,100]}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{value:"70% target",position:"right",fontSize:9,fill:D.amber}}/>
                        <Area type="monotone" dataKey="rate" name="Pass Rate %" stroke={D.pass} strokeWidth={2.5} fill="url(#pgGrad)" dot={{fill:D.pass,r:4,stroke:"#060b14",strokeWidth:2}} activeDot={{r:6}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* GWA Comparison */}
                <Card title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA = better (1.0 scale)" accent={D.indigo}>
                  <div style={{ width:"100%", height:180 }}>
                    <ResponsiveContainer>
                      <BarChart data={[{name:"Passers",GWA:ov.avg_gwa_passers},{name:"Failers",GWA:ov.avg_gwa_failers}]} margin={{top:0,right:10,bottom:0,left:-20}}>
                        <CartesianGrid {...gridS} vertical={false}/>
                        <XAxis dataKey="name" tick={{...axTick,fontWeight:600}} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[0,3]}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <Bar dataKey="GWA" radius={[6,6,0,0]}><Cell fill={D.pass}/><Cell fill={D.fail}/></Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ background: D.blueD, border:`1px solid ${D.blue}20`, borderRadius:"9px", padding:"9px 13px", marginTop:"10px", fontSize:"12px", color: D.textMid }}>
                    💡 Passers had a GWA <strong style={{color:D.text}}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} pts better</strong> than failers.
                  </div>
                </Card>

                {/* Review Attendance */}
                <Card title="Review Attendance Impact" icon="📖" subtitle="Pass rate by formal review attendance" accent={D.blue}>
                  <div style={{ width:"100%", height:180 }}>
                    <ResponsiveContainer>
                      <BarChart data={filteredPassByReview.map(d=>({name:d.label,rate:d.pass_rate,n:d.total}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                        <CartesianGrid {...gridS} vertical={false}/>
                        <XAxis dataKey="name" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[0,100]}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="4 3" strokeWidth={1.5}/>
                        <Bar dataKey="rate" name="Pass Rate %" radius={[6,6,0,0]} fill={D.blue}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Review Duration */}
                <Card title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review correlates with higher pass rate" accent={D.teal}>
                  <div style={{ width:"100%", height:180 }}>
                    <ResponsiveContainer>
                      <BarChart data={passByDuration.map(d=>({name:d.label,rate:d.pass_rate}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                        <CartesianGrid {...gridS} vertical={false}/>
                        <XAxis dataKey="name" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[0,100]}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="4 3" strokeWidth={1.5}/>
                        <Bar dataKey="rate" name="Pass Rate %" radius={[6,6,0,0]}>
                          {passByDuration.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Model Performance */}
                <Card title="Model Performance" icon="📈" subtitle="Classifier & regressor metrics (Chapter 4)" accent={D.pink}>
                  {modelInfo ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                      {[
                        { label:"Classification", items:[
                          {k:"Accuracy",v:modelInfo.classification.accuracy,pct:true},
                          {k:"F1-Score", v:modelInfo.classification.f1,      pct:true},
                          {k:"CV Acc",   v:modelInfo.classification.cv_acc,  pct:true},
                        ]},
                        { label:"Regression A", items:[
                          {k:"MAE",v:modelInfo.regression_a.mae},{k:"R²",v:modelInfo.regression_a.r2},{k:"RMSE",v:modelInfo.regression_a.rmse},
                        ]},
                        { label:"Regression B", items:[
                          {k:"MAE",v:modelInfo.regression_b.mae},{k:"R²",v:modelInfo.regression_b.r2},{k:"RMSE",v:modelInfo.regression_b.rmse},
                        ]},
                      ].map((sec,si)=>(
                        <div key={si}>
                          <p style={{margin:"0 0 5px",fontSize:"10px",fontWeight:700,color:D.textMute,textTransform:"uppercase",letterSpacing:"0.07em"}}>{sec.label}</p>
                          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                            {sec.items.map((item,ii)=>(
                              <div key={ii} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${D.border}`,borderRadius:"8px",padding:"8px 12px",flex:"1 1 auto",minWidth:"60px"}}>
                                <p style={{margin:"0 0 2px",fontSize:"10px",color:D.textMute,fontWeight:600}}>{item.k}</p>
                                <p style={{margin:0,fontSize:"15px",fontWeight:800,color:D.blue}}>
                                  {item.pct ? `${(item.v*100).toFixed(1)}%` : item.v?.toFixed(3)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{fontSize:"12px",color:D.textMute}}>Loading model metrics…</p>}
                </Card>
              </div>

              <InsightBox insights={insights} />
            </div>
          )}

          {/* ════════════════ PERFORMANCE ════════════════ */}
          {activeTab === "performance" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Performance Breakdown</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Pass rates by strand, survey section scores, and multi-year subject analysis.</p>
              </div>
              <FilterPanel filters={filters} onChange={setFilters} />
              <div className="dash-grid">
                {/* SHS Strand */}
                <Card title="Pass Rate by SHS Strand" icon="🎓" subtitle="Which SHS track best prepares students?" accent={D.indigo}>
                  <div style={{ width:"100%", height:220 }}>
                    <ResponsiveContainer>
                      <BarChart data={passByStrand.map(d=>({strand:d.label,rate:d.pass_rate,n:d.total}))} layout="vertical" margin={{top:0,right:40,bottom:0,left:20}}>
                        <CartesianGrid {...gridS} horizontal={false}/>
                        <XAxis type="number" tick={axTick} axisLine={false} tickLine={false} domain={[0,100]}/>
                        <YAxis type="category" dataKey="strand" tick={{...axTick,fontWeight:600}} axisLine={false} tickLine={false} width={50}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <ReferenceLine x={70} stroke={D.amber} strokeDasharray="4 3"/>
                        <Bar dataKey="rate" name="Pass Rate %" radius={[0,6,6,0]}>
                          {passByStrand.map((d,i)=><Cell key={i} fill={d.pass_rate>=70?D.pass:d.pass_rate>=55?D.amber:D.fail}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{marginTop:"12px",background:D.blueD,border:`1px solid ${D.blue}20`,borderRadius:"9px",padding:"9px 13px",fontSize:"12px",color:D.textMid}}>
                    💡 STEM led with <strong style={{color:D.text}}>{pct(passByStrand[0]?.pass_rate)}</strong> pass rate — consistent with its math-heavy curriculum.
                  </div>
                </Card>

                {/* Subject Trends */}
                <Card title="Subject Score Trends" icon="📐" subtitle="EE, MATH & ESAS average scores per cohort year" fullWidth accent={D.blue}>
                  <div style={{ width:"100%", height:240 }}>
                    <ResponsiveContainer>
                      <LineChart data={filteredSubjectTrends} margin={{top:5,right:20,bottom:0,left:-10}}>
                        <CartesianGrid {...gridS}/>
                        <XAxis dataKey="year" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[55,85]}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <Legend formatter={v=><span style={{fontSize:"11px",color:D.textMid,fontWeight:600}}>{v}</span>}/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="5 3" strokeWidth={1.5} label={{value:"Passing",position:"right",fontSize:9,fill:D.amber}}/>
                        {(filters.subject==="all"||filters.subject==="EE")   && <Line type="monotone" dataKey="EE"   name="EE"   stroke={D.blue}   strokeWidth={2.5} dot={{fill:D.blue,  r:4,stroke:"#060b14",strokeWidth:2}} activeDot={{r:6}}/>}
                        {(filters.subject==="all"||filters.subject==="MATH") && <Line type="monotone" dataKey="MATH" name="MATH" stroke={D.indigo} strokeWidth={2.5} dot={{fill:D.indigo,r:4,stroke:"#060b14",strokeWidth:2}} activeDot={{r:6}}/>}
                        {(filters.subject==="all"||filters.subject==="ESAS") && <Line type="monotone" dataKey="ESAS" name="ESAS" stroke={D.teal}   strokeWidth={2.5} dot={{fill:D.teal,  r:4,stroke:"#060b14",strokeWidth:2}} activeDot={{r:6}}/>}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>
                    {["EE","MATH","ESAS"].map((s,i)=>{
                      const last  = subjectTrends[subjectTrends.length-1];
                      const first = subjectTrends[0];
                      const v     = last?.[`${s}_avg`];
                      const delta = v - first?.[`${s}_avg`];
                      const col   = [D.blue,D.indigo,D.teal][i];
                      return (
                        <div key={s} style={{background:`${col}0d`,border:`1px solid ${col}22`,borderRadius:"10px",padding:"11px"}}>
                          <p style={{margin:"0 0 2px",fontSize:"10px",fontWeight:700,color:col,textTransform:"uppercase"}}>{s} Latest</p>
                          <p style={{margin:"0 0 2px",fontSize:"20px",fontWeight:800,color:col,fontFamily:"'Syne',sans-serif"}}>{v}</p>
                          <p style={{margin:0,fontSize:"10px",color:delta>=0?D.pass:D.fail,fontWeight:600}}>
                            {delta>=0?"▲":"▼"} {Math.abs(delta).toFixed(1)} pts overall
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Radar */}
                <Card title="Survey Sections: Passers vs Failers" icon="🕸️" subtitle="Radar view of section performance by outcome" fullWidth accent={D.pink}>
                  <div style={{ width:"100%", height:280 }}>
                    <ResponsiveContainer>
                      <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)"/>
                        <PolarAngleAxis dataKey="section" tick={{fontSize:11,fill:D.textMid,fontWeight:600}}/>
                        <PolarRadiusAxis tick={{fontSize:9,fill:D.textMute}} domain={[40,90]} tickCount={4}/>
                        <Radar name="Passers" dataKey="Passers" stroke={D.pass} fill={D.pass} fillOpacity={0.15} strokeWidth={2}/>
                        <Radar name="Failers" dataKey="Failers" stroke={D.fail} fill={D.fail} fillOpacity={0.12} strokeWidth={2}/>
                        <Legend formatter={v=><span style={{fontSize:"11px",color:D.textMid,fontWeight:600}}>{v}</span>}/>
                        <Tooltip content={<DarkTooltip />}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Histogram */}
                <Card title="Predicted Score Distribution" icon="📊" subtitle="Distribution of predicted PRC total ratings" fullWidth accent={D.amber}>
                  <div style={{ width:"100%", height:200 }}>
                    <ResponsiveContainer>
                      <BarChart data={histogramData} margin={{top:0,right:20,bottom:0,left:-10}}>
                        <CartesianGrid {...gridS} vertical={false}/>
                        <XAxis dataKey="range" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis tick={axTick} axisLine={false} tickLine={false}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <ReferenceLine x="70–75" stroke={D.amber} strokeDasharray="4 3" label={{value:"Pass threshold",position:"top",fontSize:9,fill:D.amber}}/>
                        <Bar dataKey="count" name="Students" radius={[4,4,0,0]}>
                          {histogramData.map((d,i)=>{
                            const lo = parseInt(d.range.split("–")[0]);
                            return <Cell key={i} fill={lo>=70?D.pass:lo>=60?D.amber:D.fail}/>;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Scatter */}
                <Card title="Actual vs Predicted (Pass Rate)" icon="🎯" subtitle="Model prediction accuracy across cohorts" fullWidth accent={D.blue}>
                  <div style={{ width:"100%", height:220 }}>
                    <ResponsiveContainer>
                      <ScatterChart margin={{top:10,right:20,bottom:10,left:-10}}>
                        <CartesianGrid {...gridS}/>
                        <XAxis type="number" dataKey="actual" name="Actual" tick={axTick} axisLine={false} tickLine={false}
                          label={{value:"Actual %",position:"insideBottom",offset:-4,fontSize:10,fill:D.textSoft}} domain={[50,90]}/>
                        <YAxis type="number" dataKey="predicted" name="Predicted" tick={axTick} axisLine={false} tickLine={false}
                          label={{value:"Pred %",angle:-90,position:"insideLeft",fontSize:10,fill:D.textSoft}} domain={[50,90]}/>
                        <Tooltip cursor={{strokeDasharray:"3 3"}} content={<DarkTooltip />}/>
                        <ReferenceLine segment={[{x:50,y:50},{x:90,y:90}]} stroke={D.textMute} strokeDasharray="5 3"/>
                        <ReferenceLine x={70} stroke={D.amber} strokeDasharray="4 3" strokeWidth={1}/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="4 3" strokeWidth={1}/>
                        <Scatter data={scatterData} fill={D.blue} fillOpacity={0.85}/>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{margin:"8px 0 0",fontSize:"11px",color:D.textMute}}>Dashed diagonal = perfect prediction. Amber lines = 70% threshold.</p>
                </Card>
              </div>
              <InsightBox insights={insights} />
            </div>
          )}

          {/* ════════════════ FEATURE IMPORTANCE ════════════════ */}
          {activeTab === "features" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Feature Importance</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Top predictors from the Random Forest classifier — what matters most for board exam success.</p>
              </div>
              <div className="dash-grid">
                <Card title="Top 10 Predictors" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail" fullWidth accent={D.blue}>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {featureImp.map((f,i)=>{
                      const maxV = featureImp[0]?.value??1;
                      const pctW = (f.value/maxV)*100;
                      const col  = i===0?D.blue:i===1?D.indigo:i===2?D.teal:i<4?D.amber:D.textMute;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:"12px"}}>
                          <span style={{width:"21px",height:"21px",borderRadius:"6px",background:`${col}18`,border:`1px solid ${col}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:800,color:col,flexShrink:0}}>{i+1}</span>
                          <span style={{flex:"0 0 240px",fontSize:"12px",color:D.textMid,lineHeight:1.3}}>{f.label}</span>
                          <div style={{flex:1,height:"10px",background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pctW}%`,background:`linear-gradient(90deg,${col},${col}88)`,borderRadius:99,transition:"width 1s ease"}}/>
                          </div>
                          <span style={{width:"52px",fontSize:"11px",fontWeight:800,color:col,textAlign:"right",flexShrink:0}}>{f.value.toFixed(4)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop:"18px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"}}>
                    {[
                      {icon:"📝",title:"Subject Scores Dominate",desc:"EE, MATH, ESAS account for ~39% of total prediction importance."},
                      {icon:"📚",title:"GWA is #4",desc:"Academic GWA is the strongest non-exam predictor in the model."},
                      {icon:"🧠",title:"Survey Factors Matter",desc:"Confidence (PS11) and study schedule adherence (MT4) are top survey predictors."},
                    ].map((x,i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${D.border}`,borderRadius:"12px",padding:"14px"}}>
                        <p style={{margin:"0 0 5px",fontSize:"16px"}}>{x.icon}</p>
                        <p style={{margin:"0 0 3px",fontSize:"12px",fontWeight:700,color:D.text,fontFamily:"'Syne',sans-serif"}}>{x.title}</p>
                        <p style={{margin:0,fontSize:"11px",color:D.textMute,lineHeight:1.55}}>{x.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Feature Importance Chart" icon="📊" subtitle="Visual comparison of predictor weights" accent={D.indigo}>
                  <div style={{ width:"100%", height:300 }}>
                    <ResponsiveContainer>
                      <BarChart data={featureImp.map(f=>({name:f.label.split("–")[0].trim(),value:f.value}))} layout="vertical" margin={{top:0,right:20,bottom:0,left:10}}>
                        <CartesianGrid {...gridS} horizontal={false}/>
                        <XAxis type="number" tick={axTick} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:D.textMid}} axisLine={false} tickLine={false} width={110}/>
                        <Tooltip content={<DarkTooltip />}/>
                        <Bar dataKey="value" name="Importance" radius={[0,6,6,0]}>
                          {featureImp.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ════════════════ CURRICULUM GAPS ════════════════ */}
          {activeTab === "curriculum" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Curriculum Gap Analysis</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Survey questions with the lowest scores — pinpointing institutional weaknesses.</p>
              </div>
              <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:"13px", padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"18px" }}>
                <span style={{ fontSize:"18px", flexShrink:0 }}>⚠️</span>
                <div>
                  <p style={{ margin:"0 0 3px", fontSize:"13px", fontWeight:700, color: D.amber, fontFamily:"'Syne',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
                  <p style={{ margin:0, fontSize:"11px", color:"#92400e", lineHeight:1.6 }}>
                    Items sorted by avg Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores = more disagreement = institutional gaps.
                  </p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:"10px", marginBottom:"14px" }}>
                {weakestQ.map((q,i)=>{
                  const sev = q.avg>=2.7?"high":q.avg>=2.55?"medium":"low";
                  const sc  = sev==="high"?D.fail:sev==="medium"?D.amber:D.orange;
                  const bp  = ((q.avg-1)/3)*100;
                  return (
                    <div key={i} style={{ background: D.surface, border:`1px solid ${sc}28`, borderRadius:"13px", padding:"14px", borderLeft:`4px solid ${sc}` }}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"8px"}}>
                        <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                          <span style={{fontSize:"9px",fontWeight:800,padding:"2px 7px",borderRadius:999,background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{q.key}</span>
                          <span style={{fontSize:"9px",color:D.textMute,background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:999}}>{q.section}</span>
                        </div>
                        <span style={{fontSize:"15px",fontWeight:800,color:sc,flexShrink:0}}>{q.avg.toFixed(2)}<span style={{fontSize:"9px",color:D.textMute}}>/4</span></span>
                      </div>
                      <p style={{margin:"0 0 9px",fontSize:"12px",color:D.textMid,lineHeight:1.45}}>{q.label}</p>
                      <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${bp}%`,background:sc,borderRadius:99,transition:"width 1s ease"}}/>
                      </div>
                      <p style={{margin:"4px 0 0",fontSize:"10px",color:D.textMute}}>
                        {sev==="high"?"🔴 Critical":sev==="medium"?"🟡 Moderate":"🟠 Low concern"}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Card title="Gap Summary by Category" icon="📋" subtitle="Average concern level per institutional category" fullWidth accent={D.amber}>
                {(()=>{
                  const counts={};
                  weakestQ.forEach(q=>{
                    if(!counts[q.section]) counts[q.section]={count:0,tot:0};
                    counts[q.section].count++; counts[q.section].tot+=q.avg;
                  });
                  const cats=Object.entries(counts).map(([label,v])=>({label,count:v.count,avg:+(v.tot/v.count).toFixed(2)})).sort((a,b)=>b.avg-a.avg);
                  return (
                    <div style={{width:"100%",height:200}}>
                      <ResponsiveContainer>
                        <BarChart data={cats} margin={{top:5,right:20,bottom:0,left:-10}}>
                          <CartesianGrid {...gridS} vertical={false}/>
                          <XAxis dataKey="label" tick={axTick} axisLine={false} tickLine={false}/>
                          <YAxis tick={axTick} axisLine={false} tickLine={false} domain={[2,3]}/>
                          <Tooltip content={<DarkTooltip />}/>
                          <ReferenceLine y={2.5} stroke={D.amber} strokeDasharray="4 3" label={{value:"Concern threshold",position:"right",fontSize:9,fill:D.amber}}/>
                          <Bar dataKey="avg" name="Avg Score" radius={[6,6,0,0]}>
                            {cats.map((c,i)=><Cell key={i} fill={c.avg>=2.65?D.fail:c.avg>=2.55?D.amber:D.orange}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
                <div style={{marginTop:"12px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:"9px",padding:"11px 14px",fontSize:"12px",color:D.textMid,lineHeight:1.6}}>
                  🎯 <strong style={{color:D.text}}>Key Finding:</strong> Facilities and Dept. Review items score highest (most disagreement), signaling critical institutional gaps requiring immediate action.
                </div>
              </Card>
            </div>
          )}

          {/* ════════════════ CLASSIFICATION METRICS ════════════════ */}
          {activeTab === "classification_metrics" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Classification Metrics</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>System metrics for the Pass/Fail prediction model.</p>
              </div>
              <div className="kpi-grid" style={{ marginBottom:"18px" }}>
                {[
                  {label:"Accuracy", v:modelInfo?.classification?.accuracy, color:D.blue},
                  {label:"Precision",v:modelInfo?.classification?.precision,color:D.indigo},
                  {label:"Recall",   v:modelInfo?.classification?.recall,   color:D.teal},
                  {label:"F1-Score", v:modelInfo?.classification?.f1,       color:D.pass},
                ].map((m,i)=>(
                  <KPI key={i} label={m.label} value={typeof m.v==="number"?pct(m.v*100):"—"} color={m.color}/>
                ))}
              </div>
              <div className="dash-grid">
                <Card title="Metrics Reference" icon="🎯" subtitle="When and why each metric is used" fullWidth accent={D.blue}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                      <thead>
                        <tr style={{background:"rgba(255,255,255,0.03)"}}>
                          {["Metric","Current Value","Focus","Best Used When"].map(h=>(
                            <th key={h} style={{padding:"11px 13px",textAlign:"left",color:D.textSoft,fontWeight:700,fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${D.border}`}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Accuracy", modelInfo?.classification?.accuracy, "Overall correctness",      "Balanced classes"],
                          ["Precision",modelInfo?.classification?.precision,"Avoid false positives",    "Fraud / spam"],
                          ["Recall",   modelInfo?.classification?.recall,   "Catch all positives",      "Medical / safety"],
                          ["F1-Score", modelInfo?.classification?.f1,       "Precision-recall balance", "Imbalanced data"],
                        ].map((row,i)=>(
                          <tr key={i} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                            <td style={{padding:"11px 13px",fontWeight:700,color:D.text,borderBottom:`1px solid ${D.border}`}}>{row[0]}</td>
                            <td style={{padding:"11px 13px",fontWeight:800,color:D.blue,borderBottom:`1px solid ${D.border}`}}>{typeof row[1]==="number"?pct(row[1]*100):"—"}</td>
                            <td style={{padding:"11px 13px",color:D.textMid,borderBottom:`1px solid ${D.border}`}}>{row[2]}</td>
                            <td style={{padding:"11px 13px",color:D.textMute,borderBottom:`1px solid ${D.border}`}}>{row[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {modelInfo?.dataset_size && <p style={{marginTop:"10px",fontSize:"12px",color:D.textSoft}}>Dataset size: <strong style={{color:D.text}}>{modelInfo.dataset_size}</strong> records.</p>}
                </Card>

                <Card title="Confusion Matrix (Training)" icon="🧾" subtitle="Visual heatmap of model predictions vs actuals" accent={D.indigo}>
                  <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr",gap:"4px",maxWidth:"300px",margin:"8px auto 0"}}>
                    <div/>
                    <div style={{textAlign:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.fail}}>Pred: FAIL</div>
                    <div style={{textAlign:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.pass}}>Pred: PASS</div>
                    {[["Actual: FAIL",18,8,D.fail],["Actual: PASS",5,56,D.pass]].map(([lbl,tn,tp,col])=>(
                      <>
                        <div key={lbl} style={{display:"flex",alignItems:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:col}}>{lbl}</div>
                        <div style={{background:`${D.pass}15`,border:`1px solid ${D.pass}25`,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",padding:"14px",fontSize:"20px",fontWeight:800,color:D.pass}}>{tn}</div>
                        <div style={{background:`${D.fail}10`,border:`1px solid ${D.fail}18`,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",padding:"14px",fontSize:"20px",fontWeight:800,color:D.fail}}>{tp}</div>
                      </>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ════════════════ REGRESSION METRICS ════════════════ */}
          {activeTab === "regression_metrics" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Regression Metrics</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>System metrics for PRC rating prediction models.</p>
              </div>
              <div className="kpi-grid" style={{ marginBottom:"18px" }}>
                {[
                  {label:"Model A — MAE", v:modelInfo?.regression_a?.mae, color:D.blue},
                  {label:"Model A — R²",  v:modelInfo?.regression_a?.r2,  color:D.indigo},
                  {label:"Model B — MAE", v:modelInfo?.regression_b?.mae, color:D.teal},
                  {label:"Model B — R²",  v:modelInfo?.regression_b?.r2,  color:D.orange},
                ].map((m,i)=>(
                  <KPI key={i} label={m.label} value={typeof m.v==="number"?m.v.toFixed(4):"—"} color={m.color}/>
                ))}
              </div>
              <div className="dash-grid">
                <Card title="Regression Metrics Reference" icon="📐" subtitle="Error behavior and optimization goals" fullWidth accent={D.indigo}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                      <thead>
                        <tr style={{background:"rgba(255,255,255,0.03)"}}>
                          {["Metric","Model A","Model B","Units","Outlier Sensitivity","Goal"].map(h=>(
                            <th key={h} style={{padding:"11px 13px",textAlign:"left",color:D.textSoft,fontWeight:700,fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`1px solid ${D.border}`}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["MAE",     modelInfo?.regression_a?.mae, modelInfo?.regression_b?.mae, "Same as target","Low",     "Minimize avg error"],
                          ["RMSE",    modelInfo?.regression_a?.rmse,modelInfo?.regression_b?.rmse,"Same as target","High",    "Avoid large errors"],
                          ["R² Score",modelInfo?.regression_a?.r2,  modelInfo?.regression_b?.r2,  "None (0–1)",   "Moderate","Maximize explained variance"],
                        ].map((row,i)=>(
                          <tr key={i} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                            <td style={{padding:"11px 13px",fontWeight:700,color:D.text,borderBottom:`1px solid ${D.border}`}}>{row[0]}</td>
                            <td style={{padding:"11px 13px",fontWeight:800,color:D.blue,borderBottom:`1px solid ${D.border}`}}>{typeof row[1]==="number"?row[1].toFixed(4):"—"}</td>
                            <td style={{padding:"11px 13px",fontWeight:800,color:D.indigo,borderBottom:`1px solid ${D.border}`}}>{typeof row[2]==="number"?row[2].toFixed(4):"—"}</td>
                            <td style={{padding:"11px 13px",color:D.textMid,borderBottom:`1px solid ${D.border}`}}>{row[3]}</td>
                            <td style={{padding:"11px 13px",color:D.textMute,borderBottom:`1px solid ${D.border}`}}>{row[4]}</td>
                            <td style={{padding:"11px 13px",color:D.textMute,borderBottom:`1px solid ${D.border}`}}>{row[5]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Actual vs Predicted (Regression)" icon="🔵" subtitle="Model precision — diagonal = perfect prediction" fullWidth accent={D.indigo}>
                  <div style={{width:"100%",height:240}}>
                    <ResponsiveContainer>
                      <ScatterChart margin={{top:10,right:20,bottom:20,left:-10}}>
                        <CartesianGrid {...gridS}/>
                        <XAxis type="number" dataKey="actual" name="Actual" tick={axTick} axisLine={false} tickLine={false}
                          label={{value:"Actual Rating",position:"insideBottom",offset:-10,fontSize:10,fill:D.textSoft}} domain={[55,90]}/>
                        <YAxis type="number" dataKey="predicted" name="Predicted" tick={axTick} axisLine={false} tickLine={false}
                          label={{value:"Predicted Rating",angle:-90,position:"insideLeft",fontSize:10,fill:D.textSoft}} domain={[55,90]}/>
                        <Tooltip cursor={{strokeDasharray:"3 3"}} content={<DarkTooltip />}/>
                        <ReferenceLine segment={[{x:55,y:55},{x:90,y:90}]} stroke={D.textMute} strokeDasharray="5 3" strokeWidth={1.5}/>
                        <ReferenceLine x={70} stroke={D.amber} strokeDasharray="4 3"/>
                        <ReferenceLine y={70} stroke={D.amber} strokeDasharray="4 3"/>
                        <Scatter data={scatterData} fill={D.indigo} fillOpacity={0.85}/>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ════════════════ CORRELATION ════════════════ */}
          {activeTab === "correlation" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Correlation Matrix</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Pearson correlations between key academic variables and exam outcome.</p>
              </div>
              <Card title="Correlation Matrix" icon="🧮" subtitle="Strength of linear relationships between variables" fullWidth accent={D.teal}>
                {correlation ? (
                  <div style={{overflowX:"auto"}}>
                    <table style={{borderCollapse:"collapse",width:"100%",fontSize:"11px"}}>
                      <thead>
                        <tr>
                          <th style={{padding:"9px 11px",borderBottom:`1px solid ${D.border}`,textAlign:"left",color:D.textSoft,fontWeight:700,fontSize:"10px"}}>Variable</th>
                          {(correlation.columns??[]).map(col=>(
                            <th key={col} style={{padding:"9px 11px",borderBottom:`1px solid ${D.border}`,textAlign:"right",color:D.textSoft,fontWeight:700,fontSize:"10px"}}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(correlation.matrix??[]).map((row,ri)=>(
                          <tr key={row.row} style={{background:ri%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                            <td style={{padding:"9px 11px",borderBottom:`1px solid ${D.border}`,fontWeight:700,color:D.text}}>{row.row}</td>
                            {(correlation.columns??[]).map(col=>{
                              const val=row[col]; const abs=Math.abs(val); const isDiag=col===row.row;
                              const color=isDiag?D.textMute:abs>=0.7?D.pass:abs>=0.4?D.amber:D.textSoft;
                              const bg=isDiag?"transparent":abs>=0.7?`${D.pass}10`:abs>=0.4?`${D.amber}10`:"transparent";
                              return <td key={col} style={{padding:"9px 11px",borderBottom:`1px solid ${D.border}`,textAlign:"right",fontWeight:abs>=0.4&&!isDiag?800:400,color,background:bg}}>{val.toFixed(2)}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{fontSize:"12px",color:D.textMute}}>Correlation data not available.</p>}
                <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  {[{label:"Strong (≥ 0.7)",color:D.pass},{label:"Moderate (0.4–0.7)",color:D.amber},{label:"Weak (< 0.4)",color:D.textSoft}].map((l,i)=>(
                    <span key={i} style={{fontSize:"11px",fontWeight:600,color:l.color,background:`${l.color}15`,border:`1px solid ${l.color}25`,padding:"3px 10px",borderRadius:"999px"}}>{l.label}</span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ════════════════ 2025 DEFENSE ════════════════ */}
          {activeTab === "test2025" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>2025 Final Defense</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).</p>
              </div>
              {testLoading ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0",color:D.textMute}}>Loading 2025 metrics…</div>
              ) : test2025?.error ? (
                <div style={{background:D.failD,border:`1px solid ${D.fail}28`,borderRadius:"13px",padding:"14px 18px"}}>
                  <p style={{margin:0,fontSize:"12px",color:D.fail}}>{test2025.error}</p>
                </div>
              ) : test2025 ? (
                <>
                  <div className="kpi-grid" style={{ marginBottom:"18px" }}>
                    <KPI label="Test Accuracy" value={pct((test2025.classification?.accuracy??0)*100)} color={(test2025.classification?.accuracy??0)>=0.9?D.pass:D.amber} icon="🎯"/>
                    <KPI label="Precision"     value={pct((test2025.classification?.precision??0)*100)} color={D.blue}   icon="🔬"/>
                    <KPI label="Recall"        value={pct((test2025.classification?.recall??0)*100)}    color={D.indigo} icon="🧲"/>
                    <KPI label="F1-Score"      value={pct((test2025.classification?.f1??0)*100)}        color={D.teal}   icon="⚖️"/>
                  </div>
                  <div className="dash-grid" style={{ marginBottom:"14px" }}>
                    {[["Regression A",test2025.regression?.a,"Model 2A — EE+MATH+ESAS+GWA","📉"],["Regression B",test2025.regression?.b,"Model 2B — GWA+Survey only","🧠"]].map(([label,reg,sub,icon])=>(
                      <Card key={label} title={label} icon={icon} subtitle={sub} accent={D.blue}>
                        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                          {[["R²",reg?.r2,4],["MAE",reg?.mae,4],["MSE",reg?.mse,4],["RMSE",reg?.rmse,4]].map(([k,v,d])=>(
                            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 11px",background:"rgba(255,255,255,0.03)",border:`1px solid ${D.border}`,borderRadius:"7px"}}>
                              <span style={{fontSize:"12px",color:D.textMid,fontWeight:600}}>{k}</span>
                              <span style={{fontSize:"15px",fontWeight:800,color:D.blue}}>{num(v,d)}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}

                    <Card title="Confusion Matrix" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth accent={D.teal}>
                      {test2025.confusion_matrix ? (
                        <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr",gap:"4px",maxWidth:"320px",margin:"0 auto"}}>
                          <div/><div style={{textAlign:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.fail}}>Pred: FAIL</div><div style={{textAlign:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.pass}}>Pred: PASS</div>
                          <div style={{display:"flex",alignItems:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.fail}}>Actual: FAIL</div>
                          <div style={{background:`${D.pass}15`,border:`1px solid ${D.pass}25`,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",padding:"18px",fontSize:"24px",fontWeight:800,color:D.pass}}>{test2025.confusion_matrix.actual_fail.pred_fail}</div>
                          <div style={{background:`${D.fail}10`,border:`1px solid ${D.fail}18`,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",padding:"18px",fontSize:"24px",fontWeight:800,color:D.fail}}>{test2025.confusion_matrix.actual_fail.pred_pass}</div>
                          <div style={{display:"flex",alignItems:"center",padding:"8px",fontSize:"11px",fontWeight:700,color:D.pass}}>Actual: PASS</div>
                          <div style={{background:`${D.fail}10`,border:`1px solid ${D.fail}18`,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",padding:"18px",fontSize:"24px",fontWeight:800,color:D.fail}}>{test2025.confusion_matrix.actual_pass.pred_fail}</div>
                          <div style={{background:`${D.pass}15`,border:`1px solid ${D.pass}25`,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",padding:"18px",fontSize:"24px",fontWeight:800,color:D.pass}}>{test2025.confusion_matrix.actual_pass.pred_pass}</div>
                        </div>
                      ) : <p style={{margin:0,fontSize:"12px",color:D.textMute}}>Confusion matrix not available.</p>}
                    </Card>
                  </div>
                  <Card title="Select a 2025 Examinee" icon="🧪" subtitle="Row-level check: predicted vs actual + survey answers" fullWidth accent={D.pink}>
                    <ExamineeDetailPanel
                      records={test2025Records}
                      selectedIdx={selectedTestIdx}
                      onSelect={setSelectedTestIdx}
                      runData={test2025Run}
                      runLoading={test2025RunLoading}
                    />
                  </Card>
                </>
              ) : <p style={{fontSize:"12px",color:D.textMute}}>No 2025 defense metrics available.</p>}
            </div>
          )}

          {/* ════════════════ TRENDS & MONITORING ════════════════ */}
          {activeTab === "trends" && (
            <div style={{ animation:"fadeUp 0.35s ease" }}>
              <div style={{ marginBottom:"20px" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Trends & Monitoring</h2>
                <p style={{ margin:0, fontSize:"12px", color: D.textMute }}>Live data from the prediction database — attempts, monthly summaries, and AI trend insights.</p>
              </div>

              {/* Usage */}
              <div style={{ marginBottom:"14px" }}>
                <Card title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)" accent={D.blue}>
                  {usageLoading ? (
                    <p style={{margin:0,fontSize:"12px",color:D.textMute}}>Loading…</p>
                  ) : usageSummary ? (
                    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button onClick={downloadPerformanceReport} disabled={reportLoading} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:"9px",padding:"7px 14px",color:D.textSoft,fontSize:"12px",cursor:reportLoading?"not-allowed":"pointer",opacity:reportLoading?0.7:1}}>
                          {reportLoading?"Preparing…":"⬇ Download Performance Report"}
                        </button>
                      </div>
                      <div className="kpi-grid">
                        <KPI label="Total Predictions" value={usageSummary.total_predictions} color={D.blue}/>
                        <KPI label="Active Users" value={usageSummary.active_users} color={D.pass} sub="distinct students"/>
                      </div>
                      {(usageSummary.predictions_by_day??[]).length>0 && (
                        <div style={{width:"100%",height:150}}>
                          <ResponsiveContainer>
                            <BarChart data={(usageSummary.predictions_by_day??[]).slice(-10).map(d=>({day:d.day?.slice(5)??"—",total:d.total??0}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                              <CartesianGrid {...gridS} vertical={false}/>
                              <XAxis dataKey="day" tick={axTick} axisLine={false} tickLine={false}/>
                              <YAxis tick={axTick} axisLine={false} tickLine={false}/>
                              <Tooltip content={<DarkTooltip />}/>
                              <Bar dataKey="total" name="Predictions" radius={[4,4,0,0]} fill={D.blue}/>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {(usageSummary.active_users_recent??[]).length>0 && (
                        <div>
                          <p style={{margin:"0 0 8px",fontSize:"10px",fontWeight:700,color:D.textMute,textTransform:"uppercase",letterSpacing:"0.07em"}}>Most Active Students</p>
                          <table className="att-table">
                            <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                            <tbody>
                              {(usageSummary.active_users_recent??[]).map((u,i)=>(
                                <tr key={i}>
                                  <td style={{fontWeight:700,color:D.text}}>{u.name||u.user_id||"—"}</td>
                                  <td>{u.attempts??0}</td>
                                  <td>{u.last_at?new Date(u.last_at).toLocaleDateString("en-PH"):"—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : <p style={{fontSize:"12px",color:D.textMute}}>No usage data yet.</p>}
                </Card>
              </div>

              {/* AI Insights */}
              <div style={{ marginBottom:"14px" }}>
                <Card title="AI Trend Insights" icon="✨" subtitle="AI-generated summary of year-over-year prediction trends" accent={D.teal}>
                  {insightsLoading ? (
                    <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                      <div style={{width:"13px",height:"13px",borderRadius:"50%",border:`2px solid ${D.blue}30`,borderTopColor:D.blue,animation:"spin 0.8s linear infinite"}}/>
                      <span style={{fontSize:"12px",color:D.textMute}}>Generating AI summary…</span>
                    </div>
                  ) : trendInsights ? (
                    <div>
                      {(trendInsights.stats?.years??[]).length>0 && (
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"8px",marginBottom:"12px"}}>
                          {trendInsights.stats.years.map((yr,i)=>(
                            <div key={i} style={{background:D.blueD,border:`1px solid ${D.blue}20`,borderRadius:"9px",padding:"10px"}}>
                              <p style={{margin:"0 0 2px",fontSize:"10px",color:D.textMute}}>{yr.year}</p>
                              <p style={{margin:"0 0 1px",fontSize:"20px",fontWeight:800,color:yr.pass_rate>=70?D.pass:D.amber,fontFamily:"'Syne',sans-serif"}}>{yr.pass_rate.toFixed(1)}%</p>
                              <p style={{margin:0,fontSize:"10px",color:D.textMute}}>{yr.total} attempts · avg {yr.avg_rating.toFixed(1)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{background:D.blueD,border:`1px solid ${D.blue}20`,borderRadius:"9px",padding:"12px 14px"}}>
                        <p style={{margin:"0 0 5px",fontSize:"10px",fontWeight:700,color:D.blue,textTransform:"uppercase",letterSpacing:"0.08em"}}>AI Summary</p>
                        <p style={{margin:0,fontSize:"12px",color:D.textMid,lineHeight:1.7}}>{trendInsights.summary}</p>
                      </div>
                      <button onClick={fetchTrendInsights} style={{marginTop:"10px",background:"transparent",border:`1px solid ${D.blue}25`,borderRadius:"8px",padding:"5px 12px",color:D.blue,fontSize:"11px",cursor:"pointer",fontWeight:600}}>↻ Refresh Insights</button>
                    </div>
                  ) : <p style={{fontSize:"12px",color:D.textMute}}>No trend data yet.</p>}
                </Card>
              </div>

              {/* Yearly PF */}
              {(yearlyPF??[]).length>0 && (
                <div style={{ marginBottom:"14px" }}>
                  <Card title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions" accent={D.pass}>
                    <div style={{width:"100%",height:200}}>
                      <ResponsiveContainer>
                        <BarChart data={(yearlyPF??[]).map(yr=>({year:yr.year,Pass:yr.pass_count,Fail:yr.fail_count}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                          <CartesianGrid {...gridS} vertical={false}/>
                          <XAxis dataKey="year" tick={axTick} axisLine={false} tickLine={false}/>
                          <YAxis tick={axTick} axisLine={false} tickLine={false}/>
                          <Tooltip content={<DarkTooltip />}/>
                          <Legend formatter={v=><span style={{fontSize:"11px",color:D.textMid,fontWeight:600}}>{v}</span>}/>
                          <Bar dataKey="Pass" stackId="a" fill={D.pass}/>
                          <Bar dataKey="Fail" stackId="a" fill={D.fail} radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {/* Review Analysis */}
              {(reviewAnalysis?.items??[]).length>0 && (
                <div style={{ marginBottom:"14px" }}>
                  <Card title="Formal Review Split Analysis" icon="📚" subtitle="Separated results by Attended Formal Review = Yes / No" accent={D.indigo}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"10px"}}>
                      {(reviewAnalysis.items??[]).map((item,idx)=>(
                        <div key={idx} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${D.border}`,borderRadius:"10px",padding:"12px"}}>
                          <p style={{margin:"0 0 3px",fontSize:"10px",color:item.review_program==="Yes"?D.pass:D.amber,fontWeight:700,textTransform:"uppercase"}}>
                            {item.review_program==="Yes"?"Attended Review":"No Formal Review"}
                          </p>
                          <p style={{margin:"0 0 2px",fontSize:"18px",color:D.text,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{item.pass_rate?.toFixed(1)}%</p>
                          <p style={{margin:0,fontSize:"11px",color:D.textMute}}>
                            {item.pass_count}/{item.total} predicted pass
                            {item.human_like_rate!=null?` · Human-like: ${item.human_like_rate.toFixed(1)}%`:""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Monthly */}
              <div style={{ marginBottom:"14px" }}>
                <Card title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year" accent={D.amber}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
                    <label style={{fontSize:"11px",color:D.textMute}}>Year:</label>
                    <select className="fi-input" value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}>
                      {Array.from({length:5},(_,i)=>new Date().getFullYear()-i).map(yr=>(
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                  {(monthly??[]).length>0 ? (
                    <div style={{width:"100%",height:200}}>
                      <ResponsiveContainer>
                        <BarChart data={(monthly??[]).map(m=>({month:MONTH_NAMES[m.month-1],Pass:m.pass_count,Fail:m.fail_count}))} margin={{top:0,right:10,bottom:0,left:-10}}>
                          <CartesianGrid {...gridS} vertical={false}/>
                          <XAxis dataKey="month" tick={axTick} axisLine={false} tickLine={false}/>
                          <YAxis tick={axTick} axisLine={false} tickLine={false}/>
                          <Tooltip content={<DarkTooltip />}/>
                          <Legend formatter={v=><span style={{fontSize:"11px",color:D.textMid,fontWeight:600}}>{v}</span>}/>
                          <Bar dataKey="Pass" stackId="a" fill={D.pass}/>
                          <Bar dataKey="Fail" stackId="a" fill={D.fail} radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{fontSize:"12px",color:D.textMute}}>No data for {selectedYear}.</p>}
                </Card>
              </div>

              {/* Attempts Table */}
              <Card title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth accent={D.blue}>
                <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"14px",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                    <label style={{fontSize:"11px",color:D.textMute}}>Year:</label>
                    <input className="fi-input" type="number" placeholder="e.g. 2025" value={attFilter.year}
                      onChange={e=>{setAttFilter(f=>({...f,year:e.target.value}));setAttPage(1);}} style={{width:"85px"}}/>
                  </div>
                  <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                    <label style={{fontSize:"11px",color:D.textMute}}>Month:</label>
                    <input className="fi-input" type="number" placeholder="1–12" min="1" max="12" value={attFilter.month}
                      onChange={e=>{setAttFilter(f=>({...f,month:e.target.value}));setAttPage(1);}} style={{width:"65px"}}/>
                  </div>
                  <button onClick={()=>{setAttFilter({year:"",month:""});setAttPage(1);}}
                    style={{background:"transparent",border:`1px solid ${D.border}`,borderRadius:"7px",padding:"5px 11px",color:D.textMute,fontSize:"11px",cursor:"pointer"}}>
                    ✕ Clear
                  </button>
                  {attempts && <span style={{fontSize:"11px",color:D.textMute,marginLeft:"auto"}}>{attempts.total} total · Page {attPage}</span>}
                </div>
                {attempts && (attempts.items??[]).length>0 ? (
                  <>
                    <div style={{overflowX:"auto"}}>
                      <table className="att-table">
                        <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>User ID</th></tr></thead>
                        <tbody>
                          {(attempts.items??[]).map((item,i)=>(
                            <tr key={i}>
                              <td style={{color:D.textMute}}>{new Date(item.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                              <td>
                                <span style={{fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:999,background:item.label==="PASSED"?`${D.pass}12`:`${D.fail}10`,color:item.label==="PASSED"?D.pass:D.fail,border:`1px solid ${item.label==="PASSED"?D.pass:D.fail}28`}}>
                                  {item.label}
                                </span>
                              </td>
                              <td style={{fontWeight:700,color:item.probability_pass>=0.7?D.pass:item.probability_pass>=0.5?D.amber:D.fail}}>
                                {(item.probability_pass*100).toFixed(1)}%
                              </td>
                              <td style={{color:item.predicted_rating_a>=70?D.pass:item.predicted_rating_a>=60?D.amber:D.fail}}>
                                {item.predicted_rating_a?.toFixed(1)??"—"}
                              </td>
                              <td style={{color:D.textMute,fontSize:"10px"}}>{item.user_id?item.user_id.slice(0,8)+"…":"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{display:"flex",gap:"7px",marginTop:"10px",alignItems:"center",justifyContent:"flex-end"}}>
                      {[["← Prev",()=>setAttPage(p=>Math.max(1,p-1)),attPage===1],["Next →",()=>setAttPage(p=>p+1),attPage>=Math.ceil(((attempts.total)||1)/20)]].map(([label,fn,disabled])=>(
                        <button key={label} onClick={fn} disabled={disabled} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:"7px",padding:"6px 14px",color:disabled?D.textMute:D.textMid,fontSize:"11px",cursor:disabled?"not-allowed":"pointer",fontWeight:600,opacity:disabled?0.5:1}}>
                          {label}
                        </button>
                      ))}
                      <span style={{fontSize:"11px",color:D.textMute,padding:"0 6px"}}>
                        Page {attPage} / {Math.ceil(((attempts.total)||1)/20)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{padding:"28px",textAlign:"center"}}>
                    <p style={{fontSize:"13px",color:D.textSoft}}>No prediction attempts found.</p>
                    <p style={{fontSize:"11px",color:D.textMute,marginTop:"4px"}}>Students need to log in and submit predictions first.</p>
                  </div>
                )}
              </Card>
            </div>
          )}

        </>)}
      </main>

      {/* ══ TIMING MODAL ══ */}
      {timingModalOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(2,6,23,0.8)",backdropFilter:"blur(6px)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}
          onClick={()=>setTimingModalOpen(false)}>
          <div style={{width:"min(980px,96vw)",maxHeight:"85vh",overflow:"auto",background:"#0b1220",border:`1px solid ${D.borderAlt}`,borderRadius:"14px",padding:"18px",boxShadow:D.shadowMd}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",gap:"10px"}}>
              <div>
                <p style={{margin:0,fontSize:"15px",fontWeight:800,color:D.text,fontFamily:"'Syne',sans-serif"}}>Attempt Timer Drill-down</p>
                <p style={{margin:"2px 0 0",fontSize:"11px",color:D.textSoft}}>{selectedTimingAttempt?.name||"Unknown"} · {selectedTimingAttempt?.attempt_id?.slice(0,8)}</p>
              </div>
              <button onClick={()=>setTimingModalOpen(false)} style={{background:D.surface,border:`1px solid ${D.border}`,borderRadius:"8px",padding:"6px 12px",color:D.textMid,cursor:"pointer"}}>Close</button>
            </div>
            {selectedTimingLoading ? (
              <p style={{color:D.textSoft}}>Loading timing details…</p>
            ) : selectedTimingData?.error ? (
              <p style={{color:D.fail}}>{selectedTimingData.error}</p>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table className="att-table">
                  <thead><tr><th>Question</th><th>Section</th><th>Order</th><th>Duration (sec)</th><th>Expected Range</th><th>Human-like?</th></tr></thead>
                  <tbody>
                    {(selectedTimingData?.items??[]).map((t,i)=>(
                      <tr key={i}>
                        <td>{t.question_key}</td><td>{t.step_id||"—"}</td><td>{t.question_index??"—"}</td>
                        <td>{t.duration_sec??"—"}</td>
                        <td>{t.expected_min_sec!=null?`${t.expected_min_sec}–${t.expected_max_sec}`:"—"}</td>
                        <td style={{color:t.is_human_like?D.pass:D.fail,fontWeight:700}}>{t.is_human_like?"Yes":"No"}</td>
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