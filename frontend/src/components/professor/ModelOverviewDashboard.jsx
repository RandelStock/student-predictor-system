import { useMemo, useState} from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
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
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .iiee-combined * { box-sizing: border-box; }
  .iiee-combined {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }
  .comb-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .comb-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .comb-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .comb-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px, 1.5vw, 11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .comb-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .comb-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .comb-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .comb-hero-title .ag { color:${IIEE.gold}; }
  .comb-hero-title .ab { color:${IIEE.blue}; }
  .comb-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  .comb-body { padding:clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  .comb-filter-strip {
    position:sticky; top:0; z-index:20;
    background:rgba(11,20,55,0.95);
    border:1px solid ${IIEE.cardBorder}; border-radius:14px;
    padding:clamp(10px, 2vw, 14px) clamp(12px, 3vw, 18px); margin-bottom:clamp(12px, 3vw, 24px);
    backdrop-filter:blur(16px); box-shadow:0 8px 32px rgba(0,0,0,0.4);
  }
  .comb-year-pill {
    margin-top:10px; padding:8px 14px;
    background:rgba(245,197,24,0.07); border:1px solid ${IIEE.goldBorder};
    border-radius:10px; font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.gold};
    display:flex; align-items:center; gap:8px; font-family:'Inter',sans-serif;
  }

  .comb-divider {
    display:flex; align-items:center; gap:10px; margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .comb-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .comb-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .comb-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px, 1.5vw, 12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

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

  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }
  .g2 .fw { grid-column:1/-1; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(12px, 2vw, 16px); }

  .sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px, 3vw, 20px); overflow:hidden;
    transition:border-color .18s;
  }
  .sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .sec-head {
    display:flex; align-items:flex-start; gap:clamp(10px, 2vw, 14px);
    padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px); border-bottom:1px solid rgba(245,197,24,0.1);
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

  .model-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .model-row-label { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.muted}; font-family:'Inter',sans-serif; }
  .model-row-val { font-size:clamp(11px, 1.5vw, 12px); font-weight:700; font-family:'Montserrat',sans-serif; }
  .prog-track {
    height:6px; background:rgba(255,255,255,0.06);
    border-radius:99px; overflow:hidden; margin-bottom:10px;
  }
  .prog-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }

  .insight-banner {
    border-left:3px solid ${IIEE.gold};
    background:linear-gradient(90deg,rgba(245,197,24,0.08) 0%,transparent 100%);
    border-radius:0 10px 10px 0; padding:clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px);
    margin-bottom:clamp(16px, 3vw, 22px); font-size:clamp(11px, 1.5vw, 12.5px); color:${IIEE.white}; font-family:'Inter',sans-serif;
  }

  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

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

  .tab-btn {
    padding:8px 14px; border-radius:8px; font-size:clamp(11px, 1.5vw, 12px); font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'Inter',sans-serif;
  }

  .ai-insight-box {
    background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(129,140,248,0.06) 100%);
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 12px;
    padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
    margin-top: 12px;
    position: relative;
    overflow: hidden;
  }
  .ai-insight-box::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, ${IIEE.blue}, ${IIEE.indigo});
  }
  .ai-insight-header {
    display: flex; align-items: center; gap: 6px;
    font-size: clamp(10px, 1.5vw, 11px); font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: ${IIEE.blue}; margin-bottom: 8px; font-family:'Montserrat',sans-serif;
  }
  .ai-insight-text {
    font-size: clamp(12px, 1.5vw, 13px); color: ${IIEE.white}; line-height: 1.7; font-family:'Inter',sans-serif;
  }
  .ai-loading {
    display: flex; align-items: center; gap: 8px;
    font-size: clamp(11px, 1.5vw, 12px); color: ${IIEE.muted}; font-family:'Inter',sans-serif;
  }
  .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: ${IIEE.blue}; animation: pulse 1.2s infinite; }
  .ai-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }

  .period-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(150px, 20vw, 200px), 1fr));
    gap: clamp(8px, 2vw, 10px);
    margin-bottom: 16px;
  }
  .period-pill {
    background: rgba(15,28,77,0.8);
    border: 1px solid rgba(245,197,24,0.15);
    border-radius: 12px;
    padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
    transition: border-color .18s, transform .18s;
  }
  .period-pill:hover { border-color: ${IIEE.gold}; transform: translateY(-2px); }
  .period-pill-label {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(12px, 1.5vw, 13px); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: ${IIEE.muted}; margin-bottom: 6px;
  }
  .period-pill-rate {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(20px, 4vw, 28px); font-weight: 700; line-height: 1;
  }
  .period-pill-sub { font-size: clamp(11px, 1.5vw, 12px); color: ${IIEE.dimText}; margin-top: 3px; font-family:'Inter',sans-serif; }

  .subject-table { width: 100%; border-collapse: collapse; }
  .subject-table th {
    font-size: clamp(11px, 1.5vw, 12px); font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: ${IIEE.dimText};
    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 1.5vw, 10px); border-bottom: 1px solid rgba(245,197,24,0.12);
    text-align: left; font-family:'Montserrat',sans-serif;
  }
  .subject-table td {
    padding: clamp(8px, 1.5vw, 10px); border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: clamp(12px, 1.5vw, 14px); font-family:'Inter',sans-serif;
  }
  .subject-table tr:last-child td { border-bottom: none; }
  .subject-table tr:hover td { background: rgba(245,197,24,0.03); }

  .survey-section-row {
    margin-bottom: 14px;
  }
  .survey-section-label {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 4px;
  }
  .survey-section-name { font-size: clamp(11px, 1.5vw, 12px); color: ${IIEE.muted}; font-weight: 600; font-family:'Inter',sans-serif; }
  .survey-section-vals { font-size: clamp(11px, 1.5vw, 12px); color: ${IIEE.dimText}; font-family:'Inter',sans-serif; }
  .survey-track {
    height: 8px; background: rgba(255,255,255,0.05);
    border-radius: 99px; overflow: visible;
    position: relative; margin-bottom: 4px;
  }
  .survey-bar-pass {
    height: 8px; border-radius: 99px;
    background: ${IIEE.passGreen};
    position: absolute; top: 0; left: 0;
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }
  .survey-bar-fail {
    height: 8px; border-radius: 99px;
    background: ${IIEE.failRed}; opacity: 0.7;
    position: absolute; top: 0; left: 0;
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }
  .survey-legend {
    display: flex; gap: clamp(10px, 2vw, 14px); margin-bottom: 14px;
    font-size: clamp(11px, 1.5vw, 12px); flex-wrap:wrap;
  }
  .survey-legend-item { display: flex; align-items: center; gap: 5px; color: ${IIEE.muted}; font-family:'Inter',sans-serif; }
  .survey-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink:0; }

  @media (max-width:1200px) {
    .g3 { grid-template-columns:repeat(2,1fr); }
  }

  @media (max-width:960px) {
    .g2,.g3 { grid-template-columns:1fr; }
    .g2 .fw,.g3 .fw { grid-column:1; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); }
    .comb-body { padding:12px; }
  }

  @media (max-width:768px) {
    .comb-body { padding:10px; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
    .g2 { gap:10px; }
    .g3 { gap:10px; }
  }

  @media (max-width:640px) {
    .comb-hero { padding:14px 12px 10px; }
    .sec-body { padding:10px 12px; }
    .sec-head { padding:10px 12px 8px; gap:10px; }
    .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .comb-body { padding:8px; }
    .g2,.g3 { gap:8px; }
    .chart-card { padding:10px; }
  }

  @media (max-width:540px) {
    .comb-hero { padding:10px 10px 8px; }
    .metrics-grid { grid-template-columns:1fr; }
    .comb-body { padding:6px; }
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

/* ─── Predicted vs Actual (uses DATA_EVALUATION scatter data) ── */
function PredictedActualSection({ scatterData: rawScatter, modelInfo }) {
  const scatter = useMemo(() => {
    const raw = rawScatter ?? [];
    return raw
      .filter((r) => r && (r.actual != null || r.predicted != null))
      .map((r) => ({
        actual:    Number(r.actual ?? r.actual_rating ?? r.Total_Rating ?? 0),
        predicted: Number(r.predicted ?? r.predicted_rating ?? 0),
        passed:    (r.passed != null) ? r.passed : (Number(r.actual ?? r.actual_rating ?? 0) >= 70),
      }))
      .filter((r) => r.actual > 0 && r.predicted > 0);
  }, [rawScatter]);

  const mae = useMemo(() => {
    if (!scatter.length) return null;
    return scatter.reduce((a, r) => a + Math.abs(r.predicted - r.actual), 0) / scatter.length;
  }, [scatter]);

  const r2 = useMemo(() => {
    if (scatter.length < 2) return null;
    const meanActual = scatter.reduce((a, r) => a + r.actual, 0) / scatter.length;
    const ss_tot = scatter.reduce((a, r) => a + Math.pow(r.actual - meanActual, 2), 0);
    const ss_res = scatter.reduce((a, r) => a + Math.pow(r.actual - r.predicted, 2), 0);
    return 1 - (ss_res / ss_tot);
  }, [scatter]);

  const passed = scatter.filter((r) => r.passed);
  const failed = scatter.filter((r) => !r.passed);

  if (!scatter.length) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 13, color: IIEE.muted, marginBottom: 8 }}>
          No scatter data detected. To populate this section:
        </div>
        <div style={{ fontSize: 12, color: IIEE.dimText, lineHeight: 1.8 }}>
          1. Run <code style={{ color: IIEE.gold }}>train_model.py</code> to generate predictions<br/>
          2. Ensure <code style={{ color: IIEE.gold }}>/dashboard</code> endpoint returns <code style={{ color: IIEE.gold }}>scatterData</code><br/>
          3. Each item needs: <code style={{ color: IIEE.gold }}>{'{ actual, predicted }'}</code>
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245,197,24,.06)", border: "1px solid rgba(245,197,24,.2)", borderRadius: 10, fontSize: 12, color: IIEE.gold }}>
          ℹ️ The 2025 test set (DATA_EVALUATION, 36 rows) should provide this data after model training.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Test Records", value: scatter.length, color: IIEE.blue, icon: "📋" },
          { label: "MAE",          value: mae != null ? mae.toFixed(2) + " pts" : "—", color: IIEE.teal, icon: "📏" },
          { label: "R² (test)",    value: r2 != null ? (r2 * 100).toFixed(1) + "%" : "—", color: IIEE.indigo, icon: "📈" },
          { label: "Correct Pass", value: passed.filter(r => r.predicted >= 70).length + "/" + passed.length, color: IIEE.passGreen, icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: IIEE.cardBg, border: `1px solid ${s.color}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 10, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 12, right: 24, left: -8, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
          <XAxis
            dataKey="actual"    name="Actual Rating"
            type="number"       domain={[40, 100]}
            tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: "Actual PRC Rating", position: "insideBottom", offset: -10, fill: IIEE.muted, fontSize: 11 }}
          />
          <YAxis
            dataKey="predicted" name="Predicted Rating"
            type="number"       domain={[40, 100]}
            tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: "Predicted", angle: -90, position: "insideLeft", fill: IIEE.muted, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                  <div style={{ color: IIEE.gold, marginBottom: 4 }}>Examinee</div>
                  <div>Actual: <strong style={{ color: IIEE.white }}>{d?.actual?.toFixed(2)}</strong></div>
                  <div>Predicted: <strong style={{ color: IIEE.white }}>{d?.predicted?.toFixed(2)}</strong></div>
                  <div style={{ marginTop: 4, color: d?.passed ? IIEE.passGreen : IIEE.failRed }}>
                    {d?.passed ? "✅ Passed" : "❌ Failed"}
                  </div>
                </div>
              );
            }}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <ReferenceLine
            segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]}
            stroke="rgba(245,197,24,.35)" strokeDasharray="5 4"
            label={{ value: "Perfect", position: "insideTopLeft", fill: IIEE.gold, fontSize: 10 }}
          />
          <ReferenceLine x={70} stroke={IIEE.failRed} strokeDasharray="4 3"
            label={{ value: "Pass 70", position: "top", fill: IIEE.failRed, fontSize: 10 }} />
          <ReferenceLine y={70} stroke={IIEE.failRed} strokeDasharray="4 3" />
          <Scatter data={passed} fill={IIEE.passGreen} fillOpacity={0.85} r={5} name="Passed" />
          <Scatter data={failed} fill={IIEE.failRed}   fillOpacity={0.85} r={5} name="Failed" />
          <Legend iconType="circle" iconSize={9}
            formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
        </ScatterChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 10, fontSize: 12, color: IIEE.muted, lineHeight: 1.6 }}>
        {mae != null
          ? `Average prediction error = ${mae.toFixed(2)} pts across ${scatter.length} test records (2025 held-out). Points closer to the diagonal = more accurate predictions.`
          : `${scatter.length} test records plotted. Points on the diagonal = perfect predictions.`}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER — derive full DATA_UPCOMING KPIs from analytics response
   ---------------------------------------------------------------
   The backend /analytics endpoint loads DATA_UPCOMING (333 rows)
   as the primary source and returns its aggregates in `ov`:
     ov.total_students     → 333 (all examiners)
     ov.total_passers      → from DATA_UPCOMING
     ov.total_failers      → from DATA_UPCOMING
     ov.overall_pass_rate  → from DATA_UPCOMING
     ov.avg_gwa_passers    → from DATA_UPCOMING
     ov.avg_gwa_failers    → from DATA_UPCOMING
     ov.year_breakdown     → { 2022: {passers,failers,pass_rate,total}, ... }

   When a year filter is applied we read from ov.year_breakdown
   instead of filtering passByYear (which already comes from
   DATA_UPCOMING pass_rate_by_year). This keeps everything in the
   333-row universe.
═══════════════════════════════════════════════════════════════ */
function useInstitutionalKpi(ov, selectedYear, passByYear) {
  return useMemo(() => {
    // ── No year filter → use full DATA_UPCOMING aggregates from ov ──
    if (!selectedYear) {
      return {
        total_students:    ov?.total_students    ?? 0,
        total_passers:     ov?.total_passers     ?? 0,
        total_failers:     ov?.total_failers     ?? 0,
        overall_pass_rate: ov?.overall_pass_rate ?? 0,
        avg_gwa_passers:   ov?.avg_gwa_passers   ?? 0,
        avg_gwa_failers:   ov?.avg_gwa_failers   ?? 0,
      };
    }

    // ── Year filter → prefer ov.year_breakdown (DATA_UPCOMING per-year) ──
    const yb = ov?.year_breakdown?.[Number(selectedYear)];
    if (yb) {
      return {
        total_students:    yb.total     ?? 0,
        total_passers:     yb.passers   ?? 0,
        total_failers:     yb.failers   ?? 0,
        overall_pass_rate: yb.pass_rate ?? 0,
        // GWA per-year breakdown not stored; fall back to overall averages
        avg_gwa_passers:   ov?.avg_gwa_passers ?? 0,
        avg_gwa_failers:   ov?.avg_gwa_failers ?? 0,
      };
    }

    // ── Fallback: derive from passByYear (also from DATA_UPCOMING) ──
    const yr = (passByYear ?? []).find((d) => String(d.label) === String(selectedYear));
    if (yr) {
      const p = yr.passers ?? Math.round(((yr.pass_rate ?? 0) / 100) * (yr.total ?? 0));
      return {
        total_students:    yr.total     ?? 0,
        total_passers:     p,
        total_failers:     (yr.total ?? 0) - p,
        overall_pass_rate: yr.pass_rate ?? 0,
        avg_gwa_passers:   ov?.avg_gwa_passers ?? 0,
        avg_gwa_failers:   ov?.avg_gwa_failers ?? 0,
      };
    }

    // ── No match → full overview ──
    return {
      total_students:    ov?.total_students    ?? 0,
      total_passers:     ov?.total_passers     ?? 0,
      total_failers:     ov?.total_failers     ?? 0,
      overall_pass_rate: ov?.overall_pass_rate ?? 0,
      avg_gwa_passers:   ov?.avg_gwa_passers   ?? 0,
      avg_gwa_failers:   ov?.avg_gwa_failers   ?? 0,
    };
  }, [ov, selectedYear, passByYear]);
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ModelOverviewDashboard({
  dashFilters, setDashFilters, availableYears, availablePeriods, localInsights,
  ov, pieData: propPieData, passByYear, passByPeriod, subjectByYear,
  passByStrand, passByDur, reviewPieData: propReviewPieData,
  sectionScores, weakestQ,
  modelInfo, scatterData, dataSource, featureImp,
}) {
  const [mode, setMode] = useState("institutional");
  const [activePie, setActivePie] = useState(null);

  const selectedYear = dashFilters?.year || "";

  // ── DATA_UPCOMING KPIs (always from 333-row universe) ──────────────────────
  // useInstitutionalKpi reads from ov (populated by /analytics which loads
  // DATA_UPCOMING first) and ov.year_breakdown for per-year breakdown.
  const kpi = useInstitutionalKpi(ov, selectedYear, passByYear);

  // ── Rows shown in year-filtered charts ────────────────────────────────────
  // passByYear comes from /analytics pass_rate_by_year → DATA_UPCOMING 333 rows
  const displayRows = useMemo(() => {
    if (!selectedYear) return passByYear ?? [];
    const filtered = (passByYear ?? []).filter((d) => String(d.label) === String(selectedYear));
    return filtered.length ? filtered : (passByYear ?? []);
  }, [selectedYear, passByYear]);

  // ── Pie chart data — derived from DATA_UPCOMING KPIs ──────────────────────
  // Always build from kpi (DATA_UPCOMING) rather than propPieData which may
  // come from the smaller DATA_ALL dataset.
  const pieData = useMemo(() => {
    const p = kpi.total_passers;
    const f = kpi.total_failers;
    // Only fall back to propPieData if both counts are 0 (no data yet)
    if (p === 0 && f === 0 && propPieData?.length) return propPieData;
    return [
      { name: "Passers", value: p, color: IIEE.passGreen },
      { name: "Failers", value: f, color: IIEE.failRed },
    ];
  }, [kpi, propPieData]);

  // ── Stacked bar data — also from DATA_UPCOMING via passByYear ─────────────
  const stackData = useMemo(() =>
    displayRows.map((d) => {
      const p = d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0));
      return { label: d.label, Passers: p, Failers: (d.total ?? 0) - p };
    }),
  [displayRows]);

  const scatter = useMemo(() => scatterData ?? [], [scatterData]);

  const regTrend = useMemo(() => {
    if (!modelInfo) return [];
    return [
      { model: "Reg A", r2: (modelInfo.regression_a?.r2 ?? 0) * 100, label: "EE+MATH+ESAS+GWA" },
      { model: "Reg B", r2: (modelInfo.regression_b?.r2 ?? 0) * 100, label: "GWA+Survey" },
    ];
  }, [modelInfo]);

  const weakAreas = useMemo(() => (weakestQ ?? []).slice(0, 6), [weakestQ]);

  // ── Data source label for hero subtitle ───────────────────────────────────
  // Show upcoming_rows count (333) when available, else fall back to production
  const institutionalSourceLabel = useMemo(() => {
    if (ov?.upcoming_rows && ov.upcoming_rows > 0) {
      return `DATA_UPCOMING — ${ov.upcoming_rows} rows (Primary institutional analytics source)`;
    }
    return dataSource?.upcoming || dataSource?.production || "DATA_UPCOMING — 333 rows";
  }, [ov, dataSource]);

  // ── Whether DATA_UPCOMING loaded correctly (333 rows expected) ────────────
  const upcomingLoaded = (ov?.upcoming_rows ?? 0) >= 300 || (ov?.total_students ?? 0) >= 300;

  return (
    <div className="iiee-combined fade-in">
      <style>{styles}</style>

      {/* Hero */}
      <div className="comb-hero">
        <div className="comb-hero-badges">
          <span className="comb-badge gold">📊 Dashboard</span>
          <span className="comb-badge blue">🧭 SLSU REE Analytics</span>
        </div>
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
            ? institutionalSourceLabel + " — SLSU PRC 2022-2025."
            : `Model (Train: ${dataSource?.training || "DATA_MODEL"} | Test: ${dataSource?.evaluation || "DATA_EVALUATION"})`}
        </p>
      </div>

      <div className="comb-body">

        {/* Sticky filter */}
        <div className="comb-filter-strip">
          <FilterPanel
            filters={dashFilters}
            onChange={setDashFilters}
            availableYears={availableYears}
            availablePeriods={availablePeriods ?? []}
          />
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

        {localInsights?.length > 0 && (
          <div className="insight-banner"><InsightBox insights={localInsights} /></div>
        )}

        {/* ══ INSTITUTIONAL ══ */}
        <div style={{ display: mode === "institutional" ? "block" : "none" }}>

          <Divider
            label={`Key Performance Indicators — ${ov?.total_students ?? 333} Examiners (2022-2025)`}
            icon="📌"
          />

          {/* DATA_UPCOMING source tag */}
          <DsTag label={`DATA_UPCOMING — ${ov?.upcoming_rows ?? ov?.total_students ?? 333} rows, 2022-2025`} />

          {/* Warning only when DATA_UPCOMING genuinely failed to load */}
          {!upcomingLoaded && (
            <div style={{ marginBottom: 16, border: "1px solid rgba(245,197,24,0.3)", background: "rgba(245,197,24,0.08)", color: IIEE.white, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
              ⚠️ DATA_UPCOMING may not be fully loaded (expected ≥ 300 rows, got {ov?.total_students ?? 0}).
              Ensure <code>DATA_UPCOMING.csv</code> or <code>DATA_UPCOMING.xlsx</code> (333 rows, GWA + subject scores)
              is present in the backend directory. Currently showing available data.
            </div>
          )}

          <div className="metrics-grid" style={{ marginBottom: 28 }}>
            {/* All KPI values now sourced from useInstitutionalKpi → ov → DATA_UPCOMING */}
            <KPI
              label="Total Examiners"
              value={kpi.total_students || "—"}
              icon="👥"
              color={IIEE.blue}
              sub="DATA_UPCOMING — All exam sittings 2022-2025"
            />
            <KPI
              label="Total Passers"
              value={kpi.total_passers || "—"}
              icon="✅"
              color={IIEE.passGreen}
              sub="DATA_UPCOMING source"
            />
            <KPI
              label="Total Failers"
              value={kpi.total_failers || "—"}
              icon="❌"
              color={IIEE.failRed}
              sub="DATA_UPCOMING source"
            />
            <KPI
              label="Dataset Source"
              value={upcomingLoaded ? "333 ✓" : `${ov?.total_students ?? "—"}`}
              icon="🗂️"
              color={upcomingLoaded ? IIEE.passGreen : IIEE.amber}
              sub={upcomingLoaded
                ? "DATA_UPCOMING loaded (GWA + scores)"
                : "DATA_UPCOMING not fully loaded"}
            />
            <KPI
              label="Overall Pass Rate"
              value={pct(kpi.overall_pass_rate)}
              icon="📊"
              color={(kpi.overall_pass_rate ?? 0) >= 70 ? IIEE.passGreen : IIEE.amber}
              sub="PRC passing threshold = 70%"
            />
            <KPI
              label="Avg GWA Passers"
              value={num(kpi.avg_gwa_passers)}
              icon="🎓"
              color={IIEE.passGreen}
              sub="Lower = better (PH scale)"
            />
            <KPI
              label="Avg GWA Failers"
              value={num(kpi.avg_gwa_failers)}
              icon="📉"
              color={IIEE.failRed}
              sub="Lower = better (PH scale)"
            />
          </div>

          <Divider label="Distribution Analysis" icon="🥧" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card
              icon="🥧"
              title="Pass / Fail Distribution"
              sub={`All examiners — DATA_UPCOMING (${ov?.upcoming_rows ?? ov?.total_students ?? 333} rows)`}
              note={`Donut chart of overall pass/fail outcomes across ${kpi.total_students} examiners from DATA_UPCOMING.`}
              insight={`${pct(kpi.overall_pass_rate)} pass rate — ${(kpi.overall_pass_rate ?? 0) >= 70 ? "above" : "below"} the 70% PRC benchmark.`}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={88}
                    paddingAngle={3} dataKey="value"
                    onMouseEnter={(_, i) => setActivePie(i)}
                    onMouseLeave={() => setActivePie(null)}
                  >
                    {pieData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={e.color}
                        stroke={activePie === i ? IIEE.gold : "none"}
                        strokeWidth={activePie === i ? 3 : 0}
                        opacity={activePie === null || activePie === i ? 1 : 0.5}
                        style={{ transition: "all .3s" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<Tip />} />
                  <Legend
                    iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card
              icon="📅"
              title="Pass Rate by Year"
              sub="Annual PRC performance trend — DATA_UPCOMING"
              note="Each bar is a full calendar year sourced from DATA_UPCOMING (333 rows). 2024 peaked; 2025 declined."
              insight="2025 August sitting had only 4.5% pass rate — a major outlier requiring investigation."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={displayRows} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                    label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                  <Bar
                    dataKey="pass_rate" name="Pass Rate" radius={[6,6,0,0]}
                    activeBar={{ fill: IIEE.gold, filter: "drop-shadow(0 0 8px rgba(245,197,24,.6))" }}
                  >
                    {displayRows.map((e, i) => <Cell key={i} fill={barColor(e.pass_rate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card
              icon="📦"
              title="Pass / Fail Counts by Year"
              sub="Absolute cohort composition — DATA_UPCOMING (333 rows)"
              fullWidth
              note="Stacked bars show how many students passed vs failed per year. All counts from DATA_UPCOMING."
              insight="2022 had the largest cohort yet lowest pass rate — high volume, high risk."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stackData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend
                    iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>}
                  />
                  <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} />
                  <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* GWA Comparison */}
          <Divider label="GWA Analysis — DATA_UPCOMING" icon="🎓" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card
              icon="🎓"
              title="GWA: Passers vs Failers"
              sub="DATA_UPCOMING — lower is better (PH grading scale)"
              note="GWA gap between passers and failers from the 333-row DATA_UPCOMING dataset. Pearson r = −0.439 with Total Rating."
              insight="Every 0.1 improvement in GWA corresponds to roughly a 2-point increase in predicted board rating."
            >
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                {[
                  { label: "Passers Avg GWA", value: num(kpi.avg_gwa_passers), color: IIEE.passGreen },
                  { label: "Failers Avg GWA",  value: num(kpi.avg_gwa_failers),  color: IIEE.failRed },
                ].map((p, i) => (
                  <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: IIEE.dimText, marginBottom: 6 }}>{p.label}</div>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 32, fontWeight: 700, lineHeight: 1, color: p.color }}>{p.value}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={[
                    { name: "Passers", value: kpi.avg_gwa_passers },
                    { name: "Failers", value: kpi.avg_gwa_failers },
                  ]}
                  margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1.5, 2.5]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip fmt={(v) => v?.toFixed(3)} />} />
                  <Bar dataKey="value" name="Avg GWA" radius={[6,6,0,0]}>
                    <Cell fill={IIEE.passGreen} />
                    <Cell fill={IIEE.failRed} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* ══ MODEL DASHBOARD ══ */}
        <div style={{ display: mode === "model" ? "block" : "none" }}>

          <Divider label="Model Performance Summary" icon="🤖" />
          <SecCard
            num="1" icon="🤖"
            title="Random Forest Model Performance"
            subtitle="Trained on DATA_MODEL (123 rows). Evaluated on DATA_EVALUATION (36 rows, 2025 held-out)."
          >
            <DsTag label="Training: DATA_MODEL 123 rows | Test: DATA_EVALUATION 36 rows (2025)" />
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
                    { label: "Reg A — MAE", value: modelInfo.regression_a?.mae, color: IIEE.teal,   isScore: false, suffix: " pts" },
                    { label: "Reg A — R²",  value: modelInfo.regression_a?.r2,  color: IIEE.teal,   isScore: true },
                    { label: "Reg B — MAE", value: modelInfo.regression_b?.mae, color: IIEE.indigo, isScore: false, suffix: " pts" },
                    { label: "Reg B — R²",  value: modelInfo.regression_b?.r2,  color: IIEE.indigo, isScore: true },
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
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, color: IIEE.dimText, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>R² Comparison</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={regTrend} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                        <XAxis dataKey="model" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                        <Bar dataKey="r2" name="R² %" radius={[4,4,0,0]}>
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

          <SecCard
            num="2" icon="📌"
            title="Model Validation Highlights"
            subtitle="Key evaluation results from DATA_EVALUATION (held-out 2025)"
          >
            <div className="g2" style={{ marginBottom: 14 }}>
              {[
                { label: "Recall (PASS)",    value: modelInfo?.classification?.recall    ?? 0, suffix: "%", color: IIEE.passGreen, insight: "All actual PASS are identified" },
                { label: "Precision (PASS)", value: modelInfo?.classification?.precision ?? 0, suffix: "%", color: IIEE.blue,       insight: "Few false positives" },
                { label: "Reg A R²",         value: modelInfo?.regression_a?.r2          ?? 0, suffix: "",  color: IIEE.teal,       insight: "High reliability with subject scores" },
                { label: "Reg B R²",         value: modelInfo?.regression_b?.r2          ?? 0, suffix: "",  color: IIEE.indigo,     insight: "Lower power on survey-only data" },
              ].map((m, i) => (
                <Card key={i} inner icon="🔎" title={m.label} sub={m.insight} blueTint>
                  <div className="model-row" style={{ marginTop: 3 }}>
                    <span className="model-row-label">Value</span>
                    <span className="model-row-val" style={{ color: m.color }}>
                      {m.value != null ? (m.suffix === "%" ? pct(m.value * 100) : num(m.value, 3)) : "—"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ border: "1px solid rgba(245,197,24,0.25)", borderRadius: 10, padding: 10 }}>
                <strong>Prediction counts (DATA_EVALUATION)</strong>
                <p style={{ margin: "6px 0 0", color: IIEE.muted }}>Actual FAIL: {modelInfo?.fail_count ?? "—"}</p>
                <p style={{ margin: "2px 0 0", color: IIEE.muted }}>Actual PASS: {modelInfo?.pass_count ?? "—"}</p>
              </div>
              <div style={{ border: "1px solid rgba(245,197,24,0.25)", borderRadius: 10, padding: 10 }}>
                <strong>Production training</strong>
                <p style={{ margin: "6px 0 0", color: IIEE.muted }}>DATA_MODEL: {modelInfo?.dataset_size_model ?? "—"} rows</p>
                <p style={{ margin: "2px 0 0", color: IIEE.muted }}>DATA_EVALUATION: {modelInfo?.dataset_size_evaluation ?? "—"} rows</p>
                <p style={{ margin: "8px 0 0", color: IIEE.gold }}>DATA_ALL production retrain: {modelInfo?.dataset_size_all ?? "—"} rows</p>
              </div>
            </div>
            <div style={{ padding: "10px 14px", background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 10, fontSize: 12, color: IIEE.muted, lineHeight: 1.8 }}>
              <strong style={{ color: IIEE.gold }}>Note on data sources:</strong> Institutional dashboard (KPIs, pass rates, counts) uses
              DATA_UPCOMING (333 rows, GWA + subject scores). Model training uses DATA_MODEL (123 rows) + DATA_EVALUATION (36 rows).
              These are separate datasets — survey-based analyses use the 159-row MODEL+EVALUATION union only.
            </div>
          </SecCard>

          <SecCard
            num="3" icon="🎯"
            title="Predicted vs Actual Rating"
            subtitle="DATA_EVALUATION (36 rows, 2025) — completely held-out evaluation set"
          >
            <DsTag label="DATA_EVALUATION — 36 rows, 2025 held-out" />
            <PredictedActualSection scatterData={scatter} modelInfo={modelInfo} />
          </SecCard>

          <SecCard
            num="4" icon="🏫"
            title="Curriculum Gap Analysis & Recommendations"
            subtitle="Weakest survey indicators — where students feel least supported"
          >
            <DsTag label="DATA_MODEL + DATA_EVALUATION — survey responses, 159 rows" />
            <div className="g2">
              {weakAreas.length > 0 ? (
                <Card inner icon="⚠️" title="Weakest Survey Items" sub="Highest avg score = least agreement (most concern)" blueTint
                  note="Items with higher average scores indicate areas where students feel least agreement (scale: 1=Strongly Agree to 4=Strongly Disagree)."
                  insight="These items point to specific curriculum or support gaps that directly affect board readiness.">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}
                      margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                      <XAxis dataKey="key" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(2)} / 4`} />} />
                      <Bar dataKey="avg" name="Avg Score" fill={IIEE.failRed} radius={[4,4,0,0]}
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