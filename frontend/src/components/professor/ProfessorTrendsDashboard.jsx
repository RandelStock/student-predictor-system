import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API_BASE_URL from "../../apiBase";
import ResultCard from "../ResultCard";
import { MONTH_NAMES } from "./ProfessorShared";

/* ─── Design Tokens (matches ModelOverviewDashboard) ─────────── */
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

/* ─── Styles (unified with ModelOverviewDashboard) ───────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .iiee-trends * { box-sizing: border-box; }
  .iiee-trends {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* Hero */
  .tr-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .tr-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .tr-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .tr-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:700;
    letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .tr-badge.gold { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .tr-badge.blue { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .tr-badge.teal { background:rgba(45,212,191,0.1); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .tr-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .tr-hero-title .ag { color:${IIEE.gold}; }
  .tr-hero-title .ab { color:${IIEE.blue}; }
  .tr-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  /* Body */
  .tr-body { padding: clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  /* Sticky filter */
  .tr-filter-strip {
    position:sticky; top:0; z-index:20;
    background:rgba(11,20,55,0.95);
    border:1px solid ${IIEE.cardBorder}; border-radius:14px;
    padding:clamp(10px, 2vw, 14px) clamp(12px, 3vw, 18px); margin-bottom:clamp(12px, 3vw, 24px);
    backdrop-filter:blur(16px); box-shadow:0 8px 32px rgba(0,0,0,0.4);
    display:flex; align-items:center; gap:12px; flex-wrap:wrap;
  }
  .tr-filter-label { font-size:12px; color:${IIEE.dimText}; font-family:'Inter',sans-serif; }
  .tr-filter-select {
    background:rgba(11,20,55,0.95); border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; padding:6px 12px; color:${IIEE.white};
    font-size:clamp(11px, 1.5vw, 12px); cursor:pointer; font-family:'Inter',sans-serif;
    outline:none;
  }
  .tr-filter-select option {
    background:#0F1C4D;
    color:${IIEE.white};
  }
  .tr-filter-select option:hover,
  .tr-filter-select option:checked {
    background:#1a2a6c;
    color:${IIEE.gold};
  }
  .tr-filter-input {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; padding:6px 12px; color:${IIEE.white};
    font-size:clamp(11px, 1.5vw, 12px); font-family:'Inter',sans-serif; outline:none;
  }
  .tr-filter-btn {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; padding:6px 12px; color:${IIEE.dimText};
    font-size:12px; cursor:pointer; font-family:'Inter',sans-serif;
    transition:color .18s, border-color .18s;
  }
  .tr-filter-btn:hover { color:${IIEE.white}; border-color:rgba(255,255,255,0.25); }

  .tr-search-row {
    display:flex; gap:10px; flex-wrap:wrap; align-items:center; width:100%; margin-bottom:16px;
  }
  .tr-search-input {
    flex:1; min-width:200px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:10px 14px; color:${IIEE.white};
    font-size:clamp(11px, 1.5vw, 12px); font-family:'Inter',sans-serif; outline:none;
  }
  .tr-search-input::placeholder { color: rgba(248,250,252,0.55); }
  .tr-search-action {
    flex-shrink:0; display:flex; gap:8px; align-items:center;
  }
  .tr-search-btn {
    background:${IIEE.blue}; border:1px solid rgba(56,189,248,0.45);
    color:${IIEE.white}; border-radius:10px; padding:10px 16px;
    font-size:12px; cursor:pointer; font-family:'Inter',sans-serif; font-weight:700;
    transition:background .18s, transform .18s;
  }
  .tr-search-btn:hover { background:rgba(56,189,248,0.9); transform:translateY(-1px); }
  .tr-search-info { font-size:12px; color:${IIEE.dimText}; }

  .tr-side-panel-backdrop {
    position:fixed; inset:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(5px);
    z-index:90; display:flex; justify-content:flex-end; overflow:hidden;
  }
  .tr-side-panel {
    width:clamp(360px, 60vw, 1040px); max-width:100%; height:100vh;
    background:#0b1220; border-left:1px solid rgba(148,163,184,0.18);
    box-shadow:-12px 0 48px rgba(0,0,0,0.5); overflow-y:auto; padding:24px;
    display:flex; flex-direction:column;
  }
  .tr-side-panel-close {
    margin-left:auto; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12);
    border-radius:9px; padding:9px 14px; color:#cbd5e1; cursor:pointer;
    font-size:13px; font-family:'Inter',sans-serif;
  }
  .tr-side-panel-close:hover { background:rgba(255,255,255,0.08); }
  .tr-side-panel-header { display:flex; gap:16px; align-items:flex-start; margin-bottom:20px; }
  .tr-side-panel-title { margin:0; font-size:clamp(18px,2.4vw,24px); font-weight:700; color:${IIEE.white}; font-family:'Montserrat',sans-serif; }
  .tr-side-panel-subtitle { margin:4px 0 0; color:${IIEE.dimText}; font-size:13px; font-family:'Inter',sans-serif; }

  /* Divider */
  .tr-divider {
    display:flex; align-items:center; gap:10px;
    margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .tr-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .tr-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .tr-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px, 1.5vw, 12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold};
    white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* Section card */
  .tr-sec-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:18px; margin-bottom:clamp(14px, 3vw, 20px); overflow:hidden;
    transition:border-color .18s;
  }
  .tr-sec-card:hover { border-color:rgba(245,197,24,0.35); }
  .tr-sec-head {
    display:flex; align-items:flex-start; gap:clamp(10px, 2vw, 14px);
    padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px);
    border-bottom:1px solid rgba(245,197,24,0.1);
    background:linear-gradient(90deg,rgba(245,197,24,0.04) 0%,transparent 100%);
  }
  .tr-sec-icon {
    width:clamp(32px, 6vw, 40px); height:clamp(32px, 6vw, 40px); border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(16px, 3vw, 18px); background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
    flex-shrink:0;
  }
  .tr-sec-icon.blue { background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); }
  .tr-sec-icon.teal { background:rgba(45,212,191,0.08); border:1px solid rgba(45,212,191,0.25); }
  .tr-sec-icon.indigo { background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.25); }
  .tr-sec-icon.orange { background:rgba(251,146,60,0.1); border:1px solid rgba(251,146,60,0.25); }
  .tr-sec-num {
    font-family:'Montserrat',sans-serif; font-size:clamp(10px, 1.5vw, 11px); font-weight:700;
    color:${IIEE.gold}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px;
  }
  .tr-sec-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(16px, 3vw, 18px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 2px;
  }
  .tr-sec-subtitle { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .tr-sec-body { padding:clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px); }

  /* Metrics grid */
  .tr-metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px, 20vw, 155px),1fr));
    gap:clamp(10px, 2vw, 14px);
  }
  .tr-metric-card {
    background:${IIEE.cardBg}; border:1px solid ${IIEE.cardBorder};
    border-radius:14px; padding:clamp(14px, 3vw, 18px) clamp(12px, 2vw, 16px) clamp(10px, 2vw, 14px);
    position:relative; overflow:hidden;
    transition:transform .18s, border-color .18s, box-shadow .18s; cursor:default;
  }
  .tr-metric-card:hover {
    transform:translateY(-2px); border-color:${IIEE.gold};
    box-shadow:0 8px 28px rgba(245,197,24,0.12);
  }
  .tr-metric-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--ac,${IIEE.gold}); opacity:0.8;
  }
  .tr-metric-icon { font-size:clamp(16px, 3vw, 18px); margin-bottom:clamp(8px, 2vw, 10px); display:block; }
  .tr-metric-label {
    font-size:clamp(10px, 1.5vw, 12px); font-weight:600; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.muted}; margin-bottom:6px; font-family:'Montserrat',sans-serif;
  }
  .tr-metric-value {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(24px, 5vw, 34px); font-weight:700; line-height:1;
    color:var(--ac,${IIEE.gold});
  }
  .tr-metric-sub { font-size:clamp(10px, 1.5vw, 12px); color:${IIEE.dimText}; margin-top:4px; font-family:'Inter',sans-serif; }

  /* Chart card (inner) */
  .tr-chart-card {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:clamp(12px, 2vw, 16px);
    transition:border-color .18s;
  }
  .tr-chart-card:hover { border-color:rgba(245,197,24,0.28); }
  .tr-chart-head { display:flex; align-items:flex-start; gap:8px; margin-bottom:12px; }
  .tr-chart-icon {
    width:30px; height:30px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:14px;
    background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder};
  }
  .tr-chart-title {
    font-family:'Montserrat',sans-serif; font-size:clamp(13px, 2vw, 14px); font-weight:700;
    text-transform:uppercase; letter-spacing:0.05em; color:${IIEE.white}; margin:0 0 1px;
  }
  .tr-chart-sub { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.dimText}; margin:0; font-family:'Inter',sans-serif; }
  .tr-chart-note {
    margin-top:10px; padding:clamp(8px, 2vw, 12px);
    background:rgba(245,197,24,0.04); border-left:2px solid ${IIEE.goldBorder};
    border-radius:0 7px 7px 0; font-size:clamp(10px, 1.5vw, 11.5px); color:${IIEE.muted}; line-height:1.6;
    font-family:'Inter',sans-serif;
  }

  /* AI insight box */
  .tr-ai-box {
    background:linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(129,140,248,0.06) 100%);
    border:1px solid rgba(56,189,248,0.25); border-radius:12px;
    padding:clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px); margin-top:12px; position:relative; overflow:hidden;
  }
  .tr-ai-box::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg, ${IIEE.blue}, ${IIEE.indigo});
  }
  .tr-ai-header {
    font-size:clamp(10px, 1.5vw, 11px); font-weight:700; letter-spacing:0.12em;
    text-transform:uppercase; color:${IIEE.blue}; margin-bottom:8px; font-family:'Montserrat',sans-serif;
    display:flex; align-items:center; gap:6px;
  }
  .tr-ai-text {
    font-size:clamp(12px, 1.5vw, 13px); color:${IIEE.white}; line-height:1.7; font-family:'Inter',sans-serif;
  }

  /* Stat table */
  .tr-table { width:100%; border-collapse:collapse; }
  .tr-table th {
    font-size:clamp(10px, 1.5vw, 11px); font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    color:${IIEE.dimText}; padding:clamp(6px, 1.5vw, 8px) clamp(8px, 1.5vw, 10px);
    border-bottom:1px solid rgba(245,197,24,0.12); text-align:left; font-family:'Montserrat',sans-serif;
  }
  .tr-table td {
    padding:clamp(8px, 1.5vw, 10px); border-bottom:1px solid rgba(255,255,255,0.04);
    font-size:clamp(12px, 1.5vw, 13px); font-family:'Inter',sans-serif;
  }
  .tr-table tr:last-child td { border-bottom:none; }
  .tr-table tr:hover td { background:rgba(245,197,24,0.03); }

  /* Year stat pills (AI trend insights) */
  .tr-year-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(130px, 18vw, 160px),1fr));
    gap:clamp(8px, 2vw, 10px); margin-bottom:16px;
  }
  .tr-year-pill {
    background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.2);
    border-radius:12px; padding:clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
    transition:border-color .18s, transform .18s;
  }
  .tr-year-pill:hover { border-color:${IIEE.blue}; transform:translateY(-2px); }
  .tr-year-pill-label {
    font-family:'Montserrat',sans-serif; font-size:10px; font-weight:700;
    text-transform:uppercase; color:${IIEE.dimText}; margin-bottom:6px;
  }
  .tr-year-pill-rate {
    font-family:'Montserrat',sans-serif; font-size:clamp(20px, 4vw, 26px); font-weight:700; line-height:1;
  }
  .tr-year-pill-sub { font-size:11px; color:${IIEE.dimText}; margin-top:3px; font-family:'Inter',sans-serif; }

  /* Review split cards */
  .tr-review-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:12px; margin-bottom:14px;
  }
  .tr-review-item {
    background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
    border-radius:12px; padding:16px;
    transition:border-color .18s, transform .18s;
  }
  .tr-review-item:hover { border-color:rgba(245,197,24,0.2); transform:translateY(-2px); }

  /* Pagination */
  .tr-page-btn {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; padding:6px 14px; font-size:12px; cursor:pointer;
    font-family:'Inter',sans-serif; transition:color .18s, border-color .18s;
  }
  .tr-page-btn:disabled { color:#334155; cursor:not-allowed; }
  .tr-page-btn:not(:disabled) { color:#94a3b8; }
  .tr-page-btn:not(:disabled):hover { color:${IIEE.white}; border-color:rgba(255,255,255,0.25); }

  /* Download button */
  .tr-dl-btn {
    background:rgba(245,197,24,0.08); border:1px solid ${IIEE.goldBorder};
    border-radius:10px; padding:8px 16px; color:${IIEE.gold};
    font-size:clamp(11px, 1.5vw, 12px); cursor:pointer; font-family:'Inter',sans-serif;
    font-weight:600; transition:background .18s, box-shadow .18s;
  }
  .tr-dl-btn:hover { background:rgba(245,197,24,0.15); box-shadow:0 4px 16px rgba(245,197,24,0.12); }
  .tr-dl-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* Result badge */
  .tr-badge-pass {
    font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px;
    background:rgba(34,197,94,0.1); color:${IIEE.passGreen};
    border:1px solid rgba(34,197,94,0.3);
  }
  .tr-badge-fail {
    font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px;
    background:rgba(239,68,68,0.1); color:${IIEE.failRed};
    border:1px solid rgba(239,68,68,0.3);
  }

  /* Loading spinner */
  @keyframes tr-spin { to { transform:rotate(360deg); } }
  .tr-spinner {
    width:14px; height:14px; border-radius:50%;
    border:2px solid rgba(56,189,248,0.2); border-top-color:${IIEE.blue};
    animation:tr-spin 0.8s linear infinite;
  }

  /* AI loading dots */
  .tr-ai-dot { width:6px; height:6px; border-radius:50%; background:${IIEE.blue}; display:inline-block; }
  @keyframes tr-pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
  .tr-ai-dot:nth-child(1) { animation:tr-pulse 1.2s infinite; }
  .tr-ai-dot:nth-child(2) { animation:tr-pulse 1.2s infinite .2s; }
  .tr-ai-dot:nth-child(3) { animation:tr-pulse 1.2s infinite .4s; }

  .tr-g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }
  .tr-fw { grid-column:1/-1; }

  .tr-fade-in { animation:trFadeIn .45s ease both; }
  @keyframes trFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width:960px) { .tr-g2 { grid-template-columns:1fr; } .tr-fw { grid-column:1; } .tr-body { padding:12px; } }
  @media (max-width:768px) { .tr-body { padding:10px; } .tr-metrics-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:640px) { .tr-hero { padding:14px 12px 10px; } .tr-sec-body { padding:10px 12px; } .tr-body { padding:8px; } }
  @media (max-width:540px) { .tr-metrics-grid { grid-template-columns:1fr; } .tr-body { padding:6px; } }
`;

/* ─── Sub-components ─────────────────────────────────────────── */

function Divider({ label, icon }) {
  return (
    <div className="tr-divider">
      <div className="tr-divider-line" />
      <div className="tr-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="tr-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="tr-metric-card" style={{ "--ac": color }}>
      <span className="tr-metric-icon">{icon}</span>
      <div className="tr-metric-label">{label}</div>
      <div className="tr-metric-value">{value ?? "—"}</div>
      {sub && <div className="tr-metric-sub">{sub}</div>}
    </div>
  );
}

function SecCard({ num: number, icon, iconVariant, title, subtitle, children }) {
  return (
    <div className="tr-sec-card">
      <div className="tr-sec-head">
        <div className={`tr-sec-icon${iconVariant ? ` ${iconVariant}` : ""}`}>{icon}</div>
        <div style={{ flex: 1 }}>
          {number && <div className="tr-sec-num">Section {number}</div>}
          <h3 className="tr-sec-title">{title}</h3>
          {subtitle && <p className="tr-sec-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="tr-sec-body">{children}</div>
    </div>
  );
}

function ChartCard({ icon, title, sub, children, note }) {
  return (
    <div className="tr-chart-card">
      <div className="tr-chart-head">
        <div className="tr-chart-icon">{icon}</div>
        <div>
          <div className="tr-chart-title">{title}</div>
          {sub && <div className="tr-chart-sub">{sub}</div>}
        </div>
      </div>
      {children}
      {note && <div className="tr-chart-note">{note}</div>}
    </div>
  );
}

function AttemptDetailModal({ open, onClose, attempt, loading, error }) {
  if (!open) return null;

  return (
    <div className="tr-side-panel-backdrop" onClick={onClose}>
      <div className="tr-side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tr-side-panel-header">
          <div>
            <p className="tr-side-panel-title">Recent Attempt Details</p>
            <p className="tr-side-panel-subtitle">
              {attempt?.name ?? "Unknown"} · {attempt?.attempt_id ? attempt.attempt_id.slice(0, 8) : "—"}
            </p>
          </div>
          <button className="tr-side-panel-close" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#cbd5e1", fontSize: "clamp(12px, 1.3vw, 13px)", fontFamily: "'Inter',sans-serif" }}>
            Loading attempt details…
          </p>
        ) : error ? (
          <p style={{ color: "#fca5a5", fontSize: "clamp(12px, 1.3vw, 13px)", fontFamily: "'Inter',sans-serif" }}>
            {error}
          </p>
        ) : attempt ? (
          <ResultCard result={attempt} />
        ) : (
          <p style={{ color: "#cbd5e1", fontSize: "clamp(12px, 1.3vw, 13px)", fontFamily: "'Inter',sans-serif" }}>
            No attempt selected.
          </p>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function ProfessorTrendsDashboard({
  usageLoading,
  usageSummary,
  downloadPerformanceReport,
  reportLoading,
  insightsLoading,
  trendInsights,
  fetchTrendInsights,
  yearlyPF,
  reviewAnalysis,
  timingAnalysis,
  openTimingModal,
  selectedYear,
  setSelectedYear,
  monthly,
  attFilter,
  setAttFilter,
  setAttPage,
  attempts,
  attPage,
}) {
  const [attemptDetailOpen, setAttemptDetailOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetailLoading, setAttemptDetailLoading] = useState(false);
  const [attemptDetailError, setAttemptDetailError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttempts = useMemo(() => {
    if (!attempts?.items?.length) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return attempts.items;
    return attempts.items.filter((item) => {
      const name = (item.full_name || item.name || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const label = (item.label || "").toLowerCase();
      const id = (item.attempt_id || item.id || "").toLowerCase();
      return name.includes(query) || email.includes(query) || label.includes(query) || id.includes(query);
    });
  }, [attempts?.items, searchQuery]);

  const openAttemptDetail = async (item) => {
    setAttemptDetailOpen(true);
    setSelectedAttempt(null);
    setAttemptDetailError("");

    const attemptId = item?.attempt_id || item?.id;
    if (!attemptId) {
      setAttemptDetailError("Attempt identifier is missing.");
      return;
    }

    const hasAnswers = item?.answers && Object.keys(item.answers).length > 0;
    if (hasAnswers) {
      setSelectedAttempt(item);
      return;
    }

    setAttemptDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/attempts/${encodeURIComponent(attemptId)}`);
      if (!res.ok) throw new Error("Could not load attempt details.");
      const data = await res.json();
      setSelectedAttempt(data);
    } catch (e) {
      console.error(e);
      setAttemptDetailError("Could not fetch attempt detail.");
    } finally {
      setAttemptDetailLoading(false);
    }
  };

  const closeAttemptDetail = () => {
    setAttemptDetailOpen(false);
    setSelectedAttempt(null);
    setAttemptDetailError("");
    setAttemptDetailLoading(false);
  };

  return (
    <div className="iiee-trends tr-fade-in">
      <style>{styles}</style>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="tr-hero">
        <div className="tr-hero-badges">
          <span className="tr-badge gold">📈 Trends</span>
          <span className="tr-badge blue">🧭 SLSU REE Analytics</span>
          <span className="tr-badge teal">⚡ Live DB</span>
        </div>
        <h2 className="tr-hero-title">
          PRC Trends &amp; <span className="ag">Monitoring</span>
        </h2>
        <p className="tr-hero-sub">Live data from the prediction database — student attempts, monthly summaries, and AI trend insights.</p>
      </div>

      <div className="tr-body">

        {/* ── Sticky filter ───────────────────────────────── */}
        <div className="tr-filter-strip">
          <span className="tr-filter-label">Year:</span>
          <select
            className="tr-filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <span style={{ marginLeft: "auto", fontSize: 12, color: IIEE.dimText }}>
            {attempts ? `${attempts.total} total attempts` : ""}
          </span>
        </div>

        {/* ══ SECTION 1: System Usage ══════════════════════ */}
        <Divider label="System Usage & User Activity" icon="📊" />
        <SecCard num="1" icon="📊" iconVariant="blue" title="System Usage & User Activity"
          subtitle="Active student users and prediction volume — last 30 days">
          {usageLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="tr-spinner" />
              <span style={{ fontSize: 12, color: IIEE.dimText }}>Loading system usage…</span>
            </div>
          ) : usageSummary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="tr-dl-btn" onClick={downloadPerformanceReport} disabled={reportLoading}>
                  {reportLoading ? "Preparing…" : "⬇ Download Performance Report"}
                </button>
              </div>

              <div className="tr-metrics-grid">
                <KPI label="Total Predictions" value={usageSummary.total_predictions} color={IIEE.blue} icon="🔮" />
                <KPI label="Active Users" value={usageSummary.active_users} color={IIEE.passGreen} icon="👥" sub="distinct student users" />
              </div>

              {(usageSummary.predictions_by_day ?? []).length > 0 && (
                <ChartCard icon="📅" title="Predictions by Day" sub="Last 10 days of activity"
                  note="Daily prediction volume reveals system load trends — peaks correlate with deadline and review cycles.">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={(usageSummary.predictions_by_day ?? []).slice(-10).map((d) => ({
                        day: d.day ? d.day.slice(5) : "—",
                        total: d.total ?? 0,
                      }))}
                      margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Bar dataKey="total" name="Predictions" fill={IIEE.blue} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {(usageSummary.active_users_recent ?? []).length > 0 && (
                <ChartCard icon="🏆" title="Most Active Students"
                  note="Top contributors by prediction attempt count.">
                  <table className="tr-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Attempts</th>
                        <th>Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(usageSummary.active_users_recent ?? []).map((u, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{u.name || u.user_id || "—"}</td>
                          <td style={{ color: IIEE.blue, fontWeight: 700 }}>{u.attempts ?? 0}</td>
                          <td style={{ color: IIEE.dimText }}>
                            {u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ChartCard>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: IIEE.dimText }}>No usage data yet.</p>
          )}
        </SecCard>

        {/* ══ SECTION 2: AI Trend Insights ═════════════════ */}
        <Divider label="AI Trend Insights" icon="✨" />
        <SecCard num="2" icon="✨" iconVariant="blue" title="AI Trend Insights"
          subtitle="Groq AI summary of year-over-year prediction trends">
          {insightsLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="tr-spinner" />
              <span style={{ fontSize: 12, color: IIEE.dimText }}>Generating AI summary…</span>
            </div>
          ) : trendInsights ? (
            <div>
              {(trendInsights.stats?.years ?? []).length > 0 && (
                <div className="tr-year-grid">
                  {(trendInsights.stats.years ?? []).map((yr, i) => (
                    <div key={i} className="tr-year-pill">
                      <div className="tr-year-pill-label">{yr.year}</div>
                      <div className="tr-year-pill-rate" style={{ color: yr.pass_rate >= 70 ? IIEE.passGreen : IIEE.amber }}>
                        {yr.pass_rate.toFixed(1)}%
                      </div>
                      <div className="tr-year-pill-sub">{yr.total} attempts · avg {yr.avg_rating?.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="tr-ai-box">
                <div className="tr-ai-header">✦ AI Summary</div>
                <div className="tr-ai-text">{trendInsights.summary}</div>
              </div>
              <button
                onClick={fetchTrendInsights}
                style={{
                  marginTop: 12, background: "transparent",
                  border: `1px solid rgba(56,189,248,0.2)`, borderRadius: 8,
                  padding: "6px 14px", color: IIEE.blue, fontSize: 12, cursor: "pointer",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                ↻ Refresh Insights
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: IIEE.dimText }}>
              No trend data yet. Submit more predictions to generate insights.
            </p>
          )}
        </SecCard>

        {/* ══ SECTION 3: Pass/Fail by Year ═════════════════ */}
        {(yearlyPF ?? []).length > 0 && (
          <>
            <Divider label="Pass / Fail by Year" icon="📊" />
            <SecCard num="3" icon="📊" title="Pass / Fail by Year (Live DB)"
              subtitle="From prediction_attempts table — real student submissions">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={(yearlyPF ?? []).map((yr) => {
                    const total = yr.pass_count + yr.fail_count;
                    return {
                      year: String(yr.year),
                      Passers: yr.pass_count,
                      Failers: yr.fail_count,
                      passRate: total ? (yr.pass_count / total) * 100 : 0,
                    };
                  })}
                  margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        wrapperStyle={{ outline: "none" }}
                      />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(245,197,24,.04)", borderLeft: `2px solid ${IIEE.goldBorder}`, borderRadius: "0 7px 7px 0", fontSize: 11.5, color: IIEE.muted, lineHeight: 1.6 }}>
                Stacked pass/fail bars serve as an early warning for cohort performance shifts — compare reliability across years.
              </div>
            </SecCard>
          </>
        )}

        {/* ══ SECTION 4: Formal Review Split ═══════════════ */}
        {(reviewAnalysis?.items ?? []).length > 0 && (
          <>
            <Divider label="Formal Review Split Analysis" icon="📚" />
            <SecCard num="4" icon="📚" iconVariant="teal" title="Formal Review Split Analysis"
              subtitle="Pass rate separated by Attended Formal Review = Yes / No">
              <div className="tr-review-grid">
                {(reviewAnalysis.items ?? []).map((item, idx) => (
                  <div key={idx} className="tr-review-item">
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: item.review_program === "Yes" ? IIEE.passGreen : IIEE.amber, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>
                      {item.review_program === "Yes" ? "✅ Attended Review" : "⚠️ No Formal Review"}
                    </p>
                    <p style={{ margin: "0 0 2px", fontSize: 30, color: "#f1f5f9", fontWeight: 800, lineHeight: 1, fontFamily: "'Montserrat',sans-serif" }}>
                      {item.pass_rate?.toFixed(1)}%
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: IIEE.muted, fontFamily: "'Inter',sans-serif" }}>
                      {item.pass_count}/{item.total} predicted pass
                      {item.human_like_rate != null ? ` · Human-like timing: ${item.human_like_rate.toFixed(1)}%` : ""}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", background: "rgba(45,212,191,.04)", borderLeft: "2px solid rgba(45,212,191,0.3)", borderRadius: "0 7px 7px 0", fontSize: 11.5, color: IIEE.muted, lineHeight: 1.6 }}>
                Compare pass rate with/without formal review to assess coaching program ROI and focus interventions.
              </div>
            </SecCard>
          </>
        )}

        {/* ══ SECTION 5: Timer Analysis ════════════════════ */}
        {timingAnalysis?.summary && (
          <>
            <Divider label="Predictor Timer Analysis" icon="⏱️" />
            <SecCard num="5" icon="⏱️" iconVariant="orange" title="Predictor Timer Analysis"
              subtitle="Response timing captured from Predictor Form — integrity monitoring">
              <div className="tr-metrics-grid" style={{ marginBottom: 20 }}>
                <KPI label="Timed Questions" value={timingAnalysis.summary.timed_questions ?? 0} color={IIEE.blue} icon="⏱️" />
                <KPI label="Human-like" value={timingAnalysis.summary.human_like_rate != null ? `${timingAnalysis.summary.human_like_rate.toFixed(1)}%` : "—"} color={IIEE.passGreen} icon="🧑" sub={`${timingAnalysis.summary.human_like_count ?? 0} answers`} />
                <KPI label="Too Fast" value={timingAnalysis.summary.too_fast_rate != null ? `${timingAnalysis.summary.too_fast_rate.toFixed(1)}%` : "—"} color={IIEE.amber} icon="⚡" sub={`${timingAnalysis.summary.too_fast_count ?? 0} answers`} />
                <KPI label="Too Slow" value={timingAnalysis.summary.too_slow_rate != null ? `${timingAnalysis.summary.too_slow_rate.toFixed(1)}%` : "—"} color={IIEE.orange} icon="🐢" sub={`${timingAnalysis.summary.too_slow_count ?? 0} answers`} />
              </div>

              <div className="tr-g2">
                {(timingAnalysis.sections ?? []).length > 0 && (
                  <ChartCard icon="📋" title="Timer by Section"
                    note="Sections with low human-like rates may indicate guessing behavior.">
                    <table className="tr-table">
                      <thead>
                        <tr>
                          <th>Section</th>
                          <th>Timed Qs</th>
                          <th>Avg Sec</th>
                          <th>Human-like</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(timingAnalysis.sections ?? []).map((s, i) => (
                          <tr key={i}>
                            <td style={{ color: IIEE.white }}>{s.section}</td>
                            <td style={{ color: IIEE.muted }}>{s.timed_questions ?? 0}</td>
                            <td style={{ color: IIEE.muted }}>{s.avg_duration_sec != null ? s.avg_duration_sec.toFixed(1) : "—"}</td>
                            <td style={{ color: (s.human_like_rate ?? 0) >= 70 ? IIEE.passGreen : IIEE.amber, fontWeight: 700 }}>
                              {s.human_like_rate != null ? `${s.human_like_rate.toFixed(1)}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ChartCard>
                )}

                {(timingAnalysis.suspicious_attempts ?? []).length > 0 && (
                  <ChartCard icon="⚠️" title="Suspicious / Too-Fast Attempts"
                    note="Click any row to inspect per-question timing detail.">
                    <table className="tr-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Date</th>
                          <th>Too Fast</th>
                          <th>Qs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(timingAnalysis.suspicious_attempts ?? []).map((a, i) => (
                          <tr key={i} style={{ cursor: "pointer" }} onClick={() => openTimingModal(a)}>
                            <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{a.name || "Unknown"}</td>
                            <td style={{ color: IIEE.dimText, fontSize: 11 }}>
                              {a.created_at ? new Date(a.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                            </td>
                            <td style={{ color: IIEE.failRed, fontWeight: 700 }}>{a.too_fast_rate?.toFixed(1)}%</td>
                            <td style={{ color: IIEE.muted }}>{a.timed_questions ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ChartCard>
                )}
              </div>

              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(251,146,60,.04)", borderLeft: "2px solid rgba(251,146,60,0.3)", borderRadius: "0 7px 7px 0", fontSize: 11.5, color: IIEE.muted, lineHeight: 1.6 }}>
                Timing analysis highlights potential integrity risks (too-fast behavior) and guides adaptive exam pacing decisions.
              </div>
            </SecCard>
          </>
        )}

        {/* ══ SECTION 6: Monthly Summary ═══════════════════ */}
        <Divider label="Monthly Summary" icon="📆" />
        <SecCard num="6" icon="📆" iconVariant="teal" title="Monthly Summary"
          subtitle={`Pass/fail counts per month — ${selectedYear}`}>
          {(monthly ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(monthly ?? []).map((m) => {
                  const total = m.total || 1;
                  return {
                    month: MONTH_NAMES[m.month - 1],
                    Passers: m.pass_count,
                    Failers: m.fail_count,
                    passRate: (m.pass_count / total) * 100,
                  };
                })}
                margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        wrapperStyle={{ outline: "none" }}
                      />
                <Legend iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: IIEE.dimText }}>No data for {selectedYear}.</p>
              <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Students need to submit predictions first.</p>
            </div>
          )}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(45,212,191,.04)", borderLeft: "2px solid rgba(45,212,191,0.3)", borderRadius: "0 7px 7px 0", fontSize: 11.5, color: IIEE.muted, lineHeight: 1.6 }}>
            Monthly pass/fail bars reveal seasonality and allow quick comparison of passage rate across high/low months.
          </div>
        </SecCard>

        {/* ══ SECTION 7: Recent Prediction Attempts ════════ */}
        <Divider label="Recent Prediction Attempts" icon="🗃️" />
        <SecCard num="7" icon="🗃️" iconVariant="indigo" title="Recent Prediction Attempts"
          subtitle="Paginated log from prediction_attempts table">
          {/* Filter row */}
          <div className="tr-search-row">
            <input
              className="tr-search-input"
              type="search"
              placeholder="Search student, email, attempt ID, or result"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="tr-search-action">
              <button
                className="tr-search-btn"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                Clear search
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <span className="tr-filter-label">Year:</span>
            <input
              className="tr-filter-input"
              type="number"
              placeholder="e.g. 2025"
              value={attFilter.year}
              onChange={(e) => { setAttFilter((f) => ({ ...f, year: e.target.value })); setAttPage(1); }}
              style={{ width: 90 }}
            />
            <span className="tr-filter-label">Formal Review:</span>
            <select
              className="tr-filter-select"
              value={attFilter.review_program}
              onChange={(e) => { setAttFilter((f) => ({ ...f, review_program: e.target.value })); setAttPage(1); }}
            >
              <option value="">All</option>
              <option value="Yes">✅ Attended</option>
              <option value="No">⚠️ No Review</option>
            </select>
            <span className="tr-filter-label">Duration:</span>
            <select
              className="tr-filter-select"
              value={attFilter.review_duration}
              onChange={(e) => { setAttFilter((f) => ({ ...f, review_duration: e.target.value })); setAttPage(1); }}
            >
              <option value="">All</option>
              <option value="0">No Review</option>
              <option value="1">~3 Months</option>
              <option value="2">~6 Months</option>
            </select>
            <span className="tr-filter-label">Show:</span>
            <select
              className="tr-filter-select"
              value={attFilter.pageSize}
              onChange={(e) => { setAttFilter((f) => ({ ...f, pageSize: Number(e.target.value) })); setAttPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </select>
            <button
              className="tr-filter-btn"
              onClick={() => { setAttFilter({ year: "", review_program: "", review_duration: "", pageSize: 25 }); setSearchQuery(""); setAttPage(1); }}
            >
              Clear
            </button>
            {attempts && (
              <span style={{ fontSize: 12, color: IIEE.dimText, marginLeft: "auto" }}>
                {attempts.total} total · Page {attPage}
              </span>
            )}
          </div>

          {attempts && filteredAttempts.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                {searchQuery ? (
                  <span className="tr-search-info">
                    Showing {filteredAttempts.length} of {attempts.items.length} results for “{searchQuery}”.
                  </span>
                ) : (
                  <span className="tr-search-info">
                    Showing {filteredAttempts.length} attempt{filteredAttempts.length === 1 ? "" : "s"} on this page.
                  </span>
                )}
                {searchQuery && (
                  <button
                    className="tr-filter-btn"
                    onClick={() => setSearchQuery("")}
                    type="button"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="tr-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Result</th>
                      <th>Pass Prob.</th>
                      <th>Pred. Rating A</th>
                      <th>Student</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((item, i) => (
                      <tr
                        key={i}
                        style={{ cursor: "pointer" }}
                        onClick={() => openAttemptDetail(item)}
                      >
                        <td style={{ color: IIEE.dimText, fontSize: 11 }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString("en-PH", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          }) : "—"}
                        </td>
                        <td>
                          <span className={item.label === "PASSED" ? "tr-badge-pass" : "tr-badge-fail"}>
                            {item.label}
                          </span>
                        </td>
                        <td style={{
                          fontWeight: 700,
                          color: item.probability_pass >= 0.7 ? IIEE.passGreen
                            : item.probability_pass >= 0.5 ? IIEE.amber : IIEE.failRed,
                        }}>
                          {typeof item.probability_pass === "number" ? `${(item.probability_pass * 100).toFixed(1)}%` : "—"}
                        </td>
                        <td style={{
                          color: item.predicted_rating_a >= 70 ? IIEE.passGreen
                            : item.predicted_rating_a >= 60 ? IIEE.amber : IIEE.failRed,
                        }}>
                          {item.predicted_rating_a != null ? item.predicted_rating_a.toFixed(1) : "—"}
                        </td>
                        <td style={{ fontWeight: 700, color: "#e2e8f0" }}>
                          {item.full_name || item.name || "—"}
                        </td>
                        <td style={{ color: IIEE.muted, fontSize: 11 }}>
                          {item.email || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "flex-end" }}>
                <button
                  className="tr-page-btn"
                  onClick={() => setAttPage((p) => Math.max(1, p - 1))}
                  disabled={attPage === 1}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 12, color: IIEE.dimText }}>
                  {attPage} / {Math.ceil((attempts.total || 1) / (attFilter.pageSize || 25))}
                </span>
                <button
                  className="tr-page-btn"
                  onClick={() => setAttPage((p) => p + 1)}
                  disabled={attPage >= Math.ceil((attempts.total || 1) / (attFilter.pageSize || 25))}
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: IIEE.dimText }}>
                {searchQuery ? `No attempts match “${searchQuery}”.` : "No prediction attempts found."}
              </p>
              <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
                {searchQuery ? "Try a different search term or clear filters." : "Students need to log in and submit predictions first."}
              </p>
            </div>
          )}

          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(129,140,248,.04)", borderLeft: "2px solid rgba(129,140,248,0.3)", borderRadius: "0 7px 7px 0", fontSize: 11.5, color: IIEE.muted, lineHeight: 1.6 }}>
            Recent attempts reveal user behavior and probability accuracy name/email shown for identification.
          </div>
        </SecCard>

        <AttemptDetailModal
          open={attemptDetailOpen}
          onClose={closeAttemptDetail}
          attempt={selectedAttempt}
          loading={attemptDetailLoading}
          error={attemptDetailError}
        />

      </div>
    </div>
  );
}