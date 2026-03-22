import { useState, useEffect, useCallback, useMemo } from "react";
// NOTE: ExamineeDetailPanel and API_BASE_URL are imported from your existing project
// import ExamineeDetailPanel from "./ExamineeDetailPanel";
// import API_BASE_URL from "../apiBase";
const API_BASE_URL = "http://localhost:5000"; // placeholder

import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label,
} from "recharts";

// ─────────────────────────────────────────────
// DESIGN TOKENS — Light Academic Palette
// ─────────────────────────────────────────────
const T = {
  bg:        "#f0f4fa",
  surface:   "#ffffff",
  surfaceAlt:"#f8fafd",
  border:    "#dde3f0",
  borderMid: "#c8d2e8",
  text:      "#1e293b",
  textMid:   "#475569",
  textSoft:  "#94a3b8",
  blue:      "#2563eb",
  blueSoft:  "#eff6ff",
  blueLight: "#bfdbfe",
  indigo:    "#4f46e5",
  teal:      "#0d9488",
  pass:      "#059669",
  passSoft:  "#ecfdf5",
  passLight: "#a7f3d0",
  fail:      "#dc2626",
  failSoft:  "#fef2f2",
  failLight: "#fecaca",
  amber:     "#d97706",
  amberSoft: "#fffbeb",
  amberLight:"#fde68a",
  purple:    "#7c3aed",
  purpleSoft:"#f5f3ff",
  orange:    "#ea580c",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function pct(v) { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
function buildMockData() {
  return {
    overview: {
      total_students: 87, total_passers: 61, total_failers: 26,
      overall_pass_rate: 70.1, avg_gwa_passers: 1.82, avg_gwa_failers: 2.41,
      avg_rating_passers: 78.4, avg_rating_failers: 63.1, passing_score: 70,
    },
    pass_rate_by_year: [
      { label: "2021", pass_rate: 62.5, total: 24 },
      { label: "2022", pass_rate: 68.0, total: 25 },
      { label: "2023", pass_rate: 71.4, total: 28 },
      { label: "2024", pass_rate: 80.0, total: 10 },
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
    // Scatter data for actual vs predicted
    scatter_data: [
      { actual: 55, predicted: 58 }, { actual: 60, predicted: 62 }, { actual: 72, predicted: 70 },
      { actual: 78, predicted: 75 }, { actual: 85, predicted: 83 }, { actual: 65, predicted: 67 },
      { actual: 90, predicted: 88 }, { actual: 48, predicted: 52 }, { actual: 74, predicted: 76 },
      { actual: 82, predicted: 80 }, { actual: 69, predicted: 71 }, { actual: 58, predicted: 55 },
      { actual: 76, predicted: 78 }, { actual: 93, predicted: 91 }, { actual: 61, predicted: 63 },
      { actual: 88, predicted: 85 }, { actual: 53, predicted: 56 }, { actual: 79, predicted: 77 },
    ],
  };
}

// ─────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────

function MetricCard({ label, value, sub, color = T.blue, icon, trend }) {
  const bg = color === T.pass ? T.passSoft : color === T.fail ? T.failSoft : color === T.amber ? T.amberSoft : T.blueSoft;
  const border = color === T.pass ? T.passLight : color === T.fail ? T.failLight : color === T.amber ? T.amberLight : T.blueLight;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "20px 22px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ margin: "5px 0 0", fontSize: 12, color: T.textSoft }}>{sub}</p>}
          {trend !== undefined && (
            <p style={{ margin: "5px 0 0", fontSize: 12, color: trend > 0 ? T.pass : trend < 0 ? T.fail : T.textSoft, fontWeight: 600 }}>
              {trend > 0 ? `▲ +${trend}%` : trend < 0 ? `▼ ${trend}%` : "— No change"}
            </p>
          )}
        </div>
        {icon && (
          <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartContainer({ title, subtitle, children, action }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "22px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Syne', sans-serif" }}>{title}</p>
          {subtitle && <p style={{ margin: 0, fontSize: 12, color: T.textSoft }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InsightBox({ items = [] }) {
  if (!items.length) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
      border: `1px solid ${T.blueLight}`,
      borderRadius: 14, padding: "16px 20px",
    }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        ✦ AI Insights
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon || "💡"}</span>
            <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.55 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({ filters, onChange }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "16px 20px",
      display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div>
        <label style={{ display: "block", fontSize: 11, color: T.textSoft, marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Year</label>
        <select value={filters.year} onChange={e => onChange({ ...filters, year: e.target.value })} style={selectStyle}>
          <option value="">All Years</option>
          {["2021","2022","2023","2024","2025"].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, color: T.textSoft, marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Month</label>
        <select value={filters.month} onChange={e => onChange({ ...filters, month: e.target.value })} style={selectStyle}>
          <option value="">All Months</option>
          {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, color: T.textSoft, marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</label>
        <select value={filters.subject} onChange={e => onChange({ ...filters, subject: e.target.value })} style={selectStyle}>
          <option value="">All Subjects</option>
          {["Math","EE","ESAS","GWA"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, color: T.textSoft, marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Formal Review</label>
        <div style={{ display: "flex", gap: 0, border: `1px solid ${T.border}`, borderRadius: 9, overflow: "hidden" }}>
          {["All","Yes","No"].map(v => (
            <button key={v} onClick={() => onChange({ ...filters, reviewAttended: v })} style={{
              padding: "8px 14px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              background: filters.reviewAttended === v ? T.blue : T.surface,
              color: filters.reviewAttended === v ? "#fff" : T.textMid,
              transition: "all 0.15s",
            }}>{v}</button>
          ))}
        </div>
      </div>
      <button onClick={() => onChange({ year: "", month: "", subject: "", reviewAttended: "All" })} style={{
        background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 16px",
        fontSize: 12, color: T.textMid, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: "all 0.15s",
        alignSelf: "flex-end",
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.border}
        onMouseLeave={e => e.currentTarget.style.background = T.surfaceAlt}
      >↺ Reset</button>
    </div>
  );
}

const selectStyle = {
  background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 9,
  padding: "8px 12px", fontSize: 13, color: T.text, fontFamily: "'DM Sans', sans-serif",
  outline: "none", cursor: "pointer", minWidth: 130,
};

// Custom Recharts tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12, color: T.text }}>
      {label && <p style={{ margin: "0 0 6px", fontWeight: 700, color: T.text }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || T.blue }}>
          <span style={{ fontWeight: 600 }}>{p.name}: </span>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// DELTA BADGE
// ─────────────────────────────────────────────
function Delta({ value }) {
  if (value === undefined || value === null) return null;
  const up = value > 0, zero = value === 0;
  const color = zero ? T.textSoft : up ? T.pass : T.fail;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: up ? T.passSoft : zero ? "#f8fafc" : T.failSoft, border: `1px solid ${up ? T.passLight : zero ? T.border : T.failLight}`, borderRadius: 999, padding: "2px 7px", marginLeft: 6 }}>
      {zero ? "—" : up ? `▲ +${value}` : `▼ ${value}`}
    </span>
  );
}

// ─────────────────────────────────────────────
// SECTION DIVIDER
// ─────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>{title}</h2>
      {subtitle && <p style={{ margin: 0, fontSize: 14, color: T.textSoft }}>{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFUSION MATRIX VISUAL
// ─────────────────────────────────────────────
function ConfusionMatrixViz({ matrix }) {
  if (!matrix) return <p style={{ color: T.textSoft, fontSize: 13 }}>No matrix data.</p>;
  const cells = [
    { label: "True Negative", sub: "Actual Fail → Pred. Fail", value: matrix.actual_fail?.pred_fail ?? 0, color: T.pass },
    { label: "False Positive", sub: "Actual Fail → Pred. Pass", value: matrix.actual_fail?.pred_pass ?? 0, color: T.fail },
    { label: "False Negative", sub: "Actual Pass → Pred. Fail", value: matrix.actual_pass?.pred_fail ?? 0, color: T.fail },
    { label: "True Positive", sub: "Actual Pass → Pred. Pass", value: matrix.actual_pass?.pred_pass ?? 0, color: T.pass },
  ];
  const maxV = Math.max(...cells.map(c => c.value), 1);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cells.map((cell, i) => (
          <div key={i} style={{
            background: cell.color === T.pass ? T.passSoft : T.failSoft,
            border: `1px solid ${cell.color === T.pass ? T.passLight : T.failLight}`,
            borderRadius: 12, padding: "16px 18px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: T.textSoft, fontWeight: 600 }}>{cell.label}</p>
            <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: cell.color, fontFamily: "'Syne', sans-serif" }}>{cell.value}</p>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: T.textSoft }}>{cell.sub}</p>
            <div style={{ height: 5, background: `${cell.color}20`, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(cell.value / maxV) * 100}%`, background: cell.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textSoft }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: T.pass, display: "inline-block" }} /> Correct Prediction
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textSoft }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: T.fail, display: "inline-block" }} /> Wrong Prediction
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ProfessorPage({ onLogout }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [modelInfo, setModelInfo]     = useState(null);
  const [correlation, setCorrelation] = useState(null);

  // Phase 4 state
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

  // Final defense / held-out evaluation (2025)
  const [test2025, setTest2025] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run] = useState(null);
  const [test2025RunLoading, setTest2025RunLoading] = useState(false);

  // New filter state
  const [filters, setFilters] = useState({ year: "", month: "", subject: "", reviewAttended: "All" });

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
      const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      a.href = url; a.download = `performance_report_${selectedYear}_${ts}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Performance report download error:", e);
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
        const payload = await res.json();
        if (!cancelled) setTest2025(payload);
      } catch { if (!cancelled) setTest2025({ error: "Could not load 2025 defense metrics. Run train_model.py first." }); }
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
    if (activeTab !== "test2025") return;
    if (!test2025Records || test2025Records.length === 0) return;
    let cancelled = false;
    (async () => {
      setTest2025RunLoading(true); setTest2025Run(null);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-predict?idx=${selectedTestIdx}`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) setTest2025Run(payload.error ? { error: payload.error } : payload);
      } catch { if (!cancelled) setTest2025Run({ error: "Could not load prediction for this row." }); }
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

  const TABS = [
    { id: "overview",               label: "Overview",            icon: "📊" },
    { id: "performance",            label: "Performance",         icon: "📈" },
    { id: "prediction",             label: "Prediction Analysis", icon: "🎯" },
    { id: "features",               label: "Feature Importance",  icon: "🤖" },
    { id: "curriculum",             label: "Curriculum Gaps",     icon: "🏫" },
    { id: "classification_metrics", label: "Classification",      icon: "⚖️" },
    { id: "regression_metrics",     label: "Regression",          icon: "📐" },
    { id: "correlation",            label: "Correlation",         icon: "🧮" },
    { id: "test2025",               label: "2025 Defense",        icon: "🧪" },
    { id: "trends",                 label: "Trends",              icon: "📅" },
  ];

  const ov              = data?.overview ?? {};
  const passByYear      = data?.pass_rate_by_year     ?? [];
  const passByStrand    = data?.pass_rate_by_strand   ?? [];
  const passByReview    = data?.pass_rate_by_review   ?? [];
  const passByDuration  = data?.pass_rate_by_duration ?? [];
  const featureImp      = data?.feature_importance    ?? [];
  const sectionScores   = data?.section_scores        ?? [];
  const weakestQ        = data?.weakest_questions     ?? [];
  const subjectTrends   = data?.subject_trends_by_year ?? [];
  const scatterData     = data?.scatter_data ?? [];

  // Filter pass_rate_by_review based on reviewAttended toggle
  const filteredPassByReview = useMemo(() => {
    if (filters.reviewAttended === "All") return passByReview;
    if (filters.reviewAttended === "Yes") return passByReview.filter(x => x.label.toLowerCase().includes("attended"));
    return passByReview.filter(x => x.label.toLowerCase().includes("no formal"));
  }, [passByReview, filters.reviewAttended]);

  const reviewYesTotal = passByReview.find(x => String(x.label).toLowerCase().includes("attended"))?.total ?? 0;
  const reviewNoTotal  = passByReview.find(x => String(x.label).toLowerCase().includes("no formal"))?.total ?? 0;

  // Pie data for pass/fail
  const pieData = [
    { name: "Passers", value: Number(ov.total_passers || 0) },
    { name: "Failers", value: Number(ov.total_failers || 0) },
  ];
  const COLORS = [T.pass, T.fail];

  // Line chart data from pass_rate_by_year
  const lineData = passByYear.map(d => ({ year: d.label, passRate: d.pass_rate, total: d.total }));

  // Bar data for strands
  const strandBarData = passByStrand.map(d => ({ name: d.label, passRate: d.pass_rate, total: d.total }));

  // Subject line chart data
  const subjectLineData = subjectTrends.map(d => ({ year: String(d.year), EE: d.EE_avg, MATH: d.MATH_avg, ESAS: d.ESAS_avg }));

  // Section scores grouped bar
  const sectionBarData = sectionScores.map(s => ({ name: s.label, Passers: s.pass, Failers: s.fail }));

  // Feature importance bar
  const featureBarData = featureImp.map(f => ({ name: f.label.split(" – ")[0].substring(0, 18), fullLabel: f.label, value: f.value }));

  // Duration bar data
  const durationData = passByDuration.map(d => ({ name: d.label, passRate: d.pass_rate, total: d.total }));

  // Insights generator
  const generateInsights = useCallback(() => {
    const insights = [];
    if (passByYear.length >= 2) {
      const last = passByYear[passByYear.length - 1];
      const prev = passByYear[passByYear.length - 2];
      const diff = (last.pass_rate - prev.pass_rate).toFixed(1);
      insights.push({ icon: diff > 0 ? "📈" : "📉", text: `Passing rate ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff)}% from ${prev.label} to ${last.label}.` });
    }
    if (passByReview.length >= 2) {
      const diff = (passByReview[0].pass_rate - passByReview[1].pass_rate).toFixed(1);
      insights.push({ icon: "📖", text: `Students who attended formal review outperformed those who didn't by ${diff}% in pass rate.` });
    }
    if (subjectTrends.length >= 2) {
      const first = subjectTrends[0], last = subjectTrends[subjectTrends.length - 1];
      const weakest = ["EE","MATH","ESAS"].map(s => ({ s, val: last[`${s}_avg`] })).sort((a,b)=>a.val-b.val)[0];
      if (weakest) insights.push({ icon: "⚠️", text: `Subject ${weakest.s} shows the lowest current average (${weakest.val?.toFixed(1)}) — prioritize review materials.` });
    }
    if (passByStrand.length > 0) {
      const top = [...passByStrand].sort((a,b)=>b.pass_rate-a.pass_rate)[0];
      const low = [...passByStrand].sort((a,b)=>a.pass_rate-b.pass_rate)[0];
      insights.push({ icon: "🎓", text: `${top.label} strand leads with ${pct(top.pass_rate)} pass rate. ${low.label} needs more targeted support at ${pct(low.pass_rate)}.` });
    }
    return insights;
  }, [passByYear, passByReview, subjectTrends, passByStrand]);

  const insights = useMemo(() => generateInsights(), [generateInsights]);

  const weakestSubject = useMemo(() => {
    if (!subjectTrends || subjectTrends.length === 0) return null;
    const first = subjectTrends[0], last = subjectTrends[subjectTrends.length - 1];
    const candidates = ["EE","MATH","ESAS"].map(id => ({
      id, avg: Number(last?.[`${id}_avg`]),
      delta: Number(last?.[`${id}_delta`] ?? (Number(last?.[`${id}_avg`]) - Number(first?.[`${id}_avg`]))),
    })).filter(x => Number.isFinite(x.avg)).sort((a,b)=>a.avg-b.avg);
    return candidates[0] ?? null;
  }, [subjectTrends]);

  // ── RENDER ──
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.6} }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .metrics-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; margin-bottom:20px; }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .tab-btn { background:transparent; border:none; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .att-table { width:100%; border-collapse:collapse; font-size:13px; }
        .att-table th { padding:10px 12px; border-bottom:2px solid ${T.border}; text-align:left; color:${T.textSoft}; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; }
        .att-table td { padding:10px 12px; border-bottom:1px solid ${T.border}; color:${T.text}; }
        .att-table tr:hover td { background:${T.surfaceAlt}; }
        ::-webkit-scrollbar{width:5px;height:5px} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px} ::-webkit-scrollbar-track{background:transparent}
        @media(max-width:700px){ .dash-grid,.two-col{grid-template-columns:1fr!important} .metrics-grid{grid-template-columns:repeat(2,1fr)!important} }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      {/* ════ TOP NAV ════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 68,
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["/slsulogo.png", "/slsulogo1.png", "/slsulogo2.png"].map((src, i) => (
              <img key={src} src={src} alt={`Logo ${i+1}`} style={{ width: 34, height: 34, objectFit: "contain" }} />
            ))}
          </div>
          <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 14 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text, fontFamily: "'Syne', sans-serif" }}>Insights Dashboard</p>
            <p style={{ margin: 0, fontSize: 11, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.07em" }}>Faculty Portal · SLSU IIEE</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={fetchAnalytics} style={navBtnStyle(T)}
            onMouseEnter={e=>e.currentTarget.style.color=T.blue} onMouseLeave={e=>e.currentTarget.style.color=T.textMid}>
            ↻ Refresh
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.purpleSoft, border: `1px solid #ddd6fe`, borderRadius: 999, padding: "6px 14px" }}>
            <span style={{ fontSize: 13 }}>🔬</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.purple }}>Faculty</span>
          </div>
          <button onClick={onLogout} style={navBtnStyle(T)}
            onMouseEnter={e=>{e.currentTarget.style.color=T.fail;e.currentTarget.style.borderColor=T.failLight;}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.textMid;e.currentTarget.style.borderColor=T.border;}}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Tab Bar ── */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 28px", display: "flex", gap: 0, overflowX: "auto", boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding: "14px 16px", fontSize: 13,
            fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? T.blue : T.textMid,
            borderBottom: activeTab === tab.id ? `2px solid ${T.blue}` : "2px solid transparent",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0", flexDirection: "column", gap: 16 }}>
            <svg style={{ animation: "spin 0.8s linear infinite", width: 36, height: 36, color: T.blue }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 14, color: T.textSoft }}>Loading analytics…</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ════ OVERVIEW TAB ════ */}
            {activeTab === "overview" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Institutional Overview" subtitle="Aggregate statistics across all EE board exam takers in the dataset." />

                {/* Filter Panel */}
                <div style={{ marginBottom: 20 }}>
                  <FilterPanel filters={filters} onChange={setFilters} />
                </div>

                {/* KPI Cards */}
                <div className="metrics-grid">
                  <MetricCard label="Total Students"    value={ov.total_students}               icon="👥" color={T.blue} />
                  <MetricCard label="Total Passers"     value={ov.total_passers}                icon="✅" color={T.pass} />
                  <MetricCard label="Total Failers"     value={ov.total_failers}                icon="❌" color={T.fail} />
                  <MetricCard label="Overall Pass Rate" value={pct(ov.overall_pass_rate)}       icon="📊" color={ov.overall_pass_rate >= 70 ? T.pass : T.amber} />
                  <MetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}         icon="🏅" color={T.pass}  sub="1.0 = Highest" />
                  <MetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}         icon="📋" color={T.fail}  sub="1.0 = Highest" />
                </div>

                <div className="two-col" style={{ marginBottom: 16 }}>
                  {/* Pass/Fail Pie Donut */}
                  <ChartContainer title="Pass / Fail Distribution" subtitle="Share of passers vs failers across all examinees">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 13, color: T.textMid }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Pass Rate Trend Line */}
                  <ChartContainer title="Pass Rate Trend by Year" subtitle="Year-over-year board exam performance">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="year" tick={{ fontSize: 12, fill: T.textSoft }} />
                        <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: T.textSoft }} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" label={{ value: "70% threshold", fill: T.amber, fontSize: 11 }} />
                        <Line type="monotone" dataKey="passRate" name="Pass Rate (%)" stroke={T.blue} strokeWidth={2.5} dot={{ r: 5, fill: T.blue }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="two-col" style={{ marginBottom: 16 }}>
                  {/* Review Attendance Bar */}
                  <ChartContainer title="Pass Rate by Review Attendance" subtitle="Filtered by toggle: All / Yes / No">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={filteredPassByReview.map(d=>({name:d.label,passRate:d.pass_rate,total:d.total}))} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                        <XAxis type="number" domain={[0,100]} tick={{ fontSize: 12, fill: T.textSoft }} unit="%" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: T.textMid }} width={130} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={70} stroke={T.amber} strokeDasharray="4 3" />
                        <Bar dataKey="passRate" name="Pass Rate (%)" radius={[0,6,6,0]}>
                          {filteredPassByReview.map((d,i) => <Cell key={i} fill={d.pass_rate >= 70 ? T.pass : T.amber} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Review Duration Bar */}
                  <ChartContainer title="Pass Rate by Review Duration" subtitle="Does longer review improve outcomes?">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={durationData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: T.textSoft }} />
                        <YAxis domain={[0,100]} tick={{ fontSize: 12, fill: T.textSoft }} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" />
                        <Bar dataKey="passRate" name="Pass Rate (%)" radius={[6,6,0,0]}>
                          {durationData.map((d,i) => <Cell key={i} fill={[T.fail, T.amber, T.pass][i] || T.blue} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* GWA Comparison */}
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="GWA Comparison: Passers vs Failers" subtitle="Lower GWA = better in Philippine grading (1.0 is highest)">
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[
                        { label: "Passers Avg GWA", value: ov.avg_gwa_passers, color: T.pass },
                        { label: "Failers Avg GWA",  value: ov.avg_gwa_failers,  color: T.fail },
                      ].map((x, i) => (
                        <div key={i} style={{ flex: "1 1 160px", background: x.color === T.pass ? T.passSoft : T.failSoft, border: `1px solid ${x.color === T.pass ? T.passLight : T.failLight}`, borderRadius: 14, padding: "20px 22px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: 12, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{x.label}</p>
                          <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: x.color, fontFamily: "'Syne', sans-serif" }}>{num(x.value)}</p>
                        </div>
                      ))}
                      <div style={{ flex: "2 1 300px", background: T.blueSoft, border: `1px solid ${T.blueLight}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, color: T.textMid, lineHeight: 1.6 }}>
                          💡 Passers had a GWA <strong style={{ color: T.blue }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} points better</strong> than failers — confirming GWA as a strong predictor for board exam success.
                        </p>
                      </div>
                    </div>
                  </ChartContainer>
                </div>

                {/* Model Performance Summary */}
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="Model Performance Summary" subtitle="Random Forest classifier and regressors — Chapter 4 metrics">
                    {modelInfo ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                        {[
                          { label: "Classification Accuracy", value: `${(modelInfo.classification.accuracy*100).toFixed(1)}%`, icon: "🎯", color: T.blue },
                          { label: "F1-Score",                value: `${(modelInfo.classification.f1*100).toFixed(1)}%`,       icon: "⚖️", color: T.indigo },
                          { label: "Regression A — R²",       value: modelInfo.regression_a.r2.toFixed(3),                    icon: "📉", color: T.teal },
                          { label: "Regression B — MAE",      value: modelInfo.regression_b.mae.toFixed(2),                   icon: "📐", color: T.purple },
                        ].map((m, i) => (
                          <div key={i} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <p style={{ margin: "0 0 4px", fontSize: 11, color: T.textSoft, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
                              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: m.color, fontFamily: "'Syne', sans-serif" }}>{m.value}</p>
                            </div>
                            <span style={{ fontSize: 22 }}>{m.icon}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ color: T.textSoft, fontSize: 13 }}>Loading model metrics…</p>}
                  </ChartContainer>
                </div>

                {/* Insights */}
                <InsightBox items={insights} />

                <div style={{ marginTop: 12, padding: "12px 16px", background: T.amberSoft, border: `1px solid ${T.amberLight}`, borderRadius: 12, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
                  ℹ️ Analytics summarize <strong>first-attempt outcomes</strong> only (FAILED-RETAKE is treated as an outcome category label, not a second prediction attempt).
                </div>
              </div>
            )}

            {/* ════ PERFORMANCE TAB ════ */}
            {activeTab === "performance" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Performance Breakdown" subtitle="Pass rates by SHS strand, survey section scores, and subject score trends." />
                <div style={{ marginBottom: 20 }}>
                  <FilterPanel filters={filters} onChange={setFilters} />
                </div>

                {/* Pass Rate by Strand */}
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="Pass Rate by SHS Strand" subtitle="Board exam outcomes by Senior High School track">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={strandBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="name" tick={{ fontSize: 13, fill: T.textMid }} />
                        <YAxis domain={[0,100]} tick={{ fontSize: 12, fill: T.textSoft }} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" label={{ value: "Target 70%", fill: T.amber, fontSize: 11, position: "right" }} />
                        <Bar dataKey="passRate" name="Pass Rate (%)" radius={[6,6,0,0]}>
                          {strandBarData.map((d, i) => <Cell key={i} fill={d.passRate >= 70 ? T.pass : d.passRate >= 55 ? T.amber : T.fail} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <InsightBox items={[
                      passByStrand.length > 0 && { icon: "🎓", text: `STEM graduates lead with ${pct(passByStrand[0].pass_rate)} pass rate — consistent with math-heavy curriculum aligned with EE board topics.` },
                    ].filter(Boolean)} />
                  </ChartContainer>
                </div>

                {/* Subject Trends */}
                {subjectTrends.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <ChartContainer title="Subject Score Trends by Year" subtitle="Average EE, MATH, ESAS scores per cohort (CSV dataset)">
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={subjectLineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                          <XAxis dataKey="year" tick={{ fontSize: 12, fill: T.textSoft }} />
                          <YAxis domain={[50,90]} tick={{ fontSize: 12, fill: T.textSoft }} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" />
                          <Legend formatter={(v) => <span style={{ fontSize: 12, color: T.textMid }}>{v}</span>} />
                          <Line type="monotone" dataKey="EE"   name="EE Score"   stroke={T.blue}   strokeWidth={2.5} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="MATH" name="MATH Score" stroke={T.indigo} strokeWidth={2.5} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="ESAS" name="ESAS Score" stroke={T.teal}   strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                        {["EE","MATH","ESAS"].map((subj, i) => {
                          const last = subjectTrends[subjectTrends.length - 1];
                          const first = subjectTrends[0];
                          const totalDelta = last[`${subj}_avg`] - first[`${subj}_avg`];
                          const col = [T.blue, T.indigo, T.teal][i];
                          return (
                            <div key={subj} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
                              <p style={{ margin: "0 0 3px", fontSize: 11, color: T.textSoft, fontWeight: 600, textTransform: "uppercase" }}>{subj} Trend</p>
                              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: col, fontFamily: "'Syne', sans-serif" }}>{last[`${subj}_avg`]}</p>
                              <p style={{ margin: "3px 0 0", fontSize: 12, color: totalDelta >= 0 ? T.pass : T.fail }}>
                                {totalDelta >= 0 ? "▲" : "▼"} {Math.abs(totalDelta).toFixed(1)} pts overall
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {weakestSubject && (
                        <InsightBox items={[{ icon: "⚠️", text: `Weakest subject (latest cohort): ${weakestSubject.id} (avg = ${num(weakestSubject.avg, 1)}). Trend: ${weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} (${Math.abs(weakestSubject.delta).toFixed(1)} pts overall).` }]} />
                      )}
                    </ChartContainer>
                  </div>
                )}

                {/* Section Scores Grouped Bar */}
                <ChartContainer title="Survey Section Scores: Passers vs Failers" subtitle="Average section score (0–100) split by outcome">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={sectionBarData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textMid, angle: -30, textAnchor: "end" }} interval={0} />
                      <YAxis domain={[40,100]} tick={{ fontSize: 12, fill: T.textSoft }} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 12, color: T.textMid }}>{v}</span>} />
                      <Bar dataKey="Passers" name="Passers" fill={T.pass} radius={[4,4,0,0]} barSize={14} />
                      <Bar dataKey="Failers" name="Failers" fill={T.fail} radius={[4,4,0,0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}

            {/* ════ PREDICTION ANALYSIS TAB ════ */}
            {activeTab === "prediction" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Prediction Analysis" subtitle="Actual vs Predicted scores with reference lines for perfect prediction and passing threshold." />

                <div className="two-col" style={{ marginBottom: 16 }}>
                  {/* Scatter Plot */}
                  <ChartContainer title="Actual vs Predicted Scores" subtitle="Each point = one examinee. Diagonal = perfect prediction.">
                    <ResponsiveContainer width="100%" height={340}>
                      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis type="number" dataKey="actual"    name="Actual"    domain={[40,100]} tick={{ fontSize: 12, fill: T.textSoft }} label={{ value: "Actual Score", position: "insideBottom", offset: -5, fill: T.textSoft, fontSize: 12 }} />
                        <YAxis type="number" dataKey="predicted" name="Predicted" domain={[40,100]} tick={{ fontSize: 12, fill: T.textSoft }} label={{ value: "Predicted Score", angle: -90, position: "insideLeft", fill: T.textSoft, fontSize: 12 }} />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return (
                            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                              <p style={{ margin: "0 0 3px", fontWeight: 700, color: T.text }}>Actual: {d?.actual}</p>
                              <p style={{ margin: 0, color: T.blue }}>Predicted: {d?.predicted}</p>
                            </div>
                          );
                        }} />
                        {/* Perfect prediction line */}
                        <ReferenceLine segment={[{x:40,y:40},{x:100,y:100}]} stroke={T.indigo} strokeDasharray="5 3" label={{ value:"Perfect", fill:T.indigo, fontSize:11, position:"insideTopLeft" }} />
                        {/* Passing threshold */}
                        <ReferenceLine x={70} stroke={T.amber} strokeDasharray="4 3" label={{ value:"70%", fill:T.amber, fontSize:11 }} />
                        <ReferenceLine y={70} stroke={T.amber} strokeDasharray="4 3" />
                        <Scatter data={scatterData} fill={T.blue} opacity={0.7} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Score Distribution */}
                  <ChartContainer title="Distribution of Predicted Scores" subtitle="How predicted scores are spread across the range">
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart
                        data={[
                          { range: "40–50", count: scatterData.filter(d=>d.predicted<50).length },
                          { range: "50–60", count: scatterData.filter(d=>d.predicted>=50&&d.predicted<60).length },
                          { range: "60–70", count: scatterData.filter(d=>d.predicted>=60&&d.predicted<70).length },
                          { range: "70–80", count: scatterData.filter(d=>d.predicted>=70&&d.predicted<80).length },
                          { range: "80–90", count: scatterData.filter(d=>d.predicted>=80&&d.predicted<90).length },
                          { range: "90+",   count: scatterData.filter(d=>d.predicted>=90).length },
                        ]}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="range" tick={{ fontSize: 12, fill: T.textSoft }} />
                        <YAxis tick={{ fontSize: 12, fill: T.textSoft }} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x="70–80" stroke={T.amber} strokeDasharray="4 3" />
                        <Bar dataKey="count" name="Students" radius={[6,6,0,0]}>
                          {["40–50","50–60","60–70","70–80","80–90","90+"].map((r,i) => (
                            <Cell key={i} fill={i < 3 ? T.fail : i === 3 ? T.amber : T.pass} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Pass/Fail Donut with Stacked Bar */}
                <div className="two-col">
                  <ChartContainer title="Predicted Pass / Fail Proportions" subtitle="Overall predicted outcome distribution">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`} labelLine={false}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <ChartContainer title="Review Attendance Population" subtitle="How many students attended formal review vs. not">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={[{ name: "Attended Review", value: reviewYesTotal }, { name: "No Review", value: reviewNoTotal }]}
                          cx="50%" cy="50%" outerRadius={95} paddingAngle={3} dataKey="value"
                          label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                        >
                          <Cell fill={T.pass} /><Cell fill={T.amber} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 12, color: T.textMid }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* ════ FEATURES TAB ════ */}
            {activeTab === "features" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Feature Importance" subtitle="Top predictors from the Random Forest classifier — what matters most for passing the EE board exam." />
                <ChartContainer title="Top 10 Predictors (Random Forest — Classification Model)" subtitle="Gini importance — higher = more influence on Pass/Fail prediction">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={featureBarData} layout="vertical" margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: T.textSoft }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: T.textMid }} width={120} />
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, maxWidth: 260 }}>
                            <p style={{ margin: "0 0 4px", fontWeight: 700, color: T.text }}>{d?.fullLabel}</p>
                            <p style={{ margin: 0, color: T.blue }}>Importance: {d?.value?.toFixed(4)}</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="value" name="Importance" radius={[0,6,6,0]}>
                        {featureBarData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? T.blue : i === 1 ? T.indigo : i === 2 ? T.teal : i < 4 ? T.amber : T.textSoft} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                    {[
                      { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS scores are the #1–3 predictors, accounting for ~39% of total importance." },
                      { icon: "📚", title: "GWA is #4", desc: "Academic performance (GWA) is the strongest non-exam predictor." },
                      { icon: "🧠", title: "Survey Factors Matter", desc: "Problem-solving confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
                    ].map((x, i) => (
                      <div key={i} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px" }}>
                        <p style={{ margin: "0 0 5px", fontSize: 16 }}>{x.icon}</p>
                        <p style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 700, color: T.text }}>{x.title}</p>
                        <p style={{ margin: 0, fontSize: 13, color: T.textSoft, lineHeight: 1.55 }}>{x.desc}</p>
                      </div>
                    ))}
                  </div>
                </ChartContainer>
              </div>
            )}

            {/* ════ CURRICULUM TAB ════ */}
            {activeTab === "curriculum" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Curriculum Gap Analysis" subtitle="Survey questions with the lowest average scores — these directly indicate institutional weaknesses." />
                <div style={{ marginBottom: 16, background: T.amberSoft, border: `1px solid ${T.amberLight}`, borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: T.amber }}>Objective 4 — Curriculum Weakness Indicators</p>
                    <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
                      Items below are sorted by average Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores mean students are <strong>disagreeing more</strong>, signaling institutional gaps.
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="10 Weakest Survey Items" subtitle="Items scoring above 2.5 are critical concern areas">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10 }}>
                      {weakestQ.map((q, i) => {
                        const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
                        const sc = severity === "high" ? T.fail : severity === "medium" ? T.amber : T.orange;
                        return (
                          <div key={i} style={{ background: severity === "high" ? T.failSoft : T.amberSoft, border: `1px solid ${severity === "high" ? T.failLight : T.amberLight}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: `${sc}20`, color: sc, border: `1px solid ${sc}40` }}>{q.key}</span>
                                <span style={{ fontSize: 10, color: T.textSoft, background: T.surfaceAlt, padding: "2px 7px", borderRadius: 999, border: `1px solid ${T.border}` }}>{q.section}</span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: sc, flexShrink: 0 }}>{q.avg.toFixed(2)}<span style={{ fontSize: 10, color: T.textSoft }}>/4</span></span>
                            </div>
                            <p style={{ margin: "0 0 8px", fontSize: 13, color: T.textMid, lineHeight: 1.45 }}>{q.label}</p>
                            <div style={{ height: 5, background: `${sc}20`, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${((q.avg-1)/3)*100}%`, background: sc, borderRadius: 99 }} />
                            </div>
                            <p style={{ margin: "5px 0 0", fontSize: 11, color: T.textSoft }}>
                              {severity === "high" ? "🔴 Critical" : severity === "medium" ? "🟡 Moderate" : "🟠 Low concern"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </ChartContainer>
                </div>

                <ChartContainer title="Gap Summary by Category" subtitle="Which institutional categories have the most weak items?">
                  {(() => {
                    const counts = {};
                    weakestQ.forEach(q => {
                      if (!counts[q.section]) counts[q.section] = { count: 0, avgTotal: 0 };
                      counts[q.section].count++;
                      counts[q.section].avgTotal += q.avg;
                    });
                    const cats = Object.entries(counts).map(([label, v]) => ({ label, count: v.count, avg: v.avgTotal/v.count })).sort((a,b)=>b.avg-a.avg);
                    return (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={cats.map(c=>({name:c.label,avg:c.avg,count:c.count}))} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textMid, angle: -20, textAnchor: "end" }} interval={0} />
                          <YAxis domain={[2,3]} tick={{ fontSize: 12, fill: T.textSoft }} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={2.5} stroke={T.amber} strokeDasharray="4 3" label={{ value:"2.5 threshold",fill:T.amber,fontSize:11,position:"right" }} />
                          <Bar dataKey="avg" name="Avg Likert Score" radius={[6,6,0,0]}>
                            {cats.map((c,i) => <Cell key={i} fill={c.avg >= 2.65 ? T.fail : c.avg >= 2.55 ? T.amber : T.orange} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                  <InsightBox items={[{ icon: "🎯", text: "Facilities and Dept. Review items consistently score highest (most disagreement), suggesting physical resources and department-organized review programs are the most critical gaps." }]} />
                </ChartContainer>
              </div>
            )}

            {/* ════ CLASSIFICATION METRICS ════ */}
            {activeTab === "classification_metrics" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Classification Metrics" subtitle="System metrics for model development focused on Pass/Fail prediction." />

                {modelInfo && (
                  <div className="metrics-grid" style={{ marginBottom: 20 }}>
                    {[
                      { label: "Accuracy",  value: `${(modelInfo.classification.accuracy*100).toFixed(2)}%`,  icon: "🎯", color: T.blue,   desc: "Overall correctness" },
                      { label: "Precision", value: `${((modelInfo.classification.precision||0)*100).toFixed(2)}%`, icon: "🔍", color: T.indigo, desc: "Avoid false positives" },
                      { label: "Recall",    value: `${((modelInfo.classification.recall||0)*100).toFixed(2)}%`,    icon: "📡", color: T.teal,   desc: "Capture all positives" },
                      { label: "F1-Score",  value: `${(modelInfo.classification.f1*100).toFixed(2)}%`,             icon: "⚖️", color: T.pass,   desc: "Precision-recall balance" },
                    ].map((m, i) => <MetricCard key={i} label={m.label} value={m.value} icon={m.icon} color={m.color} sub={m.desc} />)}
                  </div>
                )}

                <div className="two-col" style={{ marginBottom: 16 }}>
                  <ChartContainer title="Metric Reference" subtitle="When and why each metric is used">
                    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                      {[
                        { metric: "Accuracy",  focus: "Overall correctness",       use: "Balanced classes",    color: T.blue   },
                        { metric: "Precision", focus: "Avoid false positives",     use: "Fraud / Spam",        color: T.indigo },
                        { metric: "Recall",    focus: "Capture all positives",     use: "Safety-critical",     color: T.teal   },
                        { metric: "F1-Score",  focus: "Balance precision & recall",use: "Imbalanced data",    color: T.pass   },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "flex", gap: 0, background: i % 2 === 0 ? T.surface : T.surfaceAlt, padding: "12px 16px", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                          <span style={{ width: 100, fontSize: 13, fontWeight: 700, color: row.color }}>{row.metric}</span>
                          <span style={{ flex: 1, fontSize: 13, color: T.textMid }}>{row.focus}</span>
                          <span style={{ width: 140, fontSize: 13, color: T.textSoft, textAlign: "right" }}>{row.use}</span>
                        </div>
                      ))}
                    </div>
                    {modelInfo?.dataset_size && (
                      <p style={{ marginTop: 12, fontSize: 13, color: T.textSoft }}>Dataset size: <strong style={{ color: T.text }}>{modelInfo.dataset_size}</strong> records.</p>
                    )}
                  </ChartContainer>

                  <ChartContainer title="CV Performance" subtitle="Cross-validation accuracy and F1">
                    {modelInfo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                        {[
                          { label: "CV Accuracy", value: modelInfo.classification.cv_acc, max: 1, color: T.blue },
                          { label: "CV F1-Score", value: modelInfo.classification.cv_f1,  max: 1, color: T.teal },
                        ].map((m, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 13, color: T.textMid, fontWeight: 600 }}>{m.label}</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{(m.value*100).toFixed(2)}%</span>
                            </div>
                            <div style={{ height: 10, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${m.value*100}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}aa)`, borderRadius: 99, transition: "width 1s ease" }} />
                            </div>
                          </div>
                        ))}
                        <InsightBox items={[{ icon: "🔬", text: `The model achieves ${(modelInfo.classification.accuracy*100).toFixed(1)}% test accuracy with a cross-validated F1 of ${(modelInfo.classification.cv_f1*100).toFixed(1)}% — indicating consistent generalization.` }]} />
                      </div>
                    ) : <p style={{ color: T.textSoft, fontSize: 13 }}>Loading…</p>}
                  </ChartContainer>
                </div>

                {/* Confusion Matrix */}
                {test2025?.confusion_matrix && (
                  <ChartContainer title="Confusion Matrix (Pass/Fail)" subtitle="Actual vs Predicted on DATA_TEST 2025">
                    <ConfusionMatrixViz matrix={test2025.confusion_matrix} />
                  </ChartContainer>
                )}
              </div>
            )}

            {/* ════ REGRESSION METRICS ════ */}
            {activeTab === "regression_metrics" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Regression Metrics" subtitle="System metrics for rating prediction model development." />

                {modelInfo && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
                    {[
                      { label: "Model A — MAE",  value: modelInfo.regression_a.mae.toFixed(4),  icon: "📉", color: T.blue,   sub: "Lower is better" },
                      { label: "Model A — RMSE", value: modelInfo.regression_a.rmse.toFixed(4), icon: "📏", color: T.indigo, sub: "Lower is better" },
                      { label: "Model A — R²",   value: modelInfo.regression_a.r2.toFixed(4),   icon: "📊", color: T.teal,   sub: "Higher is better" },
                      { label: "Model B — MAE",  value: modelInfo.regression_b.mae.toFixed(4),  icon: "📉", color: T.blue,   sub: "Lower is better" },
                      { label: "Model B — RMSE", value: modelInfo.regression_b.rmse.toFixed(4), icon: "📏", color: T.purple, sub: "Lower is better" },
                      { label: "Model B — R²",   value: modelInfo.regression_b.r2.toFixed(4),   icon: "📊", color: T.pass,   sub: "Higher is better" },
                    ].map((m, i) => <MetricCard key={i} label={m.label} value={m.value} icon={m.icon} color={m.color} sub={m.sub} />)}
                  </div>
                )}

                <div className="two-col" style={{ marginBottom: 16 }}>
                  <ChartContainer title="Metrics Reference Guide" subtitle="Units, sensitivity, and optimization goals">
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ display: "flex", background: T.surfaceAlt, padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>
                        {["Metric","Units","Sensitivity","Goal"].map(h => (
                          <span key={h} style={{ flex: 1, fontSize: 11, fontWeight: 700, color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                        ))}
                      </div>
                      {[
                        { metric: "MAE",     units: "Same as target", sens: "Low",      goal: "Minimize avg error" },
                        { metric: "RMSE",    units: "Same as target", sens: "High",     goal: "Avoid large errors" },
                        { metric: "R² Score",units: "Percentage",     sens: "Moderate", goal: "Maximize explained var." },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "flex", padding: "12px 14px", background: i%2===0?T.surface:T.surfaceAlt, borderBottom: i<2?`1px solid ${T.border}`:"none" }}>
                          <span style={{ flex:1, fontSize:13, fontWeight:700, color:T.text }}>{row.metric}</span>
                          <span style={{ flex:1, fontSize:13, color:T.textMid }}>{row.units}</span>
                          <span style={{ flex:1, fontSize:13, color:T.textMid }}>{row.sens}</span>
                          <span style={{ flex:1, fontSize:13, color:T.textSoft }}>{row.goal}</span>
                        </div>
                      ))}
                    </div>
                  </ChartContainer>

                  <ChartContainer title="Actual vs Predicted (Regression)" subtitle="Scatter plot of rating predictions">
                    <ResponsiveContainer width="100%" height={260}>
                      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis type="number" dataKey="actual"    name="Actual"    domain={[40,100]} tick={{ fontSize:11,fill:T.textSoft }} label={{ value:"Actual",    position:"insideBottom",offset:-5,fill:T.textSoft,fontSize:11 }} />
                        <YAxis type="number" dataKey="predicted" name="Predicted" domain={[40,100]} tick={{ fontSize:11,fill:T.textSoft }} label={{ value:"Predicted", angle:-90, position:"insideLeft", fill:T.textSoft,fontSize:11 }} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"8px 12px", fontSize:12 }}>
                            <p style={{ margin:"0 0 2px", fontWeight:700 }}>Actual: {d?.actual}</p>
                            <p style={{ margin:0, color:T.blue }}>Predicted: {d?.predicted}</p>
                          </div>;
                        }} />
                        <ReferenceLine segment={[{x:40,y:40},{x:100,y:100}]} stroke={T.indigo} strokeDasharray="5 3" />
                        <Scatter data={scatterData} fill={T.teal} opacity={0.75} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {modelInfo && (
                  <ChartContainer title="Model A vs Model B Comparison" subtitle="Regression A (with subject scores) vs Regression B (GWA + survey only)">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={[
                          { metric: "MAE",  modelA: modelInfo.regression_a.mae,  modelB: modelInfo.regression_b.mae  },
                          { metric: "RMSE", modelA: modelInfo.regression_a.rmse, modelB: modelInfo.regression_b.rmse },
                          { metric: "R²",   modelA: modelInfo.regression_a.r2,   modelB: modelInfo.regression_b.r2   },
                        ]}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="metric" tick={{ fontSize: 13, fill: T.textMid }} />
                        <YAxis tick={{ fontSize: 12, fill: T.textSoft }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 12, color: T.textMid }}>{v}</span>} />
                        <Bar dataKey="modelA" name="Model A (w/ subjects)" fill={T.blue}   radius={[4,4,0,0]} barSize={26} />
                        <Bar dataKey="modelB" name="Model B (GWA+survey)"  fill={T.indigo} radius={[4,4,0,0]} barSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
            )}

            {/* ════ CORRELATION TAB ════ */}
            {activeTab === "correlation" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Correlation Matrix" subtitle="Pearson correlations between key academic variables and exam outcome." />
                <ChartContainer title="Correlation Matrix" subtitle="Pearson correlations between key academic variables">
                  {correlation ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                        <thead>
                          <tr>
                            <th style={{ padding: "10px 12px", borderBottom: `2px solid ${T.border}`, textAlign: "left", color: T.textSoft, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Variable</th>
                            {(correlation.columns ?? []).map(col => (
                              <th key={col} style={{ padding: "10px 12px", borderBottom: `2px solid ${T.border}`, textAlign: "right", color: T.textSoft, fontWeight: 700, fontSize: 11 }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(correlation.matrix ?? []).map((row, ri) => (
                            <tr key={row.row} style={{ background: ri%2===0 ? T.surface : T.surfaceAlt }}>
                              <td style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.text }}>{row.row}</td>
                              {(correlation.columns ?? []).map(col => {
                                const val = row[col];
                                const absVal = Math.abs(val);
                                const isDiag = col === row.row;
                                const color = isDiag ? T.textSoft : absVal >= 0.7 ? T.pass : absVal >= 0.4 ? T.amber : T.textSoft;
                                const bg = isDiag ? "transparent" : absVal >= 0.7 ? T.passSoft : absVal >= 0.4 ? T.amberSoft : "transparent";
                                return (
                                  <td key={col} style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, textAlign: "right", fontWeight: absVal >= 0.4 && !isDiag ? 700 : 400, color, background: bg, borderRadius: 4 }}>
                                    {val.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p style={{ fontSize: 13, color: T.textSoft }}>Correlation data not available.</p>}
                  <InsightBox items={[
                    { icon: "💡", text: `Values > 0.7 indicate strong correlation (green). 0.4–0.7 moderate (amber). Diagonal = 1.00 (self-correlation).` }
                  ]} />
                </ChartContainer>
              </div>
            )}

            {/* ════ 2025 DEFENSE TAB ════ */}
            {activeTab === "test2025" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="2025 Final Defense" subtitle="Held-out evaluation on DATA_TEST.xlsx (2025)." />
                {testLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: T.textSoft }}>Loading 2025 metrics…</div>
                ) : test2025?.error ? (
                  <div style={{ background: T.failSoft, border: `1px solid ${T.failLight}`, borderRadius: 14, padding: "14px 18px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: T.fail }}>{test2025.error}</p>
                  </div>
                ) : test2025 ? (
                  <>
                    <div className="metrics-grid" style={{ marginBottom: 20 }}>
                      <MetricCard label="Test Accuracy" value={pct((test2025.classification?.accuracy??0)*100)} icon="🎯" color={(test2025.classification?.accuracy??0)>=0.9?T.pass:T.amber} />
                      <MetricCard label="Precision"     value={pct((test2025.classification?.precision??0)*100)} icon="🔍" color={T.blue} />
                      <MetricCard label="Recall"        value={pct((test2025.classification?.recall??0)*100)}    icon="📡" color={T.indigo} />
                      <MetricCard label="F1-Score"      value={pct((test2025.classification?.f1??0)*100)}        icon="⚖️" color={T.teal} />
                    </div>

                    <div className="two-col" style={{ marginBottom: 16 }}>
                      <ChartContainer title="Regression A (EE+MATH+ESAS+GWA)" subtitle="Predicted PRC TOTAL RATING — model 2A">
                        {[["R²",num(test2025.regression?.a?.r2,4)],["MAE (pts)",num(test2025.regression?.a?.mae,4)],["MSE (pts²)",num(test2025.regression?.a?.mse,4)],["RMSE (pts)",num(test2025.regression?.a?.rmse,4)]].map(([k,v],i)=>(
                          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${T.border}`:"none" }}>
                            <span style={{ fontSize:13,color:T.textSoft }}>{k}</span>
                            <span style={{ fontSize:15,fontWeight:800,color:T.blue,fontFamily:"'Syne',sans-serif" }}>{v}</span>
                          </div>
                        ))}
                      </ChartContainer>
                      <ChartContainer title="Regression B (GWA+Survey only)" subtitle="Predicted PRC TOTAL RATING — model 2B (no subjects)">
                        {[["R²",num(test2025.regression?.b?.r2,4)],["MAE (pts)",num(test2025.regression?.b?.mae,4)],["MSE (pts²)",num(test2025.regression?.b?.mse,4)],["RMSE (pts)",num(test2025.regression?.b?.rmse,4)]].map(([k,v],i)=>(
                          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${T.border}`:"none" }}>
                            <span style={{ fontSize:13,color:T.textSoft }}>{k}</span>
                            <span style={{ fontSize:15,fontWeight:800,color:T.indigo,fontFamily:"'Syne',sans-serif" }}>{v}</span>
                          </div>
                        ))}
                      </ChartContainer>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <ChartContainer title="Confusion Matrix (Pass/Fail)" subtitle="Actual vs Predicted on DATA_TEST 2025">
                        <ConfusionMatrixViz matrix={test2025.confusion_matrix} />
                        <p style={{ marginTop:12, fontSize:12, color:T.textSoft }}>
                          Values parsed from backend <code style={{ background:T.surfaceAlt, padding:"1px 5px", borderRadius:4 }}>evaluation_report.txt</code>. Re-run <code style={{ background:T.surfaceAlt, padding:"1px 5px", borderRadius:4 }}>train_model.py</code> to update.
                        </p>
                      </ChartContainer>
                    </div>

                    {/* Examinee Row-level Detail — preserved logic */}
                    {test2025Records !== null && (
                      <ChartContainer title="Select a 2025 Examinee (Row-level check)" subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers">
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize:12, color:T.textSoft, marginBottom:6, display:"block", fontWeight:600 }}>Select Examinee</label>
                          <select
                            value={selectedTestIdx}
                            onChange={e=>setSelectedTestIdx(Number(e.target.value))}
                            style={{ ...selectStyle, minWidth: 260 }}
                          >
                            {(test2025Records||[]).map((r,i)=>(
                              <option key={i} value={i}>Row {i+1}{r.name ? ` — ${r.name}` : ""}</option>
                            ))}
                          </select>
                        </div>
                        {test2025RunLoading && <p style={{ fontSize:13,color:T.textSoft }}>Loading prediction…</p>}
                        {!test2025RunLoading && test2025Run && (
                          test2025Run.error
                            ? <p style={{ fontSize:13,color:T.fail }}>{test2025Run.error}</p>
                            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
                                {Object.entries(test2025Run).filter(([k])=>!k.startsWith("_")).map(([k,v],i)=>(
                                  <div key={i} style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px" }}>
                                    <p style={{ margin:"0 0 4px", fontSize:11, color:T.textSoft, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>{k.replace(/_/g," ")}</p>
                                    <p style={{ margin:0, fontSize:16, fontWeight:800, color:T.text }}>{String(v)}</p>
                                  </div>
                                ))}
                              </div>
                        )}
                      </ChartContainer>
                    )}
                  </>
                ) : <p style={{ fontSize:13,color:T.textSoft }}>No 2025 defense metrics available.</p>}
              </div>
            )}

            {/* ════ TRENDS & MONITORING TAB ════ */}
            {activeTab === "trends" && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                <SectionHeader title="Trends & Monitoring" subtitle="Live data from the prediction database — student attempts, monthly summaries, and AI trend insights." />

                {/* Usage Summary */}
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="System Usage & User Activity" subtitle="Active student users and prediction volume (last 30 days)"
                    action={
                      <button onClick={downloadPerformanceReport} disabled={reportLoading} style={{
                        background: T.blueSoft, border:`1px solid ${T.blueLight}`, borderRadius:9, padding:"8px 16px",
                        fontSize:12, color:T.blue, cursor:reportLoading?"not-allowed":"pointer",
                        fontFamily:"'DM Sans',sans-serif", fontWeight:600, opacity:reportLoading?0.7:1, transition:"all 0.15s",
                      }}>{reportLoading?"Preparing…":"⬇ Download Report"}</button>
                    }
                  >
                    {usageLoading ? <p style={{ fontSize:13,color:T.textSoft }}>Loading system usage…</p>
                    : usageSummary ? (
                      <div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:16 }}>
                          <MetricCard label="Total Predictions" value={usageSummary.total_predictions} icon="📊" color={T.blue} />
                          <MetricCard label="Active Users" value={usageSummary.active_users} icon="👥" color={T.pass} sub="distinct student users" />
                        </div>
                        {(usageSummary.predictions_by_day??[]).length > 0 && (
                          <ChartContainer title="Predictions by Day (last 10 days)" subtitle="">
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart data={(usageSummary.predictions_by_day??[]).slice(-10).map(d=>({day:d.day?.slice(5)||"—",total:d.total??0}))} margin={{top:5,right:20,left:0,bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                                <XAxis dataKey="day" tick={{fontSize:11,fill:T.textSoft}}/>
                                <YAxis tick={{fontSize:11,fill:T.textSoft}}/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Bar dataKey="total" name="Predictions" fill={T.blue} radius={[4,4,0,0]}/>
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        )}
                        {(usageSummary.active_users_recent??[]).length > 0 && (
                          <div style={{ marginTop:14 }}>
                            <p style={{ margin:"0 0 10px",fontSize:12,color:T.textSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>Most Active Students</p>
                            <table className="att-table">
                              <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                              <tbody>
                                {(usageSummary.active_users_recent??[]).map((u,i)=>(
                                  <tr key={i}>
                                    <td style={{fontWeight:700}}>{u.name||u.user_id||"—"}</td>
                                    <td>{u.attempts??0}</td>
                                    <td style={{color:T.textSoft}}>{u.last_at?new Date(u.last_at).toLocaleDateString("en-PH"):"—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : <p style={{ fontSize:13,color:T.textSoft }}>No usage data yet.</p>}
                  </ChartContainer>
                </div>

                {/* AI Trend Insights */}
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="AI Trend Insights" subtitle="Groq AI summary of year-over-year prediction trends">
                    {insightsLoading ? (
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid ${T.blue}40`,borderTopColor:T.blue,animation:"spin 0.8s linear infinite" }} />
                        <span style={{ fontSize:13,color:T.textSoft }}>Generating AI summary…</span>
                      </div>
                    ) : trendInsights ? (
                      <div>
                        {trendInsights.stats && (trendInsights.stats.years??[]).length > 0 && (
                          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
                            {(trendInsights.stats.years??[]).map((yr,i)=>(
                              <div key={i} style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 16px", minWidth:130 }}>
                                <p style={{ margin:"0 0 3px",fontSize:11,color:T.textSoft,textTransform:"uppercase",fontWeight:600 }}>{yr.year}</p>
                                <p style={{ margin:"0 0 2px",fontSize:20,fontWeight:800,color:yr.pass_rate>=70?T.pass:T.amber,fontFamily:"'Syne',sans-serif" }}>{yr.pass_rate.toFixed(1)}%</p>
                                <p style={{ margin:0,fontSize:11,color:T.textSoft }}>{yr.total} attempts · avg {yr.avg_rating.toFixed(1)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <InsightBox items={[{ icon: "✦", text: trendInsights.summary }]} />
                        <button onClick={fetchTrendInsights} style={{ marginTop:12,background:T.blueSoft,border:`1px solid ${T.blueLight}`,borderRadius:9,padding:"7px 14px",color:T.blue,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                          ↻ Refresh Insights
                        </button>
                      </div>
                    ) : <p style={{ fontSize:13,color:T.textSoft }}>No trend data yet. Submit more predictions to generate insights.</p>}
                  </ChartContainer>
                </div>

                {/* Yearly PF from DB */}
                {(yearlyPF??[]).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <ChartContainer title="Pass / Fail by Year (Live DB)" subtitle="From prediction_attempts table — real student submissions">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={(yearlyPF??[]).map(yr=>({ year:yr.year, Pass:yr.pass_count, Fail:yr.fail_count }))} margin={{top:5,right:20,left:0,bottom:5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                          <XAxis dataKey="year" tick={{fontSize:12,fill:T.textSoft}}/>
                          <YAxis tick={{fontSize:12,fill:T.textSoft}}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend formatter={v=><span style={{fontSize:12,color:T.textMid}}>{v}</span>}/>
                          <Bar dataKey="Pass" fill={T.pass} radius={[4,4,0,0]} barSize={20}/>
                          <Bar dataKey="Fail" fill={T.fail} radius={[4,4,0,0]} barSize={20}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}

                {/* Review Analysis */}
                {(reviewAnalysis?.items??[]).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <ChartContainer title="Formal Review Split Analysis" subtitle="Results by Attended Formal Review = Yes / No">
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
                        {(reviewAnalysis.items??[]).map((item,i)=>(
                          <div key={i} style={{ background:item.review_program==="Yes"?T.passSoft:T.amberSoft, border:`1px solid ${item.review_program==="Yes"?T.passLight:T.amberLight}`, borderRadius:12, padding:"16px 18px" }}>
                            <p style={{ margin:"0 0 4px",fontSize:12,color:item.review_program==="Yes"?T.pass:T.amber,fontWeight:700 }}>
                              {item.review_program==="Yes"?"✅ Attended Review":"⚠ No Formal Review"}
                            </p>
                            <p style={{ margin:"0 0 4px",fontSize:28,fontWeight:800,color:T.text,fontFamily:"'Syne',sans-serif" }}>{item.pass_rate?.toFixed(1)}%</p>
                            <p style={{ margin:0,fontSize:12,color:T.textSoft }}>{item.pass_count}/{item.total} predicted pass
                              {item.human_like_rate!=null?` · Human-like: ${item.human_like_rate.toFixed(1)}%`:""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ChartContainer>
                  </div>
                )}

                {/* Timing Analysis */}
                {timingAnalysis?.summary && (
                  <div style={{ marginBottom: 16 }}>
                    <ChartContainer title="Predictor Timer Analysis" subtitle="Response timing from Predictor Form">
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14, marginBottom:16 }}>
                        <MetricCard label="Timed Questions" value={timingAnalysis.summary.timed_questions??0}  icon="⏱️" color={T.blue} />
                        <MetricCard label="Human-like"      value={timingAnalysis.summary.human_like_rate!=null?`${timingAnalysis.summary.human_like_rate.toFixed(1)}%`:"—"} icon="✅" color={T.pass} sub={`${timingAnalysis.summary.human_like_count??0} answers`} />
                        <MetricCard label="Too Fast"        value={timingAnalysis.summary.too_fast_rate!=null?`${timingAnalysis.summary.too_fast_rate.toFixed(1)}%`:"—"} icon="⚡" color={T.amber} sub={`${timingAnalysis.summary.too_fast_count??0} answers`} />
                        <MetricCard label="Too Slow"        value={timingAnalysis.summary.too_slow_rate!=null?`${timingAnalysis.summary.too_slow_rate.toFixed(1)}%`:"—"} icon="🐢" color={T.orange} sub={`${timingAnalysis.summary.too_slow_count??0} answers`} />
                      </div>
                      {(timingAnalysis.sections??[]).length > 0 && (
                        <div style={{ marginBottom:14 }}>
                          <p style={{ margin:"0 0 8px",fontSize:12,color:T.textSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>Timer by Section</p>
                          <table className="att-table">
                            <thead><tr><th>Section</th><th>Timed Questions</th><th>Avg Duration (sec)</th><th>Human-like Rate</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.sections??[]).map((s,i)=>(
                                <tr key={i}>
                                  <td>{s.section}</td><td>{s.timed_questions??0}</td>
                                  <td>{s.avg_duration_sec!=null?s.avg_duration_sec.toFixed(1):"—"}</td>
                                  <td style={{ color:(s.human_like_rate??0)>=70?T.pass:T.amber, fontWeight:700 }}>
                                    {s.human_like_rate!=null?`${s.human_like_rate.toFixed(1)}%`:"—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {(timingAnalysis.suspicious_attempts??[]).length > 0 && (
                        <div>
                          <p style={{ margin:"0 0 8px",fontSize:12,color:T.textSoft,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>Potentially Random / Too-fast Attempts</p>
                          <table className="att-table">
                            <thead><tr><th>Name</th><th>Date</th><th>Too Fast Rate</th><th>Timed Questions</th></tr></thead>
                            <tbody>
                              {(timingAnalysis.suspicious_attempts??[]).map((a,i)=>(
                                <tr key={i} style={{ cursor:"pointer" }} onClick={()=>openTimingModal(a)} title="Click to view per-question timings">
                                  <td style={{fontWeight:700}}>{a.name||"Unknown"}</td>
                                  <td style={{color:T.textSoft,fontSize:12}}>{a.created_at?new Date(a.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}</td>
                                  <td style={{color:T.fail,fontWeight:700}}>{a.too_fast_rate?.toFixed(1)}%</td>
                                  <td>{a.timed_questions??0}</td>
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
                <div style={{ marginBottom: 16 }}>
                  <ChartContainer title="Monthly Summary" subtitle="Pass/fail counts per month for selected year"
                    action={
                      <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))} style={selectStyle}>
                        {Array.from({length:5},(_,i)=>new Date().getFullYear()-i).map(yr=>(
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    }
                  >
                    {(monthly??[]).length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={(monthly??[]).map(m=>({ month:MONTH_NAMES[m.month-1], Pass:m.pass_count, Fail:m.fail_count }))} margin={{top:5,right:20,left:0,bottom:5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                          <XAxis dataKey="month" tick={{fontSize:12,fill:T.textSoft}}/>
                          <YAxis tick={{fontSize:12,fill:T.textSoft}}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend formatter={v=><span style={{fontSize:12,color:T.textMid}}>{v}</span>}/>
                          <Bar dataKey="Pass" fill={T.pass} radius={[4,4,0,0]} barSize={16}/>
                          <Bar dataKey="Fail" fill={T.fail} radius={[4,4,0,0]} barSize={16}/>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p style={{ fontSize:13,color:T.textSoft }}>No data for {selectedYear}. Students need to submit predictions first.</p>}
                  </ChartContainer>
                </div>

                {/* Attempts Table */}
                <ChartContainer title="Recent Prediction Attempts" subtitle="Paginated log from prediction_attempts table"
                  action={
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <input
                        type="number" placeholder="Year" value={attFilter.year}
                        onChange={e=>{setAttFilter(f=>({...f,year:e.target.value}));setAttPage(1);}}
                        style={{ ...selectStyle, width:80, minWidth:0 }}
                      />
                      <input
                        type="number" placeholder="Month (1–12)" min="1" max="12" value={attFilter.month}
                        onChange={e=>{setAttFilter(f=>({...f,month:e.target.value}));setAttPage(1);}}
                        style={{ ...selectStyle, width:100, minWidth:0 }}
                      />
                      <button onClick={()=>{setAttFilter({year:"",month:""});setAttPage(1);}} style={{ background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>Clear</button>
                      {attempts && <span style={{ fontSize:12,color:T.textSoft }}>{attempts.total} total</span>}
                    </div>
                  }
                >
                  {attempts && (attempts.items??[]).length > 0 ? (
                    <>
                      <table className="att-table">
                        <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>User ID</th></tr></thead>
                        <tbody>
                          {(attempts.items??[]).map((item,i)=>(
                            <tr key={i}>
                              <td style={{color:T.textSoft,fontSize:12}}>{new Date(item.created_at).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                              <td>
                                <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:999, background:item.label==="PASSED"?T.passSoft:T.failSoft, color:item.label==="PASSED"?T.pass:T.fail, border:`1px solid ${item.label==="PASSED"?T.passLight:T.failLight}` }}>
                                  {item.label}
                                </span>
                              </td>
                              <td style={{ fontWeight:700, color:item.probability_pass>=0.7?T.pass:item.probability_pass>=0.5?T.amber:T.fail }}>
                                {(item.probability_pass*100).toFixed(1)}%
                              </td>
                              <td style={{ color:item.predicted_rating_a>=70?T.pass:item.predicted_rating_a>=60?T.amber:T.fail, fontWeight:600 }}>
                                {item.predicted_rating_a?.toFixed(1)??"—"}
                              </td>
                              <td style={{ color:T.textSoft,fontSize:11 }}>{item.user_id?item.user_id.slice(0,8)+"…":"—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display:"flex",gap:8,marginTop:14,alignItems:"center",justifyContent:"flex-end" }}>
                        <button onClick={()=>setAttPage(p=>Math.max(1,p-1))} disabled={attPage===1}
                          style={{ background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 14px",color:attPage===1?T.textSoft:T.text,fontSize:12,cursor:attPage===1?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>← Prev</button>
                        <span style={{ fontSize:12,color:T.textSoft }}>{attPage} / {Math.ceil(((attempts.total)||1)/20)}</span>
                        <button onClick={()=>setAttPage(p=>p+1)} disabled={attPage>=Math.ceil(((attempts.total)||1)/20)}
                          style={{ background:T.blueSoft,border:`1px solid ${T.blueLight}`,borderRadius:8,padding:"6px 14px",color:T.blue,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>Next →</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding:32, textAlign:"center" }}>
                      <p style={{ fontSize:14,color:T.textSoft }}>No prediction attempts found.</p>
                      <p style={{ fontSize:12,color:T.textSoft,marginTop:4 }}>Students need to log in and submit predictions first.</p>
                    </div>
                  )}
                </ChartContainer>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Timing Modal ── */}
      {timingModalOpen && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(6px)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
          onClick={()=>setTimingModalOpen(false)}>
          <div style={{ width:"min(980px,96vw)",maxHeight:"85vh",overflow:"auto",background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10 }}>
              <div>
                <p style={{ margin:"0 0 2px",fontSize:18,fontWeight:800,color:T.text,fontFamily:"'Syne',sans-serif" }}>Attempt Timer Drill-down</p>
                <p style={{ margin:0,fontSize:13,color:T.textSoft }}>{selectedTimingAttempt?.name||"Unknown"} · {selectedTimingAttempt?.attempt_id?selectedTimingAttempt.attempt_id.slice(0,8):""}</p>
              </div>
              <button onClick={()=>setTimingModalOpen(false)} style={{ background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 16px",color:T.textMid,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>✕ Close</button>
            </div>
            {selectedTimingLoading ? <p style={{ color:T.textSoft,fontSize:13 }}>Loading timing details…</p>
            : selectedTimingData?.error ? <p style={{ color:T.fail,fontSize:13 }}>{selectedTimingData.error}</p>
            : (
              <table className="att-table">
                <thead><tr><th>Question</th><th>Section</th><th>Order</th><th>Actual Duration (sec)</th><th>Expected Range (sec)</th><th>Human-like?</th></tr></thead>
                <tbody>
                  {(selectedTimingData?.items??[]).map((t,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{t.question_key}</td>
                      <td style={{color:T.textSoft}}>{t.step_id||"—"}</td>
                      <td>{t.question_index??"—"}</td>
                      <td>{t.duration_sec??"—"}</td>
                      <td style={{color:T.textSoft}}>{t.expected_min_sec!=null&&t.expected_max_sec!=null?`${t.expected_min_sec} – ${t.expected_max_sec}`:"—"}</td>
                      <td style={{ color:t.is_human_like?T.pass:T.fail,fontWeight:700 }}>{t.is_human_like?"✓ Yes":"✗ No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function navBtnStyle(T) {
  return {
    background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 9,
    padding: "8px 16px", color: T.textMid, fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s", fontWeight: 600,
  };
}