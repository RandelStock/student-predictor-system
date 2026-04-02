import { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Design Tokens (mirrors ModelOverviewDashboard exactly) ─── */
const IIEE = {
  navy:       "#0B1437",
  navyMid:    "#0F1C4D",
  navyLight:  "#162259",
  gold:       "#F5C518",
  goldDim:    "#C9A114",
  goldGlow:   "rgba(245,197,24,0.18)",
  goldBorder: "rgba(245,197,24,0.35)",
  white:      "#F8FAFC",
  muted:      "#94A3B8",
  dimText:    "#64748B",
  cardBg:     "rgba(15,28,77,0.72)",
  cardBorder: "rgba(245,197,24,0.18)",
  glassBg:    "rgba(11,20,55,0.85)",
  passGreen:  "#22C55E",
  failRed:    "#EF4444",
  amber:      "#F59E0B",
  blue:       "#38BDF8",
  teal:       "#2DD4BF",
  indigo:     "#818CF8",
  orange:     "#FB923C",
};

/* ─── Shared Styles (mirrors ModelOverviewDashboard exactly) ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .iiee-feat * { box-sizing: border-box; }
  .iiee-feat {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* Hero — mirrors comb-hero */
  .feat-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .feat-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .feat-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px,2vw,12px); flex-wrap:wrap; }
  .feat-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px,1.5vw,11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .feat-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .feat-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .feat-badge.teal { background:rgba(45,212,191,0.10); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .feat-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px,5vw,32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .feat-hero-title .ag { color:${IIEE.gold}; }
  .feat-hero-title .ab { color:${IIEE.blue}; }
  .feat-hero-sub { font-size:clamp(12px,2vw,14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }
  .feat-hero-insight {
    margin: 10px 0 0; padding: clamp(10px,2vw,14px) clamp(12px,2vw,16px);
    background: rgba(245,197,24,0.06); border-left: 3px solid ${IIEE.goldBorder};
    border-radius: 0 10px 10px 0; font-size: clamp(12px,1.5vw,13.5px);
    color: #e2e8f0; line-height: 1.65; font-family:'Inter',sans-serif;
  }

  /* Body */
  .feat-body { padding:clamp(14px,4vw,24px) clamp(16px,5vw,28px) clamp(32px,6vw,48px); }

  /* Divider — mirrors comb-divider */
  .feat-divider {
    display:flex; align-items:center; gap:10px;
    margin:clamp(18px,4vw,28px) 0 clamp(10px,2vw,16px);
  }
  .feat-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .feat-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .feat-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px,1.5vw,12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* SecCard — mirrors sec-card */
  .feat-sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px,3vw,20px); overflow:hidden;
    transition:border-color .18s;
  }
  .feat-sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .feat-sec-head {
    display:flex; align-items:flex-start; gap:clamp(10px,2vw,14px);
    padding:clamp(12px,2vw,18px) clamp(14px,3vw,20px) clamp(10px,2vw,14px);
    border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .feat-sec-icon {
    width:clamp(32px,6vw,40px); height:clamp(32px,6vw,40px); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(16px,3vw,18px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .feat-sec-num {
    font-family:'Montserrat',sans-serif; font-size:clamp(10px,1.5vw,11px); font-weight:700;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .feat-sec-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(16px,3vw,18px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .feat-sec-subtitle { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .feat-sec-body { padding:clamp(12px,2vw,18px) clamp(14px,3vw,20px); }

  /* DS tag */
  .feat-ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px,1.5vw,11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

  /* Metric cards — mirrors metric-card */
  .feat-metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px,20vw,155px),1fr));
    gap:clamp(10px,2vw,14px); margin-bottom:0;
  }
  .feat-metric-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:clamp(14px,3vw,18px) clamp(12px,2vw,16px) clamp(10px,2vw,14px);
    position:relative; overflow:hidden;
    transition:transform .18s, border-color .18s, box-shadow .18s;
    cursor:default;
  }
  .feat-metric-card:hover {
    transform:translateY(-2px); border-color:${IIEE.gold};
    box-shadow:0 8px 28px rgba(245,197,24,0.12);
  }
  .feat-metric-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .feat-metric-icon { font-size:clamp(16px,3vw,18px); margin-bottom:clamp(8px,2vw,10px); display:block; }
  .feat-metric-label {
    font-size:clamp(10px,1.5vw,12px); font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif;
  }
  .feat-metric-value {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(24px,5vw,34px); font-weight:700; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .feat-metric-sub { font-size:clamp(10px,1.5vw,12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }

  /* Chart card — mirrors chart-card */
  .feat-chart-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:16px; padding:clamp(12px,3vw,18px);
    transition:border-color .18s;
  }
  .feat-chart-card:hover { border-color:rgba(245,197,24,0.35); }
  .feat-chart-card.inner {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:clamp(12px,2vw,16px);
  }
  .feat-chart-head { display:flex; align-items:flex-start; gap:clamp(8px,2vw,10px); margin-bottom:clamp(10px,2vw,14px); }
  .feat-chart-icon {
    width:clamp(30px,6vw,34px); height:clamp(30px,6vw,34px); border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(14px,2.5vw,15px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .feat-chart-icon.blue { background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); }
  .feat-chart-icon.teal { background:rgba(45,212,191,0.1); border:1px solid rgba(45,212,191,0.25); }
  .feat-chart-icon.indigo { background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.25); }
  .feat-chart-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(14px,2.5vw,16px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .feat-chart-sub { font-size:clamp(11px,1.5vw,12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .feat-chart-note {
    margin-top:10px; padding:clamp(8px,2vw,12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px,1.5vw,11.5px); color:${IIEE.muted}; line-height:1.6;
    font-family:'Inter',sans-serif;
  }
  .feat-chart-note strong { color:${IIEE.gold}; font-family:'Montserrat',sans-serif; }

  /* Grid layouts — mirrors g2 */
  .feat-g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,2vw,16px); }
  .feat-g2 .fw { grid-column:1/-1; }

  /* Progress bar — mirrors prog-track */
  .feat-prog-track {
    height:6px; background:rgba(255,255,255,0.06);
    border-radius:99px; overflow:hidden; margin-bottom:10px;
  }
  .feat-prog-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }

  /* Reco card — mirrors reco-card */
  .feat-reco-card {
    background:linear-gradient(135deg,rgba(245,197,24,0.08) 0%,rgba(245,197,24,0.03) 100%);
    border:1px solid rgba(245,197,24,0.25); border-radius:14px;
    padding:clamp(12px,2vw,16px) clamp(14px,2vw,18px);
  }
  .feat-reco-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(14px,2.5vw,16px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.06em; color:${IIEE.gold}; margin:0 0 10px;
  }
  .feat-reco-list { list-style:none; padding:0; margin:0; }
  .feat-reco-list li {
    display:flex; align-items:flex-start; gap:8px; padding:6px 0;
    font-size:clamp(11px,1.5vw,12.5px); color:rgba(245,197,24,0.85); line-height:1.5;
    font-family:'Inter',sans-serif; border-bottom:1px solid rgba(245,197,24,0.08);
  }
  .feat-reco-list li:last-child { border-bottom:none; }
  .feat-reco-dot { width:6px; height:6px; border-radius:50%; background:${IIEE.gold}; margin-top:5px; flex-shrink:0; }

  /* Insight banner */
  .feat-insight-banner {
    border-left:3px solid ${IIEE.gold};
    background:linear-gradient(90deg,rgba(245,197,24,0.08) 0%,transparent 100%);
    border-radius:0 10px 10px 0; padding:clamp(8px,2vw,10px) clamp(12px,2vw,16px);
    margin-bottom:clamp(16px,3vw,22px); font-size:clamp(11px,1.5vw,12.5px);
    color:${IIEE.white}; font-family:'Inter',sans-serif;
  }

  /* Tooltip */
  .feat-tooltip {
    background:${IIEE.navyMid}; border:1px solid ${IIEE.goldBorder};
    border-radius:10px; padding:10px 14px; font-size:12px;
    color:${IIEE.white}; box-shadow:0 8px 24px rgba(0,0,0,.5);
  }
  .feat-tooltip .label { color:${IIEE.gold}; font-weight:700; margin-bottom:4px; font-size:11px; text-transform:uppercase; letter-spacing:.06em; }

  /* Scrollable list */
  .feat-scroll-list {
    max-height:280px; overflow-y:auto; padding-right:6px;
    scrollbar-width:thin; scrollbar-color:rgba(245,197,24,0.2) transparent;
  }
  .feat-scroll-list::-webkit-scrollbar { width:4px; }
  .feat-scroll-list::-webkit-scrollbar-thumb { background:rgba(245,197,24,0.2); border-radius:4px; }

  /* Table */
  .feat-table { width:100%; border-collapse:collapse; font-size:13px; }
  .feat-table th {
    font-size:clamp(11px,1.5vw,12px); font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.dimText};
    padding:clamp(6px,1.5vw,8px) clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(245,197,24,0.12);
    text-align:left; font-family:'Montserrat',sans-serif;
  }
  .feat-table td {
    padding:clamp(8px,1.5vw,10px); border-bottom:1px solid rgba(255,255,255,0.04);
    font-size:clamp(12px,1.5vw,14px); font-family:'Inter',sans-serif;
  }
  .feat-table tr:last-child td { border-bottom:none; }
  .feat-table tr:hover td { background:rgba(245,197,24,0.03); }

  /* Responsive */
  @media (max-width:960px) {
    .feat-g2 { grid-template-columns:1fr; }
    .feat-g2 .fw { grid-column:1; }
    .feat-metrics-grid { grid-template-columns:repeat(2,1fr); }
    .feat-body { padding:12px; }
  }
  @media (max-width:768px) {
    .feat-body { padding:10px; }
    .feat-metrics-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .feat-g2 { gap:10px; }
  }
  @media (max-width:640px) {
    .feat-hero { padding:14px 12px 10px; }
    .feat-sec-body { padding:10px 12px; }
    .feat-sec-head { padding:10px 12px 8px; gap:10px; }
    .feat-metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .feat-body { padding:8px; }
    .feat-g2 { gap:8px; }
    .feat-chart-card { padding:10px; }
  }
  @media (max-width:540px) {
    .feat-hero { padding:10px 10px 8px; }
    .feat-metrics-grid { grid-template-columns:1fr; }
    .feat-body { padding:6px; }
    .feat-sec-body { padding:8px; }
    .feat-chart-card { padding:8px; }
  }

  .feat-fade-in { animation:featFadeIn .45s ease both; }
  @keyframes featFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ─── Sub-components ──────────────────────────────────────────── */

function FeatTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="feat-tooltip">
      {label && <div className="label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.fill || p.color || IIEE.gold, display:"inline-block" }} />
          <span style={{ color:IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight:700 }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Divider({ label, icon }) {
  return (
    <div className="feat-divider">
      <div className="feat-divider-line" />
      <div className="feat-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="feat-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="feat-metric-card" style={{ "--ac": color }}>
      <span className="feat-metric-icon">{icon}</span>
      <div className="feat-metric-label">{label}</div>
      <div className="feat-metric-value">{value}</div>
      {sub && <div className="feat-metric-sub">{sub}</div>}
    </div>
  );
}

function Prog({ value, color }) {
  return (
    <div className="feat-prog-track">
      <div className="feat-prog-fill" style={{ width:`${Math.min(value,100)}%`, background:color }} />
    </div>
  );
}

function SecCard({ num: number, icon, title, subtitle, children }) {
  return (
    <div className="feat-sec-card">
      <div className="feat-sec-head">
        <div className="feat-sec-icon">{icon}</div>
        <div style={{ flex:1 }}>
          {number && <div className="feat-sec-num">Section {number}</div>}
          <h3 className="feat-sec-title">{title}</h3>
          {subtitle && <p className="feat-sec-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="feat-sec-body">{children}</div>
    </div>
  );
}

function DsTag({ label }) {
  return <div className="feat-ds-tag">📂 {label}</div>;
}

function ChartCard({ icon, title, sub, children, note, insight, inner, fullWidth, accent = "gold" }) {
  return (
    <div className={`feat-chart-card${inner ? " inner" : ""}${fullWidth ? " fw" : ""}`}>
      <div className="feat-chart-head">
        <div className={`feat-chart-icon${accent !== "gold" ? ` ${accent}` : ""}`}>{icon}</div>
        <div>
          <div className="feat-chart-title">{title}</div>
          {sub && <div className="feat-chart-sub">{sub}</div>}
        </div>
      </div>
      {children}
      {(note || insight) && (
        <div className="feat-chart-note">
          {note && <span>{note}</span>}
          {insight && <><br /><strong>↳ {insight}</strong></>}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfessorFeaturesDashboard({ featureImp = [], passFailComparison = [] }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const fallbackPassFail = passFailComparison.length ? passFailComparison : [
    { factor: "ESAS Avg",          pass: "78%",  fail: "55%" },
    { factor: "MATH Avg",          pass: "81%",  fail: "58%" },
    { factor: "GWA",               pass: "1.52", fail: "2.48" },
    { factor: "Study Habit Index", pass: "78%",  fail: "43%" },
  ];

  const topFeature  = featureImp[0] ?? null;
  const top3Pct     = featureImp.slice(0,3).reduce((a,f) => a + (f.value ?? 0), 0);
  const top3PctFmt  = topFeature ? `${(top3Pct * 100).toFixed(1)}%` : "—";

  const rankColor = (i) =>
    i === 0 ? IIEE.blue :
    i === 1 ? IIEE.indigo :
    i === 2 ? IIEE.teal :
    i <  4  ? IIEE.amber :
    IIEE.muted;

  return (
    <div className="iiee-feat feat-fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="feat-hero">
        <div className="feat-hero-badges">
          <span className="feat-badge gold">🤖 Feature Analysis</span>
          <span className="feat-badge blue">📊 Random Forest</span>
          <span className="feat-badge teal">🎓 SLSU REE</span>
        </div>
        <h2 className="feat-hero-title">
          Feature <span className="ag">Importance</span> &amp; <span className="ab">Predictors</span>
        </h2>
        <p className="feat-hero-sub">
          Gini importance from the Random Forest classifier — what drives pass/fail outcomes on the EE board exam.
        </p>
        {topFeature && (
          <div className="feat-hero-insight">
            The model identifies <strong>{topFeature.label}</strong>, <strong>MATH scores</strong>, and <strong>GWA</strong> as the top three predictors, accounting for approximately <strong>{top3PctFmt}</strong> of total model importance. Students with higher scores in these areas and consistent study habits are significantly more likely to pass the licensure exam.
          </div>
        )}
      </div>

      <div className="feat-body">

        {/* ── KPI Strip ── */}
        <Divider label="Feature Importance Summary" icon="📌" />
        <DsTag label="Random Forest Classifier — Gini Importance, Top Features" />
        <div className="feat-metrics-grid" style={{ marginBottom:28 }}>
          <KPI
            label="Top Predictor"
            value={topFeature ? topFeature.label.split(" ").slice(0,2).join(" ") : "—"}
            icon="🥇"
            color={IIEE.blue}
            sub={topFeature ? `${(topFeature.value * 100).toFixed(1)}% importance` : ""}
          />
          <KPI
            label="Top 3 Share"
            value={top3PctFmt}
            icon="📊"
            color={IIEE.gold}
            sub="ESAS + MATH + GWA combined"
          />
          <KPI
            label="Total Features"
            value={featureImp.length || "—"}
            icon="🔢"
            color={IIEE.indigo}
            sub="All ranked predictors"
          />
          <KPI
            label="#2 Predictor"
            value={featureImp[1] ? featureImp[1].label.split(" ").slice(0,2).join(" ") : "—"}
            icon="🥈"
            color={IIEE.indigo}
            sub={featureImp[1] ? `${(featureImp[1].value * 100).toFixed(1)}% importance` : ""}
          />
          <KPI
            label="#3 Predictor"
            value={featureImp[2] ? featureImp[2].label.split(" ").slice(0,2).join(" ") : "—"}
            icon="🥉"
            color={IIEE.teal}
            sub={featureImp[2] ? `${(featureImp[2].value * 100).toFixed(1)}% importance` : ""}
          />
          <KPI
            label="GWA Rank"
            value={`#${featureImp.findIndex(f => f.label?.toLowerCase().includes("gwa")) + 1 || "—"}`}
            icon="🎓"
            color={IIEE.amber}
            sub="Non-exam strongest predictor"
          />
        </div>

        {/* ── Section 1: Ranked List + Bar Chart ── */}
        <Divider label="Predictor Rankings" icon="🤖" />
        <SecCard
          num="1"
          icon="🤖"
          title="Top Predictors Ranked"
          subtitle="Gini importance from the Random Forest — higher = more influence on pass/fail outcome"
        >
          <DsTag label="DATA_MODEL — Random Forest Classifier, featureImp" />
          <div className="feat-g2">
            {/* Ranked list */}
            <ChartCard icon="🏆" title="Top 10 Predictors" sub="Ranked by Gini importance" accent="blue">
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {featureImp.slice(0,10).map((f, i) => {
                  const maxV = featureImp[0]?.value ?? 1;
                  const color = rankColor(i);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{
                        width:22, height:22, borderRadius:7,
                        background:`${color}20`, border:`1px solid ${color}40`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:800, color, flexShrink:0,
                      }}>{i+1}</span>
                      <span style={{ flex:"0 0 190px", fontSize:"clamp(10px,1.5vw,12px)", color:"#cbd5e1", lineHeight:1.3, fontFamily:"'Inter',sans-serif" }}>
                        {f.label}
                      </span>
                      <div style={{ flex:1, height:8, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                        <div style={{
                          height:"100%",
                          width:`${(f.value/maxV)*100}%`,
                          background:`linear-gradient(90deg,${color},${color}88)`,
                          borderRadius:99, transition:"width 1s ease",
                        }} />
                      </div>
                      <span style={{
                        width:52, fontSize:"clamp(10px,1.5vw,12px)", fontWeight:700,
                        color, textAlign:"right", flexShrink:0, fontFamily:"'Montserrat',sans-serif",
                      }}>{f.value.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="feat-chart-note">
                Progress bars show relative importance vs. the top feature. ESAS, MATH, and GWA dominate the top three slots.
                <br /><strong>↳ Subject-area academic performance is the model's primary signal.</strong>
              </div>
            </ChartCard>

            {/* Bar chart */}
            <ChartCard icon="📊" title="Feature Importance — Bar Chart" sub="Visual comparison of top 8 predictors" accent="indigo"
              note="Horizontal bars make relative magnitude easier to compare at a glance."
              insight="Top 4 features account for the majority of predictive power.">
              <ResponsiveContainer width="100%" height={310}>
                <BarChart
                  data={featureImp.slice(0,8).map(f => ({
                    name: f.label.length > 18 ? `${f.label.slice(0,18)}…` : f.label,
                    value: f.value,
                  }))}
                  layout="vertical"
                  margin={{ top:4, right:16, left:4, bottom:4 }}
                  onMouseMove={(e) => { if (e.activeLabel) setHoveredBar(e.activeLabel); }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill:IIEE.dimText, fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill:IIEE.muted, fontSize:10 }} axisLine={false} tickLine={false} width={145} />
                  <Tooltip content={<FeatTooltip formatter={(v) => v.toFixed(4)} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                  <Bar dataKey="value" name="Importance" radius={[0,6,6,0]}>
                    {featureImp.slice(0,8).map((_, index) => (
                      <Cell
                        key={index}
                        fill={rankColor(index)}
                        opacity={hoveredBar === null || hoveredBar === (_.label.length > 18 ? `${_.label.slice(0,18)}…` : _.label) ? 1 : 0.55}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </SecCard>

        {/* ── Section 2: Model driver insights ── */}
        <SecCard
          num="2"
          icon="📌"
          title="Feature Driver Insights"
          subtitle="What the importance rankings tell us about student success predictors"
        >
          <DsTag label="Random Forest Feature Importance — Interpretation" />
          <div className="feat-insight-banner" style={{ borderLeft:`3px solid ${IIEE.gold}`, background:"linear-gradient(90deg,rgba(245,197,24,0.08) 0%,transparent 100%)", borderRadius:"0 10px 10px 0", padding:"clamp(8px,2vw,10px) clamp(12px,2vw,16px)", marginBottom:"clamp(16px,3vw,22px)", fontSize:"clamp(11px,1.5vw,12.5px)", color:IIEE.white, fontFamily:"'Inter',sans-serif" }}>
            The Random Forest classifier ranks features by their Gini impurity reduction. Features with higher values split the pass/fail classes more cleanly — they are the variables the model relies on most when making predictions.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(200px,30vw,260px),1fr))", gap:12, marginBottom:14 }}>
            {[
              { icon:"📝", title:"Subject Scores Dominate", desc:`EE, MATH, and ESAS scores are the top 3 predictors, accounting for ~${top3PctFmt} of total importance — far ahead of other features.`, color:IIEE.blue },
              { icon:"📚", title:"GWA is a Key Signal", desc:"Academic performance (GWA) is the strongest non-exam predictor, confirming its role as an early-warning indicator for at-risk students.", color:IIEE.amber },
              { icon:"🧠", title:"Survey Factors Matter", desc:"Problem-solving confidence and study schedule adherence rank in the top survey predictors — they reflect preparation quality beyond raw scores.", color:IIEE.teal },
              { icon:"📉", title:"Model Drift Watch", desc:"Re-evaluate feature importance rankings each time the model is retrained on updated batches to detect shifts in predictor priority.", color:IIEE.indigo },
            ].map((x,i) => (
              <div key={i} style={{
                background:IIEE.cardBg, border:`1px solid ${IIEE.cardBorder}`, borderRadius:14, padding:16,
                borderTop:`2px solid ${x.color}`, transition:"all .2s ease",
              }}>
                <p style={{ margin:"0 0 6px", fontSize:16 }}>{x.icon}</p>
                <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:IIEE.white, fontFamily:"'Montserrat',sans-serif" }}>{x.title}</p>
                <p style={{ margin:0, fontSize:12, color:IIEE.muted, lineHeight:1.55, fontFamily:"'Inter',sans-serif" }}>{x.desc}</p>
              </div>
            ))}
          </div>

          {/* Regression-style metrics summary */}
          <div className="feat-g2">
            <ChartCard inner icon="📈" title="Top Features vs Model Role" sub="How each predictor tier contributes" accent="blue">
              {[
                { label:"ESAS (Review)",  value:featureImp[0]?.value ?? 0, color:IIEE.blue,   desc:"Board review preparation signal" },
                { label:"MATH (Subject)", value:featureImp[1]?.value ?? 0, color:IIEE.indigo, desc:"Core academic competency" },
                { label:"GWA (Academic)", value:featureImp.find(f=>f.label?.toLowerCase().includes("gwa"))?.value ?? 0, color:IIEE.amber, desc:"Longitudinal performance indicator" },
                { label:"Survey Factors", value:featureImp.slice(5).reduce((a,f)=>a+(f.value??0),0), color:IIEE.teal, desc:"Behavioral and attitudinal inputs" },
              ].map((m,i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontSize:"clamp(11px,1.5vw,12px)", color:IIEE.muted, fontFamily:"'Inter',sans-serif" }}>{m.label}</span>
                    <span style={{ fontSize:"clamp(11px,1.5vw,12px)", fontWeight:700, color:m.color, fontFamily:"'Montserrat',sans-serif" }}>{(m.value*100).toFixed(1)}%</span>
                  </div>
                  <Prog value={m.value * 100 * (100 / ((featureImp[0]?.value ?? 1) * 100))} color={m.color} />
                  <p style={{ fontSize:10, color:IIEE.dimText, margin:"0 0 6px", fontFamily:"'Inter',sans-serif" }}>{m.desc}</p>
                </div>
              ))}
            </ChartCard>

            <div className="feat-reco-card">
              <div className="feat-reco-title">⚡ Key Recommendations</div>
              <ul className="feat-reco-list">
                {[
                  `Prioritize ESAS drilling — it's the #1 predictor and most directly actionable through review programs.`,
                  "Flag students with GWA above 2.0 early — it's the strongest non-exam at-risk indicator.",
                  "Integrate study habit surveys into the early-warning system — consistent study behavior ranks high.",
                  "Include both subject scores and survey metrics in the feature set for balanced explainability.",
                  "Monitor feature importance after each retraining batch to detect model drift over time.",
                  "Consider MATH-targeted remediation for students with strong ESAS but weak MATH scores.",
                ].map((r,i) => (
                  <li key={i}><span className="feat-reco-dot" />{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </SecCard>

        {/* ── Section 3: Full List + Pass vs Fail Table ── */}
        <Divider label="Full Feature Inventory &amp; Pass / Fail Comparison" icon="📋" />
        <SecCard
          num="3"
          icon="📋"
          title="Complete Feature Ranking &amp; Pass vs Fail"
          subtitle="All features ranked by importance, plus average value comparison between passing and failing students"
        >
          <DsTag label="DATA_MODEL + DATA_EVALUATION — All features, Pass/Fail averages" />
          <div className="feat-g2">
            {/* Scrollable full list */}
            <ChartCard icon="📋" title="Full Feature List" sub="All predictors — scroll to see more" accent="teal">
              <div className="feat-scroll-list">
                {featureImp.map((f,i) => {
                  const maxV = featureImp[0]?.value || 1;
                  const color = rankColor(i);
                  return (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:11, color:"#cbd5e1", fontFamily:"'Inter',sans-serif" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:18, height:18, borderRadius:5, background:`${color}20`, border:`1px solid ${color}40`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color, flexShrink:0 }}>{i+1}</span>
                          {f.label}
                        </span>
                        <span style={{ fontWeight:700, color }}>{f.value.toFixed(4)}</span>
                      </div>
                      <div style={{ width:"100%", background:"rgba(255,255,255,0.07)", borderRadius:8, height:8 }}>
                        <div style={{ width:`${Math.max(6,(f.value/maxV)*100)}%`, height:"100%", borderRadius:8, background:`linear-gradient(90deg,${IIEE.blue},${IIEE.indigo})`, transition:"width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="feat-chart-note">
                Bar length is relative to the top feature. The gradient shift from blue → indigo visually tracks descending importance.
              </div>
            </ChartCard>

            {/* Pass vs Fail table */}
            <ChartCard icon="⚖️" title="Pass vs Fail — Selected Features" sub="Average values for passing and failing students" accent="indigo">
              <div style={{ overflowX:"auto" }}>
                <table className="feat-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Pass Avg</th>
                      <th>Fail Avg</th>
                      <th>Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallbackPassFail.map((row, i) => {
                      const passNum = parseFloat(row.pass);
                      const failNum = parseFloat(row.fail);
                      const gap = isNaN(passNum) || isNaN(failNum) ? null : Math.abs(passNum - failNum).toFixed(2);
                      return (
                        <tr key={i}>
                          <td style={{ color:"#e2e8f0", fontWeight:600 }}>{row.factor}</td>
                          <td style={{ color:IIEE.passGreen, fontWeight:700 }}>{row.pass}</td>
                          <td style={{ color:IIEE.failRed,   fontWeight:700 }}>{row.fail}</td>
                          <td>
                            {gap !== null && (
                              <span style={{
                                background:"rgba(245,197,24,0.1)", border:"1px solid rgba(245,197,24,0.25)",
                                borderRadius:4, padding:"2px 7px", fontSize:11, fontWeight:700, color:IIEE.gold,
                                fontFamily:"'Montserrat',sans-serif",
                              }}>Δ {gap}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="feat-chart-note">
                Gap (Δ) column highlights the practical difference between passing and failing cohorts.
                <br /><strong>↳ Larger gaps indicate features with the most differentiation power.</strong>
              </div>
            </ChartCard>
          </div>
        </SecCard>

      </div>
    </div>
  );
}