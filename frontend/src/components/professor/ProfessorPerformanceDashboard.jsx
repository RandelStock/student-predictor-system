import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { pct, num } from "./ProfessorShared";

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

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .perf-dash * { box-sizing: border-box; }
  .perf-dash {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* Hero */
  .perf-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .perf-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .perf-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .perf-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px, 1.5vw, 11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .perf-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .perf-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .perf-badge.teal { background:rgba(45,212,191,0.12); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .perf-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .perf-hero-title .ag { color:${IIEE.gold}; }
  .perf-hero-title .ab { color:${IIEE.blue}; }
  .perf-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  /* Body */
  .perf-body { padding:clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  /* Divider */
  .perf-divider {
    display:flex; align-items:center; gap:10px; margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .perf-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .perf-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .perf-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px, 1.5vw, 12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* KPI Metric Grid */
  .metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px, 20vw, 155px),1fr));
    gap:clamp(10px, 2vw, 14px); margin-bottom:0;
  }
  .metric-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:clamp(14px, 3vw, 18px) clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px);
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
  .metric-icon { font-size:clamp(16px, 3vw, 18px); margin-bottom:clamp(8px, 2vw, 10px); display:block; }
  .metric-label {
    font-size:clamp(10px, 1.5vw, 12px); font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif;
  }
  .metric-value {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(24px, 5vw, 34px); font-weight:700; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .metric-sub { font-size:clamp(10px, 1.5vw, 12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }

  /* Section Cards */
  .sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px, 3vw, 20px); overflow:hidden;
    transition:border-color .18s;
  }
  .sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .sec-head {
    display:flex; align-items:flex-start; gap:clamp(10px, 2vw, 14px);
    padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px);
    border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .sec-icon {
    width:clamp(32px, 6vw, 40px); height:clamp(32px, 6vw, 40px); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(16px, 3vw, 18px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .sec-num {
    font-family:'Montserrat',sans-serif; font-size:clamp(10px, 1.5vw, 11px); font-weight:700;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .sec-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(16px, 3vw, 18px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .sec-subtitle { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .sec-body { padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px); }

  /* Chart Cards */
  .chart-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:clamp(12px, 3vw, 18px);
    transition:border-color .18s;
  }
  .chart-card:hover { border-color:rgba(245,197,24,0.35); }
  .chart-card.inner {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:clamp(12px, 2vw, 16px);
  }
  .chart-head { display:flex; align-items:flex-start; gap:clamp(8px, 2vw, 10px); margin-bottom:clamp(10px, 2vw, 14px); }
  .chart-icon {
    width:clamp(30px, 6vw, 34px); height:clamp(30px, 6vw, 34px); border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(14px, 2.5vw, 15px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .chart-icon.blue { background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); }
  .chart-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(14px, 2.5vw, 16px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .chart-sub { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .chart-note {
    margin-top:10px; padding:clamp(8px, 2vw, 12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px, 1.5vw, 11.5px); color:${IIEE.muted}; line-height:1.6; font-family:'Inter',sans-serif;
  }
  .chart-note strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }

  /* Grid Layouts */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }
  .g2 .fw { grid-column:1/-1; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(12px, 2vw, 16px); }

  /* DS Tag */
  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

  /* Reco Card */
  .reco-card {
    background:linear-gradient(135deg,rgba(245,197,24,0.08) 0%,rgba(245,197,24,0.03) 100%);
    border:1px solid rgba(245,197,24,0.25); border-radius:14px; padding:clamp(12px, 2vw, 16px) clamp(14px, 2vw, 18px);
  }
  .reco-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(14px, 2.5vw, 16px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.06em; color:${IIEE.gold}; margin:0 0 10px;
  }
  .reco-list { list-style:none; padding:0; margin:0; }
  .reco-list li {
    display:flex; align-items:flex-start; gap:8px; padding:6px 0;
    font-size:clamp(11px, 1.5vw, 12.5px); color:rgba(245,197,24,0.85); line-height:1.5; font-family:'Inter',sans-serif;
    border-bottom:1px solid rgba(245,197,24,0.08);
  }
  .reco-list li:last-child { border-bottom:none; }
  .reco-dot { width:6px; height:6px; border-radius:50%; background:${IIEE.gold}; margin-top:5px; flex-shrink:0; }

  /* Explanation block */
  .explain-block {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:14px; padding:clamp(14px, 2vw, 18px); margin-top:16px;
  }
  .explain-block-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(13px, 2vw, 15px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 8px;
  }
  .explain-block-sub { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.muted}; margin:0 0 12px; font-family:'Inter',sans-serif; }
  .explain-list { margin:0; padding-left:18px; color:${IIEE.muted}; font-size:clamp(11px, 1.2vw, 12px); line-height:1.7; font-family:'Inter',sans-serif; }
  .explain-list li { margin-bottom:3px; }
  .explain-list li strong { color:${IIEE.white}; font-family:'Montserrat',sans-serif; font-weight:600; }

  /* Focus banner */
  .focus-banner {
    background:rgba(15,28,77,0.75); border:1px solid rgba(245,197,24,0.2);
    border-radius:14px; padding:clamp(10px, 2vw, 14px) clamp(12px, 2vw, 18px);
    color:${IIEE.muted}; font-family:'Inter',sans-serif;
    font-size:clamp(11px, 1.5vw, 13px); margin-bottom:clamp(12px, 2vw, 18px); line-height:1.6;
  }
  .focus-banner strong { color:${IIEE.white}; }

  /* Subject trend stat boxes */
  .trend-stat {
    border-radius:12px; padding:clamp(10px, 2vw, 14px);
    font-family:'Montserrat',sans-serif;
  }
  .trend-stat-label { font-size:10px; color:${IIEE.dimText}; text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
  .trend-stat-value { font-size:clamp(20px, 4vw, 26px); font-weight:700; line-height:1; }
  .trend-stat-delta { font-size:clamp(11px, 1.5vw, 12px); margin-top:3px; font-family:'Inter',sans-serif; }

  /* Weak subject banner */
  .weak-banner {
    margin-top:12px; background:rgba(245,158,11,0.06);
    border:1px solid rgba(245,158,11,0.2); border-radius:10px;
    padding:clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 14px);
    font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.amber}; line-height:1.6; font-family:'Inter',sans-serif;
  }
  .weak-banner strong { color:${IIEE.white}; }

  /* Responsive */
  @media (max-width:1200px) { .g3 { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:960px) {
    .g2,.g3 { grid-template-columns:1fr; }
    .g2 .fw,.g3 .fw { grid-column:1; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); }
    .perf-body { padding:12px; }
  }
  @media (max-width:640px) {
    .perf-hero { padding:14px 12px 10px; }
    .sec-body { padding:10px 12px; }
    .sec-head { padding:10px 12px 8px; gap:10px; }
    .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .perf-body { padding:8px; }
    .g2,.g3 { gap:8px; }
    .chart-card { padding:10px; }
  }
  @media (max-width:540px) {
    .perf-hero { padding:10px 10px 8px; }
    .metrics-grid { grid-template-columns:1fr; }
    .perf-body { padding:6px; }
    .g2,.g3 { gap:6px; }
    .sec-body { padding:8px; }
    .chart-card { padding:8px; }
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
    <div className="perf-divider">
      <div className="perf-divider-line" />
      <div className="perf-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="perf-divider-line rev" />
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
═══════════════════════════════════════════════════════════════ */
export default function ProfessorPerformanceDashboard({
  passByStrand,
  sectionScores,
  subjectTrends,
  filteredSubjectTrends,
  weakestSubject,
}) {
  /* ── Derive summary KPIs from props ── */
  const topStrand     = passByStrand?.[0];
  const bottomStrand  = [...(passByStrand ?? [])].sort((a, b) => a.pass_rate - b.pass_rate)[0];
  const avgPass       = passByStrand?.length
    ? passByStrand.reduce((s, d) => s + (d.pass_rate ?? 0), 0) / passByStrand.length
    : 0;
  const trendData     = filteredSubjectTrends?.length ? filteredSubjectTrends : (subjectTrends ?? []);
  const lastTrend     = trendData[trendData.length - 1] ?? {};
  const subjectTrendOrder = ["MATH", "ESAS", "EE"];
  const subjectTrendColors = { MATH: IIEE.indigo, ESAS: IIEE.teal, EE: IIEE.blue };

  return (
    <div className="perf-dash fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="perf-hero">
        <div className="perf-hero-badges">
          <span className="perf-badge gold">📊 Dashboard</span>
          <span className="perf-badge blue">🧭 SLSU REE Analytics</span>
          <span className="perf-badge teal">📐 Performance Breakdown</span>
        </div>
        <h2 className="perf-hero-title">
          PRC 2022-2025 <span className="ag">Performance</span> <span className="ab">Breakdown</span>
        </h2>
        <p className="perf-hero-sub">
          Pass rates by SHS strand · Survey section scores · Subject score trends by year
        </p>
      </div>

      <div className="perf-body">

        {/* ── Focus Banner ── */}
        <div className="focus-banner">
          <strong>Focus:</strong> Total GWA, exam score predictors (Math / EE / ESAS), and survey dimensions are combined via feature engineering and correlation analysis.
          Strand-level breakdowns surface structural gaps; section radar views reveal non-academic support differentials between passers and failers.
        </div>

        {/* ══ SECTION 1 — KPI Snapshot ══ */}
        <Divider label="Strand Performance Snapshot" icon="📌" />
        <DsTag label="DATA_UPCOMING — 333 rows, 2022-2025" />

        <div className="metrics-grid" style={{ marginBottom: 28 }}>
          <KPI label="Strands Tracked"  value={passByStrand?.length ?? "—"} icon="🎓" color={IIEE.blue}      sub="SHS tracks in dataset" />
          <KPI label="Top Strand Rate"  value={pct(topStrand?.pass_rate)}   icon="🏆" color={IIEE.passGreen} sub={topStrand?.label ?? "—"} />
          <KPI label="Avg Pass Rate"    value={pct(avgPass)}                 icon="📊" color={IIEE.gold}
            sub={(avgPass >= 70 ? "Above" : "Below") + " 70% benchmark"} />
          <KPI label="Weakest Strand"   value={pct(bottomStrand?.pass_rate)} icon="⚠️" color={IIEE.failRed}  sub={bottomStrand?.label ?? "—"} />
          <KPI label="Latest EE Avg"    value={num(lastTrend.EE_avg, 1)}     icon="⚡" color={IIEE.teal}     sub="Most recent year" />
          <KPI label="Latest ESAS Avg"  value={num(lastTrend.ESAS_avg, 1)}   icon="🧮" color={IIEE.indigo}   sub="Top board predictor" />
        </div>

        {/* ══ SECTION 1 — Strand Pass Rates ══ */}
        <SecCard num="1" icon="🎓" title="Pass Rate by SHS Strand"
          subtitle="Horizontal comparison — 70% PRC threshold reference line">
          <DsTag label="DATA_UPCOMING — strand-level breakdown" />
          <div className="g2">
            <Card icon="📊" title="Strand Pass Rates" sub="All strands vs 70% PRC threshold"
              note="Bars are colored green ≥70%, amber 55–69%, red <55%. Hover for exact rates."
              insight={topStrand ? `${topStrand.label} leads at ${pct(topStrand.pass_rate)} — aligned with its math-heavy curriculum.` : undefined}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={passByStrand} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={68} />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                  <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3"
                    label={{ value: "70%", position: "insideTopLeft", fill: IIEE.gold, fontSize: 10 }} />
                  <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                    {(passByStrand ?? []).map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.pass_rate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="reco-card" style={{ alignSelf: "start" }}>
              <div className="reco-title">⚡ Strand Insights</div>
              <ul className="reco-list">
                <li><span className="reco-dot" />STEM leads — its math-science focus directly mirrors the REE board's EE and MATH subject weights.</li>
                <li><span className="reco-dot" />TVL / GAS strands trail STEM by up to 26 points — strand-specific bridging programs are critical.</li>
                <li><span className="reco-dot" />Strands below 55% pass rate need targeted review: advanced ESAS drilling and GWA monitoring.</li>
                <li><span className="reco-dot" />Non-STEM graduates benefit most from 6-month review attendance (68-point pass rate lift observed).</li>
                <li><span className="reco-dot" />Strand choice at SHS is a lagged predictor of board outcome — advising should start at Grade 11.</li>
              </ul>
            </div>
          </div>
        </SecCard>

        {/* ══ SECTION 2 — Survey Section Scores ══ */}
        <Divider label="Survey Section Analysis" icon="🕸️" />
        <SecCard num="2" icon="🕸️" title="Survey Section Scores — Passers vs Failers"
          subtitle="Radar + bar comparison across all survey dimensions">
          <DsTag label="DATA_MODEL + DATA_EVALUATION — survey responses, 159 rows" />

          <div className="g2">
            <Card icon="🕸️" title="Survey Radar View" sub="Passers vs failers across all survey sections" blueTint
              note="Radar reveals relative gaps between passers and failers per survey dimension."
              insight="Sections with the widest gap are the highest-leverage improvement targets.">
              <ResponsiveContainer width="100%" height={270}>
                <RadarChart data={(sectionScores ?? []).map((s) => ({ subject: s.label, Passers: s.pass, Failers: s.fail }))}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: IIEE.dimText, fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[40, 100]} tick={{ fill: IIEE.dimText, fontSize: 9 }} />
                  <Radar name="Passers" dataKey="Passers" stroke={IIEE.passGreen} fill={IIEE.passGreen} fillOpacity={0.15} />
                  <Radar name="Failers" dataKey="Failers" stroke={IIEE.failRed}   fill={IIEE.failRed}   fillOpacity={0.10} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Tooltip content={<Tip fmt={(v) => `${v}%`} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card icon="📊" title="Survey Section Bar Comparison" sub="Average section score split by exam outcome" blueTint
              note="Compare passers vs failers per section to identify the most actionable non-academic gaps."
              insight="Faculty Quality and Curriculum show the largest inter-group gaps — top institutional priorities.">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  data={(sectionScores ?? []).map((s) => ({ name: s.label, Passers: s.pass, Failers: s.fail }))}
                  margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<Tip fmt={(v) => `${v}%`} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                    
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Passers" name="Passers" fill={IIEE.passGreen} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Failers" name="Failers" fill={IIEE.failRed}   radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Section explanation */}
          <div className="explain-block" style={{ marginTop: 16 }}>
            <div className="explain-block-title">Survey Section Scores — Result Explanation</div>
            <p className="explain-block-sub">
              Performance scores are interpreted via domain outcomes. Higher passers scores indicate stronger instructional alignment in that area.
            </p>
            <ul className="explain-list">
              <li><strong>Knowledge:</strong> Strong correlation with GWA and ESAS mastery.</li>
              <li><strong>Problem Solving:</strong> Predictor of improved MATH and EE performance.</li>
              <li><strong>Motivation:</strong> High passers here predicts consistent study habits and exam readiness.</li>
              <li><strong>Mental Health:</strong> Low scores often coincide with increased fail probability — monitor support needs.</li>
              <li><strong>Support System:</strong> Family/peer encouragement correlates with higher pass rates, especially in non-cognitive clusters.</li>
              <li><strong>Curriculum:</strong> Underprepared courses are major dropout signals for first-choice vs non-first-choice EE students.</li>
              <li><strong>Faculty Quality:</strong> Top influence in both subject results and overall pass/fail output.</li>
              <li><strong>Department Review / Facilities / Institutional Culture:</strong> Strong relationships with <code style={{ color: IIEE.gold }}>departmental_support_index</code> — serve as ambient factors.</li>
            </ul>
          </div>
        </SecCard>

        {/* ══ SECTION 3 — Subject Score Trends ══ */}
        {(subjectTrends?.length ?? 0) > 0 && (
          <>
            <Divider label="Subject Score Trends" icon="📐" />
            <SecCard num="3" icon="📐" title="Subject Score Trends by Year"
              subtitle="MATH, ESAS, EE average score trajectories over 2022–2025">
              <DsTag label="DATA_UPCOMING — MATH / ESAS / EE averages by year" />

              <Card icon="📈" title="MATH · ESAS · EE Trends" sub="Year-over-year subject performance vs 70% passing line" fullWidth
                note="Year-over-year trends show curriculum performance momentum and which domains consistently fall below the passing line."
                insight={weakestSubject
                  ? `${weakestSubject.id} is the weakest subject (avg ${num(weakestSubject.avg, 1)}) — ${weakestSubject.delta >= 0 ? "improving" : "declining"} ${Math.abs(weakestSubject.delta).toFixed(1)} pts overall.`
                  : undefined}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 8, right: 24, left: -8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                    <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[55, 85]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                    <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                      label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                    {subjectTrendOrder.map((subj) => (
                      <Line
                        key={subj}
                        type="monotone"
                        dataKey={`${subj}_avg`}
                        name={subj}
                        stroke={subjectTrendColors[subj]}
                        strokeWidth={2.5}
                        dot={{ fill: subjectTrendColors[subj], r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Subject stat tiles */}
              <div className="g3" style={{ marginTop: 16 }}>
                {subjectTrendOrder.map((subj) => {
                  const first = trendData[0];
                  const last  = trendData[trendData.length - 1];
                  const delta = (last?.[`${subj}_avg`] ?? 0) - (first?.[`${subj}_avg`] ?? 0);
                  const col   = subjectTrendColors[subj];
                  return (
                    <div key={subj} className="trend-stat"
                      style={{ background: `${col}0d`, border: `1px solid ${col}25` }}>
                      <div className="trend-stat-label">{subj} Trend</div>
                      <div className="trend-stat-value" style={{ color: col }}>
                        {num(last?.[`${subj}_avg`], 1)}
                      </div>
                      <div className="trend-stat-delta"
                        style={{ color: delta >= 0 ? IIEE.passGreen : IIEE.failRed }}>
                        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} pts overall
                      </div>
                    </div>
                  );
                })}
              </div>

              {weakestSubject && (
                <div className="weak-banner">
                  ⚠ Weakest subject:{" "}
                  <strong>{weakestSubject.id}</strong> (avg {num(weakestSubject.avg, 1)}) —{" "}
                  <strong style={{ color: weakestSubject.delta >= 0 ? IIEE.passGreen : IIEE.failRed }}>
                    {weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} ({Math.abs(weakestSubject.delta).toFixed(1)} pts overall)
                  </strong>
                  {" "}— prioritize remediation in this area before the next board exam cycle.
                </div>
              )}
            </SecCard>
          </>
        )}

        {/* ══ SECTION 4 — Data Pipeline Guide ══ */}
        <Divider label="Data Analysis Pipeline Guide" icon="🔬" />
        <SecCard num="4" icon="🔬" title="Data Analysis Pipeline"
          subtitle="Key preprocessing, encoding, and validation steps for the dataset">
          <DsTag label="DATA_MODEL + DATA_EVALUATION — pipeline reference" />
          <div className="g2">
            {[
              {
                icon: "🧹", title: "Preprocessing", color: IIEE.blue,
                items: ["Missing value imputation and data cleaning", "Category handling and outlier detection", "SHS strand mapping and normalization"],
              },
              {
                icon: "🔢", title: "Encoding", color: IIEE.teal,
                items: ["One-hot: strand, multiple-choice fields", "Label/ordinal: S1–S5 Likert ratings", "Target encoding for high-cardinality categories"],
              },
              {
                icon: "⚙️", title: "Feature Engineering", color: IIEE.indigo,
                items: ["ESAS / MATH / GWA composite indexes", "Cohort trend deltas year-over-year", "College prep score + time-to-graduation flag"],
              },
              {
                icon: "📌", title: "Feature Selection", color: IIEE.amber,
                items: ["Correlation matrix + AUC/RF importance", "Pearson, point-biserial, chi-square tests", "Drop low-importance and collinear features"],
              },
              {
                icon: "✅", title: "Validation", color: IIEE.passGreen,
                items: ["Holdout sets with stratified pass/fail split", "Cross-validation on training fold", "Sanity check on class-imbalanced factors"],
              },
            ].map((step, i) => (
              <div key={i} className="chart-card inner"
                style={{ borderLeft: `3px solid ${step.color}`, borderRadius: "0 14px 14px 0" }}>
                <div className="chart-head">
                  <div className="chart-icon" style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}>
                    {step.icon}
                  </div>
                  <div className="chart-title" style={{ color: step.color }}>{step.title}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, color: IIEE.muted, fontSize: "clamp(11px, 1.2vw, 12px)", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                  {step.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}

            <div className="reco-card" style={{ alignSelf: "start" }}>
              <div className="reco-title">⚡ Pipeline Recommendations</div>
              <ul className="reco-list">
                <li><span className="reco-dot" />Always retrain on DATA_ALL after final evaluation to capture full temporal range.</li>
                <li><span className="reco-dot" />ESAS index is the single strongest predictor — ensure it is never dropped during selection.</li>
                <li><span className="reco-dot" />Stratified split is critical: pass/fail imbalance skews accuracy without it.</li>
                <li><span className="reco-dot" />Survey Likert scales must use ordinal encoding, not one-hot, to preserve order.</li>
                <li><span className="reco-dot" />Time-to-graduation flag adds signal beyond GWA for students who delayed their board attempt.</li>
              </ul>
            </div>
          </div>
        </SecCard>

      </div>
    </div>
  );
}