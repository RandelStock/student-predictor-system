import { useMemo, useState, useEffect } from "react";
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

  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .g2 .fw { grid-column:1/-1; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

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

  .model-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .model-row-label { font-size:12px; color:${IIEE.muted}; }
  .model-row-val { font-size:12px; font-weight:700; }
  .prog-track {
    height:6px; background:rgba(255,255,255,0.06);
    border-radius:99px; overflow:hidden; margin-bottom:10px;
  }
  .prog-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }

  .insight-banner {
    border-left:3px solid ${IIEE.gold};
    background:linear-gradient(90deg,rgba(245,197,24,0.08) 0%,transparent 100%);
    border-radius:0 10px 10px 0; padding:10px 16px;
    margin-bottom:22px; font-size:12.5px; color:${IIEE.white};
  }

  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px;
  }

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

  .tab-btn {
    padding:8px 14px; border-radius:8px; font-size:12px; font-weight:700;
    cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif;
  }

  /* AI Insight Box */
  .ai-insight-box {
    background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(129,140,248,0.06) 100%);
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 12px;
    padding: 14px 16px;
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
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: ${IIEE.blue}; margin-bottom: 8px;
  }
  .ai-insight-text {
    font-size: 12.5px; color: ${IIEE.white}; line-height: 1.7;
  }
  .ai-loading {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: ${IIEE.muted};
  }
  .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: ${IIEE.blue}; animation: pulse 1.2s infinite; }
  .ai-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }

  /* Period card pills */
  .period-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }
  .period-pill {
    background: rgba(15,28,77,0.8);
    border: 1px solid rgba(245,197,24,0.15);
    border-radius: 12px;
    padding: 14px 16px;
    transition: border-color .18s, transform .18s;
  }
  .period-pill:hover { border-color: ${IIEE.gold}; transform: translateY(-2px); }
  .period-pill-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: ${IIEE.muted}; margin-bottom: 6px;
  }
  .period-pill-rate {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px; font-weight: 900; line-height: 1;
  }
  .period-pill-sub { font-size: 10px; color: ${IIEE.dimText}; margin-top: 3px; }

  /* Subject table */
  .subject-table { width: 100%; border-collapse: collapse; }
  .subject-table th {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: ${IIEE.dimText};
    padding: 8px 10px; border-bottom: 1px solid rgba(245,197,24,0.12);
    text-align: left;
  }
  .subject-table td {
    padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px;
  }
  .subject-table tr:last-child td { border-bottom: none; }
  .subject-table tr:hover td { background: rgba(245,197,24,0.03); }

  /* Survey section bars */
  .survey-section-row {
    margin-bottom: 14px;
  }
  .survey-section-label {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 4px;
  }
  .survey-section-name { font-size: 12px; color: ${IIEE.muted}; font-weight: 600; }
  .survey-section-vals { font-size: 11px; color: ${IIEE.dimText}; }
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
    display: flex; gap: 14px; margin-bottom: 14px;
    font-size: 11px;
  }
  .survey-legend-item { display: flex; align-items: center; gap: 5px; color: ${IIEE.muted}; }
  .survey-legend-dot { width: 8px; height: 8px; border-radius: 50%; }

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

/* ─── AI Insight Component ────────────────────────────────────── */
function AIInsight({ prompt, data, cacheKey }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prompt || !data) return;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setInsight(cached); return; }

    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `You are an academic data analyst for SLSU (Southern Leyte State University) REE (Registered Electrical Engineer) board exam results. 
Analyze the following data and provide a concise 2-3 sentence insight for faculty. 
Be specific, mention exact numbers, and provide actionable recommendations. 
Write in a professional but accessible tone. No markdown, just plain text.

${prompt}

Data: ${JSON.stringify(data, null, 2)}`
            }]
          }),
          signal: controller.signal,
        });
        const json = await res.json();
        const text = json?.content?.[0]?.text ?? "Unable to generate insight.";
        sessionStorage.setItem(cacheKey, text);
        if (!controller.signal.aborted) setInsight(text);
      } catch (e) {
        if (!controller.signal.aborted) setInsight(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [cacheKey, prompt, data]);

  if (!loading && !insight) return null;

  return (
    <div className="ai-insight-box">
      <div className="ai-insight-header">
        <span>✨</span>
        <span>AI Analysis</span>
      </div>
      {loading ? (
        <div className="ai-loading">
          <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
          <span>Generating insight…</span>
        </div>
      ) : (
        <div className="ai-insight-text">{insight}</div>
      )}
    </div>
  );
}

/* ─── FIX 1: Exam Period Visualization ────────────────────────── */
function ExamPeriodSection({ periodData, selectedYear }) {
  // Parse and group period data robustly
  const grouped = useMemo(() => {
    if (!periodData?.length) return [];
    const map = {};
    periodData.forEach((d) => {
      const label = (d.label || "").trim();
      // Try to extract year and month from label like "2022-Apr", "2023-Aug", "2025 April"
      const yearMatch = label.match(/\b(20\d{2})\b/);
      const monthMatch = label.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|april|august|january|february|march|june|july|september|october|november|december)\b/i);
      if (!yearMatch) return;
      const year = yearMatch[1];
      // Replace the month mapping with this:
      const month = monthMatch
        ? monthMatch[1].charAt(0).toUpperCase() + monthMatch[1].slice(1, 3).toLowerCase()
        : "Unknown";
      // e.g. "April" → "Apr", "August" → "Aug", "September" → "Sep"
      const key = `${year}-${month}`;
      if (!map[key]) map[key] = { year, month, label: key, pass_rate: d.pass_rate, passers: d.passers, total: d.total };
    });
    return Object.values(map).sort((a, b) => {
      if (a.year !== b.year) return a.year.localeCompare(b.year);
      return a.month === "April" ? -1 : 1;
    });
  }, [periodData]);

  // For the chart: group by year, show April and August side-by-side
  const chartData = useMemo(() => {
    const yearMap = {};
    grouped.forEach((d) => {
      if (!yearMap[d.year]) yearMap[d.year] = { year: d.year };
      yearMap[d.year][d.month] = Number(d.pass_rate ?? 0);
      yearMap[d.year][`${d.month}_n`] = d.total ?? 0;
    });
    return Object.values(yearMap).sort((a, b) => a.year.localeCompare(b.year));
  }, [grouped]);

  const filtered = useMemo(() => {
    if (!selectedYear) return chartData;
    return chartData.filter((d) => String(d.year) === String(selectedYear));
  }, [chartData, selectedYear]);

  const displayData = filtered.length ? filtered : chartData;

  // Build AI prompt
  const aiPrompt = `Analyze the PRC REE exam period pass rates (April vs August sittings). 
Focus on: which period consistently performs better, any alarming drops, and recommendations for when students should ideally sit for exams.`;
  const aiCacheKey = `exam-period-${selectedYear || "all"}-${JSON.stringify(displayData).slice(0, 80)}`;

  if (!displayData.length) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: IIEE.dimText, fontSize: 12 }}>
        No exam period data available. Ensure <code>passByPeriod</code> prop is populated with labels like "2022-Apr" or "2023-August".
      </div>
    );
  }

  return (
    <div>
      {/* Summary pills */}
      <div className="period-grid" style={{ marginBottom: 16 }}>
        {grouped
          .filter((d) => !selectedYear || String(d.year) === String(selectedYear))
          .map((d, i) => (
            <div key={i} className="period-pill">
              <div className="period-pill-label">{d.year} · {d.month}</div>
              <div className="period-pill-rate" style={{ color: barColor(d.pass_rate) }}>
                {Number(d.pass_rate ?? 0).toFixed(1)}%
              </div>
              <div className="period-pill-sub">
                {d.passers != null ? `${d.passers} passers` : ""}
                {d.total != null ? ` / ${d.total} total` : ""}
              </div>
            </div>
          ))}
      </div>

      {/* Grouped bar chart: April vs August per year */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={displayData} margin={{ top: 12, right: 24, left: -4, bottom: 4 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.10)" />
          <XAxis
            dataKey="year"
            tick={{ fill: IIEE.dimText, fontSize: 12 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: IIEE.dimText, fontSize: 11 }}
            axisLine={false} tickLine={false} unit="%"
          />
          <Tooltip
            content={<Tip fmt={(v) => `${Number(v).toFixed(1)}%`} />}
          />
          <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
            label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
          <Legend
            iconType="circle" iconSize={9}
            formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>}
          />
          <Bar dataKey="April"  name="April Sitting"  fill={IIEE.blue}      radius={[6,6,0,0]} maxBarSize={48} />
          <Bar dataKey="August" name="August Sitting" fill={IIEE.orange}    radius={[6,6,0,0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>

      {/* Line overlay for trend */}
      {displayData.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Period Trend Line
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={displayData} margin={{ top: 4, right: 24, left: -4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.08)" />
              <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(1)}%`} />} />
              <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="April"  stroke={IIEE.blue}   strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, fill: IIEE.gold }} />
              <Line type="monotone" dataKey="August" stroke={IIEE.orange} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, fill: IIEE.gold }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <AIInsight prompt={aiPrompt} data={displayData} cacheKey={aiCacheKey} />
    </div>
  );
}

/* ─── FIX 2: Subject Score Trends ────────────────────────────── */
function SubjectTrendsSection({ subjectTrend, selectedYear, kpi }) {
  // Safety: ensure all values are valid numbers
  const safeData = useMemo(() =>
    (subjectTrend || []).map((d) => ({
      year: String(d.year || d.label || ""),
      EE:   Number(d.EE)   > 0 ? Number(d.EE)   : null,
      MATH: Number(d.MATH) > 0 ? Number(d.MATH) : null,
      ESAS: Number(d.ESAS) > 0 ? Number(d.ESAS) : null,
    })).filter((d) => d.year),
  [subjectTrend]);

  const displayData = useMemo(() => {
    if (!selectedYear) return safeData;
    const filtered = safeData.filter((d) => String(d.year) === String(selectedYear));
    return filtered.length ? filtered : safeData;
  }, [safeData, selectedYear]);

  const hasData = displayData.some((d) => d.EE || d.MATH || d.ESAS);

  const aiPrompt = `Analyze the PRC REE subject score trends across years for SLSU students. 
The subjects are: EE (Electrical Engineering), MATH (Mathematics), and ESAS (Engineering Sciences and Allied Subjects).
Comment on which subject is the strongest predictor of passing, which has the most variance, and what faculty should prioritize.`;
  const aiCacheKey = `subject-trends-${selectedYear || "all"}-${JSON.stringify(displayData).slice(0, 100)}`;

  if (!hasData) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: IIEE.dimText, fontSize: 12 }}>
        No subject score data. Ensure <code>subjectByYear</code> contains EE_avg, MATH_avg, ESAS_avg fields with non-zero values.
      </div>
    );
  }

  // Build table data for single-year view
  const subjects = [
    { key: "EE",   label: "Electrical Engineering",              color: IIEE.blue    },
    { key: "MATH", label: "Mathematics",                         color: IIEE.passGreen },
    { key: "ESAS", label: "Engineering Sciences & Allied Subj.", color: IIEE.orange   },
  ];

  if (selectedYear && displayData.length === 1) {
    const row = displayData[0];
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
          {subjects.map((s) => (
            <div key={s.key} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: IIEE.dimText, marginBottom: 8 }}>{s.key}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {row[s.key] != null ? Number(row[s.key]).toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: 10, color: IIEE.dimText, marginTop: 4 }}>{s.label}</div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: s.color, width: `${Math.min((row[s.key] / 100) * 100, 100)}%`, transition: "width .6s" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={subjects.map((s) => ({ name: s.key, value: row[s.key] ?? 0, color: s.color }))} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" />
            <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="pts" />
            <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(1)} pts`} />} />
            <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3" label={{ value: "Pass (70)", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
            <Bar dataKey="value" name="Score" radius={[6,6,0,0]}>
              {subjects.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <AIInsight prompt={aiPrompt} data={{ year: selectedYear, scores: row }} cacheKey={aiCacheKey} />
      </div>
    );
  }

  // Multi-year: grouped bar + line trend
  return (
    <div>
      {/* Subject summary table */}
      <table className="subject-table" style={{ marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Year</th>
            <th style={{ color: IIEE.blue }}>EE</th>
            <th style={{ color: IIEE.passGreen }}>MATH</th>
            <th style={{ color: IIEE.orange }}>ESAS</th>
            <th>Best Subject</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((d, i) => {
            const vals = { EE: d.EE, MATH: d.MATH, ESAS: d.ESAS };
            const best = Object.entries(vals).filter(([,v]) => v != null).sort(([,a],[,b]) => b - a)[0];
            return (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: IIEE.white }}>{d.year}</td>
                <td style={{ color: IIEE.blue, fontWeight: 700 }}>{d.EE != null ? Number(d.EE).toFixed(1) : "—"}</td>
                <td style={{ color: IIEE.passGreen, fontWeight: 700 }}>{d.MATH != null ? Number(d.MATH).toFixed(1) : "—"}</td>
                <td style={{ color: IIEE.orange, fontWeight: 700 }}>{d.ESAS != null ? Number(d.ESAS).toFixed(1) : "—"}</td>
                <td style={{ color: IIEE.gold, fontWeight: 600, fontSize: 11 }}>
                  {best ? `${best[0]} (${Number(best[1]).toFixed(1)})` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Grouped bar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={displayData} margin={{ top: 8, right: 16, left: -4, bottom: 4 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.10)" />
          <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[50, 90]} tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="pts" />
          <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(1)} pts`} />} />
          <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3"
            label={{ value: "Pass (70)", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
          <Legend iconType="circle" iconSize={9}
            formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
          <Bar dataKey="EE"   name="EE"   fill={IIEE.blue}       radius={[4,4,0,0]} maxBarSize={28} />
          <Bar dataKey="MATH" name="MATH" fill={IIEE.passGreen}  radius={[4,4,0,0]} maxBarSize={28} />
          <Bar dataKey="ESAS" name="ESAS" fill={IIEE.orange}     radius={[4,4,0,0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>

      {/* Line trend */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
          Score Trend Lines
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={displayData} margin={{ top: 4, right: 16, left: -4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.08)" />
            <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 90]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} unit="pts" />
            <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(1)} pts`} />} />
            <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="EE"   stroke={IIEE.blue}      strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} connectNulls />
            <Line type="monotone" dataKey="MATH" stroke={IIEE.passGreen} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} connectNulls />
            <Line type="monotone" dataKey="ESAS" stroke={IIEE.orange}    strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 7, fill: IIEE.gold }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AIInsight prompt={aiPrompt} data={displayData} cacheKey={aiCacheKey} />
    </div>
  );
}

/* ─── FIX 3: Predicted vs Actual (uses test2025 data) ────────── */
function PredictedActualSection({ scatterData: rawScatter, modelInfo }) {
  // Build safe scatter data — works whether from scatterData prop OR test2025 evaluation
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
          ℹ️ The 2025 test set (DATA_TEST, 21 rows) should provide this data after model training.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Quick stats */}
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
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Scatter plot */}
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
          {/* Perfect prediction line */}
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

/* ─── FIX 4: Survey Section Visualization ────────────────────── */
function SurveySectionViz({ sectionScores }) {
  const data = useMemo(() => {
    const raw = sectionScores ?? [];
    return raw
      .filter((s) => s && s.label)
      .map((s) => ({
        section:  String(s.label || s.section || ""),
        pass_avg: Number(s.pass_avg ?? s.passer_avg ?? 0),
        fail_avg: Number(s.fail_avg ?? s.failer_avg ?? 0),
        items:    s.items ?? 0,
      }))
      .filter((s) => s.section && (s.pass_avg > 0 || s.fail_avg > 0));
  }, [sectionScores]);

  const hasData = data.length > 0;

  if (!hasData) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: IIEE.dimText, fontSize: 12 }}>
        No section score data. Ensure <code>sectionScores</code> prop has items with <code>label</code>, <code>pass_avg</code>, <code>fail_avg</code>.
      </div>
    );
  }

  // Compute scale — Likert 1-4, normalize to 0-100 for bar widths
  const maxVal = Math.max(...data.map((d) => Math.max(d.pass_avg, d.fail_avg)), 4);
  const toWidth = (v) => `${(v / maxVal) * 100}%`;

  return (
    <div>
      {/* Custom side-by-side progress bars — most reliable visualization */}
      <div className="survey-legend">
        <div className="survey-legend-item">
          <div className="survey-legend-dot" style={{ background: IIEE.passGreen }} />
          <span>Passers avg (lower = more agreement)</span>
        </div>
        <div className="survey-legend-item">
          <div className="survey-legend-dot" style={{ background: IIEE.failRed }} />
          <span>Failers avg</span>
        </div>
      </div>

      {data.map((s, i) => (
        <div key={i} className="survey-section-row">
          <div className="survey-section-label">
            <span className="survey-section-name">{s.section}</span>
            <span className="survey-section-vals">
              <span style={{ color: IIEE.passGreen }}>{s.pass_avg.toFixed(2)}</span>
              <span style={{ color: IIEE.dimText }}> vs </span>
              <span style={{ color: IIEE.failRed }}>{s.fail_avg.toFixed(2)}</span>
            </span>
          </div>
          {/* Pass bar */}
          <div className="survey-track" style={{ marginBottom: 2 }}>
            <div className="survey-bar-pass" style={{ width: toWidth(s.pass_avg) }} />
          </div>
          {/* Fail bar */}
          <div className="survey-track">
            <div className="survey-bar-fail" style={{ width: toWidth(s.fail_avg) }} />
          </div>
        </div>
      ))}

      {/* Also render a proper recharts bar chart as secondary view */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
          Bar Chart View — Passers vs Failers by Section
        </div>
        <ResponsiveContainer width="100%" height={Math.max(data.length * 32 + 60, 200)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 32, left: 90, bottom: 4 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.08)" horizontal={false} />
            <XAxis
              type="number"
              domain={[1, 4]}
              tick={{ fill: IIEE.dimText, fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickCount={4}
            />
            <YAxis
              type="category"
              dataKey="section"
              tick={{ fill: IIEE.muted, fontSize: 10 }}
              axisLine={false} tickLine={false}
              width={85}
            />
            <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(2)} avg`} />} />
            <Legend
              iconType="circle" iconSize={9}
              formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 11 }}>{v}</span>}
            />
            <Bar dataKey="pass_avg" name="Passers" fill={IIEE.passGreen} radius={[0,4,4,0]} barSize={9} />
            <Bar dataKey="fail_avg" name="Failers" fill={IIEE.failRed}   radius={[0,4,4,0]} barSize={9} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar as tertiary — only if data > 3 sections */}
      {data.length >= 4 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Radar View
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="rgba(245,197,24,.15)" />
              <PolarAngleAxis dataKey="section" tick={{ fill: IIEE.muted, fontSize: 10 }} />
              <Radar name="Passers" dataKey="pass_avg" stroke={IIEE.passGreen} fill={IIEE.passGreen} fillOpacity={0.25} strokeWidth={2} />
              <Radar name="Failers" dataKey="fail_avg" stroke={IIEE.failRed}   fill={IIEE.failRed}   fillOpacity={0.15} strokeWidth={2} />
              <Legend iconType="circle" iconSize={9}
                formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
              <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(2)} avg`} />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ModelOverviewDashboard({
  dashFilters, setDashFilters, availableYears, availablePeriods, localInsights,
  ov, pieData: propPieData, passByYear, passByPeriod, subjectByYear,
  passByStrand, passByDur, reviewPieData: propReviewPieData,
  sectionScores, weakestQ,
  modelInfo, scatterData,
}) {
  const [mode, setMode] = useState("institutional");
  const [activePie, setActivePie] = useState(null);

  const selectedYear = dashFilters?.year || "";

  const yearRows = useMemo(() => {
    if (!selectedYear) return passByYear ?? [];
    return (passByYear ?? []).filter((d) => String(d.label) === String(selectedYear));
  }, [selectedYear, passByYear]);

  const displayRows = useMemo(
    () => (yearRows.length ? yearRows : (passByYear ?? [])),
    [yearRows, passByYear]
  );

  const kpi = useMemo(() => {
    if (!selectedYear || !yearRows.length) return ov ?? {};
    const yr = yearRows[0];
    const p = yr.passers ?? Math.round((yr.pass_rate / 100) * (yr.total || 0));
    const f = (yr.total || 0) - p;
    return {
      total_students:    yr.total ?? 0,
      total_passers:     p,
      total_failers:     f,
      overall_pass_rate: yr.pass_rate ?? 0,
      avg_gwa_passers:   ov?.avg_gwa_passers ?? 0,
      avg_gwa_failers:   ov?.avg_gwa_failers ?? 0,
    };
  }, [selectedYear, yearRows, ov]);

  const pieData = useMemo(() => {
    if (!selectedYear || !yearRows.length) return propPieData ?? [];
    const p = kpi.total_passers;
    const f = kpi.total_failers;
    return [
      { name: "Passers", value: p, color: IIEE.passGreen },
      { name: "Failers", value: f, color: IIEE.failRed },
    ];
  }, [selectedYear, yearRows, kpi, propPieData]);

  const stackData = useMemo(() =>
    displayRows.map((d) => {
      const p = d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0));
      return { label: d.label, Passers: p, Failers: (d.total ?? 0) - p };
    }),
  [displayRows]);

  const subjectTrend = useMemo(() => {
    const rows = subjectByYear ?? [];
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return rows.map((d) => ({
      year: String(d.label || d.year || ""),
      EE:   toNum(d.EE_avg   ?? d.EE_Avg   ?? d.EE),
      MATH: toNum(d.MATH_avg ?? d.MATH_Avg ?? d.MATH),
      ESAS: toNum(d.ESAS_avg ?? d.ESAS_Avg ?? d.ESAS),
    }));
  }, [subjectByYear]);

  /* Period data — respect period and year filters */
  const periodData = useMemo(() => {
    const base = passByPeriod ?? [];
    if (dashFilters?.period) {
      return base.filter((d) => d.label === dashFilters.period);
    }
    if (dashFilters?.year) {
      return base.filter((d) => String(d.year) === String(dashFilters.year));
    }
    return base;
  }, [passByPeriod, dashFilters]);

  /* Survey radar */
  const radarData = useMemo(() =>
    (sectionScores ?? []).map((s) => ({
      section:  s.label,
      Passers:  Number(s.pass_avg ?? 0),
      Failers:  Number(s.fail_avg ?? 0),
    })),
  [sectionScores]);

  const scatter = useMemo(() => scatterData ?? [], [scatterData]);

  const regTrend = useMemo(() => {
    if (!modelInfo) return [];
    return [
      { model: "Reg A", r2: (modelInfo.regression_a?.r2 ?? 0) * 100, label: "EE+MATH+ESAS+GWA" },
      { model: "Reg B", r2: (modelInfo.regression_b?.r2 ?? 0) * 100, label: "GWA+Survey" },
    ];
  }, [modelInfo]);

  const strandData = useMemo(() =>
    (passByStrand ?? []).map((s) => ({ name: s.label, passRate: Number(s.pass_rate ?? 0), total: s.total })),
  [passByStrand]);

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

          <Divider label="Key Performance Indicators — 333 Examiners (2022-2025)" icon="📌" />
          <DsTag label="DATA_UPCOMING — 333 rows, 2022-2025" />

          <div className="metrics-grid" style={{ marginBottom: 28 }}>
            <KPI label="Total Examiners"   value={kpi.total_students ?? "—"}   icon="👥" color={IIEE.blue}      sub="All exam sittings 2022-2025" />
            <KPI label="Total Passers"     value={kpi.total_passers  ?? "—"}   icon="✅" color={IIEE.passGreen} />
            <KPI label="Total Failers"     value={kpi.total_failers  ?? "—"}   icon="❌" color={IIEE.failRed}   />
            <KPI label="Overall Pass Rate" value={pct(kpi.overall_pass_rate)}  icon="📊"
              color={(kpi.overall_pass_rate ?? 0) >= 70 ? IIEE.passGreen : IIEE.amber}
              sub="PRC passing threshold = 70%" />
            <KPI label="Avg GWA Passers"   value={num(kpi.avg_gwa_passers)}    icon="🎓" color={IIEE.passGreen} sub="Lower = better (PH scale)" />
            <KPI label="Avg GWA Failers"   value={num(kpi.avg_gwa_failers)}    icon="📉" color={IIEE.failRed}   sub="Lower = better (PH scale)" />
          </div>

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
                  <Bar dataKey="pass_rate" name="Pass Rate" radius={[6,6,0,0]}
                    activeBar={{ fill: IIEE.gold, filter: "drop-shadow(0 0 8px rgba(245,197,24,.6))" }}>
                    {displayRows.map((e, i) => <Cell key={i} fill={barColor(e.pass_rate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card icon="📦" title="Pass / Fail Counts by Year" sub="Absolute cohort composition" fullWidth
              note="Stacked bars show how many students passed vs failed per year."
              insight="2022 had the largest cohort (103) yet lowest pass rate (52.4%) — high volume, high risk.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stackData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} />
                  <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* ── FIX 1: Exam Period Analysis ── */}
          <Divider label="Exam Period Analysis (Apr vs Aug)" icon="📆" />
          <Card icon="📆" title="Pass Rate by Exam Period" sub="April vs August sittings per year — auto-parsed from period labels" fullWidth>
            <ExamPeriodSection periodData={periodData.length ? periodData : passByPeriod} selectedYear={selectedYear} />
          </Card>

          {/* ── FIX 2: Subject Score Trends ── */}
          <Divider label="Subject Score Trends" icon="📐" />
          <div className="g2" style={{ marginBottom: 20 }}>
            <Card icon="📐" title="Subject Averages by Year" sub="EE, MATH, ESAS — DATA_UPCOMING" fullWidth>
              <SubjectTrendsSection subjectTrend={subjectTrend} selectedYear={selectedYear} kpi={kpi} />
            </Card>

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

          {/* ── FIX 3: Predicted vs Actual ── */}
          <SecCard num="2" icon="🎯" title="Predicted vs Actual Rating"
            subtitle="DATA_TEST (21 rows, 2025 Apr+Aug) — completely held-out evaluation set">
            <DsTag label="DATA_TEST — 21 rows, 2025 held-out" />
            <PredictedActualSection scatterData={scatter} modelInfo={modelInfo} />
          </SecCard>

          {/* ── FIX 4: Survey Analysis ── */}
          <SecCard num="3" icon="📋" title="Survey Analysis"
            subtitle="DATA_MODEL (60 rows with full survey) — 10 sections, 73 Likert items">
            <DsTag label="DATA_MODEL — 60 rows with survey answers" />

            <div className="g2" style={{ marginBottom: 16 }}>
              <Card inner icon="🕸️" title="Survey Section: Passers vs Failers" sub="Avg Likert score per section (lower = more agreement)" blueTint
                note="Scores closer to 1.0 = Strongly Agree. Faculty and Dept Culture show the widest gap between passers and failers."
                insight="Passers score lower (more agreement) on Faculty and Facilities — these are key institutional differentiators.">
                <SurveySectionViz sectionScores={sectionScores} />
              </Card>

              <Card inner icon="📊" title="Section Avg: Passers vs Failers" sub="Side-by-side per survey section" blueTint
                note="Faculty (1.47 vs 2.18) and Dept Review (1.95 vs 2.24) have the largest pass/fail gaps."
                insight="Stronger faculty ratings from passers suggest instructor quality is a measurable predictor.">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(radarData.length * 36 + 60, 200)}>
                    <BarChart
                      data={radarData}
                      layout="vertical"
                      margin={{ top: 0, right: 24, left: 90, bottom: 0 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" horizontal={false} />
                      <XAxis type="number" domain={[1, 3]} tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} tickCount={5} />
                      <YAxis type="category" dataKey="section" tick={{ fill: IIEE.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={85} />
                      <Tooltip content={<Tip fmt={(v) => `${Number(v).toFixed(2)} avg`} />} />
                      <Legend iconType="circle" iconSize={9}
                        formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 11 }}>{v}</span>} />
                      <Bar dataKey="Passers" fill={IIEE.passGreen} radius={[0,4,4,0]} barSize={9} />
                      <Bar dataKey="Failers" fill={IIEE.failRed}   radius={[0,4,4,0]} barSize={9} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ padding: 24, textAlign: "center", color: IIEE.dimText, fontSize: 12 }}>
                    No section data. Ensure <code>sectionScores</code> prop is populated.
                  </div>
                )}
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
                      { label: "With Review (n=39)", pass_rate: 82.1 },
                      { label: "No Review (n=21)",   pass_rate: 14.3 },
                    ]}
                    layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.1)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                    <Tooltip content={<Tip fmt={(v) => `${v?.toFixed(1)}%`} />} />
                    <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                    <Bar dataKey="pass_rate" name="Pass Rate" radius={[0,6,6,0]}>
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
                    <Bar dataKey="pass_rate" name="Pass Rate" radius={[0,6,6,0]}>
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
                  <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="4 3"
                    label={{ value: "70%", fill: IIEE.gold, fontSize: 10, position: "insideTopRight" }} />
                  <Bar dataKey="passRate" name="Pass Rate" radius={[6,6,0,0]}>
                    {strandData.map((e, i) => <Cell key={i} fill={barColor(e.passRate)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </SecCard>

          {/* Section 4 — Curriculum Gap */}
          <SecCard num="4" icon="🏫" title="Curriculum Gap Analysis & Recommendations"
            subtitle="Weakest survey indicators — where students feel least supported">
            <DsTag label="DATA_MODEL — survey responses, 60 rows" />
            <div className="g2">
              {weakAreas.length > 0 ? (
                <Card inner icon="⚠️" title="Weakest Survey Items" sub="Highest avg score = least agreement (most concern)" blueTint
                  note="Items with higher average scores indicate areas where students feel least agreement (scale: 1=Strongly Agree to 4=Strongly Disagree)."
                  insight="These items point to specific curriculum or support gaps that directly affect board readiness.">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}
                      margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
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
