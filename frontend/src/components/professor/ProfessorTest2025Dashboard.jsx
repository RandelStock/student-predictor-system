import ExamineeDetailPanel from "../ExamineeDetailPanel";
import {
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
import { pct, num } from "./ProfessorShared";

/* ─── Design Tokens (mirrors ModelOverviewDashboard exactly) ──── */
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

/* ─── Styles (mirrors ModelOverviewDashboard) ─────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');

  .t25-wrap * { box-sizing: border-box; }
  .t25-wrap {
    font-family: 'Inter', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    font-size: clamp(13px, 1vw, 14px);
    line-height: 1.6;
  }

  /* ── Hero ── */
  .t25-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: clamp(14px, 4vw, 28px) clamp(16px, 5vw, 32px) clamp(14px, 3vw, 22px);
    position: relative; overflow: hidden;
  }
  .t25-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:280px; height:280px;
    background: radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 65%);
    pointer-events:none;
  }
  .t25-hero-badges { display:flex; gap:8px; margin-bottom:clamp(8px, 2vw, 12px); flex-wrap:wrap; }
  .t25-badge {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:4px; padding:3px 10px; font-size:clamp(10px, 1.5vw, 11px);
    font-weight:700; letter-spacing:0.12em; text-transform:uppercase; font-family:'Montserrat',sans-serif;
  }
  .t25-badge.gold  { background:${IIEE.goldGlow}; border:1px solid ${IIEE.goldBorder}; color:${IIEE.gold}; }
  .t25-badge.blue  { background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:${IIEE.blue}; }
  .t25-badge.teal  { background:rgba(45,212,191,0.10); border:1px solid rgba(45,212,191,0.3); color:${IIEE.teal}; }
  .t25-hero-title {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(22px, 5vw, 32px); font-weight:700; text-transform:uppercase;
    letter-spacing:0.04em; color:${IIEE.white}; margin:0 0 4px; line-height:1;
  }
  .t25-hero-title .ac { color:${IIEE.teal}; }
  .t25-hero-sub { font-size:clamp(12px, 2vw, 14px); color:${IIEE.muted}; margin:0; font-family:'Inter',sans-serif; }

  /* ── Body ── */
  .t25-body { padding:clamp(14px, 4vw, 24px) clamp(16px, 5vw, 28px) clamp(32px, 6vw, 48px); }

  /* ── Section Cards (mirrors .sec-card) ── */
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

  /* ── Chart Cards (mirrors .chart-card) ── */
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
  .chart-icon.teal { background:rgba(45,212,191,0.1); border:1px solid rgba(45,212,191,0.25); }
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

  /* ── KPI Cards (mirrors .metric-card) ── */
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
  .metrics-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(clamp(120px, 20vw, 155px),1fr));
    gap:clamp(10px, 2vw, 14px); margin-bottom:0;
  }

  /* ── Divider (mirrors .comb-divider) ── */
  .t25-divider { display:flex; align-items:center; gap:10px; margin:clamp(18px, 4vw, 28px) 0 clamp(10px, 2vw, 16px); }
  .t25-divider-line { flex:1; height:1px; background:linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%); }
  .t25-divider-line.rev { background:linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%); }
  .t25-divider-label {
    font-family:'Montserrat',sans-serif;
    font-size:clamp(10px, 1.5vw, 12px); font-weight:700; letter-spacing:0.16em;
    text-transform:uppercase; color:${IIEE.gold}; white-space:nowrap; display:flex; align-items:center; gap:6px;
  }

  /* ── DS Tag ── */
  .ds-tag {
    display:inline-flex; align-items:center; gap:4px;
    font-size:clamp(10px, 1.5vw, 11px); font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; background:rgba(56,189,248,0.1);
    border:1px solid rgba(56,189,248,0.2); border-radius:4px;
    padding:2px 8px; color:${IIEE.blue}; margin-bottom:12px; font-family:'Montserrat',sans-serif;
  }

  /* ── Grid layouts ── */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px, 2vw, 16px); }
  .g2 .fw { grid-column:1/-1; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(12px, 2vw, 16px); }

  /* ── Prog bar ── */
  .prog-track { height:6px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; margin-bottom:10px; }
  .prog-fill   { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }
  .model-row   { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .model-row-label { font-size:clamp(11px, 1.5vw, 12px); color:${IIEE.muted}; font-family:'Inter',sans-serif; }
  .model-row-val   { font-size:clamp(11px, 1.5vw, 12px); font-weight:700; font-family:'Montserrat',sans-serif; }

  /* ── Confusion matrix ── */
  .cm-cell {
    width:80px; height:80px; display:flex; align-items:center; justify-content:center;
    border-radius:10px; font-size:22px; font-weight:800; font-family:'Montserrat',sans-serif;
  }

  /* ── Examinee section ── */
  .examinee-wrap {
    background:rgba(11,20,55,0.65); border:1px solid rgba(245,197,24,0.12);
    border-radius:14px; padding:clamp(12px, 2vw, 16px);
  }

  /* ── State cards (loading / error / empty) ── */
  .state-box {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:clamp(32px, 6vw, 56px); text-align:center; gap:12px;
  }
  .state-emoji { font-size:clamp(36px, 7vw, 48px); }
  .state-title { font-family:'Montserrat',sans-serif; font-size:clamp(14px, 2.5vw, 16px); font-weight:700; color:${IIEE.white}; }
  .state-sub   { font-size:clamp(12px, 1.5vw, 13px); color:${IIEE.muted}; max-width:340px; line-height:1.7; }

  /* ── Error banner ── */
  .error-banner {
    background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.22);
    border-radius:14px; padding:clamp(14px, 2vw, 20px); display:flex; gap:12px; align-items:flex-start;
  }
  .error-icon { font-size:20px; flex-shrink:0; margin-top:1px; }
  .error-text { font-size:clamp(12px, 1.5vw, 13px); color:#fca5a5; line-height:1.7; font-family:'Inter',sans-serif; margin:0; }

  /* ── Responsive ── */
  @media (max-width:1200px) { .g3 { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:960px) {
    .g2,.g3 { grid-template-columns:1fr; }
    .g2 .fw,.g3 .fw { grid-column:1; }
    .metrics-grid { grid-template-columns:repeat(2,1fr); }
    .t25-body { padding:12px; }
  }
  @media (max-width:640px) {
    .t25-hero { padding:14px 12px 10px; }
    .sec-body { padding:10px 12px; }
    .sec-head { padding:10px 12px 8px; gap:10px; }
    .metrics-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .t25-body { padding:8px; }
    .g2,.g3 { gap:8px; }
    .chart-card { padding:10px; }
  }
  @media (max-width:540px) {
    .t25-hero { padding:10px 10px 8px; }
    .metrics-grid { grid-template-columns:1fr; }
    .t25-body { padding:6px; }
    .g2,.g3 { gap:6px; }
    .sec-body { padding:8px; }
    .chart-card { padding:8px; }
  }

  .fade-in { animation:fadeIn .45s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

/* ─── Local sub-components (mirrors ModelOverviewDashboard) ───── */
function Divider({ label, icon }) {
  return (
    <div className="t25-divider">
      <div className="t25-divider-line" />
      <div className="t25-divider-label">{icon && <span>{icon}</span>}{label}</div>
      <div className="t25-divider-line rev" />
    </div>
  );
}

function KPI({ label, value, icon, color = IIEE.gold, sub, hint }) {
  return (
    <div className="metric-card" style={{ "--ac": color }} title={hint}>
      <span className="metric-icon">{icon}</span>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function Card({ icon, title, sub, children, note, insight, inner, fullWidth, blueTint, tealTint }) {
  const iconClass = `chart-icon${blueTint ? " blue" : tealTint ? " teal" : ""}`;
  return (
    <div className={`chart-card${inner ? " inner" : ""}${fullWidth ? " fw" : ""}`}>
      <div className="chart-head">
        <div className={iconClass}>{icon}</div>
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

function Prog({ value, color }) {
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: IIEE.navyMid, border: `1px solid ${IIEE.goldBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
      <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>Examinee</div>
      <div style={{ color: IIEE.muted }}>Actual: <strong style={{ color: IIEE.white }}>{d?.actual?.toFixed(2)}</strong></div>
      <div style={{ color: IIEE.muted }}>Predicted: <strong style={{ color: IIEE.white }}>{d?.predicted?.toFixed(2)}</strong></div>
      <div style={{ marginTop: 4, color: d?.passed ? IIEE.passGreen : IIEE.failRed }}>
        {d?.passed ? "✅ Passed" : "❌ Failed"}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function ProfessorTest2025Dashboard({
  testLoading,
  test2025,
  scatterData,
  test2025Records,
  selectedTestIdx,
  setSelectedTestIdx,
  test2025Run,
  test2025RunLoading,
}) {
  const cls = test2025?.classification ?? {};
  const regA = test2025?.regression?.a ?? {};
  const regB = test2025?.regression?.b ?? {};
  const cm   = test2025?.confusion_matrix;

  const passedScatter = (scatterData ?? []).filter((d) => d.passed);
  const failedScatter = (scatterData ?? []).filter((d) => !d.passed);

  const acc       = cls.accuracy  ?? 0;
  const precision = cls.precision ?? 0;
  const recall    = cls.recall    ?? 0;
  const f1        = cls.f1        ?? 0;

  return (
    <div className="t25-wrap fade-in">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <div className="t25-hero">
        <div className="t25-hero-badges">
          <span className="t25-badge gold">🧪 Held-Out Evaluation</span>
          <span className="t25-badge blue">📂 DATA_EVALUATION.csv</span>
          <span className="t25-badge teal">📅 2025 Only</span>
        </div>
        <h2 className="t25-hero-title">
          2025 Final <span className="ac">Defense</span> Evaluation
        </h2>
        <p className="t25-hero-sub">
          Held-out test set evaluation — <strong style={{ color: IIEE.white }}>DATA_EVALUATION.csv</strong> (2025 cohort) · Pass threshold: 70%
        </p>
      </div>

      <div className="t25-body">

        {/* ── Loading state ── */}
        {testLoading && (
          <div className="sec-card">
            <div className="state-box">
              <div className="state-emoji">⏳</div>
              <div className="state-title">Loading 2025 Metrics…</div>
              <div className="state-sub">Fetching evaluation report from server. This may take a moment.</div>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {!testLoading && test2025?.error && (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{test2025.error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!testLoading && !test2025?.error && !test2025 && (
          <div className="sec-card">
            <div className="state-box">
              <div className="state-emoji">📭</div>
              <div className="state-title">No 2025 Evaluation Data</div>
              <div className="state-sub">Run <code style={{ color: IIEE.gold }}>train_model.py</code> and ensure the <code style={{ color: IIEE.gold }}>/dashboard</code> endpoint returns 2025 test metrics.</div>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {!testLoading && !test2025?.error && test2025 && (
          <>

            {/* ════ SECTION 1: Classification KPIs ════ */}
            <Divider label="Classification Performance — Pass / Fail Prediction" icon="🎯" />
            <DsTag label="DATA_EVALUATION — 2025 held-out · Random Forest Classifier" />

            <div className="metrics-grid" style={{ marginBottom: 28 }}>
              <KPI
                label="Test Accuracy"
                value={pct(acc * 100)}
                icon="🎯"
                color={acc >= 0.9 ? IIEE.passGreen : IIEE.amber}
                sub="Overall correct predictions"
                hint="Overall correct pass/fail predictions on held-out 2025 test set."
              />
              <KPI
                label="Precision"
                value={pct(precision * 100)}
                icon="🔬"
                color={IIEE.blue}
                sub="Low false positives"
                hint="Correct pass predictions out of all pass predictions."
              />
              <KPI
                label="Recall"
                value={pct(recall * 100)}
                icon="📡"
                color={IIEE.indigo}
                sub="True passes captured"
                hint="Actual passers correctly identified by the model."
              />
              <KPI
                label="F1-Score"
                value={pct(f1 * 100)}
                icon="⚖️"
                color={IIEE.teal}
                sub="Precision–recall balance"
                hint="Harmonic mean of precision and recall."
              />
            </div>

            {/* ── Classification metric progress bars ── */}
            <SecCard num="1" icon="📊" title="Classification Metrics Detail"
              subtitle="Pass / Fail prediction quality on 2025 held-out evaluation set">
              <div className="g2">
                <Card inner icon="📈" title="Metric Breakdown" sub="All four classification scores" blueTint>
                  {[
                    { label: "Accuracy",  value: acc,       color: acc >= 0.9 ? IIEE.passGreen : IIEE.amber },
                    { label: "Precision", value: precision, color: IIEE.blue },
                    { label: "Recall",    value: recall,    color: IIEE.indigo },
                    { label: "F1-Score",  value: f1,        color: IIEE.teal },
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

                <Card inner icon="💡" title="Interpretation" sub="What these numbers mean" blueTint
                  note="A Recall of 100% means no actual passer was missed — the safest outcome for a board exam predictor."
                  insight={`F1 of ${pct(f1 * 100)} reflects the balance between catching passers and avoiding false alarms.`}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: "🎯", label: "Accuracy", text: `${pct(acc * 100)} of all 2025 predictions were correct.` },
                      { icon: "🔬", label: "Precision", text: `When model predicts PASS, it is correct ${pct(precision * 100)} of the time.` },
                      { icon: "📡", label: "Recall", text: `${pct(recall * 100)} of all actual passers were correctly identified.` },
                      { icon: "⚖️", label: "F1-Score", text: `Balanced measure combining precision and recall.` },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, color: IIEE.gold, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: 12, color: IIEE.muted, lineHeight: 1.6 }}>{item.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </SecCard>

            {/* ════ SECTION 2: Regression ════ */}
            <Divider label="Regression Performance — Total Rating Prediction" icon="📉" />

            <SecCard num="2" icon="📉" title="Regression Model Results"
              subtitle="Predicted PRC Total Rating — evaluated on 2025 held-out set">
              <DsTag label="DATA_EVALUATION — 2025 only · Ridge Regression (Model A & B)" />
              <div className="g2">

                <Card inner icon="📉" title="Regression A" sub="EE + MATH + ESAS + GWA" tealTint
                  note="Model A uses full subject scores and GWA — highest predictive fidelity."
                  insight={`R² of ${num(regA.r2, 4)} means ${pct((regA.r2 ?? 0) * 100)} of rating variance explained.`}>
                  {[["R²", "r2", 4], ["MAE", "mae", 4], ["MSE", "mse", 4], ["RMSE", "rmse", 4]].map(([label, key, d]) => (
                    <div key={key}>
                      <div className="model-row" style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="model-row-label">{label}</span>
                        <span className="model-row-val" style={{ color: IIEE.teal }}>{num(regA[key], d)}</span>
                      </div>
                      {key === "r2" && <Prog value={(regA.r2 ?? 0) * 100} color={IIEE.teal} />}
                    </div>
                  ))}
                </Card>

                <Card inner icon="🧠" title="Regression B" sub="GWA + Survey only (no subjects)" blueTint
                  note="Model B validates survey-only predictive capacity without subject exam scores."
                  insight={`R² of ${num(regB.r2, 4)} — lower than A, confirming subject scores add significant signal.`}>
                  {[["R²", "r2", 4], ["MAE", "mae", 4], ["MSE", "mse", 4], ["RMSE", "rmse", 4]].map(([label, key, d]) => (
                    <div key={key}>
                      <div className="model-row" style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="model-row-label">{label}</span>
                        <span className="model-row-val" style={{ color: IIEE.indigo }}>{num(regB[key], d)}</span>
                      </div>
                      {key === "r2" && <Prog value={(regB.r2 ?? 0) * 100} color={IIEE.indigo} />}
                    </div>
                  ))}
                </Card>

                {/* R² comparison quick-view */}
                <Card inner icon="⚖️" title="Model A vs B — R² Comparison" sub="Higher R² = better rating prediction" fullWidth
                  note="Model A benefits from subject score inputs; Model B relies on GWA + survey responses only.">
                  <div style={{ display: "flex", gap: clamp(12, 24), flexWrap: "wrap" }}>
                    {[
                      { label: "Reg A (EE+MATH+ESAS+GWA)", value: regA.r2 ?? 0, color: IIEE.teal },
                      { label: "Reg B (GWA+Survey)",        value: regB.r2 ?? 0, color: IIEE.indigo },
                    ].map((m, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: IIEE.muted }}>{m.label}</span>
                          <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 700, color: m.color }}>{num(m.value, 4)}</span>
                        </div>
                        <div className="prog-track" style={{ height: 10 }}>
                          <div className="prog-fill" style={{ width: `${Math.min(m.value * 100, 100)}%`, background: m.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </SecCard>

            {/* ════ SECTION 3: Scatter plot ════ */}
            {(scatterData?.length ?? 0) > 0 && (
              <>
                <Divider label="Actual vs Predicted Scores" icon="🎯" />
                <SecCard num="3" icon="🎯" title="Actual vs Predicted Rating"
                  subtitle="DATA_EVALUATION (2025) — closer to diagonal = better prediction">
                  <DsTag label="DATA_EVALUATION — 2025 held-out scatter" />

                  {/* Quick stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Test Records",  value: scatterData.length,                        color: IIEE.blue,       icon: "📋" },
                      { label: "Passed",        value: passedScatter.length,                       color: IIEE.passGreen,  icon: "✅" },
                      { label: "Failed",        value: failedScatter.length,                       color: IIEE.failRed,    icon: "❌" },
                      { label: "Pass Rate",     value: pct((passedScatter.length / (scatterData.length || 1)) * 100), color: IIEE.teal, icon: "📊" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: IIEE.cardBg, border: `1px solid ${s.color}30`, borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 10, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height={310}>
                    <ScatterChart margin={{ top: 12, right: 24, left: -8, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,.12)" />
                      <XAxis type="number" dataKey="actual" name="Actual" domain={[40, 100]}
                        tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false}
                        label={{ value: "Actual PRC Rating", position: "insideBottom", offset: -10, fill: IIEE.muted, fontSize: 11 }} />
                      <YAxis type="number" dataKey="predicted" name="Predicted" domain={[40, 100]}
                        tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false}
                        label={{ value: "Predicted Rating", angle: -90, position: "insideLeft", fill: IIEE.muted, fontSize: 11 }} />
                      <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                      <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]}
                        stroke="rgba(245,197,24,.35)" strokeDasharray="5 4"
                        label={{ value: "Perfect prediction", position: "insideTopLeft", fill: IIEE.gold, fontSize: 10 }} />
                      <ReferenceLine x={70} stroke={IIEE.failRed} strokeDasharray="4 3"
                        label={{ value: "Pass 70", position: "top", fill: IIEE.failRed, fontSize: 10 }} />
                      <ReferenceLine y={70} stroke={IIEE.failRed} strokeDasharray="4 3" />
                      <Scatter data={passedScatter} fill={IIEE.passGreen} fillOpacity={0.85} r={5} name="Passed" />
                      <Scatter data={failedScatter} fill={IIEE.failRed}   fillOpacity={0.85} r={5} name="Failed" />
                      <Legend iconType="circle" iconSize={9}
                        formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                    </ScatterChart>
                  </ResponsiveContainer>

                  <div className="chart-note" style={{ marginTop: 12 }}>
                    Points near the diagonal line represent accurate predictions. The vertical and horizontal dashed lines mark the 70% pass threshold.
                    <strong> ↳ Points in the top-right quadrant are correctly predicted passers.</strong>
                  </div>
                </SecCard>
              </>
            )}

            {/* ════ SECTION 4: Confusion Matrix ════ */}
            <Divider label="Confusion Matrix — Pass / Fail Classification" icon="🧾" />

            <SecCard num="4" icon="🧾" title="Confusion Matrix"
              subtitle="Actual vs Predicted on DATA_EVALUATION (2025)">
              <DsTag label="Parsed from evaluation_report.txt — re-run train_model.py after dataset changes" />

              {cm ? (
                <div className="g2">
                  {/* Heatmap */}
                  <Card inner icon="🗂️" title="Heatmap View" sub="Visual pass/fail prediction grid">
                    <p style={{ fontSize: 11, color: IIEE.dimText, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Confusion Matrix Heatmap</p>
                    <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: 6, width: "fit-content" }}>
                      {/* Header row */}
                      <div />
                      <div style={{ textAlign: "center", fontSize: 11, color: IIEE.dimText, padding: "4px 8px", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>Pred FAIL</div>
                      <div style={{ textAlign: "center", fontSize: 11, color: IIEE.dimText, padding: "4px 8px", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>Pred PASS</div>

                      {/* Actual FAIL row */}
                      <div style={{ fontSize: 11, color: IIEE.failRed, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center", fontFamily: "'Montserrat',sans-serif" }}>Act FAIL</div>
                      <div className="cm-cell" style={{ background: `${IIEE.passGreen}20`, border: `1px solid ${IIEE.passGreen}40`, color: IIEE.passGreen }}>
                        {cm.actual_fail?.pred_fail ?? "—"}
                      </div>
                      <div className="cm-cell" style={{ background: `${IIEE.failRed}15`, border: `1px solid ${IIEE.failRed}30`, color: IIEE.failRed }}>
                        {cm.actual_fail?.pred_pass ?? "—"}
                      </div>

                      {/* Actual PASS row */}
                      <div style={{ fontSize: 11, color: IIEE.passGreen, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center", fontFamily: "'Montserrat',sans-serif" }}>Act PASS</div>
                      <div className="cm-cell" style={{ background: `${IIEE.failRed}15`, border: `1px solid ${IIEE.failRed}30`, color: IIEE.failRed }}>
                        {cm.actual_pass?.pred_fail ?? "—"}
                      </div>
                      <div className="cm-cell" style={{ background: `${IIEE.passGreen}20`, border: `1px solid ${IIEE.passGreen}40`, color: IIEE.passGreen }}>
                        {cm.actual_pass?.pred_pass ?? "—"}
                      </div>
                    </div>

                    <div style={{ marginTop: 14, fontSize: 12, color: IIEE.dimText, lineHeight: 1.7 }}>
                      <span style={{ color: IIEE.passGreen, fontWeight: 700 }}>Green cells</span> = correct predictions (TN + TP) ·{" "}
                      <span style={{ color: IIEE.failRed, fontWeight: 700 }}>Red cells</span> = misclassifications (FP + FN)
                    </div>
                  </Card>

                  {/* Table + interpretation */}
                  <Card inner icon="📋" title="Table View" sub="Breakdown by actual class" blueTint
                    note="Parsed from evaluation_report.txt. Re-run train_model.py after dataset changes.">
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr>
                            {["Actual \\ Predicted", "FAIL", "PASS"].map((h) => (
                              <th key={h} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: h === "Actual \\ Predicted" ? "left" : "right", color: IIEE.dimText, fontWeight: 700, fontSize: 11, fontFamily: "'Montserrat',sans-serif" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: "10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: IIEE.failRed, fontFamily: "'Montserrat',sans-serif" }}>FAIL</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", fontWeight: 800, color: IIEE.passGreen, fontFamily: "'Montserrat',sans-serif" }}>{cm.actual_fail?.pred_fail ?? "—"}</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", color: IIEE.failRed }}>{cm.actual_fail?.pred_pass ?? "—"}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: "10px", fontWeight: 700, color: IIEE.passGreen, fontFamily: "'Montserrat',sans-serif" }}>PASS</td>
                            <td style={{ padding: "10px", textAlign: "right", color: IIEE.failRed }}>{cm.actual_pass?.pred_fail ?? "—"}</td>
                            <td style={{ padding: "10px", textAlign: "right", fontWeight: 800, color: IIEE.passGreen, fontFamily: "'Montserrat',sans-serif" }}>{cm.actual_pass?.pred_pass ?? "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "True Negatives (TN)", value: cm.actual_fail?.pred_fail, color: IIEE.passGreen, desc: "Actual FAIL → correctly predicted FAIL" },
                        { label: "False Positives (FP)", value: cm.actual_fail?.pred_pass, color: IIEE.failRed, desc: "Actual FAIL → wrongly predicted PASS" },
                        { label: "False Negatives (FN)", value: cm.actual_pass?.pred_fail, color: IIEE.amber, desc: "Actual PASS → wrongly predicted FAIL" },
                        { label: "True Positives (TP)", value: cm.actual_pass?.pred_pass, color: IIEE.passGreen, desc: "Actual PASS → correctly predicted PASS" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: item.color, fontFamily: "'Montserrat',sans-serif" }}>{item.label}</div>
                            <div style={{ fontSize: 10, color: IIEE.dimText, marginTop: 1 }}>{item.desc}</div>
                          </div>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 20, fontWeight: 800, color: item.color }}>{item.value ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="state-box" style={{ padding: "24px 0" }}>
                  <div className="state-emoji">🗂️</div>
                  <div className="state-title">Confusion Matrix Unavailable</div>
                  <div className="state-sub">Ensure <code style={{ color: IIEE.gold }}>evaluation_report.txt</code> is present and <code style={{ color: IIEE.gold }}>/dashboard</code> returns confusion_matrix data.</div>
                </div>
              )}
            </SecCard>

            {/* ════ SECTION 5: Row-level examinee check ════ */}
            <Divider label="Row-Level Examinee Check" icon="🧪" />

            <SecCard num="5" icon="🧪" title="Examinee Detail Panel"
              subtitle="Select a 2025 examinee row to view predicted vs actual results and survey answers">
              <DsTag label="DATA_EVALUATION.csv — 2025 examinee records" />
              <div className="examinee-wrap">
                <ExamineeDetailPanel
                  records={test2025Records}
                  selectedIdx={selectedTestIdx}
                  onSelect={setSelectedTestIdx}
                  runData={test2025Run}
                  runLoading={test2025RunLoading}
                />
              </div>
            </SecCard>

          </>
        )}
      </div>
    </div>
  );
}

/* ─── tiny helper (avoids division in JSX) ───────────────────── */
function clamp(a, b) { return `clamp(${a}px, 2vw, ${b}px)`; }