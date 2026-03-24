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
  DashboardGuide,
  FilterPanel,
  InsightBox,
  MONTH_NAMES,
  num,
} from "./ProfessorShared";

/* ─── IIEE Design Tokens (shared with Overview) ──────────────────────────── */
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  .iiee-model * { box-sizing: border-box; }

  .iiee-model {
    font-family: 'DM Sans', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
  }

  /* ── Hero Header ── */
  .mo-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 60%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: 28px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .mo-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events: none;
  }
  .mo-hero::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 200px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .mo-hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.3);
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${IIEE.blue};
    margin-bottom: 10px;
  }
  .mo-hero-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 30px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${IIEE.white};
    margin: 0 0 4px;
    line-height: 1;
  }
  .mo-hero-title span { color: ${IIEE.blue}; }
  .mo-hero-sub {
    font-size: 12px;
    color: ${IIEE.muted};
    margin: 0;
  }

  /* ── Body ── */
  .mo-body { padding: 24px 28px; }

  /* ── Filter Strip ── */
  .mo-filter-strip {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(11,20,55,0.92);
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 24px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  /* ── Section Card ── */
  .mo-section {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 18px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: border-color 0.18s ease;
  }
  .mo-section:hover { border-color: rgba(245,197,24,0.35); }
  .mo-section-head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(245,197,24,0.1);
    background: linear-gradient(90deg, rgba(245,197,24,0.04) 0%, transparent 100%);
  }
  .mo-section-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    font-weight: 900;
    color: ${IIEE.gold};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .mo-section-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    flex-shrink: 0;
  }
  .mo-section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${IIEE.white};
    margin: 0 0 2px;
    line-height: 1.1;
  }
  .mo-section-sub {
    font-size: 11px;
    color: ${IIEE.dimText};
    margin: 0;
  }
  .mo-section-body { padding: 18px 20px; }

  /* ── Metric Grid inside section ── */
  .mo-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
    gap: 12px;
  }
  .mo-metric {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px 12px;
    position: relative;
    overflow: hidden;
  }
  .mo-metric::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--mc, ${IIEE.gold});
  }
  .mo-metric-icon { font-size: 16px; margin-bottom: 8px; display: block; }
  .mo-metric-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${IIEE.dimText};
    margin-bottom: 4px;
  }
  .mo-metric-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: var(--mc, ${IIEE.gold});
    line-height: 1;
  }
  .mo-metric-sub { font-size: 10px; color: ${IIEE.dimText}; margin-top: 3px; }

  /* ── Chart Card (inside section) ── */
  .mo-chart-card {
    background: rgba(11,20,55,0.6);
    border: 1px solid rgba(245,197,24,0.12);
    border-radius: 14px;
    padding: 16px;
    transition: border-color 0.18s ease;
  }
  .mo-chart-card:hover { border-color: rgba(245,197,24,0.3); }
  .mo-chart-head {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 12px;
  }
  .mo-chart-icon-sm {
    width: 30px; height: 30px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    background: rgba(56,189,248,0.1);
    border: 1px solid rgba(56,189,248,0.25);
    flex-shrink: 0;
  }
  .mo-chart-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${IIEE.white};
    margin: 0 0 1px;
  }
  .mo-chart-subtitle { font-size: 11px; color: ${IIEE.dimText}; margin: 0; }
  .mo-chart-desc {
    margin-top: 10px;
    padding: 8px 12px;
    background: rgba(56,189,248,0.04);
    border-left: 2px solid rgba(56,189,248,0.3);
    border-radius: 0 7px 7px 0;
    font-size: 11px;
    color: ${IIEE.muted};
    line-height: 1.6;
  }
  .mo-chart-desc strong { color: ${IIEE.blue}; }

  /* ── Charts 2-col ── */
  .mo-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .mo-full  { margin-top: 14px; }

  /* ── External sheet input ── */
  .mo-sheet-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mo-sheet-input {
    background: rgba(15,28,77,0.9);
    border: 1px solid rgba(245,197,24,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: ${IIEE.white};
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.18s ease;
  }
  .mo-sheet-input::placeholder { color: ${IIEE.dimText}; }
  .mo-sheet-input:focus { border-color: ${IIEE.gold}; }
  .mo-sheet-btn {
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 700;
    color: ${IIEE.gold};
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.18s ease, opacity 0.18s ease;
  }
  .mo-sheet-btn:hover { background: rgba(245,197,24,0.22); }
  .mo-sheet-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .mo-sheet-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    color: ${IIEE.muted};
  }
  .mo-sheet-table td {
    padding: 6px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  /* ── Correlation Block ── */
  .mo-corr-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: rgba(11,20,55,0.55);
    border: 1px solid rgba(245,197,24,0.1);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 14px;
  }
  .mo-corr-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${IIEE.white};
    margin: 0 0 8px;
  }
  .mo-corr-text {
    font-size: 12.5px;
    line-height: 1.7;
    color: ${IIEE.muted};
  }

  /* ── Reliability Text ── */
  .mo-reliability-banner {
    background: linear-gradient(90deg, rgba(34,197,94,0.08) 0%, transparent 100%);
    border-left: 3px solid ${IIEE.passGreen};
    border-radius: 0 10px 10px 0;
    padding: 10px 16px;
    font-size: 12.5px;
    color: ${IIEE.muted};
    margin-bottom: 14px;
  }

  /* ── AI Recommendations ── */
  .mo-reco-card {
    background: linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(245,197,24,0.04) 100%);
    border: 1px solid rgba(245,197,24,0.25);
    border-radius: 14px;
    padding: 16px 18px;
  }
  .mo-reco-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${IIEE.gold};
    margin: 0 0 10px;
  }
  .mo-reco-list { list-style: none; padding: 0; margin: 0; }
  .mo-reco-list li {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 0;
    font-size: 12.5px;
    color: rgba(245,197,24,0.85);
    line-height: 1.5;
    border-bottom: 1px solid rgba(245,197,24,0.08);
  }
  .mo-reco-list li:last-child { border-bottom: none; }
  .mo-reco-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${IIEE.gold};
    margin-top: 5px;
    flex-shrink: 0;
  }

  /* ── Insight pills ── */
  .mo-insight-banner {
    border-left: 3px solid ${IIEE.gold};
    background: linear-gradient(90deg, rgba(245,197,24,0.08) 0%, transparent 100%);
    border-radius: 0 10px 10px 0;
    padding: 10px 16px;
    margin-bottom: 18px;
    font-size: 12.5px;
    color: ${IIEE.white};
  }

  /* ── Smart viz footer ── */
  .mo-smart-viz {
    background: rgba(11,20,55,0.7);
    border: 1px solid rgba(245,197,24,0.12);
    border-radius: 14px;
    padding: 16px 20px;
    margin-top: 8px;
    font-size: 13px;
    color: ${IIEE.muted};
    line-height: 1.6;
  }
  .mo-smart-viz strong { color: ${IIEE.white}; font-weight: 600; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mo-2col { grid-template-columns: 1fr; }
    .mo-corr-block { grid-template-columns: 1fr; }
    .mo-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .mo-body { padding: 14px; }
  }
  @media (max-width: 540px) {
    .mo-hero { padding: 18px 16px 14px; }
    .mo-section-body { padding: 14px; }
    .mo-sheet-row { grid-template-columns: 1fr; }
  }

  .fade-in { animation: moFadeIn 0.45s ease both; }
  @keyframes moFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
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

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function IIEETooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
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

function SectionCard({ number, icon, title, subtitle, children }) {
  return (
    <div className="mo-section">
      <div className="mo-section-head">
        <div className="mo-section-icon">{icon}</div>
        <div style={{ flex: 1 }}>
          {number && <div className="mo-section-num">Section {number}</div>}
          <h3 className="mo-section-title">{title}</h3>
          {subtitle && <p className="mo-section-sub">{subtitle}</p>}
        </div>
      </div>
      <div className="mo-section-body">{children}</div>
    </div>
  );
}

function MoMetric({ icon, label, value, sub, color = IIEE.gold }) {
  return (
    <div className="mo-metric" style={{ "--mc": color }}>
      <span className="mo-metric-icon">{icon}</span>
      <div className="mo-metric-label">{label}</div>
      <div className="mo-metric-value">{value}</div>
      {sub && <div className="mo-metric-sub">{sub}</div>}
    </div>
  );
}

function MoChart({ icon, title, subtitle, children, description, insight }) {
  return (
    <div className="mo-chart-card">
      <div className="mo-chart-head">
        <div className="mo-chart-icon-sm">{icon}</div>
        <div>
          <div className="mo-chart-title">{title}</div>
          {subtitle && <div className="mo-chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
      {(description || insight) && (
        <div className="mo-chart-desc">
          {description}
          {insight && <><br /><strong>↳ {insight}</strong></>}
        </div>
      )}
    </div>
  );
}

function CorrelationBlock({ title, explanation, points = [], color = IIEE.blue, xKey = "x", yKey = "y", xLabel = "X", yLabel = "Y" }) {
  return (
    <div className="mo-corr-block">
      <div>
        <div className="mo-corr-title">{title}</div>
        <p className="mo-corr-text">{explanation}</p>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey={xKey} tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} name={xLabel} />
            <YAxis dataKey={yKey} tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} name={yLabel} />
            <Tooltip content={<IIEETooltip />} />
            <Scatter data={points} fill={color} opacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function ModelOverviewDashboard({
  dashFilters,
  setDashFilters,
  availableYears,
  localInsights,
  ov,
  passByYear,
  passByStrand,
  passByReview,
  passByDur,
  sectionScores,
  weakestQ,
  subjectTrends,
  filteredSubjectTrends,
  correlation,
  scatterData,
  pieData,
  reviewPieData,
}) {
  const [sheetUrl, setSheetUrl]       = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError]   = useState("");
  const [sheetPreview, setSheetPreview] = useState([]);

  const totalSurveyResponses = useMemo(
    () => sectionScores.reduce((acc, x) => acc + Number(x.pass || 0) + Number(x.fail || 0), 0),
    [sectionScores]
  );

  const monthlyTrend = useMemo(() => {
    if (!passByYear.length) return [];
    return passByYear.map((x, idx) => ({
      month: MONTH_NAMES[idx % MONTH_NAMES.length],
      passRate: Number(x.pass_rate ?? 0),
    }));
  }, [passByYear]);

  const yearlyTrend = useMemo(
    () => passByYear.map((x) => ({ year: x.label, passRate: Number(x.pass_rate ?? 0), total: Number(x.total ?? 0) })),
    [passByYear]
  );

  const strandSummary = useMemo(
    () => passByStrand.map((x) => ({ name: x.label, passRate: Number(x.pass_rate ?? 0), total: Number(x.total ?? 0) })),
    [passByStrand]
  );

  const weakAreas = useMemo(() => weakestQ.slice(0, 6), [weakestQ]);

  const reliabilityText = useMemo(() => {
    if (!scatterData?.length) return "Prediction reliability will appear once prediction-vs-actual records are available.";
    const avgAbsError =
      scatterData.reduce((acc, row) => acc + Math.abs(Number(row.predicted || 0) - Number(row.actual || 0)), 0) /
      scatterData.length;
    return `Average absolute prediction gap is ${avgAbsError.toFixed(2)} points across ${scatterData.length} records.`;
  }, [scatterData]);

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
    <div className="iiee-model fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="mo-hero">
        <div className="mo-hero-badge">🧭 Model Dashboard</div>
        <h2 className="mo-hero-title">Model <span>Overview</span></h2>
        <p className="mo-hero-sub">
          Consolidated view of model behavior, data patterns, reliability, and curriculum insights.
        </p>
      </div>

      <div className="mo-body">

        {/* ── Sticky Filter Strip ── */}
        <div className="mo-filter-strip">
          <DashboardGuide
            title="How to Read This Dashboard"
            items={[
              { label: "Model behavior", text: "Sections summarize predictors, reliability, and prediction consistency." },
              { label: "Data context",   text: "Trend/distribution visuals show cohort patterns by year, subject, review, and strand." },
              { label: "Actionable",     text: "Correlation and curriculum sections highlight weak areas and guide intervention." },
            ]}
          />
          <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
        </div>

        {/* ── Insights ── */}
        {localInsights?.length > 0 && (
          <div className="mo-insight-banner">
            <InsightBox insights={localInsights} />
          </div>
        )}

        {/* ── 1. Model Summary ── */}
        <SectionCard number="1" icon="🧠" title="Model Summary" subtitle="Purpose, structure, and major predictor groups.">
          <div className="mo-metrics-grid">
            <MoMetric icon="🎓" label="GWA Signal" value={num(ov.avg_gwa_failers - ov.avg_gwa_passers)} sub="gap (failers − passers)" color={IIEE.indigo} />
            <MoMetric icon="📘" label="Math / EE / ESAS" value="3 Core" sub="subject score predictors" color={IIEE.blue} />
            <MoMetric icon="🧾" label="Survey Inputs" value={`${sectionScores.length}`} sub="survey sections considered" color={IIEE.teal} />
            <MoMetric icon="🎯" label="Pass Threshold" value="70%" sub="system pass reference" color={IIEE.amber} />
          </div>
        </SectionCard>

        {/* ── 2. Dataset Overview ── */}
        <SectionCard number="2" icon="🗃️" title="Dataset Overview" subtitle="PRC outcomes and survey response summaries from current system data.">
          <div className="mo-2col">
            <MoChart icon="🥧" title="PRC Result Distribution" subtitle="Passers vs Failers"
              description="Donut breakdown of exam outcomes across the full dataset."
              insight="Green-dominant chart = strong cohort performance.">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={85} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </MoChart>

            <MoChart icon="📊" title="Survey Section Summary" subtitle={`Aggregated responses: ${totalSurveyResponses}`}
              description="Compares pass/fail counts per survey section — reveals where performance diverges.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectionScores.map((s) => ({ name: s.label, pass: s.pass, fail: s.fail }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis                tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="pass" name="Passers" fill={IIEE.passGreen} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fail" name="Failers" fill={IIEE.failRed}   radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </MoChart>
          </div>
        </SectionCard>

        {/* ── 3. External Data Integration ── */}
        <SectionCard number="3" icon="🔗" title="External Data Integration" subtitle="Google Sheets read-only preview — no change to backend logic.">
          <div className="mo-sheet-row">
            <input
              className="mo-sheet-input"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheets link…"
            />
            <button
              className="mo-sheet-btn"
              onClick={handlePreviewSheet}
              disabled={sheetLoading}
            >
              {sheetLoading ? "Loading…" : "Preview"}
            </button>
          </div>
          {sheetError && <p style={{ fontSize: 12, color: IIEE.failRed, margin: "4px 0 0" }}>{sheetError}</p>}
          {sheetPreview.length > 0 && (
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid rgba(245,197,24,0.15)`, background: "rgba(11,20,55,0.7)", padding: 10, marginTop: 10 }}>
              <table className="mo-sheet-table">
                <tbody>
                  {sheetPreview.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j}>{cell || "—"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* ── 4. Visualization & Trends ── */}
        <SectionCard number="4" icon="📈" title="Data Visualization & Trends" subtitle="Monthly, yearly, and subject trend behavior with indicators.">
          <div className="mo-2col">
            <MoChart icon="🗓️" title="Monthly Trends" subtitle="Line chart for trend continuity"
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
            </MoChart>

            <MoChart icon="📅" title="Yearly Trends" subtitle="Bar chart for year-over-year comparison"
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
            </MoChart>
          </div>

          {subjectTrends.length > 0 && (
            <div className="mo-full">
              <MoChart icon="📘" title="Subject Trends" subtitle="EE, MATH, ESAS trend line behavior"
                description="Tracks subject-level average score movement across cohort years."
                insight="Diverging lines suggest uneven subject performance that requires targeted intervention.">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={filteredSubjectTrends.length ? filteredSubjectTrends : subjectTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                    <XAxis dataKey="year" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<IIEETooltip />} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                    <Line dataKey="EE_avg"   name="EE"   stroke={IIEE.blue}   strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="MATH_avg" name="MATH" stroke={IIEE.indigo} strokeWidth={2} dot={{ r: 3 }} />
                    <Line dataKey="ESAS_avg" name="ESAS" stroke={IIEE.teal}   strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </MoChart>
            </div>
          )}
        </SectionCard>

        {/* ── 5. Model Reliability ── */}
        <SectionCard number="5" icon="🧪" title="Model Reliability" subtitle="Predicted vs actual consistency and confidence behavior.">
          <div className="mo-reliability-banner">{reliabilityText}</div>
          <MoChart icon="🎯" title="Predicted vs Actual" subtitle="Scatter = relationship / consistency"
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
                <Scatter data={scatterData || []} fill={IIEE.passGreen} opacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </MoChart>
        </SectionCard>

        {/* ── 6. Student Performance Summary ── */}
        <SectionCard number="6" icon="👥" title="Student Performance Summary" subtitle="Strand, review duration, and review attendance split.">
          <div className="mo-2col">
            <MoChart icon="🎓" title="SHS Strand Summary" subtitle="Pass rate by academic strand"
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
            </MoChart>

            <MoChart icon="⏱️" title="Review Duration Summary" subtitle="Pass rate by duration group"
              description="Shows how the length of a board review program affects exam success rates."
              insight="Longer review durations generally yield higher pass rates across all cohorts.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={passByDur}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis                 tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                  <Bar dataKey="pass_rate" name="Pass Rate" fill={IIEE.orange} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </MoChart>
          </div>

          <div className="mo-full">
            <MoChart icon="🥧" title="Review Attendance Distribution" subtitle="Pie chart distribution"
              description="Proportion of students who attended formal board review versus those who did not.">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={reviewPieData} dataKey="value" innerRadius={55} outerRadius={90}>
                    {reviewPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<IIEETooltip />} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </MoChart>
          </div>
        </SectionCard>

        {/* ── 7. Curriculum Gap Analysis ── */}
        <SectionCard number="7" icon="🏫" title="Curriculum Gap Analysis" subtitle="Weakest curriculum-linked survey signals with recommendations.">
          <div className="mo-2col">
            <MoChart icon="⚠️" title="Weak Curriculum Areas" subtitle="Highest disagreement survey points"
              description="Survey indicators with the lowest average scores — signals where students feel least supported."
              insight="Low scores here indicate curriculum or facilities areas needing urgent review.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                  <XAxis dataKey="key"  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis               tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(2)}/4`} />} />
                  <Bar dataKey="avg" name="Avg Score" fill={IIEE.failRed} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </MoChart>

            <div className="mo-reco-card">
              <div className="mo-reco-title">⚡ AI Recommendations</div>
              <ul className="mo-reco-list">
                {[
                  "Prioritize facilities and department review interventions for immediate impact.",
                  "Align syllabus and mock tests more closely with board exam patterns.",
                  "Track improvements quarterly using the same weakest-item indicators.",
                ].map((rec, i) => (
                  <li key={i}>
                    <span className="mo-reco-dot" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* ── 8. Correlation Analysis ── */}
        <SectionCard number="8" icon="🧮" title="Correlation Analysis Module" subtitle="One correlation per section — explanation left, chart right.">
          <CorrelationBlock
            title="GWA vs Predicted Rating"
            explanation="Lower GWA (better academic standing) should generally align with stronger predicted scores. This validates GWA as the primary model predictor."
            points={(scatterData || []).map((x) => ({ x: x.actual, y: x.predicted }))}
            color={IIEE.blue}
            xLabel="Actual"
            yLabel="Predicted"
          />
          <CorrelationBlock
            title="Math vs EE Trend Relationship"
            explanation="Subject trend movement shows whether yearly improvements are synchronized across core board domains. Synchronized trends indicate curriculum coherence."
            points={(subjectTrends || []).map((s) => ({ x: Number(s.MATH_avg || 0), y: Number(s.EE_avg || 0) }))}
            color={IIEE.teal}
            xLabel="MATH"
            yLabel="EE"
          />
          <CorrelationBlock
            title="Survey Factors vs Pass Rate"
            explanation="Survey section averages reveal cognitive, non-cognitive, and institutional relationships with board outcomes. Higher survey satisfaction often predicts better results."
            points={(sectionScores || []).map((s) => ({ x: Number(s.pass || 0), y: Number(s.fail || 0) }))}
            color={IIEE.indigo}
            xLabel="Passers Avg"
            yLabel="Failers Avg"
          />
        </SectionCard>

        {/* ── Smart Viz Footer ── */}
        <div className="mo-smart-viz">
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