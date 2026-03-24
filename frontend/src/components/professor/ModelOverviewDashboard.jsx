import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  pct,
  num,
  DashboardGuide,
  FilterPanel,
  InsightBox,
  MONTH_NAMES,
} from "./ProfessorShared";

/* ─── IIEE Design Tokens ──────────────────────────────────────────────────── */
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

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  .iiee-combined * { box-sizing: border-box; }

  .iiee-combined {
    font-family: 'DM Sans', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
  }

  /* ── Hero ── */
  .comb-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: 28px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .comb-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events: none;
  }
  .comb-hero::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 200px;
    width: 140px; height: 140px;
    background: radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .comb-hero-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .comb-hero-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .comb-hero-badge.gold {
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    color: ${IIEE.gold};
  }
  .comb-hero-badge.blue {
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.3);
    color: ${IIEE.blue};
  }
  .comb-hero-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${IIEE.white};
    margin: 0 0 4px;
    line-height: 1;
  }
  .comb-hero-title .accent-gold { color: ${IIEE.gold}; }
  .comb-hero-title .accent-blue { color: ${IIEE.blue}; }
  .comb-hero-sub {
    font-size: 12px;
    color: ${IIEE.muted};
    margin: 0;
    letter-spacing: 0.02em;
  }

  /* ── Body ── */
  .comb-body { padding: 24px 28px 48px; }

  /* ── Filter Strip ── */
  .comb-filter-strip {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(11,20,55,0.95);
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 24px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  /* ── Insight Banner ── */
  .comb-insights {
    border-left: 3px solid ${IIEE.gold};
    background: linear-gradient(90deg, rgba(245,197,24,0.08) 0%, transparent 100%);
    border-radius: 0 10px 10px 0;
    padding: 10px 16px;
    margin-bottom: 22px;
    font-size: 12.5px;
    color: ${IIEE.white};
  }

  /* ── Section Divider ── */
  .comb-section-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 32px 0 18px;
  }
  .comb-section-divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .comb-section-divider-line.rev {
    background: linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .comb-section-divider-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${IIEE.gold};
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── Section Card (for numbered sections) ── */
  .comb-section-card {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 18px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: border-color 0.18s ease;
  }
  .comb-section-card:hover { border-color: rgba(245,197,24,0.35); }
  .comb-section-head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(245,197,24,0.1);
    background: linear-gradient(90deg, rgba(245,197,24,0.04) 0%, transparent 100%);
  }
  .comb-section-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10px;
    font-weight: 900;
    color: ${IIEE.gold};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .comb-section-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    flex-shrink: 0;
  }
  .comb-section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${IIEE.white};
    margin: 0 0 2px;
    line-height: 1.1;
  }
  .comb-section-sub {
    font-size: 11px;
    color: ${IIEE.dimText};
    margin: 0;
  }
  .comb-section-body { padding: 18px 20px; }

  /* ── KPI Metrics ── */
  .comb-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 0;
  }
  .comb-metric-card {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px;
    padding: 18px 16px 14px;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    cursor: default;
  }
  .comb-metric-card:hover {
    transform: translateY(-2px);
    border-color: ${IIEE.gold};
    box-shadow: 0 8px 28px rgba(245,197,24,0.12);
  }
  .comb-metric-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent, ${IIEE.gold});
    opacity: 0.8;
  }
  .comb-metric-icon { font-size: 18px; margin-bottom: 10px; display: block; }
  .comb-metric-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${IIEE.muted};
    margin-bottom: 6px;
  }
  .comb-metric-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 34px;
    font-weight: 900;
    line-height: 1;
    color: var(--accent, ${IIEE.gold});
  }
  .comb-metric-sub { font-size: 10px; color: ${IIEE.dimText}; margin-top: 4px; }

  /* ── Inner Metric (for section cards) ── */
  .comb-inner-metric {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px 12px;
    position: relative;
    overflow: hidden;
  }
  .comb-inner-metric::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--mc, ${IIEE.gold});
  }
  .comb-inner-metric-icon { font-size: 16px; margin-bottom: 8px; display: block; }
  .comb-inner-metric-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: ${IIEE.dimText}; margin-bottom: 4px;
  }
  .comb-inner-metric-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 26px; font-weight: 900;
    color: var(--mc, ${IIEE.gold}); line-height: 1;
  }
  .comb-inner-metric-sub { font-size: 10px; color: ${IIEE.dimText}; margin-top: 3px; }

  /* ── Chart Cards ── */
  .comb-chart-card {
    background: rgba(11,20,55,0.65);
    border: 1px solid rgba(245,197,24,0.12);
    border-radius: 14px;
    padding: 16px;
    transition: border-color 0.18s ease;
  }
  .comb-chart-card:hover { border-color: rgba(245,197,24,0.3); }
  .comb-chart-card.standalone {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 16px;
    padding: 18px;
  }

  .comb-chart-head {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 12px;
  }
  .comb-chart-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    flex-shrink: 0;
  }
  .comb-chart-icon.blue-tint {
    background: rgba(56,189,248,0.1);
    border: 1px solid rgba(56,189,248,0.25);
  }
  .comb-chart-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: ${IIEE.white}; margin: 0 0 1px;
  }
  .comb-chart-subtitle { font-size: 11px; color: ${IIEE.dimText}; margin: 0; }
  .comb-chart-desc {
    margin-top: 10px; padding: 8px 12px;
    background: rgba(245,197,24,0.04);
    border-left: 2px solid ${IIEE.goldBorder};
    border-radius: 0 7px 7px 0;
    font-size: 11.5px; color: ${IIEE.muted}; line-height: 1.6;
  }
  .comb-chart-desc strong { color: ${IIEE.gold}; font-weight: 600; }

  /* ── 2-col grid ── */
  .comb-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .comb-2col .full-w { grid-column: 1 / -1; margin-top: 0; }
  .comb-standalone-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .comb-standalone-grid .full-w { grid-column: 1 / -1; }

  /* ── GWA pills ── */
  .comb-gwa-pills { display: flex; gap: 12px; margin-bottom: 14px; }
  .comb-gwa-pill {
    flex: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 10px; text-align: center;
  }
  .comb-gwa-pill-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: ${IIEE.dimText}; margin-bottom: 6px;
  }
  .comb-gwa-pill-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px; font-weight: 900; line-height: 1;
  }

  /* ── Model metrics ── */
  .comb-model-metrics { display: flex; flex-direction: column; gap: 10px; }
  .comb-model-row { display: flex; justify-content: space-between; align-items: center; }
  .comb-model-row-label { font-size: 12px; color: ${IIEE.muted}; }
  .comb-model-row-val { font-size: 12px; font-weight: 700; }
  .comb-progress-track {
    height: 6px; background: rgba(255,255,255,0.06);
    border-radius: 99px; overflow: hidden; margin-top: 4px;
  }
  .comb-progress-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.6s cubic-bezier(.4,0,.2,1);
  }
  .comb-model-mini-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .comb-model-mini {
    background: rgba(255,255,255,0.025); border-radius: 8px; padding: 8px 10px;
  }
  .comb-model-mini-label {
    font-size: 9px; color: ${IIEE.dimText}; text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 2px;
  }
  .comb-model-mini-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 900; color: ${IIEE.white};
  }

  /* ── Reliability banner ── */
  .comb-reliability-banner {
    background: linear-gradient(90deg, rgba(34,197,94,0.08) 0%, transparent 100%);
    border-left: 3px solid ${IIEE.passGreen};
    border-radius: 0 10px 10px 0;
    padding: 10px 16px;
    font-size: 12.5px; color: ${IIEE.muted}; margin-bottom: 14px;
  }

  /* ── Correlation block ── */
  .comb-corr-block {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    background: rgba(11,20,55,0.55);
    border: 1px solid rgba(245,197,24,0.1);
    border-radius: 14px; padding: 16px; margin-bottom: 14px;
  }
  .comb-corr-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: ${IIEE.white}; margin: 0 0 8px;
  }
  .comb-corr-text { font-size: 12.5px; line-height: 1.7; color: ${IIEE.muted}; }

  /* ── Reco card ── */
  .comb-reco-card {
    background: linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(245,197,24,0.03) 100%);
    border: 1px solid rgba(245,197,24,0.25);
    border-radius: 14px; padding: 16px 18px;
  }
  .comb-reco-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: ${IIEE.gold}; margin: 0 0 10px;
  }
  .comb-reco-list { list-style: none; padding: 0; margin: 0; }
  .comb-reco-list li {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 0; font-size: 12.5px;
    color: rgba(245,197,24,0.85); line-height: 1.5;
    border-bottom: 1px solid rgba(245,197,24,0.08);
  }
  .comb-reco-list li:last-child { border-bottom: none; }
  .comb-reco-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${IIEE.gold}; margin-top: 5px; flex-shrink: 0;
  }

  /* ── Sheet input ── */
  .comb-sheet-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-bottom: 10px; }
  .comb-sheet-input {
    background: rgba(15,28,77,0.9); border: 1px solid rgba(245,197,24,0.25);
    border-radius: 10px; padding: 10px 14px; font-size: 13px;
    color: ${IIEE.white}; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.18s ease;
  }
  .comb-sheet-input::placeholder { color: ${IIEE.dimText}; }
  .comb-sheet-input:focus { border-color: ${IIEE.gold}; }
  .comb-sheet-btn {
    background: ${IIEE.goldGlow}; border: 1px solid ${IIEE.goldBorder};
    border-radius: 10px; padding: 10px 18px; font-size: 13px;
    font-weight: 700; color: ${IIEE.gold}; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.18s ease, opacity 0.18s ease;
  }
  .comb-sheet-btn:hover { background: rgba(245,197,24,0.22); }
  .comb-sheet-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .comb-sheet-table { width: 100%; border-collapse: collapse; font-size: 12px; color: ${IIEE.muted}; }
  .comb-sheet-table td { padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }

  /* ── Smart viz footer ── */
  .comb-smart-viz {
    background: rgba(11,20,55,0.7);
    border: 1px solid rgba(245,197,24,0.12);
    border-radius: 14px; padding: 16px 20px; margin-top: 8px;
    font-size: 13px; color: ${IIEE.muted}; line-height: 1.6;
  }
  .comb-smart-viz strong { color: ${IIEE.white}; font-weight: 600; }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .comb-2col, .comb-standalone-grid { grid-template-columns: 1fr; }
    .comb-2col .full-w, .comb-standalone-grid .full-w { grid-column: 1; }
    .comb-corr-block { grid-template-columns: 1fr; }
    .comb-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .comb-body { padding: 14px; }
  }
  @media (max-width: 540px) {
    .comb-hero { padding: 18px 16px 14px; }
    .comb-section-body { padding: 14px; }
    .comb-sheet-row { grid-template-columns: 1fr; }
    .comb-metrics-grid { grid-template-columns: 1fr 1fr; }
  }

  .fade-in { animation: combFadeIn 0.45s ease both; }
  @keyframes combFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function normalizeSheetUrl(url) {
  if (!url) return null;
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const gidMatch = url.match(/[?&]gid=([0-9]+)/);
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv&gid=${gidMatch?.[1] ?? "0"}`;
}

function parseCsvPreview(csvText, limit = 6) {
  return csvText.split(/\r?\n/).filter(Boolean).slice(0, limit)
    .map((line) => line.split(",").map((v) => v.replace(/^"|"$/g, "").trim()));
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function IIEETooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
      color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      {label && (
        <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function SectionDivider({ label, icon }) {
  return (
    <div className="comb-section-divider">
      <div className="comb-section-divider-line" />
      <div className="comb-section-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="comb-section-divider-line rev" />
    </div>
  );
}

function SectionCard({ number, icon, title, subtitle, children }) {
  return (
    <div className="comb-section-card">
      <div className="comb-section-head">
        <div className="comb-section-icon">{icon}</div>
        <div style={{ flex: 1 }}>
          {number && <div className="comb-section-num">Section {number}</div>}
          <h3 className="comb-section-title">{title}</h3>
          {subtitle && <p className="comb-section-sub">{subtitle}</p>}
        </div>
      </div>
      <div className="comb-section-body">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="comb-metric-card" style={{ "--accent": color }}>
      <span className="comb-metric-icon">{icon}</span>
      <div className="comb-metric-label">{label}</div>
      <div className="comb-metric-value">{value}</div>
      {sub && <div className="comb-metric-sub">{sub}</div>}
    </div>
  );
}

function InnerMetric({ icon, label, value, sub, color = IIEE.gold }) {
  return (
    <div className="comb-inner-metric" style={{ "--mc": color }}>
      <span className="comb-inner-metric-icon">{icon}</span>
      <div className="comb-inner-metric-label">{label}</div>
      <div className="comb-inner-metric-value">{value}</div>
      {sub && <div className="comb-inner-metric-sub">{sub}</div>}
    </div>
  );
}

function ChartCard({ icon, title, subtitle, children, description, insight, fullWidth, standalone, blueTint }) {
  return (
    <div className={`comb-chart-card${standalone ? " standalone" : ""}${fullWidth ? " full-w" : ""}`}>
      <div className="comb-chart-head">
        <div className={`comb-chart-icon${blueTint ? " blue-tint" : ""}`}>{icon}</div>
        <div>
          <div className="comb-chart-title">{title}</div>
          {subtitle && <div className="comb-chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
      {(description || insight) && (
        <div className="comb-chart-desc">
          {description && <span>{description}</span>}
          {insight && <><br /><strong>↳ {insight}</strong></>}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="comb-progress-track">
      <div className="comb-progress-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function CorrelationBlock({ title, explanation, points = [], color = IIEE.blue, xLabel = "X", yLabel = "Y" }) {
  return (
    <div className="comb-corr-block">
      <div>
        <div className="comb-corr-title">{title}</div>
        <p className="comb-corr-text">{explanation}</p>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="x" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} name={xLabel} />
            <YAxis dataKey="y" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} name={yLabel} />
            <Tooltip content={<IIEETooltip />} />
            <Scatter data={points} fill={color} opacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────────────────── */
export default function ModelOverviewDashboard({
  // From ProfessorPage sharedProps
  dashFilters,
  setDashFilters,
  availableYears,
  localInsights,
  // From ProfessorOverviewDashboard props
  ov,
  pieData,
  reviewPieData,
  filteredYears,
  passByYear,
  filteredReview,
  passByDur,
  modelInfo,
  // From ModelOverviewDashboard props
  passByStrand,
  passByReview,
  sectionScores,
  weakestQ,
  subjectTrends,
  filteredSubjectTrends,
  correlation,
  scatterData,
}) {
  const [sheetUrl, setSheetUrl]         = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError]     = useState("");
  const [sheetPreview, setSheetPreview] = useState([]);

  /* ── Derived data ── */
  const chartData = useMemo(() => {
    return filteredYears?.length ? filteredYears : (passByYear ?? []);
  }, [filteredYears, passByYear]);

  const stackData = useMemo(() =>
    chartData.map((d) => ({
      label: d.label,
      Passers: d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0)),
      Failers: d.failers ?? ((d.total ?? 0) - Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0))),
    })),
  [chartData]);

  const monthlyTrend = useMemo(() => {
    if (!passByYear?.length) return [];
    return passByYear.map((x, idx) => ({
      month: (MONTH_NAMES ?? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])[idx % 12],
      passRate: Number(x.pass_rate ?? 0),
    }));
  }, [passByYear]);

  const yearlyTrend = useMemo(() =>
    (passByYear ?? []).map((x) => ({
      year: x.label,
      passRate: Number(x.pass_rate ?? 0),
      total: Number(x.total ?? 0),
    })),
  [passByYear]);

  const strandSummary = useMemo(() =>
    (passByStrand ?? []).map((x) => ({
      name: x.label,
      passRate: Number(x.pass_rate ?? 0),
      total: Number(x.total ?? 0),
    })),
  [passByStrand]);

  const weakAreas = useMemo(() => (weakestQ ?? []).slice(0, 6), [weakestQ]);

  const totalSurveyResponses = useMemo(() =>
    (sectionScores ?? []).reduce((acc, x) => acc + Number(x.pass || 0) + Number(x.fail || 0), 0),
  [sectionScores]);

  const reliabilityText = useMemo(() => {
    if (!scatterData?.length) return "Prediction reliability will appear once prediction-vs-actual records are available.";
    const avgAbsError =
      scatterData.reduce((acc, row) => acc + Math.abs(Number(row.predicted || 0) - Number(row.actual || 0)), 0) /
      scatterData.length;
    return `Average absolute prediction gap is ${avgAbsError.toFixed(2)} points across ${scatterData.length} records.`;
  }, [scatterData]);

  const barColor = (rate) =>
    rate >= 70 ? IIEE.passGreen : rate >= 55 ? IIEE.amber : IIEE.failRed;

  const handlePreviewSheet = async () => {
    const csvUrl = normalizeSheetUrl(sheetUrl);
    if (!csvUrl) { setSheetError("Invalid Google Sheets URL."); setSheetPreview([]); return; }
    setSheetLoading(true); setSheetError("");
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error();
      setSheetPreview(parseCsvPreview(await res.text()));
    } catch {
      setSheetError("Could not load read-only sheet preview."); setSheetPreview([]);
    } finally { setSheetLoading(false); }
  };

  return (
    <div className="iiee-combined fade-in">
      <style>{styles}</style>

      {/* ── Hero Header ── */}
      <div className="comb-hero">
        <div className="comb-hero-badges">
          <span className="comb-hero-badge gold">📊 Dashboard</span>
          <span className="comb-hero-badge blue">🧭 Model Overview</span>
        </div>
        <h2 className="comb-hero-title">
          Institutional <span className="accent-gold">Overview</span>{" "}
          <span style={{ color: IIEE.dimText, fontWeight: 400 }}>&amp;</span>{" "}
          <span className="accent-blue">Model</span> Dashboard
        </h2>
        <p className="comb-hero-sub">
          Aggregate EE board exam outcomes, model behavior, reliability, and curriculum insights — all in one view.
        </p>
      </div>

      <div className="comb-body">

        {/* ── Sticky Filter Strip ── */}
        <div className="comb-filter-strip">
          <DashboardGuide
            title="How to Read This Dashboard"
            items={[
              { label: "KPI cards",     text: "Totals and rates for students, passers/failers, and GWA gap." },
              { label: "Charts",        text: "Compare outcomes by year, strand, review status, and subject." },
              { label: "Model section", text: "Covers reliability, correlation, and curriculum gap analysis." },
              { label: "Threshold",     text: "Gold 70% reference lines and color cues judge cohort performance." },
            ]}
          />
          <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
        </div>

        {/* ── Insights ── */}
        {localInsights?.length > 0 && (
          <div className="comb-insights">
            <InsightBox insights={localInsights} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            PART A — INSTITUTIONAL OVERVIEW
        ════════════════════════════════════════════════════════ */}

        <SectionDivider label="Key Performance Indicators" icon="📌" />

        {/* KPI Metric Cards */}
        <div className="comb-metrics-grid" style={{ marginBottom: 28 }}>
          <MetricCard label="Total Students"    value={ov?.total_students ?? "—"}                                                                    icon="👥" color={IIEE.blue} />
          <MetricCard label="Total Passers"     value={ov?.total_passers ?? "—"}                                                                     icon="✅" color={IIEE.passGreen} />
          <MetricCard label="Total Failers"     value={ov?.total_failers ?? "—"}                                                                     icon="❌" color={IIEE.failRed} />
          <MetricCard label="Overall Pass Rate" value={pct(ov?.overall_pass_rate)} color={(ov?.overall_pass_rate ?? 0) >= 70 ? IIEE.passGreen : IIEE.amber} icon="📊" />
          <MetricCard label="Avg GWA (Passers)" value={num(ov?.avg_gwa_passers)}   icon="🎓" color={IIEE.passGreen} sub="1.0 = Highest" />
          <MetricCard label="Avg GWA (Failers)" value={num(ov?.avg_gwa_failers)}   icon="📉" color={IIEE.failRed}   sub="1.0 = Highest" />
        </div>

        <SectionDivider label="Distribution Analysis" icon="🥧" />

        {/* Distribution Charts */}
        <div className="comb-standalone-grid" style={{ marginBottom: 20 }}>
          <ChartCard standalone icon="🥧" title="Pass / Fail Distribution" subtitle="Overall passer vs failer share"
            description="Donut chart showing the proportion of exam takers who passed vs failed their first attempt."
            insight="A larger green slice indicates stronger cohort performance above the 70% benchmark.">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                  {(pieData ?? []).map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard standalone icon="📖" title="Review Attendance Share" subtitle="Formal review vs no review"
            description="Shows how many students enrolled in a formal board review program before taking the PRC exam."
            insight="Higher review attendance consistently correlates with improved pass rates.">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={reviewPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                  {(reviewPieData ?? []).map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard standalone fullWidth icon="📅" title="Pass Rate by Year" subtitle="Board exam performance trend per cohort year"
            description="Bar chart tracking year-over-year pass rate movement across all exam cohorts."
            insight="Bars above the gold 70% threshold are strong; amber/red bars indicate cohorts requiring intervention.">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                <XAxis dataKey="label"   tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                  label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={barColor(entry.pass_rate)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard standalone fullWidth icon="📦" title="Pass / Fail Counts by Year" subtitle="Stacked composition per cohort year"
            description="Stacked chart revealing the absolute number of passers and failers in each cohort year."
            insight="Years with large total bars but low green proportion are high-volume low-performance cohorts.">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stackData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis                 tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} />
                <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <SectionDivider label="Review Program Analysis" icon="🏫" />

        {/* Review & Duration */}
        <div className="comb-standalone-grid" style={{ marginBottom: 20 }}>
          <ChartCard standalone icon="🏫" title="Pass Rate by Review Attendance" subtitle="Did attending formal review improve results?"
            description="Horizontal bar comparing pass rates of students who attended formal review vs those who did not."
            insight="A significant gap between groups validates the impact of review programs on board exam outcomes.">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredReview ?? []} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                  {(filteredReview ?? []).map((entry, i) => <Cell key={i} fill={entry.pass_rate >= 70 ? IIEE.passGreen : IIEE.failRed} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard standalone icon="⏱️" title="Pass Rate by Review Duration" subtitle="Longer review programs → higher pass rates"
            description="Compares pass rates across different review program durations to find the optimal preparation length."
            insight="Progressively higher bars for longer durations confirm that review length is a key predictor.">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={passByDur ?? []} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                  {(passByDur ?? []).map((entry, i) => (
                    <Cell key={i} fill={[IIEE.failRed, IIEE.amber, IIEE.passGreen][i] || IIEE.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <SectionDivider label="Academic Signal & Model" icon="📐" />

        {/* GWA + Model */}
        <div className="comb-standalone-grid" style={{ marginBottom: 8 }}>
          <ChartCard standalone icon="📐" title="GWA: Passers vs Failers" subtitle="Lower GWA is better in PH grading (1.0 = highest)"
            description="Compares average General Weighted Average between passers and failers — a core predictive signal."
            insight={`GWA gap: ${num((ov?.avg_gwa_failers ?? 0) - (ov?.avg_gwa_passers ?? 0))} points — a strong board exam predictor.`}>
            <div className="comb-gwa-pills">
              <div className="comb-gwa-pill">
                <div className="comb-gwa-pill-label">Passers Avg GWA</div>
                <div className="comb-gwa-pill-val" style={{ color: IIEE.passGreen }}>{num(ov?.avg_gwa_passers)}</div>
              </div>
              <div className="comb-gwa-pill">
                <div className="comb-gwa-pill-label">Failers Avg GWA</div>
                <div className="comb-gwa-pill-val" style={{ color: IIEE.failRed }}>{num(ov?.avg_gwa_failers)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart
                data={[
                  { name: "Passers", value: ov?.avg_gwa_passers },
                  { name: "Failers", value: ov?.avg_gwa_failers },
                ]}
                margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 3]}  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<IIEETooltip formatter={(v) => v?.toFixed(2)} />} />
                <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
                  <Cell fill={IIEE.passGreen} />
                  <Cell fill={IIEE.failRed} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard standalone icon="📈" title="Model Performance Summary" subtitle="Random Forest classification & regression metrics"
            description="Summarizes the predictive model's accuracy, F1 score, and cross-validation performance."
            insight="Higher accuracy and F1 confirm the model reliably identifies at-risk students before the exam.">
            {modelInfo ? (
              <div className="comb-model-metrics">
                {[
                  { label: "Classification Accuracy", value: modelInfo.classification?.accuracy, color: IIEE.blue },
                  { label: "Classification F1",        value: modelInfo.classification?.f1,       color: IIEE.gold },
                  { label: "CV Accuracy",              value: modelInfo.classification?.cv_acc,   color: IIEE.indigo },
                  { label: "CV F1",                    value: modelInfo.classification?.cv_f1,    color: IIEE.passGreen },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="comb-model-row">
                      <span className="comb-model-row-label">{m.label}</span>
                      <span className="comb-model-row-val" style={{ color: m.color }}>{pct((m.value ?? 0) * 100)}</span>
                    </div>
                    <ProgressBar value={(m.value ?? 0) * 100} color={m.color} />
                  </div>
                ))}
                <div className="comb-model-mini-grid">
                  {[
                    { label: "Reg A — MAE", v: modelInfo.regression_a?.mae, d: 2 },
                    { label: "Reg A — R²",  v: modelInfo.regression_a?.r2,  d: 3 },
                    { label: "Reg B — MAE", v: modelInfo.regression_b?.mae, d: 2 },
                    { label: "Reg B — R²",  v: modelInfo.regression_b?.r2,  d: 3 },
                  ].map((m, i) => (
                    <div key={i} className="comb-model-mini">
                      <div className="comb-model-mini-label">{m.label}</div>
                      <div className="comb-model-mini-val">{num(m.v, m.d)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: IIEE.dimText }}>Loading model metrics…</p>
            )}
          </ChartCard>
        </div>

        {/* ════════════════════════════════════════════════════════
            PART B — MODEL OVERVIEW (numbered sections)
        ════════════════════════════════════════════════════════ */}

        <SectionDivider label="Model Summary" icon="🧠" />

        {/* Section 1 — Model Summary */}
        <SectionCard number="1" icon="🧠" title="Model Summary" subtitle="Purpose, structure, and major predictor groups.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
            <InnerMetric icon="🎓" label="GWA Signal"     value={num((ov?.avg_gwa_failers ?? 0) - (ov?.avg_gwa_passers ?? 0))} sub="gap (failers − passers)" color={IIEE.indigo} />
            <InnerMetric icon="📘" label="Math / EE / ESAS" value="3 Core" sub="subject score predictors"       color={IIEE.blue} />
            <InnerMetric icon="🧾" label="Survey Inputs"  value={`${sectionScores?.length ?? 0}`} sub="survey sections used"  color={IIEE.teal} />
            <InnerMetric icon="🎯" label="Pass Threshold" value="70%"    sub="system pass reference"            color={IIEE.amber} />
          </div>
        </SectionCard>

        {/* Section 2 — Dataset Overview */}
        <SectionCard number="2" icon="🗃️" title="Dataset Overview" subtitle="PRC outcomes and survey response summaries from current system data.">
          <div className="comb-2col">
            <ChartCard icon="🥧" title="PRC Result Distribution" subtitle="Passers vs Failers" blueTint
              description="Donut breakdown of exam outcomes across the full dataset."
              insight="Green-dominant chart = strong cohort performance.">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={85} dataKey="value">
                    {(pieData ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard icon="📊" title="Survey Section Summary" subtitle={`Aggregated responses: ${totalSurveyResponses}`} blueTint
              description="Compares pass/fail counts per survey section — reveals where performance diverges.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(sectionScores ?? []).map((s) => ({ name: s.label, pass: s.pass, fail: s.fail }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="pass" name="Passers" fill={IIEE.passGreen} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fail" name="Failers" fill={IIEE.failRed}   radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </SectionCard>

        {/* Section 3 — External Data Integration */}
        <SectionCard number="3" icon="🔗" title="External Data Integration" subtitle="Google Sheets read-only preview — no change to backend logic.">
          <div className="comb-sheet-row">
            <input
              className="comb-sheet-input"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheets link…"
            />
            <button className="comb-sheet-btn" onClick={handlePreviewSheet} disabled={sheetLoading}>
              {sheetLoading ? "Loading…" : "Preview"}
            </button>
          </div>
          {sheetError && <p style={{ fontSize: 12, color: IIEE.failRed, margin: "4px 0 0" }}>{sheetError}</p>}
          {sheetPreview.length > 0 && (
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid rgba(245,197,24,0.15)`, background: "rgba(11,20,55,0.7)", padding: 10, marginTop: 10 }}>
              <table className="comb-sheet-table">
                <tbody>
                  {sheetPreview.map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j}>{cell || "—"}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Section 4 — Visualization & Trends */}
        <SectionCard number="4" icon="📈" title="Data Visualization & Trends" subtitle="Monthly, yearly, and subject trend behavior with indicators.">
          <div className="comb-2col">
            <ChartCard icon="🗓️" title="Monthly Trends" subtitle="Line chart for trend continuity" blueTint
              description="Pass rate movement mapped across months using year data as proxy."
              insight="Rising line = improving cohort performance over time.">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="month"    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis                    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                  <Line type="monotone" dataKey="passRate" stroke={IIEE.teal} strokeWidth={2.5} dot={{ r: 3, fill: IIEE.teal }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard icon="📅" title="Yearly Trends" subtitle="Bar chart for year-over-year comparison" blueTint
              description="Compares overall pass rates per exam year to reveal performance trajectory."
              insight="Consistent upward movement signals effective academic intervention.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={yearlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="year"  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis                 tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                  <Bar dataKey="passRate" name="Pass Rate" fill={IIEE.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {(subjectTrends?.length ?? 0) > 0 && (
              <ChartCard icon="📘" title="Subject Trends" subtitle="EE, MATH, ESAS trend line behavior" fullWidth blueTint
                description="Tracks subject-level average score movement across cohort years."
                insight="Diverging lines suggest uneven subject performance that requires targeted intervention.">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={(filteredSubjectTrends?.length ? filteredSubjectTrends : subjectTrends) ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                    <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<IIEETooltip />} />
                    <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                    <Line dataKey="EE_avg"   name="EE"   stroke={IIEE.blue}   strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="MATH_avg" name="MATH" stroke={IIEE.indigo} strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="ESAS_avg" name="ESAS" stroke={IIEE.teal}   strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        </SectionCard>

        {/* Section 5 — Model Reliability */}
        <SectionCard number="5" icon="🧪" title="Model Reliability" subtitle="Predicted vs actual consistency and confidence behavior.">
          <div className="comb-reliability-banner">{reliabilityText}</div>
          <ChartCard icon="🎯" title="Predicted vs Actual" subtitle="Scatter — relationship / consistency" blueTint
            description="Each point represents one student record — X axis is actual PRC rating, Y axis is model prediction."
            insight="Points close to the diagonal reference line indicate high model accuracy.">
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                <XAxis dataKey="actual"    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="predicted" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<IIEETooltip />} />
                <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]}
                  stroke="rgba(245,197,24,0.3)" strokeDasharray="5 4" />
                <Scatter data={scatterData ?? []} fill={IIEE.passGreen} opacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </SectionCard>

        {/* Section 6 — Student Performance Summary */}
        <SectionCard number="6" icon="👥" title="Student Performance Summary" subtitle="Strand, review duration, and review attendance split.">
          <div className="comb-2col">
            <ChartCard icon="🎓" title="SHS Strand Summary" subtitle="Pass rate by academic strand" blueTint
              description="Bar comparison of board exam performance split by senior high school strand."
              insight="Strands with STEM alignment tend to outperform other tracks.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={strandSummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="name"     tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis                    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                  <Bar dataKey="passRate" name="Pass Rate" fill={IIEE.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard icon="⏱️" title="Review Duration Summary" subtitle="Pass rate by duration group" blueTint
              description="Shows how the length of a board review program affects exam success rates."
              insight="Longer review durations generally yield higher pass rates across all cohorts.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={passByDur ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis                 tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                  <Bar dataKey="pass_rate" name="Pass Rate" fill={IIEE.orange} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard icon="🥧" title="Review Attendance Distribution" subtitle="Pie chart distribution" fullWidth blueTint
              description="Proportion of students who attended formal board review versus those who did not.">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={reviewPieData} dataKey="value" innerRadius={55} outerRadius={90}>
                    {(reviewPieData ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </SectionCard>

        {/* Section 7 — Curriculum Gap */}
        <SectionCard number="7" icon="🏫" title="Curriculum Gap Analysis" subtitle="Weakest curriculum-linked survey signals with recommendations.">
          <div className="comb-2col">
            <ChartCard icon="⚠️" title="Weak Curriculum Areas" subtitle="Highest disagreement survey points" blueTint
              description="Survey indicators with the lowest average scores — signals where students feel least supported."
              insight="Low scores indicate curriculum or facilities areas needing urgent review.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="key"  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(2)}/4`} />} />
                  <Bar dataKey="avg" name="Avg Score" fill={IIEE.failRed} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="comb-reco-card">
              <div className="comb-reco-title">⚡ AI Recommendations</div>
              <ul className="comb-reco-list">
                {[
                  "Prioritize facilities and department review interventions for immediate impact.",
                  "Align syllabus and mock tests more closely with board exam patterns.",
                  "Track improvements quarterly using the same weakest-item indicators.",
                  "STEM students show highest pass rate — replicate pedagogical approach in other strands.",
                  "Students with >6 months review duration achieve best results — incentivize extended enrollment.",
                ].map((rec, i) => (
                  <li key={i}><span className="comb-reco-dot" />{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Section 8 — Correlation */}
        <SectionCard number="8" icon="🧮" title="Correlation Analysis Module" subtitle="One correlation per section — explanation left, chart right.">
          <CorrelationBlock
            title="GWA vs Predicted Rating"
            explanation="Lower GWA (better academic standing) should generally align with stronger predicted scores. This validates GWA as the primary model predictor."
            points={(scatterData ?? []).map((x) => ({ x: x.actual, y: x.predicted }))}
            color={IIEE.blue}
            xLabel="Actual"
            yLabel="Predicted"
          />
          <CorrelationBlock
            title="Math vs EE Trend Relationship"
            explanation="Subject trend movement shows whether yearly improvements are synchronized across core board domains. Synchronized trends indicate curriculum coherence."
            points={(subjectTrends ?? []).map((s) => ({ x: Number(s.MATH_avg || 0), y: Number(s.EE_avg || 0) }))}
            color={IIEE.teal}
            xLabel="MATH"
            yLabel="EE"
          />
          <CorrelationBlock
            title="Survey Factors vs Pass Rate"
            explanation="Survey section averages reveal cognitive, non-cognitive, and institutional relationships with board outcomes. Higher survey satisfaction often predicts better results."
            points={(sectionScores ?? []).map((s) => ({ x: Number(s.pass || 0), y: Number(s.fail || 0) }))}
            color={IIEE.indigo}
            xLabel="Passers Avg"
            yLabel="Failers Avg"
          />
        </SectionCard>

        {/* Smart Viz Footer */}
        <div className="comb-smart-viz">
          <strong>Smart Visualization Mapping</strong>
          <p style={{ margin: "6px 0 0" }}>
            Line charts are used for trends, bar charts for comparisons, pie charts for distribution, and scatter plots for relationship and reliability views.
            {correlation?.columns?.length ? " Correlation matrix data is also available in the dedicated Correlation tab." : ""}
          </p>
        </div>

      </div>
    </div>
  );
}