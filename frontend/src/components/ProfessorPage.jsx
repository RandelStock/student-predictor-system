import { useState, useEffect, useCallback } from "react";
import ExamineeDetailPanel from "./ExamineeDetailPanel";
import API_BASE_URL from "../apiBase";

// ── colour helpers ────────────────────────────────────────────────────────────
const c = {
  pass:   "#34d399",
  fail:   "#f87171",
  blue:   "#38bdf8",
  indigo: "#818cf8",
  amber:  "#fbbf24",
  orange: "#fb923c",
  pink:   "#f472b6",
  teal:   "#2dd4bf",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function pct(v) { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }

// ── tiny bar ─────────────────────────────────────────────────────────────────
function Bar({ value, max = 100, color = c.blue, height = 6 }) {
  return (
    <div style={{ height, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
    </div>
  );
}

// ── horizontal bar chart ──────────────────────────────────────────────────────
function HBar({ items, colorFn, maxValue }) {
  const safeItems = items ?? [];
  const mx = maxValue ?? Math.max(...safeItems.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {safeItems.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "140px", fontSize: "11px", color: "#94a3b8", textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>
            {item.label}
          </span>
          <div style={{ flex: 1, height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%",
              width: `${(item.value / mx) * 100}%`,
              background: colorFn ? colorFn(item, i) : c.blue,
              borderRadius: 99,
              transition: "width 1s ease",
            }} />
          </div>
          <span style={{ width: "44px", fontSize: "11px", color: "#f1f5f9", fontWeight: 700, textAlign: "right", flexShrink: 0 }}>
            {item.suffix ? item.value + item.suffix : pct(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── double bar (passers vs failers) ──────────────────────────────────────────
function DoubleBar({ items }) {
  const safeItems = items ?? [];
  const maxV = Math.max(...safeItems.flatMap(d => [d.pass ?? 0, d.fail ?? 0]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {safeItems.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.label}</span>
            <span style={{ fontSize: "10px", color: "#475569" }}>
              <span style={{ color: c.pass }}>P:{num(item.pass)}</span> / <span style={{ color: c.fail }}>F:{num(item.fail)}</span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ height: "7px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((item.pass ?? 0) / maxV) * 100}%`, background: c.pass, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
            <div style={{ height: "7px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((item.fail ?? 0) / maxV) * 100}%`, background: c.fail, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: "14px", marginTop: "4px" }}>
        <span style={{ fontSize: "10px", color: c.pass, display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c.pass, display: "inline-block" }} />Passers</span>
        <span style={{ fontSize: "10px", color: c.fail, display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c.fail, display: "inline-block" }} />Failers</span>
      </div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Card({ title, icon, subtitle, children, accent = c.blue, fullWidth = false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: "16px", padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: subtitle ? "4px" : "16px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{title}</span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
      </div>
      {subtitle && <p style={{ margin: "0 0 14px", fontSize: "11px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ── KPI chip ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, color = c.blue }) {
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}25`,
      borderRadius: "12px", padding: "14px 16px",
    }}>
      <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans',sans-serif" }}>{label}</p>
      <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "10px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>}
    </div>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────
function Delta({ value }) {
  if (value === undefined || value === null) return null;
  const up    = value > 0;
  const zero  = value === 0;
  const color = zero ? "#475569" : up ? c.pass : c.fail;
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700,
      color, background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: "999px", padding: "1px 6px",
      marginLeft: "6px",
    }}>
      {zero ? "—" : up ? `▲ +${value}` : `▼ ${value}`}
    </span>
  );
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
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

// ── Main ProfessorPage ────────────────────────────────────────────────────────
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

  // Final defense / held-out evaluation (2025)
  const [test2025, setTest2025] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Select a specific DATA_TEST 2025 examinee
  const [test2025Records, setTest2025Records] = useState(null);
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [test2025Run, setTest2025Run] = useState(null);
  const [test2025RunLoading, setTest2025RunLoading] = useState(false);

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
      // Merge with mock defaults so missing keys never cause .map() errors
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
    } catch (e) {
      console.error("Admin fetch error:", e);
    }
  }, [attPage, attFilter, selectedYear]);

  const fetchTrendInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/trend-insights`);
      if (res.ok) setTrendInsights(await res.json());
    } catch (e) {
      console.error("Trend insights error:", e);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/usage-summary?days=30`);
      if (res.ok) setUsageSummary(await res.json());
    } catch (e) {
      console.error("Usage summary error:", e);
    } finally {
      setUsageLoading(false);
    }
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
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Performance report download error:", e);
      alert("Could not download performance report. Check backend logs and DB configuration.");
    } finally {
      setReportLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    const run = async () => {
      setTestLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) setTest2025(payload);
      } catch (e) {
        if (!cancelled) setTest2025({ error: "Could not load 2025 defense metrics. Run train_model.py first." });
      } finally {
        if (!cancelled) setTestLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    let cancelled = false;
    const loadRecords = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-records`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) {
          setTest2025Records(payload.error ? null : payload.items || []);
          setSelectedTestIdx(0);
        }
      } catch (e) {
        if (!cancelled) setTest2025Records([]);
      }
    };
    loadRecords();
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "test2025") return;
    if (!test2025Records || test2025Records.length === 0) return;
    let cancelled = false;
    const runPredict = async () => {
      setTest2025RunLoading(true);
      setTest2025Run(null);
      try {
        const res = await fetch(`${API_BASE_URL}/defense/test-2025-predict?idx=${selectedTestIdx}`);
        if (!res.ok) throw new Error("Server error");
        const payload = await res.json();
        if (!cancelled) setTest2025Run(payload.error ? { error: payload.error } : payload);
      } catch (e) {
        if (!cancelled) setTest2025Run({ error: "Could not load prediction for this row." });
      } finally {
        if (!cancelled) setTest2025RunLoading(false);
      }
    };
    runPredict();
    return () => { cancelled = true; };
  }, [activeTab, selectedTestIdx, test2025Records]);

  useEffect(() => {
    if (activeTab === "trends") {
      fetchAdminFromDb();
      fetchUsage();
      if (!trendInsights) fetchTrendInsights();
    }
  }, [activeTab, fetchAdminFromDb, fetchTrendInsights, trendInsights, fetchUsage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "trends") fetchAdminFromDb();
  }, [attPage, attFilter, selectedYear, activeTab, fetchAdminFromDb]);

  const TABS = [
    { id: "overview",     label: "Overview",            icon: "📊" },
    { id: "performance",  label: "Performance",         icon: "📈" },
    { id: "features",     label: "Feature Importance",  icon: "🤖" },
    { id: "curriculum",   label: "Curriculum Gaps",     icon: "🏫" },
    { id: "correlation",  label: "Correlation",         icon: "🧮" },
    { id: "test2025",     label: "2025 Final Defense",  icon: "🧪" },
    { id: "trends",       label: "Trends & Monitoring", icon: "📅" },
  ];

  const ov = data?.overview ?? {};

  // Safe array accessors
  const passByYear     = data?.pass_rate_by_year     ?? [];
  const passByStrand   = data?.pass_rate_by_strand   ?? [];
  const passByReview   = data?.pass_rate_by_review   ?? [];
  const passByDuration = data?.pass_rate_by_duration ?? [];
  const featureImp     = data?.feature_importance    ?? [];
  const sectionScores  = data?.section_scores        ?? [];
  const weakestQ       = data?.weakest_questions     ?? [];
  const subjectTrends  = data?.subject_trends_by_year ?? [];

  const weakestSubject = (() => {
    if (!subjectTrends || subjectTrends.length === 0) return null;
    const first = subjectTrends[0];
    const last  = subjectTrends[subjectTrends.length - 1];
    const mk = (id, avgKey, deltaKey) => {
      const avg = Number(last?.[avgKey]);
      const fallbackDelta = Number(last?.[avgKey]) - Number(first?.[avgKey]);
      const deltaRaw = last?.[deltaKey];
      const delta = Number(deltaRaw ?? fallbackDelta);
      return { id, avg, delta };
    };
    const candidates = [
      mk("EE", "EE_avg", "EE_delta"),
      mk("MATH", "MATH_avg", "MATH_delta"),
      mk("ESAS", "ESAS_avg", "ESAS_delta"),
    ].filter(x => Number.isFinite(x.avg) && Number.isFinite(x.delta));

    if (!candidates.length) return null;
    candidates.sort((a, b) => a.avg - b.avg); // weakest = lowest latest average
    return candidates[0];
  })();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
        .tab-btn   { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
        @media(max-width:600px){ .dash-grid{grid-template-columns:1fr !important} }
        .att-table { width:100%; border-collapse:collapse; font-size:11px; font-family:'DM Sans',sans-serif; }
        .att-table th { padding:8px 10px; border-bottom:1px solid rgba(148,163,184,0.2); text-align:left; color:#475569; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; font-size:10px; }
        .att-table td { padding:8px 10px; border-bottom:1px solid rgba(30,41,59,0.6); color:#cbd5e1; }
        .att-table tr:hover td { background:rgba(255,255,255,0.02); }
        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px 10px; color:#f1f5f9; font-size:12px; font-family:'DM Sans',sans-serif; outline:none; }
        .filter-input:focus { border-color:rgba(56,189,248,0.5); }
      `}</style>

      {/* ══ TOP NAV ══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(6,11,20,0.94)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "76px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <img
              src="/slsulogo.png" alt="SLSU"
              style={{ width: "46px", height: "46px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(139,92,246,0.3))" }}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <div style={{ display: "none", width: "46px", height: "46px", borderRadius: "11px", background: "linear-gradient(135deg, #7c3aed, #6366f1)", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔬</div>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "14px" }}>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.01em", fontFamily: "'Syne',sans-serif" }}>Insights Dashboard</p>
            <p style={{ margin: 0, fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Sans',sans-serif" }}>Faculty Portal · SLSU IIEE</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={fetchAnalytics}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "8px 16px", color: "#64748b", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"} onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            ↻ Refresh
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: "999px", padding: "6px 14px" }}>
            <span style={{ fontSize: "13px" }}>🔬</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#a78bfa", fontFamily: "'DM Sans',sans-serif" }}>Faculty</span>
          </div>
          <button onClick={onLogout}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "8px 18px", color: "#64748b", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Tab Bar ── */}
      <div style={{ background: "rgba(6,11,20,0.8)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 24px", display: "flex", gap: "2px", overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
            padding: "14px 18px", fontSize: "12px",
            fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? "#38bdf8" : "#475569",
            borderBottom: activeTab === tab.id ? "2px solid #38bdf8" : "2px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px 64px" }}>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: "16px" }}>
            <svg style={{ animation: "spin 0.8s linear infinite", width: "32px", height: "32px", color: "#38bdf8" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: "13px", color: "#475569" }}>Loading analytics…</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === "overview" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Institutional Overview</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Aggregate statistics across all EE board exam takers in the dataset.</p>
                  <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                    Note: The analytics in this dashboard summarize <strong>first-attempt outcomes</strong> only (FAILED-RETAKE is treated as an outcome category label, not a second prediction attempt).
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "10px", marginBottom: "16px" }}>
                  <KPI label="Total Students"    value={ov.total_students}                 color={c.blue} />
                  <KPI label="Total Passers"     value={ov.total_passers}                  color={c.pass} />
                  <KPI label="Total Failers"     value={ov.total_failers}                  color={c.fail} />
                  <KPI label="Overall Pass Rate" value={pct(ov.overall_pass_rate)}         color={ov.overall_pass_rate >= 70 ? c.pass : c.amber} />
                  <KPI label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}           color={c.pass} sub="1.0=Highest" />
                  <KPI label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}           color={c.fail} sub="1.0=Highest" />
                </div>
                <div className="dash-grid">
                  <Card title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA = better in PH grading (1.0 is highest)">
                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                      {[
                        { label: "Passers Avg GWA", value: ov.avg_gwa_passers, color: c.pass },
                        { label: "Failers Avg GWA",  value: ov.avg_gwa_failers,  color: c.fail },
                      ].map((x, i) => (
                        <div key={i} style={{ flex: 1, background: `${x.color}0d`, border: `1px solid ${x.color}25`, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                          <p style={{ margin: "0 0 4px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>{x.label}</p>
                          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: x.color, fontFamily: "'Syne',sans-serif" }}>{num(x.value)}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "12px 14px", fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                      💡 Passers had a GWA <strong style={{ color: "#f1f5f9" }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} points better</strong> than failers — confirming GWA as a strong predictor.
                    </div>
                  </Card>

                  <Card title="Pass Rate by Year" icon="📅" subtitle="Trend of board exam performance per graduating cohort">
                    <HBar
                      items={passByYear.map(d => ({ label: d.label, value: d.pass_rate }))}
                      colorFn={(item) => item.value >= 70 ? c.pass : item.value >= 55 ? c.amber : c.fail}
                    />
                  </Card>

                  <Card title="Pass Rate by Review Attendance" icon="📖" subtitle="Did attending a formal review program make a difference?">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                      {passByReview.map((d, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{d.label}</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: d.pass_rate >= 70 ? c.pass : c.fail }}>{pct(d.pass_rate)}</span>
                          </div>
                          <Bar value={d.pass_rate} color={d.pass_rate >= 70 ? c.pass : c.fail} height={8} />
                          <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#334155" }}>n = {d.total} students</p>
                        </div>
                      ))}
                    </div>
                    {passByReview.length >= 2 && (
                      <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                        💡 Students who attended formal review outperformed those who did not by <strong style={{ color: "#f1f5f9" }}>{pct(passByReview[0].pass_rate - passByReview[1].pass_rate)}</strong>
                      </div>
                    )}
                  </Card>

                  <Card title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review = higher pass rate?">
                    <HBar
                      items={passByDuration.map(d => ({ label: d.label, value: d.pass_rate }))}
                      colorFn={(item) => item.value >= 80 ? c.pass : item.value >= 65 ? c.amber : c.fail}
                    />
                  </Card>

                  <Card title="Model Performance" icon="📈" subtitle="Random Forest classifier and regressors (Chapter 4 metrics)">
                    {modelInfo ? (
                      <div style={{ fontSize: "11px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                        <p style={{ margin: "0 0 4px" }}>
                          <strong>Classification (Pass / Fail)</strong><br />
                          Accuracy: {modelInfo.classification.accuracy.toFixed(3)} · F1: {modelInfo.classification.f1.toFixed(3)}<br />
                          CV Acc: {modelInfo.classification.cv_acc.toFixed(3)} · CV F1: {modelInfo.classification.cv_f1.toFixed(3)}
                        </p>
                        <p style={{ margin: "8px 0 4px" }}>
                          <strong>Regression A</strong> (with subject scores)<br />
                          MAE: {modelInfo.regression_a.mae.toFixed(2)} · MSE: {modelInfo.regression_a.mse.toFixed(2)} · RMSE: {modelInfo.regression_a.rmse.toFixed(2)} · R²: {modelInfo.regression_a.r2.toFixed(3)}
                        </p>
                        <p style={{ margin: "8px 0 0" }}>
                          <strong>Regression B</strong> (GWA + survey only)<br />
                          MAE: {modelInfo.regression_b.mae.toFixed(2)} · MSE: {modelInfo.regression_b.mse.toFixed(2)} · RMSE: {modelInfo.regression_b.rmse.toFixed(2)} · R²: {modelInfo.regression_b.r2.toFixed(3)}
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", color: "#64748b" }}>Loading model metrics…</p>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* ══ PERFORMANCE TAB ══ */}
            {activeTab === "performance" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Performance Breakdown</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Pass rates by SHS strand, survey section scores, and subject score trends by year.</p>
                </div>
                <div className="dash-grid">
                  <Card title="Pass Rate by SHS Strand" icon="🎓" subtitle="Does your Senior High School track matter?">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {passByStrand.map((d, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>{d.label}</span>
                              <span style={{ fontSize: "9px", color: "#334155", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 999 }}>n={d.total}</span>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: d.pass_rate >= 70 ? c.pass : d.pass_rate >= 55 ? c.amber : c.fail }}>{pct(d.pass_rate)}</span>
                          </div>
                          <Bar value={d.pass_rate} color={d.pass_rate >= 70 ? c.pass : d.pass_rate >= 55 ? c.amber : c.fail} height={7} />
                        </div>
                      ))}
                    </div>
                    {passByStrand.length > 0 && (
                      <div style={{ marginTop: "14px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                        💡 STEM graduates had the highest pass rate at <strong style={{ color: "#f1f5f9" }}>{pct(passByStrand[0].pass_rate)}</strong>, consistent with its math-heavy curriculum.
                      </div>
                    )}
                  </Card>

                  {/* Subject Trends by Year */}
                  {subjectTrends.length > 0 && (
                    <Card title="Subject Score Trends by Year" icon="📐" subtitle="Average EE, MATH, ESAS scores per cohort year (CSV dataset)" fullWidth>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "'DM Sans',sans-serif" }}>
                          <thead>
                            <tr>
                              {["Year", "EE Avg", "MATH Avg", "ESAS Avg"].map(h => (
                                <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid rgba(148,163,184,0.2)", textAlign: "left", color: "#475569", fontWeight: 600, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.06em" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {subjectTrends.map((row, i) => (
                              <tr key={i}>
                                <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", fontWeight: 700, color: "#f1f5f9" }}>{row.year}</td>
                                {[
                                  { val: row.EE_avg,   delta: row.EE_delta,   color: c.blue   },
                                  { val: row.MATH_avg, delta: row.MATH_delta, color: c.indigo },
                                  { val: row.ESAS_avg, delta: row.ESAS_delta, color: c.teal   },
                                ].map((cell, j) => (
                                  <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)" }}>
                                    <span style={{ fontWeight: 700, color: cell.val >= 70 ? c.pass : cell.val >= 60 ? c.amber : c.fail }}>{cell.val}</span>
                                    <Delta value={cell.delta} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {["EE", "MATH", "ESAS"].map((subj, i) => {
                          const last        = subjectTrends[subjectTrends.length - 1];
                          const first       = subjectTrends[0];
                          const totalDelta  = last[`${subj}_avg`] - first[`${subj}_avg`];
                          const improving   = totalDelta > 0;
                          const col         = [c.blue, c.indigo, c.teal][i];
                          return (
                            <div key={subj} style={{ background: `${col}0d`, border: `1px solid ${col}25`, borderRadius: "10px", padding: "10px 12px" }}>
                              <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>{subj} Trend</p>
                              <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: col, fontFamily: "'Syne',sans-serif" }}>{last[`${subj}_avg`]}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "10px", color: improving ? c.pass : c.fail }}>
                                {improving ? "▲" : "▼"} {Math.abs(totalDelta).toFixed(1)} pts overall
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {weakestSubject && (
                        <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                          ⚠ Weakest subject (latest cohort): <strong style={{ color: "#f1f5f9" }}>{weakestSubject.id}</strong> (latest avg = {num(weakestSubject.avg, 1)}).
                          {' '}
                          Trend:{" "}
                          <strong style={{ color: weakestSubject.delta >= 0 ? c.pass : c.fail }}>
                            {weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} ({Math.abs(weakestSubject.delta).toFixed(1)} pts overall)
                          </strong>
                        </div>
                      )}
                    </Card>
                  )}

                  <Card title="Survey Section Scores: Passers vs Failers" icon="📊" subtitle="Average section score (0–100) split by outcome" fullWidth>
                    <DoubleBar items={sectionScores} />
                    <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "8px" }}>
                      {sectionScores.map((s, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 12px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>{s.label}</p>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: c.pass }}>{num(s.pass)}%</span>
                            <span style={{ fontSize: "12px", color: "#334155" }}>vs</span>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: c.fail }}>{num(s.fail)}%</span>
                            <span style={{ fontSize: "11px", color: "#475569", marginLeft: "auto" }}>Δ {num(s.pass - s.fail)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ FEATURES TAB ══ */}
            {activeTab === "features" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Feature Importance</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Top predictors from the Random Forest classifier — what matters most for passing the EE board exam.</p>
                </div>
                <Card title="Top 10 Predictors (Random Forest — Classification Model)" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail prediction" fullWidth>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {featureImp.map((f, i) => {
                      const maxV  = featureImp[0]?.value ?? 1;
                      const pctW  = (f.value / maxV) * 100;
                      const color = i === 0 ? c.blue : i === 1 ? c.indigo : i === 2 ? c.teal : i < 4 ? c.amber : "#64748b";
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ flex: "0 0 240px", fontSize: "11px", color: "#94a3b8", lineHeight: 1.3 }}>{f.label}</span>
                          <div style={{ flex: 1, height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pctW}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, transition: "width 1s ease" }} />
                          </div>
                          <span style={{ width: "52px", fontSize: "11px", fontWeight: 700, color, textAlign: "right", flexShrink: 0 }}>{f.value.toFixed(4)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
                    {[
                      { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS scores are the #1–3 predictors, accounting for ~39% of total importance." },
                      { icon: "📚", title: "GWA is #4", desc: "Academic performance (GWA) is the strongest non-exam predictor, confirming its role in the model." },
                      { icon: "🧠", title: "Survey Factors Matter", desc: "Problem-solving confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
                    ].map((x, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: "12px", padding: "14px" }}>
                        <p style={{ margin: "0 0 6px", fontSize: "13px" }}>{x.icon}</p>
                        <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{x.title}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>{x.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ══ CURRICULUM TAB ══ */}
            {activeTab === "curriculum" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Curriculum Gap Analysis</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Survey questions with the lowest average scores — these directly indicate institutional weaknesses.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "#fcd34d", fontFamily: "'Syne',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                        Items below are sorted by average Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores mean students are <strong style={{ color: "#fbbf24" }}>disagreeing more</strong>, signaling institutional gaps.
                      </p>
                    </div>
                  </div>
                  <Card title="10 Weakest Survey Items (Highest Avg Score = Most Disagreement)" icon="🔎" subtitle="Items scoring above 2.5 are critical concern areas" fullWidth>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "8px" }}>
                      {weakestQ.map((q, i) => {
                        const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
                        const sColor   = severity === "high" ? c.fail : severity === "medium" ? c.amber : c.orange;
                        const barPct   = ((q.avg - 1) / 3) * 100;
                        return (
                          <div key={i} style={{ background: `${sColor}08`, border: `1px solid ${sColor}25`, borderRadius: "12px", padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                <span style={{ fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: `${sColor}20`, color: sColor, border: `1px solid ${sColor}40`, flexShrink: 0 }}>{q.key}</span>
                                <span style={{ fontSize: "9px", color: "#475569", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 999 }}>{q.section}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: `${sColor}15`, border: `1px solid ${sColor}30`, borderRadius: "999px", padding: "2px 8px", flexShrink: 0 }}>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: sColor }}>{q.avg.toFixed(2)}</span>
                                <span style={{ fontSize: "9px", color: sColor + "99" }}>/4</span>
                              </div>
                            </div>
                            <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#cbd5e1", lineHeight: 1.4 }}>{q.label}</p>
                            <Bar value={barPct} max={100} color={sColor} height={5} />
                            <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#475569" }}>
                              {severity === "high" ? "🔴 Critical — requires immediate attention" : severity === "medium" ? "🟡 Moderate — monitor and improve" : "🟠 Low concern — room for improvement"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  <Card title="Gap Summary by Category" icon="📋" subtitle="Which institutional categories have the most weak items?" fullWidth>
                    {(() => {
                      const counts = {};
                      weakestQ.forEach(q => {
                        if (!counts[q.section]) counts[q.section] = { count: 0, avgTotal: 0 };
                        counts[q.section].count++;
                        counts[q.section].avgTotal += q.avg;
                      });
                      const cats = Object.entries(counts).map(([label, v]) => ({ label, count: v.count, avg: v.avgTotal / v.count })).sort((a, b) => b.avg - a.avg);
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "8px" }}>
                          {cats.map((cat, i) => {
                            const sev = cat.avg >= 2.65 ? c.fail : cat.avg >= 2.55 ? c.amber : c.orange;
                            return (
                              <div key={i} style={{ background: `${sev}0d`, border: `1px solid ${sev}25`, borderRadius: "10px", padding: "12px" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{cat.label}</p>
                                <p style={{ margin: "0 0 6px", fontSize: "10px", color: "#475569" }}>{cat.count} weak item{cat.count > 1 ? "s" : ""}</p>
                                <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: sev, fontFamily: "'Syne',sans-serif" }}>{num(cat.avg)}<span style={{ fontSize: "10px", color: "#475569" }}>/4</span></p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div style={{ marginTop: "14px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "12px 14px", fontSize: "11px", color: "#64748b", lineHeight: 1.7 }}>
                      🎯 <strong style={{ color: "#f1f5f9" }}>Key Finding:</strong> Facilities and Dept. Review items consistently score highest (most disagreement), suggesting physical resources and department-organized review programs are the most critical gaps.
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ══ CORRELATION TAB ══ */}
            {activeTab === "correlation" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Correlation Matrix</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Pearson correlations between key academic variables and exam outcome.</p>
                </div>
                <Card title="Correlation Matrix" icon="🧮" subtitle="Pearson correlations between key academic variables and exam outcome" fullWidth>
                  {correlation ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
                        <thead>
                          <tr>
                            <th style={{ padding: "6px 8px", borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>Variable</th>
                            {(correlation.columns ?? []).map(col => (
                              <th key={col} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "right" }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(correlation.matrix ?? []).map(row => (
                            <tr key={row.row}>
                              <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(30,41,59,0.7)", fontWeight: 600 }}>{row.row}</td>
                              {(correlation.columns ?? []).map(col => {
                                const val    = row[col];
                                const absVal = Math.abs(val);
                                const isDiag = col === row.row;
                                const color  = isDiag ? "#475569" : absVal >= 0.7 ? c.pass : absVal >= 0.4 ? c.amber : "#94a3b8";
                                return (
                                  <td key={col} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(30,41,59,0.7)", textAlign: "right", fontWeight: absVal >= 0.4 && !isDiag ? 700 : 400, color }}>
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
                    <p style={{ fontSize: "11px", color: "#64748b" }}>Correlation data not available.</p>
                  )}
                  <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 14px", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                    💡 Values <strong style={{ color: c.pass }}>&gt; 0.7</strong> indicate strong correlation. <strong style={{ color: c.amber }}>0.4–0.7</strong> moderate. Diagonal = 1.00 (self-correlation).
                  </div>
                </Card>
              </div>
            )}

            {/* ══ 2025 FINAL DEFENSE TAB ══ */}
            {activeTab === "test2025" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>2025 Final Defense</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                    Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).
                  </p>
                </div>

                {testLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", color: "#64748b" }}>
                    Loading 2025 metrics…
                  </div>
                ) : test2025 && test2025.error ? (
                  <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "14px", padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#fca5a5", lineHeight: 1.6 }}>{test2025.error}</p>
                  </div>
                ) : test2025 ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "10px", marginBottom: "16px" }}>
                      <KPI label="Test Accuracy" value={pct((test2025.classification?.accuracy ?? 0) * 100)} color={((test2025.classification?.accuracy ?? 0) >= 0.9) ? c.pass : c.amber} />
                      <KPI label="Precision"     value={pct((test2025.classification?.precision ?? 0) * 100)} color={c.blue} />
                      <KPI label="Recall"        value={pct((test2025.classification?.recall ?? 0) * 100)}    color={c.indigo} />
                      <KPI label="F1-Score"      value={pct((test2025.classification?.f1 ?? 0) * 100)}        color={c.teal} />
                    </div>

                    <div className="dash-grid" style={{ marginBottom: "16px" }}>
                      <Card title="Regression A (EE+MATH+ESAS+GWA)" icon="📉" subtitle="Predicted PRC TOTAL RATING — model 2A">
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>R²</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.a?.r2, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>MAE (pts)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.a?.mae, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>MSE (pts²)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.a?.mse, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE (pts)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.a?.rmse, 4)}</span>
                          </div>
                        </div>
                      </Card>

                      <Card title="Regression B (GWA+Survey only)" icon="🧠" subtitle="Predicted PRC TOTAL RATING — model 2B (no subjects)">
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>R²</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.b?.r2, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>MAE (pts)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.b?.mae, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>MSE (pts²)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.b?.mse, 4)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE (pts)</span>
                            <span style={{ fontSize: "12px", fontWeight: 800 }}>{num(test2025.regression?.b?.rmse, 4)}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card title="Confusion Matrix (Pass/Fail)" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth>
                      {test2025.confusion_matrix ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0" }}>
                            <thead>
                              <tr>
                                <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>Actual \\ Predicted</th>
                                <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "right" }}>FAIL</th>
                                <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "right" }}>PASS</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", fontWeight: 700, color: c.fail }}>FAIL</td>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", textAlign: "right", fontWeight: 800 }}>{test2025.confusion_matrix.actual_fail.pred_fail}</td>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", textAlign: "right" }}>{test2025.confusion_matrix.actual_fail.pred_pass}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", fontWeight: 700, color: c.pass }}>PASS</td>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", textAlign: "right" }}>{test2025.confusion_matrix.actual_pass.pred_fail}</td>
                                <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.7)", textAlign: "right", fontWeight: 800 }}>{test2025.confusion_matrix.actual_pass.pred_pass}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Confusion matrix not available.</p>
                      )}
                      <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                        Note: values are parsed from backend <code>evaluation_report.txt</code>. Re-run <code>train_model.py</code> if you want updated results after changing datasets.
                      </div>
                    </Card>

                    <Card
                      title="Select a 2025 Examinee (Row-level check)"
                      icon="🧪"
                      subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers"
                      fullWidth
                    >
                      <ExamineeDetailPanel
                        records={test2025Records}
                        selectedIdx={selectedTestIdx}
                        onSelect={setSelectedTestIdx}
                        runData={test2025Run}
                        runLoading={test2025RunLoading}
                      />
                    </Card>
                  </>
                ) : (
                  <p style={{ fontSize: "11px", color: "#64748b" }}>No 2025 defense metrics available.</p>
                )}
              </div>
            )}

            {/* ══ TRENDS & MONITORING TAB (Phase 4) ══ */}
            {activeTab === "trends" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Trends & Monitoring</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>Live data from the prediction database — student attempts, monthly summaries, and AI trend insights.</p>
                </div>

                {/* ── System Usage & User Activity ── */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)">
                    {usageLoading ? (
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Loading system usage…</p>
                    ) : usageSummary ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                          <button
                            onClick={downloadPerformanceReport}
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: "10px",
                              padding: "8px 14px",
                              color: "#94a3b8",
                              fontSize: "12px",
                              fontFamily: "'DM Sans',sans-serif",
                              cursor: reportLoading ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              opacity: reportLoading ? 0.7 : 1,
                            }}
                            disabled={reportLoading}
                            title="Download an export-friendly JSON report"
                          >
                            {reportLoading ? "Preparing…" : "Download Performance Report"}
                          </button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                          <KPI label="Total Predictions" value={usageSummary.total_predictions} color={c.blue} />
                          <KPI label="Active Users" value={usageSummary.active_users} color={c.pass} sub="distinct student users" />
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Predictions by Day (last 10 days)
                          </p>
                          <HBar
                            items={(usageSummary.predictions_by_day ?? []).slice(-10).map(d => ({
                              label: d.day ? d.day.slice(5) : "—",
                              value: d.total ?? 0,
                            }))}
                            colorFn={(item) => item.value >= 5 ? c.blue : "#818cf8"}
                          />
                        </div>

                        {(usageSummary.active_users_recent ?? []).length > 0 && (
                          <div>
                            <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              Most Active Students
                            </p>
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: "'DM Sans',sans-serif" }}>
                                <thead>
                                  <tr>
                                    {["Student", "Attempts", "Last Activity"].map(h => (
                                      <th key={h} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.2)", textAlign: "left", color: "#475569", fontWeight: 600, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.06em" }}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(usageSummary.active_users_recent ?? []).map((u, i) => (
                                    <tr key={i}>
                                      <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#e2e8f0", fontWeight: 700 }}>
                                        {u.name || u.user_id || "—"}
                                      </td>
                                      <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#e2e8f0" }}>
                                        {u.attempts ?? 0}
                                      </td>
                                      <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#e2e8f0" }}>
                                        {u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>No usage data yet.</p>
                    )}
                  </Card>
                </div>

                {/* ── AI Trend Insights ── */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="AI Trend Insights" icon="✨" subtitle="Groq AI summary of year-over-year prediction trends">
                    {insightsLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
                        <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: `2px solid ${c.blue}40`, borderTopColor: c.blue, animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Generating AI summary…</span>
                      </div>
                    ) : trendInsights ? (
                      <div>
                        {trendInsights.stats && (trendInsights.stats.years ?? []).length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "8px", marginBottom: "14px" }}>
                            {(trendInsights.stats.years ?? []).map((yr, i) => (
                              <div key={i} style={{ background: `${c.blue}0d`, border: `1px solid ${c.blue}25`, borderRadius: "10px", padding: "10px 12px" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>{yr.year}</p>
                                <p style={{ margin: "0 0 1px", fontSize: "18px", fontWeight: 800, color: yr.pass_rate >= 70 ? c.pass : c.amber, fontFamily: "'Syne',sans-serif" }}>{yr.pass_rate.toFixed(1)}%</p>
                                <p style={{ margin: 0, fontSize: "10px", color: "#475569" }}>{yr.total} attempts · avg {yr.avg_rating.toFixed(1)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "10px", padding: "12px 14px" }}>
                          <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: c.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p>
                          <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.7 }}>{trendInsights.summary}</p>
                        </div>
                        <button onClick={fetchTrendInsights} style={{ marginTop: "10px", background: "transparent", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "8px", padding: "5px 12px", color: c.blue, fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                          ↻ Refresh Insights
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", color: "#64748b" }}>No trend data yet. Submit more predictions to generate insights.</p>
                    )}
                  </Card>
                </div>

                {/* ── Yearly Pass/Fail from DB ── */}
                {(yearlyPF ?? []).length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <Card title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions">
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {(yearlyPF ?? []).map((yr, i) => {
                          const total    = yr.pass_count + yr.fail_count;
                          const passRate = total ? (yr.pass_count / total) * 100 : 0;
                          return (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>{yr.year}</span>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                  <span style={{ fontSize: "11px", color: c.pass }}>✓ {yr.pass_count}</span>
                                  <span style={{ fontSize: "11px", color: c.fail }}>✗ {yr.fail_count}</span>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: passRate >= 70 ? c.pass : c.amber }}>{passRate.toFixed(1)}%</span>
                                </div>
                              </div>
                              <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${passRate}%`, background: `linear-gradient(90deg, ${c.pass}, ${c.teal})`, borderRadius: 99, transition: "width 1s ease" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                )}

                {/* ── Monthly Summary ── */}
                <div style={{ marginBottom: "16px" }}>
                  <Card title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                      <label style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Year:</label>
                      <select className="filter-input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    {(monthly ?? []).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(monthly ?? []).map((m, i) => {
                          const total    = m.total || 1;
                          const passRate = (m.pass_count / total) * 100;
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ width: "36px", fontSize: "11px", color: "#64748b", fontWeight: 600, flexShrink: 0 }}>{MONTH_NAMES[m.month - 1]}</span>
                              <div style={{ flex: 1, height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${passRate}%`, background: passRate >= 70 ? c.pass : c.amber, borderRadius: 99, transition: "width 1s ease" }} />
                              </div>
                              <span style={{ fontSize: "11px", color: "#f1f5f9", fontWeight: 700, width: "44px", textAlign: "right", flexShrink: 0 }}>{passRate.toFixed(0)}%</span>
                              <span style={{ fontSize: "10px", color: "#475569", width: "60px", textAlign: "right", flexShrink: 0 }}>{m.pass_count}P / {m.fail_count}F</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: "11px", color: "#475569" }}>No data for {selectedYear}. Students need to submit predictions first.</p>
                    )}
                  </Card>
                </div>

                {/* ── Attempts Table ── */}
                <Card title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "#64748b" }}>Year:</label>
                      <input className="filter-input" type="number" placeholder="e.g. 2025" value={attFilter.year}
                        onChange={e => { setAttFilter(f => ({ ...f, year: e.target.value })); setAttPage(1); }}
                        style={{ width: "90px" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "#64748b" }}>Month:</label>
                      <input className="filter-input" type="number" placeholder="1–12" min="1" max="12" value={attFilter.month}
                        onChange={e => { setAttFilter(f => ({ ...f, month: e.target.value })); setAttPage(1); }}
                        style={{ width: "70px" }} />
                    </div>
                    <button onClick={() => { setAttFilter({ year: "", month: "" }); setAttPage(1); }}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "5px 12px", color: "#64748b", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      Clear
                    </button>
                    {attempts && (
                      <span style={{ fontSize: "11px", color: "#475569", marginLeft: "auto" }}>
                        {attempts.total} total · Page {attPage}
                      </span>
                    )}
                  </div>

                  {attempts && (attempts.items ?? []).length > 0 ? (
                    <>
                      <div style={{ overflowX: "auto" }}>
                        <table className="att-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Result</th>
                              <th>Pass Prob.</th>
                              <th>Pred. Rating A</th>
                              <th>User ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(attempts.items ?? []).map((item, i) => (
                              <tr key={i}>
                                <td style={{ color: "#64748b" }}>{new Date(item.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                <td>
                                  <span style={{
                                    fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px",
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
                                <td style={{ color: "#475569", fontSize: "10px" }}>{item.user_id ? item.user_id.slice(0, 8) + "…" : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center", justifyContent: "flex-end" }}>
                        <button onClick={() => setAttPage(p => Math.max(1, p - 1))} disabled={attPage === 1}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "5px 12px", color: attPage === 1 ? "#334155" : "#94a3b8", fontSize: "11px", cursor: attPage === 1 ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                          ← Prev
                        </button>
                        <span style={{ fontSize: "11px", color: "#475569" }}>
                          {attPage} / {Math.ceil(((attempts.total) || 1) / 20)}
                        </span>
                        <button onClick={() => setAttPage(p => p + 1)} disabled={attPage >= Math.ceil(((attempts.total) || 1) / 20)}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "5px 12px", color: attPage >= Math.ceil(((attempts.total) || 1) / 20) ? "#334155" : "#94a3b8", fontSize: "11px", cursor: attPage >= Math.ceil(((attempts.total) || 1) / 20) ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                          Next →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                      <p style={{ fontSize: "13px", color: "#475569" }}>No prediction attempts found.</p>
                      <p style={{ fontSize: "11px", color: "#334155", marginTop: "4px" }}>Students need to log in and submit predictions first.</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}