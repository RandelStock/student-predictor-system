import { useState, useEffect } from "react";
import PredictorForm from "./PredictorForm";
import ResultCard from "./ResultCard";
import { apiStudentAttempts } from "../api-service";

// ─── Design Tokens (mirrors ModelOverviewDashboard) ───────────────────────────
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

// ─── Global Styles ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .sp-root {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1.2vw, 14px);
    line-height: 1.6;
  }

  /* ── Nav ── */
  .sp-nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(11,20,55,0.96);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: 0 clamp(14px, 4vw, 32px);
    display: flex; align-items: center; justify-content: space-between;
    height: clamp(58px, 8vw, 72px);
    gap: 12px;
  }
  .sp-nav-brand {
    display: flex; align-items: center; gap: clamp(8px, 2vw, 12px);
    min-width: 0;
  }
  .sp-nav-logos {
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }
  .sp-nav-logos img {
    width: clamp(22px, 3.5vw, 30px);
    height: clamp(22px, 3.5vw, 30px);
    object-fit: contain; opacity: 0.95;
  }
  .sp-nav-divider {
    width: 1px; height: 32px;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  .sp-nav-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(12px, 2vw, 15px); font-weight: 800;
    color: ${IIEE.white}; letter-spacing: 0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sp-nav-subtitle {
    font-size: clamp(9px, 1.2vw, 10px); color: ${IIEE.muted};
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'DM Sans', sans-serif;
  }
  .sp-nav-actions {
    display: flex; align-items: center; gap: clamp(6px, 1.5vw, 10px);
    flex-shrink: 0;
  }
  .sp-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 4px; padding: 3px 10px;
    font-size: clamp(9px, 1.2vw, 11px); font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
  }
  .sp-badge.gold {
    background: ${IIEE.goldGlow}; border: 1px solid ${IIEE.goldBorder}; color: ${IIEE.gold};
  }
  .sp-badge.blue {
    background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); color: ${IIEE.blue};
  }
  .sp-btn {
    border-radius: 8px; padding: clamp(6px, 1.2vw, 8px) clamp(10px, 2vw, 16px);
    font-size: clamp(10px, 1.3vw, 12px); font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.18s; border: 1px solid transparent;
    white-space: nowrap;
  }
  .sp-btn.ghost {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.09);
    color: ${IIEE.muted};
  }
  .sp-btn.ghost:hover { color: ${IIEE.white}; border-color: rgba(255,255,255,0.2); }
  .sp-btn.danger:hover { color: #f87171; border-color: rgba(248,113,113,0.3); }
  .sp-btn.primary {
    background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2));
    border-color: rgba(14,165,233,0.35);
    color: ${IIEE.blue};
  }
  .sp-btn.primary:hover {
    background: linear-gradient(135deg, rgba(14,165,233,0.32), rgba(99,102,241,0.32));
    box-shadow: 0 4px 16px rgba(14,165,233,0.2);
  }
  .sp-btn.cta {
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: #fff; border: none;
    box-shadow: 0 6px 20px rgba(14,165,233,0.3);
    padding: clamp(10px, 2vw, 13px) clamp(20px, 4vw, 30px);
    font-size: clamp(11px, 1.5vw, 13px);
  }
  .sp-btn.cta:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(14,165,233,0.4); }
  .sp-btn.outline-blue {
    background: rgba(56,189,248,0.06); border-color: rgba(56,189,248,0.28); color: ${IIEE.blue};
  }
  .sp-btn.outline-blue:hover { background: rgba(56,189,248,0.14); box-shadow: 0 4px 14px rgba(56,189,248,0.15); }

  /* ── Body ── */
  .sp-body {
    max-width: 900px; margin: 0 auto;
    padding: clamp(20px, 4vw, 40px) clamp(12px, 4vw, 24px) 80px;
  }

  /* ── Hero divider (same pattern) ── */
  .sp-divider {
    display: flex; align-items: center; gap: 10px;
    margin: clamp(18px, 3vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .sp-divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .sp-divider-line.rev {
    background: linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .sp-divider-label {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(10px, 1.3vw, 12px); font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: ${IIEE.gold}; white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
  }

  /* ── Page hero header ── */
  .sp-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border: 1px solid ${IIEE.goldBorder};
    border-radius: 18px;
    padding: clamp(18px, 4vw, 28px) clamp(16px, 4vw, 28px) clamp(16px, 3vw, 22px);
    position: relative; overflow: hidden;
    margin-bottom: clamp(18px, 3vw, 24px);
  }
  .sp-hero::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(245,197,24,0.09) 0%, transparent 65%);
    pointer-events: none;
  }
  .sp-hero-badges { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .sp-hero-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(20px, 4.5vw, 30px); font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.03em;
    color: ${IIEE.white}; margin: 0 0 6px; line-height: 1.1;
  }
  .sp-hero-title .gold { color: ${IIEE.gold}; }
  .sp-hero-title .blue { color: ${IIEE.blue}; }
  .sp-hero-sub {
    font-size: clamp(12px, 1.6vw, 14px); color: ${IIEE.muted};
    margin: 0; font-family: 'DM Sans', sans-serif;
  }

  /* ── KPI grid ── */
  .sp-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(120px, 20vw, 155px), 1fr));
    gap: clamp(8px, 2vw, 12px);
    margin-bottom: clamp(16px, 3vw, 22px);
  }
  .sp-kpi {
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px; padding: clamp(12px, 2.5vw, 18px) clamp(10px, 2vw, 16px) clamp(10px, 2vw, 14px);
    position: relative; overflow: hidden;
    transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
    cursor: default;
  }
  .sp-kpi:hover {
    transform: translateY(-2px); border-color: ${IIEE.gold};
    box-shadow: 0 8px 28px rgba(245,197,24,0.12);
  }
  .sp-kpi::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--ac, ${IIEE.gold}); opacity: 0.85;
  }
  .sp-kpi-icon { font-size: clamp(15px, 2.5vw, 18px); margin-bottom: 8px; display: block; }
  .sp-kpi-label {
    font-size: clamp(9px, 1.3vw, 11px); font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: ${IIEE.muted}; margin-bottom: 5px;
    font-family: 'Montserrat', sans-serif;
  }
  .sp-kpi-value {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(22px, 4.5vw, 32px); font-weight: 700; line-height: 1;
    color: var(--ac, ${IIEE.gold});
  }
  .sp-kpi-sub { font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText}; margin-top: 4px; font-family: 'Inter', sans-serif; }

  /* ── Cards ── */
  .sp-card {
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 16px; overflow: hidden;
    transition: border-color 0.18s;
    margin-bottom: clamp(12px, 2.5vw, 18px);
  }
  .sp-card:hover { border-color: rgba(245,197,24,0.35); }
  .sp-card-head {
    display: flex; align-items: flex-start; gap: clamp(10px, 2vw, 14px);
    padding: clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2vw, 14px);
    border-bottom: 1px solid rgba(245,197,24,0.1);
    background: linear-gradient(90deg, rgba(245,197,24,0.04) 0%, transparent 100%);
  }
  .sp-card-icon {
    width: clamp(30px, 5vw, 38px); height: clamp(30px, 5vw, 38px);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: clamp(14px, 2.5vw, 16px);
    background: ${IIEE.goldGlow}; border: 1px solid ${IIEE.goldBorder};
    flex-shrink: 0;
  }
  .sp-card-icon.blue { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.25); }
  .sp-card-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(13px, 2vw, 16px); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: ${IIEE.white}; margin: 0 0 2px;
  }
  .sp-card-sub { font-size: clamp(10px, 1.4vw, 12px); color: ${IIEE.dimText}; margin: 0; font-family: 'Inter', sans-serif; }
  .sp-card-body { padding: clamp(12px, 2vw, 18px) clamp(14px, 3vw, 20px); }

  /* ── Latest result card ── */
  .sp-latest {
    background: linear-gradient(135deg, rgba(15,28,77,0.85), rgba(26,16,96,0.7));
    border: 1px solid ${IIEE.goldBorder};
    border-radius: 18px;
    padding: clamp(14px, 3vw, 22px) clamp(14px, 3vw, 22px);
    margin-bottom: clamp(16px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .sp-latest::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(245,197,24,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .sp-latest-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: clamp(12px, 2.5vw, 18px); flex-wrap: wrap;
  }
  .sp-latest-verdict {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(26px, 6vw, 36px); font-weight: 800; line-height: 1;
  }
  .sp-latest-meta { display: flex; gap: 8px; flex-wrap: wrap; }
  .sp-mini-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: clamp(6px, 1.5vw, 10px);
  }
  .sp-mini-stat {
    background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px; padding: clamp(8px, 1.5vw, 12px) clamp(8px, 1.5vw, 12px);
  }
  .sp-mini-stat-label {
    font-size: clamp(8px, 1.1vw, 10px); color: ${IIEE.dimText};
    text-transform: uppercase; letter-spacing: 0.07em;
    font-family: 'DM Sans', sans-serif; margin-bottom: 4px;
  }
  .sp-mini-stat-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(18px, 4vw, 24px); font-weight: 800; line-height: 1;
  }

  /* ── History row ── */
  .sp-history-row {
    display: flex; align-items: center; gap: clamp(8px, 2vw, 14px);
    padding: clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 16px);
    border-radius: 12px; cursor: pointer;
    transition: background 0.18s, transform 0.15s;
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 6px;
  }
  .sp-history-row:hover { background: rgba(255,255,255,0.04); transform: translateX(2px); }
  .sp-history-row.latest { background: rgba(56,189,248,0.04); border-color: rgba(56,189,248,0.15); }
  .sp-history-row.latest:hover { background: rgba(56,189,248,0.08); }
  .sp-history-badge {
    width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 16px;
  }
  .sp-history-info { flex: 1; min-width: 0; }
  .sp-history-tags { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
  .sp-history-tag {
    font-size: clamp(8px, 1.1vw, 10px); font-weight: 700;
    padding: 2px 8px; border-radius: 999px; white-space: nowrap;
  }
  .sp-history-meta { display: flex; gap: clamp(8px, 2vw, 14px); align-items: center; flex-wrap: wrap; }
  .sp-history-stat {
    font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.dimText};
    font-family: 'DM Sans', sans-serif;
  }
  .sp-history-stat strong { font-weight: 700; }

  /* ── Empty state ── */
  .sp-empty {
    background: rgba(255,255,255,0.015); border: 1px dashed rgba(245,197,24,0.2);
    border-radius: 18px; padding: clamp(30px, 6vw, 50px) 24px;
    text-align: center; margin-bottom: 20px;
  }
  .sp-empty-icon { font-size: clamp(36px, 7vw, 48px); margin-bottom: 14px; }
  .sp-empty-title {
    font-family: 'Montserrat', sans-serif; font-size: clamp(14px, 2.5vw, 17px);
    font-weight: 700; color: ${IIEE.white}; margin: 0 0 8px;
  }
  .sp-empty-sub { font-size: clamp(11px, 1.5vw, 13px); color: ${IIEE.dimText}; margin: 0 0 22px; line-height: 1.6; }

  /* ── Review compare cards ── */
  .sp-review-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: clamp(8px, 2vw, 12px); margin-bottom: clamp(10px, 2vw, 14px);
  }
  .sp-review-pill {
    border-radius: 12px; padding: clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 16px);
    border: 1px solid;
  }
  .sp-review-pill-label { font-size: clamp(9px, 1.2vw, 11px); font-weight: 600; margin-bottom: 4px; }
  .sp-review-pill-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(20px, 4vw, 26px); font-weight: 800; line-height: 1;
    color: ${IIEE.white};
  }

  /* ── Filter pills ── */
  .sp-filter-strip {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;
  }
  .sp-filter-btn {
    padding: 5px 12px; border-radius: 999px;
    font-size: clamp(10px, 1.3vw, 12px); font-weight: 700;
    cursor: pointer; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Info note ── */
  .sp-note {
    border-left: 3px solid ${IIEE.goldBorder};
    background: linear-gradient(90deg, rgba(245,197,24,0.06) 0%, transparent 100%);
    border-radius: 0 10px 10px 0;
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
    font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.muted}; line-height: 1.7;
    font-family: 'Inter', sans-serif; margin-top: clamp(14px, 2.5vw, 20px);
  }
  .sp-note strong { color: ${IIEE.gold}; font-family: 'Montserrat', sans-serif; }

  /* ── Section view header ── */
  .sp-section-num {
    font-family: 'Montserrat', sans-serif; font-size: clamp(9px, 1.2vw, 11px);
    font-weight: 700; color: ${IIEE.gold}; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 2px;
  }

  /* ── Fade animation ── */
  .sp-fade { animation: spFadeUp 0.35s ease both; }
  @keyframes spFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Scrollbar ── */
  .sp-root ::-webkit-scrollbar { width: 4px; }
  .sp-root ::-webkit-scrollbar-thumb { background: rgba(245,197,24,0.2); border-radius: 99px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sp-nav {
      padding: 0 clamp(10px, 3vw, 20px);
      gap: 8px;
    }
    .sp-nav-title {
      font-size: clamp(11px, 1.8vw, 14px);
    }
    .sp-nav-subtitle {
      font-size: clamp(8px, 1vw, 9px);
    }
    .sp-nav-actions {
      gap: clamp(4px, 1vw, 8px);
    }
    .sp-badge {
      padding: 2px 8px;
      font-size: clamp(8px, 1vw, 10px);
    }
    .sp-btn {
      padding: clamp(5px, 0.8vw, 7px) clamp(8px, 1.5vw, 12px);
      font-size: clamp(9px, 1.1vw, 11px);
    }
  }

  @media (max-width: 640px) {
    .sp-nav {
      flex-wrap: wrap;
      height: auto;
      padding: clamp(10px, 3vw, 16px);
      gap: 6px;
    }
    .sp-nav-brand {
      width: 100%;
      gap: clamp(6px, 1.5vw, 10px);
      margin-bottom: 6px;
    }
    .sp-nav-logos img { 
      width: 18px; 
      height: 18px; 
    }
    .sp-nav-title {
      font-size: clamp(10px, 1.5vw, 12px);
    }
    .sp-nav-subtitle {
      font-size: clamp(7px, 0.9vw, 8px);
      display: none;
    }
    .sp-nav-divider {
      display: none;
    }
    .sp-nav-actions {
      width: 100%;
      justify-content: flex-start;
      gap: 4px;
      flex-wrap: wrap;
    }
    .sp-badge {
      padding: 2px 6px;
      font-size: clamp(7px, 0.9vw, 9px);
    }
    .sp-btn {
      padding: clamp(4px, 0.7vw, 6px) clamp(6px, 1vw, 10px);
      font-size: clamp(8px, 1vw, 10px);
    }
    .sp-mini-stats { grid-template-columns: 1fr 1fr; }
    .sp-mini-stats > :nth-child(3) { grid-column: 1 / -1; }
    .sp-review-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 480px) {
    .sp-nav {
      padding: clamp(8px, 2vw, 12px);
      height: auto;
    }
    .sp-nav-brand {
      width: 100%;
      margin-bottom: 4px;
      gap: clamp(4px, 1vw, 8px);
    }
    .sp-nav-logos {
      gap: 4px;
    }
    .sp-nav-logos img { 
      width: 16px; 
      height: 16px; 
    }
    .sp-nav-title {
      font-size: clamp(9px, 1.3vw, 11px);
      font-weight: 700;
    }
    .sp-nav-actions {
      width: 100%;
      gap: 3px;
      justify-content: space-between;
    }
    .sp-badge {
      padding: 2px 5px;
      font-size: clamp(7px, 0.8vw, 8px);
    }
    .sp-btn {
      padding: clamp(3px, 0.5vw, 5px) clamp(5px, 0.8vw, 8px);
      font-size: clamp(7px, 0.9vw, 9px);
    }
    .sp-btn:has-text:not(:first-child) {
      display: none;
    }
    .sp-kpi-grid { grid-template-columns: 1fr 1fr; }
    .sp-history-meta { gap: 6px; }
    .sp-mini-stats { grid-template-columns: 1fr; }
    .sp-mini-stats > :nth-child(3) { grid-column: auto; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "ee_predictor_history";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
async function fetchDbHistory({ pageSize = 50 }) {
  try {
    const result = await apiStudentAttempts(pageSize);
    return result.data?.items || [];
  } catch (err) {
    console.error("Failed to load DB history:", err);
    throw new Error(err.message || "Failed to load prediction history. Please try again.");
  }
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function getRatingColor(score) {
  if (score >= 85) return IIEE.passGreen;
  if (score >= 78) return IIEE.blue;
  if (score >= 70) return IIEE.amber;
  if (score >= 60) return IIEE.orange;
  return IIEE.failRed;
}
function pct(v) { return v != null ? `${Number(v).toFixed(1)}%` : "—"; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider({ label, icon }) {
  return (
    <div className="sp-divider">
      <div className="sp-divider-line" />
      <div className="sp-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="sp-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="sp-kpi" style={{ "--ac": color }}>
      <span className="sp-kpi-icon">{icon}</span>
      <div className="sp-kpi-label">{label}</div>
      <div className="sp-kpi-value">{value ?? "—"}</div>
      {sub && <div className="sp-kpi-sub">{sub}</div>}
    </div>
  );
}

function HistoryRow({ entry, index, onView }) {
  const passed = entry.prediction === 1;
  const passColor = passed ? IIEE.passGreen : IIEE.failRed;
  const rColor = getRatingColor(entry.predicted_rating_a);
  const reliability = entry.reliability_score;
  const rCat = entry.reliability_category;
  const relColor = reliability == null ? IIEE.muted
    : reliability >= 80 ? IIEE.passGreen
    : reliability >= 60 ? IIEE.amber : IIEE.orange;
  const attendedReview = entry?.answers?.Review_Program || entry?.attended_formal_review || "—";
  const isLatest = index === 0;

  return (
    <div className={`sp-history-row${isLatest ? " latest" : ""}`} onClick={onView}>
      {/* Badge */}
      <div
        className="sp-history-badge"
        style={{ background: `${passColor}18`, border: `1px solid ${passColor}30` }}
      >
        {passed ? "🎓" : "📋"}
      </div>

      {/* Info */}
      <div className="sp-history-info">
        <div className="sp-history-tags">
          <span
            className="sp-history-tag"
            style={{ background: `${passColor}20`, color: passColor, border: `1px solid ${passColor}35` }}
          >{passed ? "PASSED" : "FAILED"}</span>
          {isLatest && (
            <span
              className="sp-history-tag"
              style={{ background: "rgba(56,189,248,0.12)", color: IIEE.blue, border: "1px solid rgba(56,189,248,0.25)" }}
            >Latest</span>
          )}
          <span style={{ fontSize: "clamp(9px,1.2vw,11px)", color: IIEE.dimText, fontFamily: "'DM Sans',sans-serif" }}>
            {formatDate(entry.date)}
          </span>
        </div>
        <div className="sp-history-meta">
          <span className="sp-history-stat">
            Pass prob: <strong style={{ color: passColor }}>{pct(entry.probability_pass * 100)}</strong>
          </span>
          <span className="sp-history-stat">
            Rtg A: <strong style={{ color: rColor }}>{entry.predicted_rating_a?.toFixed(1) ?? "—"}</strong>
          </span>
          <span className="sp-history-stat">
            Rtg B: <strong style={{ color: getRatingColor(entry.predicted_rating_b) }}>{entry.predicted_rating_b?.toFixed(1) ?? "—"}</strong>
          </span>
          {(rCat || reliability != null) && (
            <span
              className="sp-history-tag"
              style={{ background: `${relColor}18`, color: relColor, border: `1px solid ${relColor}35` }}
            >{rCat ?? `${reliability?.toFixed(1)}%`}</span>
          )}
          <span style={{ fontSize: "clamp(9px,1.2vw,11px)", color: attendedReview === "Yes" ? IIEE.passGreen : IIEE.amber }}>
            Review: {attendedReview}
          </span>
        </div>
      </div>

      <span style={{ fontSize: 12, color: IIEE.dimText, flexShrink: 0 }}>→</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentPage({ onLogout }) {
  const [view, setView] = useState("dashboard");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [history, setHistory] = useState([]);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchDbHistory({ pageSize: 50 });
        if (!cancelled) setHistory(items);
      } catch (err) {
        console.error("Error fetching history:", err);
        if (!cancelled) setHistory(loadHistory());
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshHistory = async () => {
    try {
      const items = await fetchDbHistory({ pageSize: 50 });
      setHistory(items);
      saveHistory(items);
    } catch (err) {
      console.error("Error refreshing history:", err);
      setHistory(loadHistory());
    }
  };

  const handleResult = (result) => {
    const entry = { ...result, date: new Date().toISOString(), id: Date.now() };
    setHistory([entry, ...history]);
    setPendingResult(result);
    setView("result");
    refreshHistory();
  };

  const handleViewEntry = (entry) => { setViewingEntry(entry); setView("result"); };
  const handleBackToDashboard = () => {
    setViewingEntry(null); setPendingResult(null); setView("dashboard");
    refreshHistory();
  };

  // Stats
  const totalAttempts = history.length;
  const passCount = history.filter(h => h.prediction === 1).length;
  const latestEntry = history[0] || null;
  const bestRating = history.length
    ? Math.max(...history.map(h => h.predicted_rating_a || 0)).toFixed(1) : null;

  // Review breakdown
  const reviewYes = history.filter(h => (h?.answers?.Review_Program || h?.attended_formal_review) === "Yes");
  const reviewNo = history.filter(h => (h?.answers?.Review_Program || h?.attended_formal_review) === "No");
  const avgPassProb = (arr) => {
    if (!arr.length) return null;
    return (arr.reduce((a, c) => a + Number(c?.probability_pass || 0), 0) / arr.length) * 100;
  };

  const filteredHistory = history.filter(h => {
    const rev = h?.answers?.Review_Program || h?.attended_formal_review;
    if (historyFilter === "yes") return rev === "Yes";
    if (historyFilter === "no") return rev === "No";
    return true;
  });

  const displayedResult = viewingEntry || pendingResult;

  return (
    <div className="sp-root">
      <style>{STYLES}</style>

      {/* ══ NAV ══ */}
      <nav className="sp-nav">
        <div className="sp-nav-brand">
          <div className="sp-nav-logos">
            {["/slsulogo.png", "/slsulogo1.png", "/slsulogo2.png"].map((src, i) => (
              <img key={src} src={src} alt={`Logo ${i + 1}`} />
            ))}
          </div>
          <div className="sp-nav-divider" />
          <div>
            <div className="sp-nav-title">EE Licensure Predictor</div>
            <div className="sp-nav-subtitle">Student Portal · SLSU IIEE</div>
          </div>
        </div>

        <div className="sp-nav-actions">
          {view !== "dashboard" && (
            <button className="sp-btn ghost" onClick={handleBackToDashboard}>← Dashboard</button>
          )}
          {view === "dashboard" && (
            <button className="sp-btn primary" onClick={() => setView("predictor")}>+ Take Prediction</button>
          )}
          <span className="sp-badge gold">🎓 Student</span>
          <button className="sp-btn ghost danger" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      {/* ══ BODY ══ */}
      <main className="sp-body">

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div className="sp-fade">

            {/* Hero */}
            <div className="sp-hero">
              <div className="sp-hero-badges">
                <span className="sp-badge gold">📊 Dashboard</span>
                <span className="sp-badge blue">🎓 Student Portal</span>
              </div>
              <h1 className="sp-hero-title">
                Your <span className="gold">Readiness</span> Overview
              </h1>
              <p className="sp-hero-sub">
                Track your board exam predictions and monitor your readiness progress across attempts.
              </p>
            </div>

            {/* KPIs */}
            <Divider label={`Key Indicators — ${totalAttempts} Attempt${totalAttempts !== 1 ? "s" : ""}`} icon="📌" />
            <div className="sp-kpi-grid">
              <KPI label="Total Attempts"  value={totalAttempts || "—"} icon="📋" color={IIEE.blue}  sub="All prediction runs" />
              <KPI label="Predicted Pass"  value={passCount || "—"}     icon="✅" color={IIEE.passGreen} sub="Board pass predictions" />
              <KPI label="Best Rating A"   value={bestRating ?? "—"}    icon="🏆" color={IIEE.amber} sub="Highest predicted Rating A" />
              <KPI
                label="Latest Verdict"
                value={latestEntry ? (latestEntry.prediction === 1 ? "PASS" : "FAIL") : "—"}
                icon={latestEntry ? (latestEntry.prediction === 1 ? "🎓" : "📉") : "📊"}
                color={latestEntry ? (latestEntry.prediction === 1 ? IIEE.passGreen : IIEE.failRed) : IIEE.dimText}
                sub={latestEntry ? `${pct(latestEntry.probability_pass * 100)} pass probability` : "No attempts yet"}
              />
            </div>

            {/* Latest result */}
            {latestEntry && (
              <>
                <Divider label="Latest Prediction" icon="🔍" />
                <div className="sp-latest">
                  <div className="sp-latest-top">
                    <div>
                      <div style={{ fontSize: "clamp(9px,1.2vw,11px)", color: IIEE.dimText, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>
                        Most Recent · {formatDate(latestEntry.date)}
                      </div>
                      <div className="sp-latest-verdict" style={{ color: latestEntry.prediction === 1 ? IIEE.passGreen : IIEE.failRed }}>
                        {latestEntry.prediction === 1 ? "PASSED" : "FAILED"}
                      </div>
                    </div>
                    <div className="sp-latest-meta">
                      <button className="sp-btn outline-blue" onClick={() => handleViewEntry(latestEntry)}>View Full Result →</button>
                      <button className="sp-btn ghost" onClick={() => setView("predictor")}>↻ Retake</button>
                    </div>
                  </div>
                  <div className="sp-mini-stats">
                    {[
                      { label: "Pass Probability", val: pct(latestEntry.probability_pass * 100), color: latestEntry.prediction === 1 ? IIEE.passGreen : IIEE.failRed },
                      { label: "Predicted Rating A", val: latestEntry.predicted_rating_a?.toFixed(1) ?? "—", color: getRatingColor(latestEntry.predicted_rating_a) },
                      { label: "Predicted Rating B", val: latestEntry.predicted_rating_b?.toFixed(1) ?? "—", color: getRatingColor(latestEntry.predicted_rating_b) },
                    ].map((item, i) => (
                      <div key={i} className="sp-mini-stat">
                        <div className="sp-mini-stat-label">{item.label}</div>
                        <div className="sp-mini-stat-val" style={{ color: item.color }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* No history empty state */}
            {history.length === 0 && (
              <div className="sp-empty">
                <div className="sp-empty-icon">📋</div>
                <p className="sp-empty-title">No predictions yet</p>
                <p className="sp-empty-sub">
                  Take your first EE board exam readiness prediction to see your results here.
                  <br />Your history will be saved to your account.
                </p>
                <button className="sp-btn cta" onClick={() => setView("predictor")}>Start Prediction →</button>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <>
                <Divider label="Prediction History" icon="📅" />

                {/* Review comparison */}
                <div className="sp-review-grid" style={{ marginBottom: 14 }}>
                  <div className="sp-review-pill" style={{ background: "rgba(34,197,94,0.07)", borderColor: "rgba(34,197,94,0.22)" }}>
                    <div className="sp-review-pill-label" style={{ color: IIEE.passGreen }}>With Formal Review</div>
                    <div className="sp-review-pill-val">{reviewYes.length}</div>
                    <div style={{ fontSize: "clamp(9px,1.2vw,11px)", color: IIEE.dimText, marginTop: 3 }}>
                      Avg pass prob: <strong style={{ color: IIEE.passGreen }}>{avgPassProb(reviewYes) != null ? pct(avgPassProb(reviewYes)) : "—"}</strong>
                    </div>
                  </div>
                  <div className="sp-review-pill" style={{ background: "rgba(251,191,36,0.07)", borderColor: "rgba(251,191,36,0.22)" }}>
                    <div className="sp-review-pill-label" style={{ color: IIEE.amber }}>Without Formal Review</div>
                    <div className="sp-review-pill-val">{reviewNo.length}</div>
                    <div style={{ fontSize: "clamp(9px,1.2vw,11px)", color: IIEE.dimText, marginTop: 3 }}>
                      Avg pass prob: <strong style={{ color: IIEE.amber }}>{avgPassProb(reviewNo) != null ? pct(avgPassProb(reviewNo)) : "—"}</strong>
                    </div>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="sp-filter-strip">
                  {[
                    { id: "all", label: `All (${history.length})` },
                    { id: "yes", label: `With Review (${reviewYes.length})` },
                    { id: "no",  label: `No Review (${reviewNo.length})` },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      className="sp-filter-btn"
                      onClick={() => setHistoryFilter(opt.id)}
                      style={{
                        background: historyFilter === opt.id ? "rgba(56,189,248,0.14)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${historyFilter === opt.id ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.1)"}`,
                        color: historyFilter === opt.id ? IIEE.blue : IIEE.muted,
                      }}
                    >{opt.label}</button>
                  ))}
                </div>

                <div>
                  {filteredHistory.map((entry, i) => (
                    <HistoryRow
                      key={entry.id || entry.attempt_id || i}
                      entry={entry} index={i}
                      onView={() => handleViewEntry(entry)}
                    />
                  ))}
                </div>

                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <button className="sp-btn outline-blue" style={{ padding: "10px 28px", fontSize: "clamp(11px,1.4vw,13px)" }} onClick={() => setView("predictor")}>
                    ↻ Take a New Prediction
                  </button>
                </div>
              </>
            )}

            {/* Info note */}
            <div className="sp-note">
              💡 <strong>Tip:</strong> Retake the prediction after improving your weak areas to see your updated score.
              Attempts are saved to your account when the backend is configured.
            </div>
          </div>
        )}

        {/* ── PREDICTOR VIEW ── */}
        {view === "predictor" && (
          <div className="sp-fade">
            <div className="sp-hero">
              <div className="sp-hero-badges">
                <span className="sp-badge gold">📝 New Prediction</span>
              </div>
              <h2 className="sp-hero-title">
                EE Board Exam <span className="blue">Readiness</span> Survey
              </h2>
              <p className="sp-hero-sub">
                Answer all questions honestly for the most accurate board exam readiness prediction.
              </p>
            </div>
            <PredictorForm onResult={handleResult} />
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === "result" && displayedResult && (
          <div className="sp-fade">
            <div className="sp-hero">
              <div className="sp-hero-badges">
                <span className="sp-badge gold">🔍 Result</span>
                {displayedResult?.attempt_id && (
                  <span className="sp-badge blue">Attempt {String(displayedResult.attempt_id).slice(0, 8)}</span>
                )}
              </div>
              <h2 className="sp-hero-title">
                {viewingEntry ? <>Past <span className="gold">Result</span> Review</> : <>Your <span className="gold">Prediction</span> Result</>}
              </h2>
              <p className="sp-hero-sub">
                {viewingEntry ? `Result from ${formatDate(viewingEntry.date)}` : "Your latest board exam readiness prediction"}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button className="sp-btn outline-blue" onClick={() => setView("predictor")}>↻ Retake Prediction</button>
              <button className="sp-btn ghost" onClick={handleBackToDashboard}>← Back to Dashboard</button>
            </div>

            <ResultCard result={displayedResult} />
          </div>
        )}
      </main>
    </div>
  );
}