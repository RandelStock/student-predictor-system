import { useMemo, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart,
  Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { pct, num, FilterPanel, InsightBox } from "./ProfessorShared";

/* ─── Design Tokens ───────────────────────────────────────────── */
const IIEE = {
  navy:       "#0B1437",
  navyMid:    "#0F1C4D",
  gold:       "#F5C518",
  goldGlow:   "rgba(245,197,24,0.18)",
  goldBorder: "rgba(245,197,24,0.35)",
  white:      "#F8FAFC",
  muted:      "#94A3B8",
  dimText:    "#64748B",
  cardBg:     "rgba(15,28,77,0.72)",
  cardBorder: "rgba(245,197,24,0.18)",
  passGreen:  "#22C55E",
  failRed:    "#EF4444",
  amber:      "#F59E0B",
  blue:       "#38BDF8",
  teal:       "#2DD4BF",
  indigo:     "#818CF8",
  orange:     "#FB923C",
};



/* ─── Styles ──────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  .iiee-combined * { box-sizing: border-box; }
  .iiee-combined {
    font-family: 'DM Sans', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
  }
  .comb-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: 28px 32px 22px;
    position: relative; overflow: hidden;
  }
  .comb-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .comb-hero-badges { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
  .comb-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:10px;
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
  }
  .comb-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .comb-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .comb-hero-title {
    font-family:'Barlow Condensed',sans-serif;
    font-size:32px; font-weight:900; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .comb-hero-title .ag { color:${IIEE.gold}; }
  .comb-hero-title .ab { color:${IIEE.blue}; }
  .comb-hero-sub { font-size:12px; color:${IIEE.muted}; margin:0; }

  .comb-body { padding:24px 28px 48px; }

  .comb-filter-strip {
    position:sticky; top:0; z-index:20;
    background:rgba(11,20,55,0.95);
    border:1px solid ${IIEE.cardBorder}; border-radius:14px;
    padding:14px 18px; margin-bottom:24px;
    backdrop-filter:blur(16px); box-shadow:0 8px 32px rgba(0,0,0,0.4);
  }
  .comb-year-pill {
    margin-top:10px; padding:8px 14px;
    background:rgba(245,197,24,0.07); border:1px solid ${IIEE.goldBorder};
    border-radius:10px; font-size:12px; color:${IIEE.gold};
    display:flex; align-items:center; gap:8px;
  }

  .comb-divider {
    display:flex; align-items:center; gap:10px; margin:28px 0 16px;
  }
  .comb-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .comb-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .comb-divider-label {
    font-family:'Barlow Condensed',sans-serif;
    font-size:11px; font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* Metric cards */
  .metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(155px,1fr));
    gap:14px; margin-bottom:0;
  }
  .metric-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:18px 16px 14px;
    position:relative; overflow:hidden;
    transition:transform .18s, border-color .18s, box-shadow .18s;
    cursor:default;
  }
  .metric-card:hover {
    transform:translateY(-2px); border-color:${IIEE.gold};
    box-shadow:0 8px 28px rgba(245,197,24,0.12);
  }
  .metric-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .metric-icon { font-size:18px; margin-bottom:10px; display:block; }
  .metric-label {
    font-size:10px; font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px;
  }
  .metric-value {
    font-family:'Barlow Condensed',sans-serif;
    font-size:34px; font-weight:900; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .metric-sub { font-size:10px; color:${IIEE.dimText}; margin-top:4px; }

  /* Chart card */
  .chart-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:18px;
    transition:border-color .18s;
  }
  .chart-card:hover { border-color:rgba(245,197,24,0.35); }
  .chart-card.inner {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:16px;
  }
  .chart-head { display:flex; align-items:flex-start; gap:10px; margin-bottom:14px; }
  .chart-icon {
    width:34px; height:34px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:15px; background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .chart-icon.blue { background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); }
  .chart-title {
    font-family:'Barlow Condensed',sans-serif;
    font-size:14px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .chart-sub { font-size:11px; color:${IIEE.dimText}; margin:0; }
  .chart-note {
    margin-top:10px; padding:8px 12px;
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:11.5px; color:${IIEE.muted}; line-height:1.6;
  }
  .chart-note strong { color:${IIEE.gold}; }

  /* Grids */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .g2 .fw { grid-column:1/-1; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

  /* Section card */
  .sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:20px; overflow:hidden;
    transition:border-color .18s;
  }
  .sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .sec-head {
    display:flex; align-items:flex-start; gap:14px;
    padding:18px 20px 14px; border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .sec-icon {
    width:40px; height:40px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:18px; background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .sec-num {
    font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:900;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .sec-title {
    font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:800;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .sec-subtitle { font-size:11px; color:${IIEE.dimText}; margin:0; }
  .sec-body { padding:18px 20px; }

  /* Model metric rows */
  .model-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .model-row-label { font-size:12px; color:${IIEE.muted}; }
  .model-row-val { font-size:12px; font-weight:700; }
  .prog-track {
    height:6px; background:rgba(255,255,255,0.06);
    border-radius:99px; overflow:hidden; margin-bottom:10px;
  }
  .prog-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }

  /* Insight banner */
  .insight-banner {
    border-left:3px solid ${IIEE.gold};
    background:linear-gradient(90deg,rgba(245,197,24,0.08) 0%,transparent 100%);
    border-radius:0 10px 10px 0; padding:10px 16px;
    margin-bottom:22px; font-size:12.5px; color:${IIEE.white};
  }

  /* Data source tag */
  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px;
  }

  /* Reco card */
  .reco-card {
    background:linear-gradient(135deg,rgba(245,197,24,0.08) 0%,rgba(245,197,24,0.03) 100%);
    border:1px solid rgba(245,197,24,0.25); border-radius:14px; padding:16px 18px;
  }
  .reco-title {
    font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:800;
    text-transform:uppercase; letter-spacing:0.06em; color:${IIEE.gold}; margin:0 0 10px;
  }
  .reco-list { list-style:none; padding:0; margin:0; }
  .reco-list li {
    display:flex; align-items:flex-start; gap:8px; padding:6px 0;
    font-size:12.5px; color:rgba(245,197,24,0.85); line-height:1.5;
    border-bottom:1px solid rgba(245,197,24,0.08);
  }
  .reco-list li:last-child { border-bottom:none; }
  .reco-dot { width:6px; height:6px; border-radius:50%; background:${IIEE.gold}; margin-top:5px; flex-shrink:0; }

  /* Tab buttons */
  .tab-btn {
    padding:8px 14px; border-radius:8px; font-size:12px; font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif;
  }

  @media (max-width:960px) {
    .g2,.g3 { grid-template-columns:1fr; }
    .g2 .fw,.g3 .fw { grid-column:1; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); }
    .comb-body { padding:14px; }
  }
  @media (max-width:540px) {
    .comb-hero { padding:18px 16px 14px; }
    .sec-body { padding:14px; }
    .metrics-grid { grid-template-columns:1fr 1fr; }
  }
  .fade-in { animation:fadeIn .45s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ─── Shared sub-components ───────────────────────────────────── */
function Tip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Divider({ label, icon }) {
  return (
    <div className="comb-divider">
      <div className="comb-divider-line" />
      <div className="comb-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="comb-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="metric-card" style={{ "--ac": color }}>
      <span className="metric-icon">{icon}</span>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function Card({ icon, title, sub, children, note, insight, inner, fullWidth, blueTint }) {
  return (
    <div className={`chart-card${inner ? " inner" : ""}${fullWidth ? " fw" : ""}`}>
      <div className="chart-head">
        <div className={`chart-icon${blueTint ? " blue" : ""}`}>{icon}</div>
        <div>
          <div className="chart-title">{title}</div>
          {sub && <div className="chart-sub">{sub}</div>}
        </div>
      </div>
      {children}
      {(note || insight) && (
        <div className="chart-note">
          {note && <span>{note}</span>}
          {insight && <><br /><strong>↳ {insight}</strong></>}
        </div>
      )}
    </div>
  );
}

function Prog({ value, color }) {
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function SecCard({ num: number, icon, title, subtitle, children }) {
  return (
    <div className="sec-card">
      <div className="sec-head">
        <div className="sec-icon">{icon}</div>
        <div style={{ flex: 1 }}>
          {number && <div className="sec-num">Section {number}</div>}
          <h3 className="sec-title">{title}</h3>
          {subtitle && <p className="sec-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="sec-body">{children}</div>
    </div>
  );
}

function DsTag({ label }) {
  return <div className="ds-tag">📂 {label}</div>;
}

const barColor = (r) => r >= 70 ? IIEE.passGreen : r >= 55 ? IIEE.amber : IIEE.failRed;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────
   Props expected from main.py /dashboard endpoint:

   INSTITUTIONAL (from DATA_UPCOMING — all 333 rows, 2022-2025):
     ov             → { total_students:333, total_passers:200, total_failers:133,
                        overall_pass_rate:60.1, avg_gwa_passers:1.92, avg_gwa_failers:2.15 }
     passByYear     → [ { label:"2022", pass_rate:52.4, passers:54, failers:49, total:103,
                          EE_avg:76.1, MATH_avg:72.0, ESAS_avg:61.8 }, ... ]  (4 items)
     passByPeriod   → [ { label:"2022-Apr", pass_rate:64.4, passers:38, total:59 }, ... ] (8 items)
     subjectByYear  → same structure as passByYear, used for subject trend chart
     pieData        → [ { name:"Passers", value:200, color:"#22C55E" },
                        { name:"Failers", value:133, color:"#EF4444" } ]

   SURVEY (from DATA_MODEL — 60 rows):
     passByStrand   → [ { label:"STEM", pass_rate:63.4, total:41 }, ... ]
     passByDur      → [ { label:"No Review", pass_rate:14.3, total:21 },
                        { label:"3 Months",  pass_rate:50.0, total:30 },
                        { label:"6 Months",  pass_rate:74.1, total:30 } ]
     reviewPieData  → [ { name:"With Review", value:39, color:"#22C55E" },
                        { name:"No Review",   value:21, color:"#EF4444" } ]
     sectionScores  → [ { label:"Knowledge", pass_avg:1.71, fail_avg:1.76, items:12 }, ... ] (10 items)
     weakestQ       → [ { key:"Q1", label:"...", avg:1.2 }, ... ]

   MODEL (from ree_survey_model.pkl eval dict):
     modelInfo      → { classification:{ accuracy, f1, cv_acc, cv_f1 },
                        regression_a:{ mae, rmse, r2 },
                        regression_b:{ mae, rmse, r2 },
                        train_rows:{ clf:60, reg_a:310, reg_b:60 },
                        test_rows:21 }
     scatterData    → [ { actual:71.3, predicted:70.8 }, ... ]   (DATA_TEST predictions)

   SHARED:
     dashFilters, setDashFilters, availableYears, localInsights
═══════════════════════════════════════════════════════════════ */
export default function ModelOverviewDashboard({
  dashFilters, setDashFilters, availableYears, localInsights,
  // Institutional — DATA_UPCOMING (333 rows)
  ov, pieData: propPieData, passByYear, passByPeriod, subjectByYear,
  // Survey — DATA_MODEL (60 rows)
  passByStrand, passByDur, reviewPieData: propReviewPieData,
  sectionScores, weakestQ,
  // Model
  modelInfo, scatterData,
}) {
  const [mode, setMode] = useState("institutional");
  const [activePie, setActivePie] = useState(null);

  const selectedYear = dashFilters?.year || "";

  /* ── Filter institutional data by selected year ── */
  const yearRows = useMemo(() => {
    if (!selectedYear) return passByYear ?? [];
    return (passByYear ?? []).filter((d) => String(d.label) === String(selectedYear));
  }, [selectedYear, passByYear]);

  const displayRows = useMemo(
    () => (yearRows.length ? yearRows : (passByYear ?? [])),
    [yearRows, passByYear]
  );

  /* ── KPIs: recalc from year slice or show all-time ── */
  const kpi = useMemo(() => {
    if (!selectedYear || !yearRows.length) return ov ?? {};
    const yr = yearRows[0];
    const p = yr.passers ?? Math.round((yr.pass_rate / 100) * (yr.total || 0));
    const f = (yr.total || 0) - p;
    return {
      total_students:   yr.total ?? 0,
      total_passers:    p,
      total_failers:    f,
      overall_pass_rate: yr.pass_rate ?? 0,
      avg_gwa_passers:  ov?.avg_gwa_passers ?? 0,
      avg_gwa_failers:  ov?.avg_gwa_failers ?? 0,
    };
  }, [selectedYear, yearRows, ov]);

  /* ── Pie data: recalc when year filter active ── */
  const pieData = useMemo(() => {
    if (!selectedYear || !yearRows.length) return propPieData ?? [];
    const p = kpi.total_passers;
    const f = kpi.total_failers;
    return [
      { name: "Passers", value: p, color: IIEE.passGreen },
      { name: "Failers", value: f, color: IIEE.failRed },
    ];
  }, [selectedYear, yearRows, kpi, propPieData]);

  /* ── Stacked bar data ── */
  const stackData = useMemo(() =>
    displayRows.map((d) => {
      const p = d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0));
      return { label: d.label, Passers: p, Failers: (d.total ?? 0) - p };
    }),
  [displayRows]);

  /* ── Subject trend by year (from DATA_UPCOMING via subjectByYear prop) ── */
  const subjectTrend = useMemo(() =>
    (subjectByYear ?? displayRows).map((d) => ({
      year: d.label,
      EE:   Number(d.EE_avg   ?? d.EE   ?? 0),
      MATH: Number(d.MATH_avg ?? d.MATH ?? 0),
      ESAS: Number(d.ESAS_avg ?? d.ESAS ?? 0),
    })),
  [subjectByYear, displayRows]);

  /* ── Period pass rate (from DATA_UPCOMING passByPeriod) ── */
  const periodData = useMemo(() => {
    const base = passByPeriod ?? [];
    if (!selectedYear) return base;
    return base.filter((d) => d.label?.startsWith(String(selectedYear)));
  }, [passByPeriod, selectedYear]);

  /* ── Survey-derived: section radar data ── */
  const radarData = useMemo(() =>
    (sectionScores ?? []).map((s) => ({
      section: s.label,
      Passers: Number(s.pass_avg ?? 0),
      Failers: Number(s.fail_avg ?? 0),
    })),
  [sectionScores]);

  /* ── Scatter: predicted vs actual (DATA_TEST 21 rows) ── */
  const scatter = useMemo(() => scatterData ?? [], [scatterData]);

  const reliabilityNote = useMemo(() => {
    if (!scatter.length) return "Run train_model.py to populate predicted vs actual data.";
    const mae = scatter.reduce((a, r) => a + Math.abs((r.predicted ?? 0) - (r.actual ?? 0)), 0) / scatter.length;
    return `Avg absolute error = ${mae.toFixed(2)} pts across ${scatter.length} test records (2025 held-out).`;
  }, [scatter]);

  /* ── Model regression trend ── */
  const regTrend = useMemo(() => {
    if (!modelInfo) return [];
    return [
      { model: "Reg A", r2: (modelInfo.regression_a?.r2 ?? 0) * 100, label: "EE+MATH+ESAS+GWA" },
      { model: "Reg B", r2: (modelInfo.regression_b?.r2 ?? 0) * 100, label: "GWA+Survey" },
    ];
  }, [modelInfo]);

  /* ── Strand ── */
  const strandData = useMemo(() =>
    (passByStrand ?? []).map((s) => ({ name: s.label, passRate: Number(s.pass_rate ?? 0), total: s.total })),
  [passByStrand]);

  /* ── Review duration — clean duplicates ("6 months" vs "6  months") ── */
  const durData = useMemo(() => {
    const raw = passByDur ?? [];
    const merged = {};
    raw.forEach((d) => {
      const key = d.label?.trim().replace(/\s+/g, " ");
      if (!merged[key]) merged[key] = { ...d, label: key };
      else merged[key].pass_rate = (merged[key].pass_rate + d.pass_rate) / 2;
    });
    return Object.values(merged).sort((a, b) => a.pass_rate - b.pass_rate);
  }, [passByDur]);

  /* ── Weak areas ── */
  const weakAreas = useMemo(() => (weakestQ ?? []).slice(0, 6), [weakestQ]);

  return (
    <div className="iiee-combined fade-in">
      <style>{styles}</style>

      {/* Hero */}
      <div className="comb-hero">
        <div className="comb-hero-badges">
          <span className="comb-badge gold">📊 Dashboard</span>
          <span className="comb-badge blue">🧭 SLSU REE Analytics</span>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { key: "institutional", label: "Institutional Dashboard" },
            { key: "model",         label: "Model Dashboard" },
          ].map((t) => (
            <button
              key={t.key}
              className="tab-btn"
              onClick={() => setMode(t.key)}
              style={{
                border: `1px solid ${mode === t.key ? IIEE.gold : "rgba(255,255,255,.15)"}`,
                background: mode === t.key ? "rgba(245,197,24,0.2)" : "rgba(11,20,55,.7)",
                color: mode === t.key ? IIEE.gold : IIEE.white,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <h2 className="comb-hero-title">
          {mode === "institutional"
            ? <>PRC 2022-2025 <span className="ag">Institutional</span> Dashboard</>
            : <>PRC 2022-2025 <span className="ab">Model</span> Dashboard</>}
        </h2>
        <p className="comb-hero-sub">
          {mode === "institutional"
            ? "Full 333-examiner dataset (DATA_UPCOMING) — SLSU PRC performance 2022-2025."
            : "Random Forest model metrics, survey analysis (DATA_MODEL 60 rows) & test evaluation (DATA_TEST 21 rows)."}
        </p>
      </div>

      <div className="comb-body">

        {/* Sticky filter */}
        <div className="comb-filter-strip">
          <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
          {selectedYear && (
            <div className="comb-year-pill">
              <span style={{ fontWeight: 700 }}>📅 Viewing:</span>
              <span style={{ background: "rgba(245,197,24,.15)", padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{selectedYear}</span>
              {kpi.overall_pass_rate != null && (
                <>
                  <span style={{ opacity: .6 }}>•</span>
                  <span>Pass Rate: <strong style={{ color: kpi.overall_pass_rate >= 70 ? IIEE.passGreen : IIEE.amber }}>{pct(kpi.overall_pass_rate)}</strong></span>
                  <span style={{ opacity: .6 }}>•</span>
                  <span>n = {kpi.total_students}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Insights banner */}
        {localInsights?.length > 0 && (
          <div className="insight-banner"><InsightBox insights={localInsights} /></div>
        )}

        {/* ══════════════════════════════════════════════════════
            INSTITUTIONAL DASHBOARD
            Source: DATA_UPCOMING (333 rows, 2022-2025)
        ══════════════════════════════════════════════════════ */}
        <div style={{ display: mode === "institutional" ? "block" : "none" }}>

          <Divider label="Key Performance Indicators — 333 Examiners (2022-2025)" icon="📌" />
          <DsTag label="DATA_UPCOMING — 333 rows, 2022-2025" />

          <div className="metrics-grid" style={{ marginBottom: 28 }}>
            <KPI label="Total Examiners"  value={kpi.total_students ?? "—"}                                                          icon="👥" color={IIEE.blue} sub="All exam sittings 2022-2025" />
            <KPI label="Total Passers"    value={kpi.total_passers  ?? "—"}                                                          icon="✅" color={IIEE.passGreen} />
            <KPI label="Total Failers"    value={kpi.total_failers  ?? "—"}                                                          icon="❌" color={IIEE.failRed} />
            <KPI label="Overall Pass Rate" value={pct(kpi.overall_pass_rate)} icon="📊"
              color={(kpi.overall_pass_rate ?? 0) >= 70 ? IIEE.passGreen : IIEE.amber}
              sub="PRC passing threshold = 70%" />
            <KPI label="Avg GWA Passers"  value={num(kpi.avg_gwa_passers)} icon="🎓" color={IIEE.passGreen} sub="Lower = better (PH scale)" />
            <KPI label="Avg GWA Failers"  value={num(kpi.avg_gwa_failers)} icon="📉" color={IIEE.failRed}   sub="Lower = better (PH scale)" />
          </div>

          {/* Pass / Fail distribution */}
          <Divider label="Distribution Analysis" icon="🥧" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card icon="🥧" title="Pass / Fail Distribution" sub="All examiners, 2022-2025"
              note="Donut chart of overall pass/fail outcomes across 333 examiners."
              insight={`${pct(kpi.overall_pass_rate)} pass rate — ${(kpi.overall_pass_rate ?? 0) >= 70 ? "above" : "below"} the 70% PRC benchmark.`}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88}
                    paddingAngle={3} dataKey="value"
                    onMouseEnter={(_, i) => setActivePie(i)}
                    onMouseLeave={() => setActivePie(null)}>
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color}
                        stroke={activePie === i ? IIEE.gold : "none"}
                        strokeWidth={activePie === i ? 3 : 0}
                        opacity={activePie === null || activePie === i ? 1 : 0.5}
                        style={{ transition: "all .3s" }} />
                    ))}
                  </Pie>
                  <Tooltip content={<Tip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Pass rate by year */}
            <Card icon="📅" title="Pass Rate by Year" sub="Annual PRC performance trend"
              note="Each bar is a full calendar year. 2024 peaked at 79.8%; 2025 dropped to 45.8%."
              insight="2025 August sitting had only 4.5% pass rate — a major outlier requiring investigation.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={displayRows} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                    label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                  <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}
                    activeBar={{ fill: IIEE.gold, filter: "drop-shadow(0 0 8px rgba(245,197,24,.6))" }}>
                    {displayRows.map((e, i) => <Cell key={i} fill={barColor(e.pass_rate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Stacked counts by year */}
            <Card icon="📦" title="Pass / Fail Counts by Year" sub="Absolute cohort composition" fullWidth
              note="Stacked bars show how many students passed vs failed per year."
              insight="2022 had the largest cohort (103) yet lowest pass rate (52.4%) — high volume, high risk.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stackData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} />
                  <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Exam period breakdown */}
          <Divider label="Exam Period Analysis (Apr vs Aug)" icon="📆" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card icon="📆" title="Pass Rate by Exam Period" sub="April vs August sittings per year" fullWidth
              note="April sittings consistently outperform August sittings across all years. This pattern warrants curriculum timing review."
              insight="2025-Aug at 4.5% is the lowest recorded period — likely warrants a deeper cohort study.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={periodData} margin={{ top: 8, right: 16, left: -8, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 10, angle: -30, textAnchor: "end" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                    label={{ value: "70%", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                  <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                    {(periodData ?? []).map((e, i) => <Cell key={i} fill={barColor(e.pass_rate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Subject score trends */}
          <Divider label="Subject Score Trends" icon="📐" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card icon="📐" title="Subject Averages by Year" sub="EE, MATH, ESAS trend — DATA_UPCOMING" fullWidth
              note="ESAS scores show the widest swings year-over-year. MATH is the most consistent predictor (r=0.897 with Total Rating)."
              insight="2024 is the strongest year across all 3 subjects. 2025 EE dropped 12.5 points from 2024.">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={subjectTrend} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[55, 85]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)} pts`} />} />
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3" label={{ value: "Pass (70)", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Line type="monotone" dataKey="EE"   stroke={IIEE.blue}      strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} />
                  <Line type="monotone" dataKey="MATH" stroke={IIEE.passGreen} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} />
                  <Line type="monotone" dataKey="ESAS" stroke={IIEE.orange}    strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* GWA comparison */}
            <Card icon="🎓" title="GWA: Passers vs Failers" sub="DATA_UPCOMING — lower is better (PH grading)"
              note="GWA gap of 0.23 between passers and failers is consistent across all years (Pearson r = −0.439 with Total Rating)."
              insight="Every 0.1 improvement in GWA corresponds to roughly a 2-point increase in predicted board rating.">
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                {[
                  { label: "Passers Avg GWA", value: num(kpi.avg_gwa_passers), color: IIEE.passGreen },
                  { label: "Failers Avg GWA",  value: num(kpi.avg_gwa_failers),  color: IIEE.failRed },
                ].map((p, i) => (
                  <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: IIEE.dimText, marginBottom: 6 }}>{p.label}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, lineHeight: 1, color: p.color }}>{p.value}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={[{ name: "Passers", value: kpi.avg_gwa_passers }, { name: "Failers", value: kpi.avg_gwa_failers }]}
                  margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1.5, 2.5]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip fmt={(v) => v?.toFixed(3)} />} />
                  <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
                    <Cell fill={IIEE.passGreen} />
                    <Cell fill={IIEE.failRed} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MODEL DASHBOARD
            Institutional: DATA_UPCOMING (333)
            Survey/Model:  DATA_MODEL (60) + DATA_TEST (21)
        ══════════════════════════════════════════════════════ */}
        <div style={{ display: mode === "model" ? "block" : "none" }}>

          {/* Section 1 — Model Performance */}
          <Divider label="Model Performance Summary" icon="🤖" />
          <SecCard num="1" icon="🤖" title="Random Forest Model Performance"
            subtitle="Trained on DATA_MODEL (60 rows). Evaluated on DATA_TEST (21 rows, 2025 held-out).">
            <DsTag label="Training: DATA_MODEL 60 rows | Test: DATA_TEST 21 rows (2025)" />
            {modelInfo ? (
              <div className="g2">
                <Card inner icon="📊" title="Classification Metrics" sub="Pass / Fail prediction" blueTint>
                  {[
                    { label: "Accuracy",    value: modelInfo.classification?.accuracy, color: IIEE.blue },
                    { label: "F1-Score",    value: modelInfo.classification?.f1,       color: IIEE.gold },
                    { label: "CV Accuracy", value: modelInfo.classification?.cv_acc,   color: IIEE.indigo },
                    { label: "CV F1",       value: modelInfo.classification?.cv_f1,    color: IIEE.passGreen },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="model-row">
                        <span className="model-row-label">{m.label}</span>
                        <span className="model-row-val" style={{ color: m.color }}>{pct((m.value ?? 0) * 100)}</span>
                      </div>
                      <Prog value={(m.value ?? 0) * 100} color={m.color} />
                    </div>
                  ))}
                </Card>

                <Card inner icon="📈" title="Regression Metrics" sub="Total Rating prediction" blueTint>
                  {[
                    { label: "Reg A — MAE (310 train rows)",  value: modelInfo.regression_a?.mae,  color: IIEE.teal,   isScore: false, suffix: " pts" },
                    { label: "Reg A — R²",                    value: modelInfo.regression_a?.r2,   color: IIEE.teal,   isScore: true },
                    { label: "Reg B — MAE (60 train rows)",   value: modelInfo.regression_b?.mae,  color: IIEE.indigo, isScore: false, suffix: " pts" },
                    { label: "Reg B — R²",                    value: modelInfo.regression_b?.r2,   color: IIEE.indigo, isScore: true },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="model-row">
                        <span className="model-row-label">{m.label}</span>
                        <span className="model-row-val" style={{ color: m.color }}>
                          {m.isScore ? num(m.value, 3) : `${num(m.value, 2)}${m.suffix ?? ""}`}
                        </span>
                      </div>
                      {m.isScore && <Prog value={(m.value ?? 0) * 100} color={m.color} />}
                    </div>
                  ))}
                  {/* R² trend mini chart */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, color: IIEE.dimText, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>R² Comparison</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={regTrend} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="model" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                        <Bar dataKey="r2" name="R² %" radius={[4, 4, 0, 0]}>
                          <Cell fill={IIEE.teal} />
                          <Cell fill={IIEE.indigo} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: IIEE.dimText }}>Model info not loaded — ensure main.py returns modelInfo from ree_survey_model.pkl.</p>
            )}
          </SecCard>

          {/* Section 2 — Predicted vs Actual (DATA_TEST) */}
          <SecCard num="2" icon="🎯" title="Predicted vs Actual Rating"
            subtitle="DATA_TEST (21 rows, 2025 Apr+Aug) — completely held-out evaluation set">
            <DsTag label="DATA_TEST — 21 rows, 2025 held-out" />
            <div style={{ background: "linear-gradient(90deg,rgba(34,197,94,.08) 0%,transparent 100%)", borderLeft: `3px solid ${IIEE.passGreen}`, borderRadius: "0 10px 10px 0", padding: "10px 16px", fontSize: 12.5, color: IIEE.muted, marginBottom: 14 }}>
              {reliabilityNote}
            </div>
            {scatter.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="actual"    name="Actual Rating"    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Actual PRC Rating", position: "insideBottom", offset: -2, fill: IIEE.muted, fontSize: 11 }} />
                  <YAxis dataKey="predicted" name="Predicted Rating" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Predicted", angle: -90, position: "insideLeft", fill: IIEE.muted, fontSize: 11 }} />
                  <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3" }} />
                  <ReferenceLine segment={[{ x: 50, y: 50 }, { x: 100, y: 100 }]} stroke="rgba(245,197,24,.4)" strokeDasharray="5 4" />
                  <ReferenceLine x={70} stroke={IIEE.failRed} strokeDasharray="4 3" label={{ value: "Pass 70", position: "top", fill: IIEE.failRed, fontSize: 10 }} />
                  <ReferenceLine y={70} stroke={IIEE.failRed} strokeDasharray="4 3" />
                  <Scatter data={scatter} fill={IIEE.passGreen} opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: IIEE.dimText, fontSize: 13 }}>
                No scatter data — make sure /dashboard endpoint returns scatterData from DATA_TEST predictions.
              </div>
            )}
          </SecCard>

          {/* Section 3 — Survey Analysis (DATA_MODEL) */}
          <SecCard num="3" icon="📋" title="Survey Analysis"
            subtitle="DATA_MODEL (60 rows with full survey) — 10 sections, 73 Likert items">
            <DsTag label="DATA_MODEL — 60 rows with survey answers" />

            <div className="g2" style={{ marginBottom: 16 }}>
              {/* Section scores radar */}
              <Card inner icon="🕸️" title="Survey Section: Passers vs Failers" sub="Avg Likert score per section (lower = more agreement)" blueTint
                note="Scores closer to 1.0 = Strongly Agree. Faculty and Dept Culture show the widest gap between passers and failers."
                insight="Passers score lower (more agreement) on Faculty and Facilities — these are key institutional differentiators.">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <PolarGrid stroke="rgba(245,197,24,.15)" />
                    <PolarAngleAxis dataKey="section" tick={{ fill: IIEE.muted, fontSize: 10 }} />
                    <Radar name="Passers" dataKey="Passers" stroke={IIEE.passGreen} fill={IIEE.passGreen} fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Failers" dataKey="Failers" stroke={IIEE.failRed}   fill={IIEE.failRed}   fillOpacity={0.15} strokeWidth={2} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                    <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(2)} avg`} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Section bar chart */}
              <Card inner icon="📊" title="Section Avg: Passers vs Failers" sub="Side-by-side per survey section" blueTint
                note="Faculty (1.47 vs 2.18) and Dept Review (1.95 vs 2.24) have the largest pass/fail gaps."
                insight="Stronger faculty ratings from passers suggest instructor quality is a measurable predictor.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={radarData} layout="vertical" margin={{ top: 0, right: 24, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" horizontal={false} />
                    <XAxis type="number" domain={[1, 2.5]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="section" tick={{ fill: IIEE.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(2)} avg`} />} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 11 }}>{v}</span>} />
                    <Bar dataKey="Passers" fill={IIEE.passGreen} radius={[0, 4, 4, 0]} barSize={8} />
                    <Bar dataKey="Failers" fill={IIEE.failRed}   radius={[0, 4, 4, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Review attendance */}
            <div className="g2" style={{ marginBottom: 16 }}>
              <Card inner icon="🏫" title="Pass Rate by Review Attendance" sub="Reviewed vs Not Reviewed" blueTint
                note="Students who attended formal review: 82.1% pass rate. Without review: 14.3%."
                insight="Review attendance is the single strongest non-subject predictor in DATA_MODEL.">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={[
                      { label: "With Review (n=39)",    pass_rate: 82.1 },
                      { label: "No Review (n=21)",      pass_rate: 14.3 },
                    ]}
                    layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                    <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                    <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                    <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                      <Cell fill={IIEE.passGreen} />
                      <Cell fill={IIEE.failRed} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card inner icon="⏱️" title="Pass Rate by Review Duration" sub="Longer review = better results" blueTint
                note="3 months: 50.0% | 6 months: 74.1% — a 24-point improvement."
                insight="6-month review crosses the 70% passing threshold; 3-month does not.">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={durData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                    <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                    <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                      {durData.map((e, i) => <Cell key={i} fill={barColor(e.pass_rate)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* SHS Strand */}
            <Card inner icon="🎓" title="Pass Rate by SHS Strand" sub="STEM vs other tracks — DATA_MODEL (60 rows)" blueTint
              note="STEM: 63.4% (n=41), GAS: 55.6% (n=9), TVL: 37.5% (n=8). HUMMS: 100% but n=1 (not significant)."
              insight="STEM-track students dominate the sample and outperform other strands — but TVL/GAS need targeted support.">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={strandData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3" label={{ value: "70%", fill: IIEE.gold, fontSize: 10, position: "insideTopRight" }} />
                  <Bar dataKey="passRate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                    {strandData.map((e, i) => <Cell key={i} fill={barColor(e.passRate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </SecCard>

          {/* Section 4 — Curriculum Gap + Recommendations */}
          <SecCard num="4" icon="🏫" title="Curriculum Gap Analysis & Recommendations"
            subtitle="Weakest survey indicators — where students feel least supported">
            <DsTag label="DATA_MODEL — survey responses, 60 rows" />
            <div className="g2">
              {weakAreas.length > 0 ? (
                <Card inner icon="⚠️" title="Weakest Survey Items" sub="Lowest avg score = most concern" blueTint
                  note="Items with higher average scores indicate areas where students feel least agreement (scale: 1=Strongly Agree to 4=Strongly Disagree)."
                  insight="These items point to specific curriculum or support gaps that directly affect board readiness.">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}
                      margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                      <XAxis dataKey="key"  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(2)} / 4`} />} />
                      <Bar dataKey="avg" name="Avg Score" fill={IIEE.failRed} radius={[4, 4, 0, 0]}
                        activeBar={{ fill: "#ef6b6b", filter: "drop-shadow(0 0 8px rgba(239,75,75,.7))" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              ) : (
                <div style={{ color: IIEE.dimText, fontSize: 12, padding: 16 }}>
                  No weakest question data — ensure main.py returns weakestQ from DATA_MODEL survey.
                </div>
              )}

              <div className="reco-card">
                <div className="reco-title">⚡ Key Findings & Recommendations</div>
                <ul className="reco-list">
                  {[
                    "Review attendance raises pass rate by 68 points (14.3% → 82.1%) — make 6-month programs accessible.",
                    "ESAS has the strongest correlation with Total Rating (r=0.947) — prioritize ESAS drilling.",
                    "Faculty quality scores differ most between passers and failers — invest in instruction.",
                    "2025 August cohort (4.5% pass rate) needs urgent root-cause analysis.",
                    "TVL/GAS strand students underperform STEM by 26 points — strand-specific bridging needed.",
                    "GWA gap of 0.23 between passers/failers — GWA early-warning flag for at-risk students.",
                  ].map((r, i) => (
                    <li key={i}><span className="reco-dot" />{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SecCard>

        </div>
      </div>
    </div>
  );
}