import { useMemo, useState } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import {  FilterPanel } from "./ProfessorShared";

/* ─── Design Tokens (mirrored from ModelOverviewDashboard) ─────── */
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

/* ─── Styles (identical structure to ModelOverviewDashboard) ───── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .iiee-curric * { box-sizing: border-box; }
  .iiee-curric {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* ── Hero ── */
  .curric-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .curric-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .curric-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .curric-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px, 1.5vw, 11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .curric-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .curric-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .curric-badge.red  { background:rgba(239,68,68,0.12);  border:1px solid rgba(239,68,68,0.3);  color:${IIEE.failRed}; }
  .curric-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .curric-hero-title .ag { color:${IIEE.gold}; }
  .curric-hero-title .ab { color:${IIEE.failRed}; }
  .curric-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  /* ── Body ── */
  .curric-body { padding:clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  /* ── Filter strip ── */
  .curric-filter-strip {
    position:sticky; top:0; z-index:20;
    background:rgba(11,20,55,0.95);
    border:1px solid ${IIEE.cardBorder}; border-radius:14px;
    padding:clamp(10px, 2vw, 14px) clamp(12px, 3vw, 18px); margin-bottom:clamp(12px, 3vw, 24px);
    backdrop-filter:blur(16px); box-shadow:0 8px 32px rgba(0,0,0,0.4);
  }

  /* ── Divider ── */
  .curric-divider {
    display:flex; align-items:center; gap:10px; margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .curric-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .curric-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .curric-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px, 1.5vw, 12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* ── Metric cards ── */
  .metrics-grid-c {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px, 20vw, 155px),1fr));
    gap:clamp(10px, 2vw, 14px); margin-bottom:0;
  }
  .metric-card-c {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:clamp(14px, 3vw, 18px) clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px);
    position:relative; overflow:hidden;
    transition:transform .18s, border-color .18s, box-shadow .18s;
    cursor:default;
  }
  .metric-card-c:hover {
    transform:translateY(-2px); border-color:${IIEE.gold};
    box-shadow:0 8px 28px rgba(245,197,24,0.12);
  }
  .metric-card-c::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .metric-icon-c { font-size:clamp(16px, 3vw, 18px); margin-bottom:clamp(8px, 2vw, 10px); display:block; }
  .metric-label-c {
    font-size:clamp(10px, 1.5vw, 12px); font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif;
  }
  .metric-value-c {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(24px, 5vw, 34px); font-weight:700; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .metric-sub-c { font-size:clamp(10px, 1.5vw, 12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }

  /* ── Chart cards ── */
  .chart-card-c {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:clamp(12px, 3vw, 18px);
    transition:border-color .18s;
  }
  .chart-card-c:hover { border-color:rgba(245,197,24,0.35); }
  .chart-card-c.inner {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:clamp(12px, 2vw, 16px);
  }
  .chart-head-c { display:flex; align-items:flex-start; gap:clamp(8px, 2vw, 10px); margin-bottom:clamp(10px, 2vw, 14px); }
  .chart-icon-c {
    width:clamp(30px, 6vw, 34px); height:clamp(30px, 6vw, 34px); border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(14px, 2.5vw, 15px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .chart-icon-c.blue { background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); }
  .chart-icon-c.red  { background:rgba(239,68,68,0.1);  border:1px solid rgba(239,68,68,0.25); }
  .chart-title-c {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(14px, 2.5vw, 16px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .chart-sub-c { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .chart-note-c {
    margin-top:10px; padding:clamp(8px, 2vw, 12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px, 1.5vw, 11.5px); color:${IIEE.muted}; line-height:1.6; font-family:'Inter',sans-serif;
  }
  .chart-note-c strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }

  /* ── Section cards ── */
  .sec-card-c {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px, 3vw, 20px); overflow:hidden;
    transition:border-color .18s;
  }
  .sec-card-c:hover { border-color:rgba(245,197,24,0.35); }
  .sec-head-c {
    display:flex; align-items:flex-start; gap:clamp(10px, 2vw, 14px);
    padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px); border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .sec-icon-c {
    width:clamp(32px, 6vw, 40px); height:clamp(32px, 6vw, 40px); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(16px, 3vw, 18px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .sec-num-c {
    font-family:'Montserrat',sans-serif; font-size:clamp(10px, 1.5vw, 11px); font-weight:700;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .sec-title-c {
    font-family:'Montserrat',sans-serif; font-size:clamp(16px, 3vw, 18px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .sec-subtitle-c { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .sec-body-c { padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px); }

  /* ── Progress bars ── */
  .prog-track-c {
    height:6px; background:rgba(255,255,255,0.06);
    border-radius:99px; overflow:hidden; margin-bottom:10px;
  }
  .prog-fill-c { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }

  /* ── DS tag ── */
  .ds-tag-c {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

  /* ── Reco card ── */
  .reco-card-c {
    background:linear-gradient(135deg,rgba(245,197,24,0.08) 0%,rgba(245,197,24,0.03) 100%);
    border:1px solid rgba(245,197,24,0.25); border-radius:14px; padding:clamp(12px, 2vw, 16px) clamp(14px, 2vw, 18px);
  }
  .reco-title-c {
    font-family:'Montserrat',sans-serif; font-size:clamp(14px, 2.5vw, 16px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.06em; color:${IIEE.gold}; margin:0 0 10px;
  }
  .reco-list-c { list-style:none; padding:0; margin:0; }
  .reco-list-c li {
    display:flex; align-items:flex-start; gap:8px; padding:6px 0;
    font-size:clamp(11px, 1.5vw, 12.5px); color:rgba(245,197,24,0.85); line-height:1.5; font-family:'Inter',sans-serif;
    border-bottom:1px solid rgba(245,197,24,0.08);
  }
  .reco-list-c li:last-child { border-bottom:none; }
  .reco-dot-c { width:6px; height:6px; border-radius:50%; background:${IIEE.gold}; margin-top:5px; flex-shrink:0; }

  /* ── Severity badge ── */
  .sev-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(9px, 1.2vw, 10px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; border-radius:4px; padding:2px 7px;
    font-family:'Montserrat',sans-serif;
  }

  /* ── Severity item card ── */
  .sev-item {
    background:rgba(11,20,55,0.65); border-radius:12px; padding:clamp(10px, 2vw, 14px);
    transition:border-color .18s, transform .18s;
  }
  .sev-item:hover { transform:translateY(-1px); }

  /* ── Tab button ── */
  .tab-btn-c {
    padding:8px 14px; border-radius:8px; font-size:clamp(11px, 1.5vw, 12px); font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'Inter',sans-serif;
  }

  /* ── Grid helpers ── */
  .g2-c { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }
  .g2-c .fw-c { grid-column:1/-1; }
  .g3-c { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(12px, 2vw, 16px); }

  /* ── Scrollable ── */
  .scroll-y { overflow-y:auto; max-height:420px; }
  .scroll-y::-webkit-scrollbar { width:4px; }
  .scroll-y::-webkit-scrollbar-track { background:rgba(255,255,255,.04); border-radius:99px; }
  .scroll-y::-webkit-scrollbar-thumb { background:rgba(245,197,24,.3); border-radius:99px; }

  @media (max-width:1200px) { .g3-c { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:960px)  { .g2-c,.g3-c { grid-template-columns:1fr; } .g2-c .fw-c,.g3-c .fw-c { grid-column:1; } }
  @media (max-width:768px)  { .curric-body { padding:10px; } .g2-c,.g3-c { gap:10px; } }
  @media (max-width:640px)  { .curric-hero { padding:14px 12px 10px; } .sec-body-c { padding:10px 12px; } .sec-head-c { padding:10px 12px 8px; } .curric-body { padding:8px; } .chart-card-c { padding:10px; } }
  @media (max-width:540px)  { .curric-body { padding:6px; } .sec-body-c { padding:8px; } .chart-card-c { padding:8px; } }

  .fade-in-c { animation:fadeInC .45s ease both; }
  @keyframes fadeInC { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ─── Shared Sub-components ────────────────────────────────────── */
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
    <div className="curric-divider">
      <div className="curric-divider-line" />
      <div className="curric-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="curric-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="metric-card-c" style={{ "--ac": color }}>
      <span className="metric-icon-c">{icon}</span>
      <div className="metric-label-c">{label}</div>
      <div className="metric-value-c">{value}</div>
      {sub && <div className="metric-sub-c">{sub}</div>}
    </div>
  );
}

function Card({ icon, title, sub, children, note, insight, inner, fullWidth, blueTint, redTint }) {
  return (
    <div className={`chart-card-c${inner ? " inner" : ""}${fullWidth ? " fw-c" : ""}`}>
      <div className="chart-head-c">
        <div className={`chart-icon-c${blueTint ? " blue" : redTint ? " red" : ""}`}>{icon}</div>
        <div>
          <div className="chart-title-c">{title}</div>
          {sub && <div className="chart-sub-c">{sub}</div>}
        </div>
      </div>
      {children}
      {(note || insight) && (
        <div className="chart-note-c">
          {note && <span>{note}</span>}
          {insight && <><br /><strong>↳ {insight}</strong></>}
        </div>
      )}
    </div>
  );
}

function Prog({ value, color }) {
  return (
    <div className="prog-track-c">
      <div className="prog-fill-c" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function SecCard({ num: number, icon, title, subtitle, children }) {
  return (
    <div className="sec-card-c">
      <div className="sec-head-c">
        <div className="sec-icon-c">{icon}</div>
        <div style={{ flex: 1 }}>
          {number && <div className="sec-num-c">Section {number}</div>}
          <h3 className="sec-title-c">{title}</h3>
          {subtitle && <p className="sec-subtitle-c">{subtitle}</p>}
        </div>
      </div>
      <div className="sec-body-c">{children}</div>
    </div>
  );
}

function DsTag({ label }) {
  return <div className="ds-tag-c">📂 {label}</div>;
}

/* ─── Severity helpers ─────────────────────────────────────────── */
const sevColor  = (avg) => avg >= 2.7 ? IIEE.failRed : avg >= 2.55 ? IIEE.amber : IIEE.orange;
const sevLabel  = (avg) => avg >= 2.7 ? "Critical"   : avg >= 2.55 ? "Moderate" : "Low";
const sevEmoji  = (avg) => avg >= 2.7 ? "🔴"         : avg >= 2.55 ? "🟡"       : "🟠";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfessorCurriculumDashboard({
  weakestQ = [],
  dashFilters,
  setDashFilters,
  availableYears,
  availablePeriods,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  /* ── Derived data ── */
  const categories = useMemo(() => {
    const map = {};
    weakestQ.forEach((q) => {
      if (!map[q.section]) map[q.section] = { count: 0, total: 0, items: [] };
      map[q.section].count += 1;
      map[q.section].total += q.avg;
      map[q.section].items.push(q);
    });
    return Object.entries(map)
      .map(([label, v]) => ({ label, count: v.count, avg: v.total / v.count, items: v.items }))
      .sort((a, b) => b.avg - a.avg);
  }, [weakestQ]);

  const critical  = useMemo(() => weakestQ.filter((q) => q.avg >= 2.7),  [weakestQ]);
  const moderate  = useMemo(() => weakestQ.filter((q) => q.avg >= 2.55 && q.avg < 2.7), [weakestQ]);
  const low       = useMemo(() => weakestQ.filter((q) => q.avg < 2.55),  [weakestQ]);
  const topWorst  = useMemo(() => [...weakestQ].sort((a, b) => b.avg - a.avg).slice(0, 8), [weakestQ]);
  const avgScore  = useMemo(() => weakestQ.length ? weakestQ.reduce((a, q) => a + q.avg, 0) / weakestQ.length : 0, [weakestQ]);

  /* Radar data (category averages) */
  const radarData = useMemo(() =>
    categories.slice(0, 7).map((c) => ({ subject: c.label, score: +c.avg.toFixed(2), fullMark: 4 })),
  [categories]);

  return (
    <div className="iiee-curric fade-in-c">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="curric-hero">
        <div className="curric-hero-badges">
          <span className="curric-badge gold">📊 Curriculum Analysis</span>
          <span className="curric-badge blue">🏫 SLSU REE Analytics</span>
          <span className="curric-badge red">⚠️ Gap Detection</span>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            { key: "overview",  label: "Overview" },
            { key: "items",     label: "All Items" },
            { key: "category",  label: "By Category" },
          ].map((t) => (
            <button
              key={t.key}
              className="tab-btn-c"
              onClick={() => setActiveTab(t.key)}
              style={{
                border: `1px solid ${activeTab === t.key ? IIEE.gold : "rgba(255,255,255,.15)"}`,
                background: activeTab === t.key ? "rgba(245,197,24,0.2)" : "rgba(11,20,55,.7)",
                color: activeTab === t.key ? IIEE.gold : IIEE.white,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <h2 className="curric-hero-title">
          {activeTab === "overview" && <>Curriculum <span className="ag">Gap</span> Analysis</>}
          {activeTab === "items"    && <>All Weak <span className="ab">Survey Items</span></>}
          {activeTab === "category" && <>Category <span className="ag">Breakdown</span></>}
        </h2>
        <p className="curric-hero-sub">
          Survey weakness indicators — SLSU PRC board exam readiness · {weakestQ.length} items assessed
        </p>
      </div>

      <div className="curric-body">

        {/* ── Sticky filter ── */}
        <div className="curric-filter-strip">
          <FilterPanel
            filters={dashFilters}
            onChange={setDashFilters}
            availableYears={availableYears}
            availablePeriods={availablePeriods ?? []}
          />
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        <div style={{ display: activeTab === "overview" ? "block" : "none" }}>

          <Divider label="Curriculum Gap Summary — Survey Weakness Indicators" icon="📌" />
          <DsTag label="DATA_MODEL + DATA_EVALUATION — survey responses, 159 rows" />

          {/* KPIs */}
          <div className="metrics-grid-c" style={{ marginBottom: 28 }}>
            <KPI label="Total Items"     value={weakestQ.length}      icon="📋" color={IIEE.blue}      sub="Survey items assessed" />
            <KPI label="Critical Gaps"   value={critical.length}      icon="🔴" color={IIEE.failRed}   sub="Score ≥ 2.7 / 4" />
            <KPI label="Moderate Gaps"   value={moderate.length}      icon="🟡" color={IIEE.amber}     sub="Score 2.55 – 2.7" />
            <KPI label="Low Concern"     value={low.length}           icon="🟠" color={IIEE.orange}    sub="Score < 2.55" />
            <KPI label="Avg Weak Score"  value={avgScore.toFixed(2)}  icon="📊" color={sevColor(avgScore)} sub="Higher = more disagreement" />
            <KPI label="Worst Category"  value={categories[0]?.label ?? "—"} icon="⚠️" color={IIEE.failRed} sub={categories[0] ? `Avg ${categories[0].avg.toFixed(2)}/4` : ""} />
          </div>

          {/* Top gaps + Radar */}
          <Divider label="Highest Disagreement Areas" icon="🔎" />
          <div className="g2-c" style={{ marginBottom: 20 }}>

            <Card icon="📉" title="Top 8 Weakest Survey Items" sub="Ranked by average disagreement score (1=Agree → 4=Disagree)"
              note="Items above 2.5 indicate more disagreement than agreement — immediate curriculum action needed."
              insight="ESAS-related and Facilities items consistently cluster near the top — resource and review deficiencies.">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topWorst.map((q) => ({ name: q.key, avg: +q.avg.toFixed(2), label: q.label, section: q.section }))}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" horizontal={false} />
                  <XAxis type="number" domain={[2, 3.2]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, maxWidth: 220 }}>
                          <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                          <div style={{ color: IIEE.muted, marginBottom: 4, lineHeight: 1.4 }}>{d.label}</div>
                          <div>Score: <strong style={{ color: sevColor(d.avg) }}>{d.avg}/4</strong> · {d.section}</div>
                          <div style={{ marginTop: 4, color: sevColor(d.avg) }}>{sevEmoji(d.avg)} {sevLabel(d.avg)}</div>
                        </div>
                      );
                    }}
                    cursor={{ fill: "rgba(245,197,24,.04)" }}
                  />
                  <ReferenceLine x={2.5} stroke={IIEE.gold} strokeDasharray="4 3"
                    label={{ value: "2.5 critical", position: "insideTopRight", fill: IIEE.gold, fontSize: 9 }} />
                  <Bar dataKey="avg" name="Avg Score" radius={[0, 5, 5, 0]}
                    activeBar={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,.6))" }}>
                    {topWorst.map((entry, i) => (
                      <Cell key={i} fill={sevColor(entry.avg)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card icon="🕸️" title="Category Radar — Gap Coverage" sub="Average disagreement by survey section" blueTint
              note="A wider radar web means disagreement is spread across more institutional dimensions."
              insight={`${categories[0]?.label ?? "Top category"} leads with avg ${categories[0]?.avg.toFixed(2) ?? "—"}/4.`}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke="rgba(245,197,24,.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: IIEE.muted, fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[2, 3.2]} tick={{ fill: IIEE.dimText, fontSize: 9 }} axisLine={false} />
                  <Radar name="Avg Score" dataKey="score" stroke={IIEE.failRed} fill={IIEE.failRed} fillOpacity={0.18} dot={{ fill: IIEE.failRed, r: 3 }} />
                  <Tooltip content={<Tip fmt={(v) => `${v}/4`} />} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

          </div>

          {/* Severity breakdown */}
          <Divider label="Severity Distribution" icon="⚡" />
          <SecCard num="1" icon="⚠️" title="Severity Breakdown"
            subtitle="All items categorized by disagreement threshold — scale 1 (Strongly Agree) → 4 (Strongly Disagree)">
            <DsTag label="159 survey respondents · all sections" />
            <div className="g3-c" style={{ marginBottom: 16 }}>
              {[
                { label: "Critical Items",  items: critical, color: IIEE.failRed, emoji: "🔴", desc: "Score ≥ 2.7 — immediate attention required" },
                { label: "Moderate Items",  items: moderate, color: IIEE.amber,   emoji: "🟡", desc: "Score 2.55–2.70 — monitor and improve" },
                { label: "Low Concern",     items: low,      color: IIEE.orange,  emoji: "🟠", desc: "Score < 2.55 — room for improvement" },
              ].map((tier, ti) => (
                <Card key={ti} inner icon={tier.emoji} title={tier.label} sub={tier.desc} redTint={tier.color === IIEE.failRed} blueTint={tier.color === IIEE.amber}>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 36, fontWeight: 700, color: tier.color, lineHeight: 1, marginBottom: 6 }}>
                    {tier.items.length}
                  </div>
                  <Prog value={(tier.items.length / Math.max(weakestQ.length, 1)) * 100} color={tier.color} />
                  <div style={{ fontSize: 11, color: IIEE.dimText }}>
                    {((tier.items.length / Math.max(weakestQ.length, 1)) * 100).toFixed(1)}% of all weak items
                  </div>
                  {tier.items.slice(0, 3).map((q, qi) => (
                    <div key={qi} style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                      <span style={{ color: IIEE.muted, fontFamily: "monospace" }}>{q.key}</span>
                      <span style={{ color: tier.color, fontWeight: 700 }}>{q.avg.toFixed(2)}</span>
                    </div>
                  ))}
                  {tier.items.length > 3 && (
                    <div style={{ fontSize: 10, color: IIEE.dimText, marginTop: 4 }}>+{tier.items.length - 3} more items</div>
                  )}
                </Card>
              ))}
            </div>
          </SecCard>

          {/* Recommendations */}
          <SecCard num="2" icon="💡" title="Key Findings & Curriculum Recommendations"
            subtitle="Evidence-based action items derived from survey gap analysis">
            <div className="g2-c">
              <div className="reco-card-c">
                <div className="reco-title-c">⚡ Priority Action Items</div>
                <ul className="reco-list-c">
                  {[
                    `${critical.length} critical items (score ≥ 2.7) require immediate curriculum intervention and faculty review.`,
                    "Facilities and Dept. Review items consistently score highest — physical resources and review programs are primary gaps.",
                    "Curriculum Development and Student Support areas show moderate weakness — targeted bridging programs needed.",
                    "Items tied to review center access show the highest correlation with pass rates — make 6-month programs accessible.",
                    "ESAS scores dominate model feature importance (r=0.947) — prioritize ESAS drilling in curriculum.",
                    "Faculty quality survey scores differ most between passers and failers — invest in instruction quality.",
                    "Assessment and Evaluation items are emerging concerns — introduce formative assessment improvements.",
                  ].map((r, i) => (
                    <li key={i}><span className="reco-dot-c" />{r}</li>
                  ))}
                </ul>
              </div>

              <Card inner icon="📊" title="Category Severity Summary" sub="Avg disagreement per survey section" blueTint>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {categories.slice(0, 7).map((cat, i) => {
                    const col = sevColor(cat.avg);
                    const pct = ((cat.avg - 1) / 3) * 100;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                          <span style={{ color: IIEE.muted }}>{cat.label} <span style={{ color: IIEE.dimText }}>({cat.count} items)</span></span>
                          <span style={{ color: col, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>{cat.avg.toFixed(2)}/4</span>
                        </div>
                        <Prog value={pct} color={col} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </SecCard>

        </div>

        {/* ═══ ALL ITEMS TAB ═══ */}
        <div style={{ display: activeTab === "items" ? "block" : "none" }}>

          <Divider label="All Weak Survey Items — Detailed View" icon="📋" />
          <DsTag label="DATA_MODEL + DATA_EVALUATION — {weakestQ.length} weak items" />

          <SecCard num="3" icon="🔎" title="Complete Survey Item Registry"
            subtitle={`All ${weakestQ.length} items ranked by disagreement score — scroll to explore`}>

            <Card fullWidth icon="📉" title="Full Item Ranking" sub="Horizontal bar: higher = more disagreement from students"
              note={`${weakestQ.length} items assessed. Scale 1 (Strongly Agree) → 4 (Strongly Disagree). Items above 2.5 are concern areas.`}
              insight={`Worst item: ${weakestQ.sort((a, b) => b.avg - a.avg)[0]?.key ?? "—"} at ${weakestQ.sort((a, b) => b.avg - a.avg)[0]?.avg.toFixed(2) ?? "—"}/4.`}>
              <div className="scroll-y" style={{ marginBottom: 12 }}>
                <ResponsiveContainer width="100%" height={Math.max(360, weakestQ.length * 22)}>
                  <BarChart
                    data={[...weakestQ].sort((a, b) => b.avg - a.avg).map((q) => ({ name: q.key, avg: +q.avg.toFixed(2), label: q.label, section: q.section }))}
                    layout="vertical"
                    margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.10)" horizontal={false} />
                    <XAxis type="number" domain={[1.8, 3.2]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, maxWidth: 260 }}>
                            <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 4 }}>{d.name} — {d.section}</div>
                            <div style={{ color: IIEE.muted, marginBottom: 6, lineHeight: 1.4, fontSize: 11 }}>{d.label}</div>
                            <div>Score: <strong style={{ color: sevColor(d.avg) }}>{d.avg}/4</strong></div>
                            <div style={{ marginTop: 4, color: sevColor(d.avg), fontSize: 11 }}>{sevEmoji(d.avg)} {sevLabel(d.avg)}</div>
                          </div>
                        );
                      }}
                      cursor={{ fill: "rgba(245,197,24,.04)" }}
                    />
                    <ReferenceLine x={2.5} stroke={IIEE.gold} strokeDasharray="4 3"
                      label={{ value: "2.5", position: "insideTopRight", fill: IIEE.gold, fontSize: 9 }} />
                    <ReferenceLine x={2.7} stroke={IIEE.failRed} strokeDasharray="4 3"
                      label={{ value: "Critical 2.7", position: "insideTopRight", fill: IIEE.failRed, fontSize: 9 }} />
                    <Bar dataKey="avg" name="Avg Score" radius={[0, 5, 5, 0]}>
                      {[...weakestQ].sort((a, b) => b.avg - a.avg).map((entry, i) => (
                        <Cell key={i} fill={sevColor(entry.avg)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Grid of item cards */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: IIEE.muted, marginBottom: 12 }}>Individual Item Cards</div>
              <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(clamp(260px,30%,320px),1fr))",
                  gap: 10,
                  maxHeight: 520
                }} className="scroll-y" >
                {[...weakestQ].sort((a, b) => b.avg - a.avg).map((q, i) => {
                  const col = sevColor(q.avg);
                  const barPct = ((q.avg - 1) / 3) * 100;
                  return (
                    <div key={i} className="sev-item" style={{ border: `1px solid ${col}25` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className="sev-badge" style={{ background: `${col}20`, color: col, border: `1px solid ${col}40` }}>{q.key}</span>
                          <span className="sev-badge" style={{ background: "rgba(255,255,255,.04)", color: IIEE.dimText, border: "1px solid rgba(255,255,255,.08)" }}>{q.section}</span>
                        </div>
                        <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 18, fontWeight: 700, color: col }}>{q.avg.toFixed(2)}<span style={{ fontSize: 10, color: IIEE.dimText }}>/4</span></span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: IIEE.white, lineHeight: 1.45 }}>{q.label}</p>
                      <div className="prog-track-c" style={{ marginBottom: 6 }}>
                        <div className="prog-fill-c" style={{ width: `${barPct}%`, background: col }} />
                      </div>
                      <div style={{ fontSize: 10, color: IIEE.dimText }}>{sevEmoji(q.avg)} {sevLabel(q.avg)} — {q.avg >= 2.7 ? "immediate attention" : q.avg >= 2.55 ? "monitor & improve" : "room for improvement"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </SecCard>
        </div>

        {/* ═══ BY CATEGORY TAB ═══ */}
        <div style={{ display: activeTab === "category" ? "block" : "none" }}>

          <Divider label="Gap Analysis by Survey Category" icon="📂" />
          <DsTag label="DATA_MODEL + DATA_EVALUATION — grouped by section" />

          <SecCard num="4" icon="📂" title="Category-Level Analysis"
            subtitle="Survey sections ranked by average disagreement — identifies systemic institutional gaps">

            {/* Category bar chart */}
            <Card fullWidth icon="📊" title="Category Average Scores" sub="Higher bar = more student disagreement = bigger institutional gap"
              note="Categories are derived from survey section groupings. Each bar represents the average Likert score across all items in that section."
              insight={`${categories[0]?.label ?? "Top category"} has the highest average disagreement (${categories[0]?.avg.toFixed(2) ?? "—"}/4) — most urgent area for institutional action.`}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categories} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[2, 3.2]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(2)}/4`} />} />
                  <ReferenceLine y={2.5}  stroke={IIEE.gold}    strokeDasharray="4 3" label={{ value: "2.5 concern",  position: "insideTopRight", fill: IIEE.gold,    fontSize: 9 }} />
                  <ReferenceLine y={2.7}  stroke={IIEE.failRed} strokeDasharray="4 3" label={{ value: "2.7 critical", position: "insideTopRight", fill: IIEE.failRed, fontSize: 9 }} />
                  <Bar dataKey="avg" name="Avg Score" radius={[6,6,0,0]}
                    activeBar={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,.5))" }}>
                    {categories.map((entry, i) => <Cell key={i} fill={sevColor(entry.avg)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Per-category cards */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(220px,28%,280px),1fr))", gap: 12 }}>
              {categories.map((cat, ci) => {
                const col = sevColor(cat.avg);
                return (
                  <div key={ci} style={{ background: "rgba(11,20,55,0.72)", border: `1px solid ${col}30`, borderRadius: 14, padding: "14px 16px", transition: "border-color .18s" }}>
                    {/* Category header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: IIEE.white }}>{cat.label}</span>
                      <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 22, fontWeight: 700, color: col }}>{cat.avg.toFixed(2)}<span style={{ fontSize: 10, color: IIEE.dimText }}>/4</span></span>
                    </div>
                    <div style={{ fontSize: 10, color: IIEE.dimText, marginBottom: 8 }}>{cat.count} weak item{cat.count !== 1 ? "s" : ""} · {sevEmoji(cat.avg)} {sevLabel(cat.avg)}</div>
                    <Prog value={((cat.avg - 1) / 3) * 100} color={col} />
                    {/* Items list */}
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {cat.items.slice(0, 4).map((q, qi) => (
                        <div key={qi} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: IIEE.muted, fontFamily: "monospace" }}>{q.key}</span>
                          <span style={{ color: sevColor(q.avg), fontWeight: 700 }}>{q.avg.toFixed(2)}</span>
                        </div>
                      ))}
                      {cat.items.length > 4 && <div style={{ fontSize: 10, color: IIEE.dimText }}>+{cat.items.length - 4} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>

          </SecCard>

          {/* Final insight */}
          <SecCard num="5" icon="🏫" title="Institutional Action Summary"
            subtitle="Synthesized findings across all survey categories">
            <div className="g2-c">
              <div className="reco-card-c">
                <div className="reco-title-c">🔴 Critical Categories</div>
                <ul className="reco-list-c">
                  {categories.filter((c) => c.avg >= 2.7).map((cat, i) => (
                    <li key={i}><span className="reco-dot-c" style={{ background: IIEE.failRed }} />
                      <strong>{cat.label}</strong>: avg {cat.avg.toFixed(2)}/4 across {cat.count} items — immediate institutional review required.
                    </li>
                  ))}
                  {categories.filter((c) => c.avg >= 2.7).length === 0 && (
                    <li><span className="reco-dot-c" />No categories in critical range — monitor moderate areas closely.</li>
                  )}
                </ul>
              </div>
              <div className="reco-card-c" style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.08) 0%,rgba(56,189,248,0.03) 100%)", borderColor: "rgba(56,189,248,0.25)" }}>
                <div className="reco-title-c" style={{ color: IIEE.blue }}>🟡 Moderate Categories</div>
                <ul className="reco-list-c">
                  {categories.filter((c) => c.avg >= 2.55 && c.avg < 2.7).map((cat, i) => (
                    <li key={i}><span className="reco-dot-c" style={{ background: IIEE.amber }} />
                      <strong>{cat.label}</strong>: avg {cat.avg.toFixed(2)}/4 — targeted improvement plan recommended.
                    </li>
                  ))}
                  {categories.filter((c) => c.avg >= 2.55 && c.avg < 2.7).length === 0 && (
                    <li><span className="reco-dot-c" />No moderate categories — check individual item severity.</li>
                  )}
                </ul>
              </div>
            </div>
          </SecCard>

        </div>

      </div>
    </div>
  );
}