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
import {
  num,
} from "./ProfessorShared";

/* ─── IIEE Design Tokens (mirrors ModelOverviewDashboard) ─────────────────── */
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

/* ─── Shared Styles (mirrors ModelOverviewDashboard exactly) ─────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  .reg-dash * { box-sizing: border-box; }
  .reg-dash {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  .reg-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .reg-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .reg-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .reg-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px, 1.5vw, 11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .reg-badge.gold  { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .reg-badge.blue  { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .reg-badge.teal  { background:rgba(45,212,191,0.12); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .reg-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .reg-hero-title .hl-a { color:${IIEE.teal}; }
  .reg-hero-title .hl-b { color:${IIEE.indigo}; }
  .reg-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  .reg-body { padding:clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  .reg-divider {
    display:flex; align-items:center; gap:10px; margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px);
  }
  .reg-divider-line {
    flex:1; height:1px;
    background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .reg-divider-line.rev {
    background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%);
  }
  .reg-divider-label {
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
    font-size:clamp(22px, 4.5vw, 30px); font-weight:700; line-height:1;
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

  .model-compare-label {
    display:inline-flex; align-items:center; gap:6px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; border-radius:4px; padding:2px 8px; font-family:'Montserrat',sans-serif;
  }
  .model-compare-label.a { background:rgba(45,212,191,0.12); border:1px solid rgba(45,212,191,0.25); color:${IIEE.teal}; }
  .model-compare-label.b { background:rgba(129,140,248,0.12); border:1px solid rgba(129,140,248,0.25); color:${IIEE.indigo}; }

  .ref-table { width:100%; border-collapse:collapse; }
  .ref-table th {
    font-size:clamp(10px, 1.3vw, 11px); font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:${IIEE.dimText};
    padding:clamp(6px, 1.5vw, 9px) clamp(8px, 1.5vw, 12px); border-bottom:1px solid rgba(245,197,24,0.12);
    text-align:left; font-family:'Montserrat',sans-serif;
  }
  .ref-table td {
    padding:clamp(8px, 1.5vw, 10px) clamp(8px, 1.5vw, 12px);
    border-bottom:1px solid rgba(30,41,59,0.6);
    font-size:clamp(12px, 1.5vw, 13px); font-family:'Inter',sans-serif;
  }
  .ref-table tr:last-child td { border-bottom:none; }
  .ref-table tr:hover td { background:rgba(245,197,24,0.03); }

  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }

  .fade-in { animation:fadeIn .45s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  @media (max-width:960px) {
    .g2 { grid-template-columns:1fr; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); }
    .reg-body { padding:12px; }
  }
  @media (max-width:640px) {
    .reg-hero { padding:14px 12px 10px; }
    .sec-body { padding:10px 12px; }
    .sec-head { padding:10px 12px 8px; gap:10px; }
    .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .reg-body { padding:8px; }
    .g2 { gap:8px; }
    .chart-card { padding:10px; }
  }
  @media (max-width:540px) {
    .metrics-grid { grid-template-columns:1fr; }
    .reg-body { padding:6px; }
  }
`;

/* ─── Local sub-components (same pattern as ModelOverviewDashboard) ───────── */
function Divider({ label, icon }) {
  return (
    <div className="reg-divider">
      <div className="reg-divider-line" />
      <div className="reg-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="reg-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="metric-card" style={{ "--ac": color }}>
      <span className="metric-icon">{icon}</span>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? "—"}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function Card({ icon, title, sub, children, note, insight, inner, blueTint }) {
  return (
    <div className={`chart-card${inner ? " inner" : ""}`}>
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

function Prog({ value, max = 1, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
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

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE.white, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{typeof p.value === "number" ? p.value.toFixed(4) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfessorRegressionMetricsDashboard({ modelInfo }) {

  const dataSourceText = modelInfo?.data_source           ? `Primary source: ${modelInfo.data_source}`                    : "Primary source: DATA_EVALUATION (2025)";
  const trainingText   = modelInfo?.dataset_sizes?.training ? `Training split: ${modelInfo.dataset_sizes.training} rows` : "Training split: ~123 rows";
  const evalText       = modelInfo?.dataset_sizes?.evaluation ? `Evaluation split: ${modelInfo.dataset_sizes.evaluation} rows` : "Evaluation split: ~36 rows";

  const rA = modelInfo?.regression_a ?? {};
  const rB = modelInfo?.regression_b ?? {};

  const barData = [
    { name: "MAE",  A: rA.mae, B: rB.mae },
    { name: "RMSE", A: rA.rmse, B: rB.rmse },
    { name: "R²",   A: rA.r2,  B: rB.r2  },
  ];

  /* MAE/RMSE use the larger of the two as a scale max for progress bars */
  const maxMae  = Math.max(rA.mae  ?? 0, rB.mae  ?? 0) || 1;
  const maxRmse = Math.max(rA.rmse ?? 0, rB.rmse ?? 0) || 1;

  const refRows = [
    ["MAE",      rA.mae,  rB.mae,  "Same as target", "Low",      "Minimize avg error"],
    ["RMSE",     rA.rmse, rB.rmse, "Same as target", "High",     "Avoid large misses"],
    ["R² Score", rA.r2,   rB.r2,   "Unitless (0–1)", "Moderate", "Maximize explained variance"],
  ];

  return (
    <div className="reg-dash fade-in">
      <style>{styles}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="reg-hero">
        <div className="reg-hero-badges">
          <span className="reg-badge gold">📈 Regression</span>
          <span className="reg-badge blue">🧭 SLSU REE Analytics</span>
        </div>
        <h2 className="reg-hero-title">
          Rating Prediction <span className="hl-a">Model A</span> &amp; <span className="hl-b">Model B</span>
        </h2>
        <p className="reg-hero-sub">System metrics for rating prediction model development (Model A &amp; B).</p>
      </div>

      <div className="reg-body">

        {/* ── Data-source badges ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <span style={{ padding: "6px 10px", borderRadius: 8, background: IIEE.goldGlow, color: IIEE.gold, fontSize: 11, fontWeight: 600, border: `1px solid ${IIEE.goldBorder}` }}>{dataSourceText}</span>
          <span style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(56,189,248,0.12)", color: IIEE.blue, fontSize: 11, fontWeight: 600, border: "1px solid rgba(56,189,248,0.25)" }}>{trainingText}</span>
          <span style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(34,197,94,0.12)", color: IIEE.passGreen, fontSize: 11, fontWeight: 600, border: "1px solid rgba(34,197,94,0.25)" }}>{evalText}</span>
        </div>

        {/* ── Quick Insight banner ─────────────────────────────────────── */}
        <div className="insight-banner">
          Model A RMSE: <strong style={{ color: IIEE.teal }}>{num(rA.rmse, 3)}</strong> &nbsp;|&nbsp;
          Model B RMSE: <strong style={{ color: IIEE.indigo }}>{num(rB.rmse, 3)}</strong>. &nbsp;
          R² values indicate Model B explains more variance when a larger sample is available; MAE gap suggests model-target bias can be reduced via feature recalibration.
        </div>

        {/* ── Section 1 — KPI cards ────────────────────────────────────── */}
        <Divider label="Regression KPIs — Model A vs Model B" icon="📐" />

        <SecCard num="1" icon="📈" title="Regression Model Performance" subtitle="MAE, RMSE, R² for Model A (subject scores) and Model B (survey+GWA)">
          <DsTag label={`Training: ${modelInfo?.dataset_sizes?.training ?? "~123 rows"} | Evaluation: ${modelInfo?.dataset_sizes?.evaluation ?? "~36 rows"} (2025)`} />

          {/* Model labels */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span className="model-compare-label a">● Model A — EE + MATH + ESAS + GWA</span>
            <span className="model-compare-label b">● Model B — GWA + Survey responses</span>
          </div>

          <div className="metrics-grid" style={{ marginBottom: 24 }}>
            {[
              { label: "Reg A — MAE",  value: num(rA.mae,  2), color: IIEE.teal,   icon: "📉", sub: "Mean absolute error (lower = better)" },
              { label: "Reg A — RMSE", value: num(rA.rmse, 2), color: IIEE.teal,   icon: "📈", sub: "Root mean squared error (lower = better)" },
              { label: "Reg A — R²",   value: num(rA.r2,   3), color: IIEE.teal,   icon: "🎯", sub: "Variance explained (higher = better)" },
              { label: "Reg B — MAE",  value: num(rB.mae,  2), color: IIEE.indigo, icon: "📉", sub: "Mean absolute error (lower = better)" },
              { label: "Reg B — RMSE", value: num(rB.rmse, 2), color: IIEE.indigo, icon: "📈", sub: "Root mean squared error (lower = better)" },
              { label: "Reg B — R²",   value: num(rB.r2,   3), color: IIEE.indigo, icon: "🎯", sub: "Variance explained (higher = better)" },
            ].map((m, i) => (
              <KPI key={i} label={m.label} value={m.value} color={m.color} icon={m.icon} sub={m.sub} />
            ))}
          </div>

          {/* Progress bars */}
          <div className="g2">
            <Card inner icon="🟢" title="Model A Progress" sub="EE + MATH + ESAS + GWA features" blueTint>
              {[
                { label: "MAE",  value: rA.mae,  max: maxMae,  color: IIEE.teal,   isLower: true },
                { label: "RMSE", value: rA.rmse, max: maxRmse, color: IIEE.teal,   isLower: true },
                { label: "R²",   value: rA.r2,   max: 1,       color: IIEE.passGreen, isLower: false },
              ].map((m, i) => (
                <div key={i}>
                  <div className="model-row">
                    <span className="model-row-label">{m.label} {m.isLower ? "(lower = better)" : "(higher = better)"}</span>
                    <span className="model-row-val" style={{ color: m.color }}>{num(m.value, 4)}</span>
                  </div>
                  <Prog value={m.isLower ? (m.max - (m.value ?? 0)) : (m.value ?? 0)} max={m.max} color={m.color} />
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 8, fontSize: 12, color: IIEE.muted }}>
                Feature set: EE, MATH, ESAS, GWA — larger combined dataset.
              </div>
            </Card>

            <Card inner icon="🟣" title="Model B Progress" sub="GWA + Survey response features" blueTint>
              {[
                { label: "MAE",  value: rB.mae,  max: maxMae,  color: IIEE.indigo, isLower: true },
                { label: "RMSE", value: rB.rmse, max: maxRmse, color: IIEE.indigo, isLower: true },
                { label: "R²",   value: rB.r2,   max: 1,       color: IIEE.blue,   isLower: false },
              ].map((m, i) => (
                <div key={i}>
                  <div className="model-row">
                    <span className="model-row-label">{m.label} {m.isLower ? "(lower = better)" : "(higher = better)"}</span>
                    <span className="model-row-val" style={{ color: m.color }}>{num(m.value, 4)}</span>
                  </div>
                  <Prog value={m.isLower ? (m.max - (m.value ?? 0)) : (m.value ?? 0)} max={m.max} color={m.color} />
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 8, fontSize: 12, color: IIEE.muted }}>
                Feature set: GWA + Survey responses — smaller focused dataset.
              </div>
            </Card>
          </div>
        </SecCard>

        {/* ── Section 2 — Bar chart + Reference table ──────────────────── */}
        <Divider label="Model A vs Model B — Visual Comparison" icon="📊" />

        <SecCard num="2" icon="📊" title="Regression Metrics Comparison" subtitle="MAE, RMSE, R² side-by-side — Model A (teal) vs Model B (indigo)">
          <DsTag label="DATA_EVALUATION — evaluation split, 2025" />

          <div className="g2">
            <Card icon="📊" title="Model A vs Model B Bar Chart" sub="MAE, RMSE, R² side-by-side"
              note="Lower bars for MAE and RMSE indicate better accuracy. Higher bars for R² indicate better variance explanation."
              insight={`Model A R² = ${num(rA.r2, 3)} vs Model B R² = ${num(rB.r2, 3)} — subject scores give stronger predictive power.`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                  <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} wrapperStyle={{ outline: "none" }} />
                  <Legend iconType="circle" iconSize={9}
                    formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>Model {v}</span>} />
                  <Bar dataKey="A" name="A" fill={IIEE.teal}   radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B" name="B" fill={IIEE.indigo} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card icon="📐" title="Regression Metrics Reference" sub="Error types and optimization goals" blueTint>
              <table className="ref-table">
                <thead>
                  <tr>
                    {["Metric", "Model A", "Model B", "Units", "Sensitivity", "Goal"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refRows.map(([name, valA, valB, units, sens, goal], i) => (
                    <tr key={i}>
                      <td style={{ color: IIEE.white, fontWeight: 700 }}>{name}</td>
                      <td style={{ color: IIEE.teal,   fontWeight: 700 }}>{typeof valA === "number" ? valA.toFixed(4) : "—"}</td>
                      <td style={{ color: IIEE.indigo, fontWeight: 700 }}>{typeof valB === "number" ? valB.toFixed(4) : "—"}</td>
                      <td style={{ color: IIEE.muted }}>{units}</td>
                      <td style={{ color: IIEE.dimText }}>{sens}</td>
                      <td style={{ color: IIEE.dimText }}>{goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(245,197,24,0.04)", borderLeft: `2px solid ${IIEE.goldBorder}`, borderRadius: "0 7px 7px 0", fontSize: 12, color: IIEE.muted, lineHeight: 1.6 }}>
                MAE measures average prediction error. RMSE penalizes large errors more heavily. R² indicates proportion of variance in the target explained by the model.
              </div>
            </Card>
          </div>
        </SecCard>

      </div>
    </div>
  );
}