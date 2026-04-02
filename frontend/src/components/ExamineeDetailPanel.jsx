/**
 * ExamineeDetailPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows full examinee details for the "Select a 2025 Examinee" row-level check
 * in the Final Defense tab.
 *
 * Props
 * ─────
 * records        – array from /defense/test-2025-records
 * selectedIdx    – currently selected row index (number)
 * onSelect       – callback(idx: number)
 * runData        – object from /defense/test-2025-predict  (or null)
 * runLoading     – boolean
 */

import { useState } from "react";

// ─── Design Tokens (mirrors ModelOverviewDashboard, StudentPage, ResultCard) ──
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

  .edp-root *, .edp-root *::before, .edp-root *::after { box-sizing: border-box; }
  .edp-root {
    font-family: 'Inter', sans-serif;
    color: ${IIEE.white};
    font-size: clamp(12px, 1.2vw, 14px);
    line-height: 1.55;
  }
  .edp-root p { margin: 0; }

  /* ── Selector row ── */
  .edp-selector-row {
    display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap; margin-bottom: clamp(12px, 2.5vw, 16px);
  }
  .edp-select-label {
    font-size: clamp(10px, 1.3vw, 12px); font-weight: 700;
    color: ${IIEE.muted}; flex-shrink: 0;
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .edp-select {
    background: rgba(11,20,55,0.8);
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 10px; color: ${IIEE.white};
    padding: clamp(7px, 1.5vw, 10px) clamp(10px, 2vw, 13px);
    min-width: clamp(180px, 30vw, 260px);
    cursor: pointer;
    font-size: clamp(11px, 1.3vw, 13px);
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s;
    outline: none;
  }
  .edp-select:focus { border-color: ${IIEE.gold}; }
  .edp-select option { background: ${IIEE.navyMid}; color: ${IIEE.white}; }

  .edp-verdict-tag {
    font-size: clamp(9px, 1.2vw, 10px); font-weight: 700;
    padding: 3px 10px; border-radius: 999px; white-space: nowrap;
  }

  /* ── Loading ── */
  .edp-loading {
    display: flex; align-items: center; gap: 10px;
    padding: clamp(14px, 3vw, 20px) 0;
  }
  .edp-spinner {
    width: clamp(12px, 2vw, 15px); height: clamp(12px, 2vw, 15px);
    border-radius: 50%; border: 2px solid ${IIEE.blue}35;
    border-top-color: ${IIEE.blue};
    animation: edpSpin 0.8s linear infinite; flex-shrink: 0;
  }
  .edp-loading-text { font-size: clamp(11px, 1.3vw, 12px); color: ${IIEE.dimText}; }

  /* ── Identity strip ── */
  .edp-identity {
    display: flex; align-items: center; gap: clamp(10px, 2.5vw, 14px);
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px; padding: clamp(12px, 2.5vw, 16px);
    position: relative; overflow: hidden;
  }
  .edp-identity::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, ${IIEE.gold}, transparent);
  }
  .edp-avatar {
    width: clamp(38px, 6vw, 46px); height: clamp(38px, 6vw, 46px);
    border-radius: 11px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(18px, 3.5vw, 22px); flex-shrink: 0;
    border: 1px solid rgba(139,92,246,0.3);
  }
  .edp-identity-info { flex: 1; min-width: 0; }
  .edp-identity-name {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(13px, 2.2vw, 16px); font-weight: 800;
    color: ${IIEE.white}; margin-bottom: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .edp-identity-sub {
    font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText};
    font-family: 'DM Sans', sans-serif;
  }
  .edp-verdict-pair {
    display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; flex-shrink: 0;
  }
  .edp-verdict-box {
    border-radius: 11px; padding: clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 13px);
    text-align: center; min-width: clamp(78px, 14vw, 96px);
  }
  .edp-verdict-tag-sm {
    font-size: clamp(8px, 1.1vw, 9px); color: ${IIEE.dimText};
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif; margin-bottom: 3px;
  }
  .edp-verdict-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(14px, 3vw, 17px); font-weight: 900; line-height: 1; margin-bottom: 4px;
  }
  .edp-verdict-sub { font-size: clamp(8px, 1.1vw, 9px); color: ${IIEE.dimText}; }

  /* ── Regression grid ── */
  .edp-reg-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: clamp(7px, 1.5vw, 10px);
  }
  .edp-reg-box {
    border-radius: 12px; padding: clamp(11px, 2.5vw, 14px) clamp(12px, 2.5vw, 16px);
    transition: transform 0.18s;
  }
  .edp-reg-box:hover { transform: translateY(-2px); }
  .edp-reg-label {
    font-size: clamp(8px, 1.1vw, 10px); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    font-family: 'Montserrat', sans-serif; color: ${IIEE.dimText}; margin-bottom: 4px;
  }
  .edp-reg-val {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(22px, 5vw, 28px); font-weight: 900; line-height: 1; margin-bottom: 6px;
  }
  .edp-reg-sub { font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText}; margin-bottom: 7px; }
  .edp-bar-track {
    height: 4px; background: rgba(255,255,255,0.06);
    border-radius: 99px; overflow: hidden;
  }
  .edp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }

  /* ── Section overview card ── */
  .edp-overview-card {
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px; padding: clamp(12px, 2.5vw, 16px);
  }
  .edp-card-heading {
    font-size: clamp(9px, 1.2vw, 11px); font-weight: 700;
    color: ${IIEE.dimText}; text-transform: uppercase; letter-spacing: 0.1em;
    font-family: 'Montserrat', sans-serif; margin-bottom: clamp(8px, 2vw, 12px);
  }
  .edp-section-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 7px;
  }
  .edp-section-row:last-child { margin-bottom: 0; }
  .edp-section-icon { font-size: clamp(11px, 1.8vw, 14px); flex-shrink: 0; width: 18px; text-align: center; }
  .edp-section-name {
    font-size: clamp(10px, 1.3vw, 12px); color: ${IIEE.muted};
    width: clamp(100px, 18vw, 130px); flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .edp-section-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; }
  .edp-section-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
  .edp-section-pct {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(10px, 1.3vw, 11px); font-weight: 800;
    width: 34px; text-align: right; flex-shrink: 0;
  }

  /* ── Survey toggle ── */
  .edp-toggle-btn {
    width: 100%; padding: clamp(9px, 2vw, 12px) 16px;
    border-radius: 11px; cursor: pointer;
    font-size: clamp(11px, 1.4vw, 12px); font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    border-style: solid; border-width: 1px;
  }
  .edp-toggle-icon { font-size: clamp(12px, 2vw, 14px); }
  .edp-toggle-arrow { font-size: clamp(9px, 1.2vw, 11px); transition: transform 0.2s; }

  /* ── Survey content wrapper ── */
  .edp-survey-wrap {
    margin-top: 8px;
    background: ${IIEE.cardBg}; border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px; padding: clamp(12px, 2.5vw, 16px);
  }
  .edp-likert-legend {
    display: flex; gap: clamp(10px, 2.5vw, 16px); margin-bottom: clamp(10px, 2vw, 13px); flex-wrap: wrap;
  }
  .edp-likert-item {
    display: flex; align-items: center; gap: 4px;
    font-size: clamp(9px, 1.2vw, 11px); color: ${IIEE.dimText};
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Survey section accordion ── */
  .edp-acc-card {
    border-radius: 11px; overflow: hidden; margin-bottom: 7px;
    transition: border-color 0.2s;
  }
  .edp-acc-btn {
    width: 100%; padding: clamp(9px, 2vw, 11px) clamp(10px, 2vw, 13px);
    display: flex; align-items: center; gap: 8px;
    border: none; cursor: pointer; text-align: left;
    transition: background 0.2s;
  }
  .edp-acc-icon { font-size: clamp(13px, 2.2vw, 15px); flex-shrink: 0; }
  .edp-acc-name {
    flex: 1; font-size: clamp(11px, 1.4vw, 12px); font-weight: 700;
    color: ${IIEE.white}; font-family: 'Inter', sans-serif;
  }
  .edp-acc-minibar { width: 56px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; flex-shrink: 0; }
  .edp-acc-minibar-fill { height: 100%; border-radius: 99px; }
  .edp-acc-pct {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(11px, 1.4vw, 12px); font-weight: 800;
    width: 34px; text-align: right; flex-shrink: 0;
  }
  .edp-acc-arrow { font-size: clamp(10px, 1.3vw, 11px); flex-shrink: 0; transition: transform 0.2s; }

  .edp-acc-body { padding: 0 clamp(10px, 2vw, 13px) clamp(8px, 1.5vw, 11px); }
  .edp-item-row {
    display: flex; align-items: center; gap: 7px;
    padding: clamp(4px, 1vw, 6px) 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .edp-item-row:last-child { border-bottom: none; }
  .edp-item-key {
    font-size: clamp(8px, 1.1vw, 9px); font-weight: 700;
    flex-shrink: 0; width: 28px;
  }
  .edp-item-label { flex: 1; font-size: clamp(9px, 1.2vw, 11px); line-height: 1.35; }
  .edp-item-mini-track { width: 34px; height: 3px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; flex-shrink: 0; }
  .edp-item-mini-fill { height: 100%; border-radius: 99px; }
  .edp-item-likert { font-size: clamp(8px, 1.1vw, 10px); color: ${IIEE.dimText}; width: 78px; text-align: right; flex-shrink: 0; font-family: 'DM Sans', sans-serif; }

  /* ── Warn box ── */
  .edp-warn {
    background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.25);
    border-radius: 11px; padding: clamp(9px, 2vw, 12px) clamp(12px, 2.5vw, 14px);
    font-size: clamp(10px, 1.3vw, 12px); color: #fde68a; line-height: 1.65;
  }
  .edp-empty {
    font-size: clamp(11px, 1.4vw, 13px); color: ${IIEE.dimText};
    font-family: 'DM Sans', sans-serif; padding: clamp(8px, 2vw, 12px) 0;
  }

  /* ── Divider ── */
  .edp-divider {
    display: flex; align-items: center; gap: 10px;
    margin: clamp(12px, 2.5vw, 18px) 0 clamp(8px, 1.5vw, 12px);
  }
  .edp-divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .edp-divider-line.rev { background: linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%); }
  .edp-divider-label {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(9px, 1.2vw, 11px); font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: ${IIEE.gold}; white-space: nowrap;
  }

  /* ── Animations ── */
  @keyframes edpSpin { to { transform: rotate(360deg); } }
  @keyframes edpFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .edp-fade { animation: edpFade 0.3s ease both; }

  /* ── Scrollbar ── */
  .edp-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .edp-root ::-webkit-scrollbar-thumb { background: rgba(245,197,24,0.2); border-radius: 99px; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .edp-reg-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .edp-selector-row { flex-direction: column; align-items: stretch; }
    .edp-select { min-width: 100%; width: 100%; }
    .edp-identity { flex-wrap: wrap; }
    .edp-verdict-pair { justify-content: flex-start; }
    .edp-section-name { width: 80px; }
    .edp-item-likert { display: none; }
  }
`;

// ─── Survey section definitions ───────────────────────────────────────────────
const SURVEY_SECTIONS = [
  {
    id: "knowledge", label: "Knowledge", icon: "📚", color: "#3b82f6",
    keys: ["KN1","KN2","KN3","KN4","KN5","KN6","KN7","KN8","KN9","KN10","KN11","KN12"],
    labels: [
      "Strong math foundation","Circuit analysis","Electrical machines","Power systems",
      "Electronics & semiconductors","Electrical laws & codes","Formula recall",
      "All board subjects studied","Theory application","Technical terminology",
      "Interprets diagrams","Aware of exam scope",
    ],
  },
  {
    id: "problem_solving", label: "Problem Solving", icon: "🧠", color: "#8b5cf6",
    keys: ["PS1","PS2","PS3","PS4","PS5","PS6","PS7","PS8","PS9","PS10","PS11","PS12"],
    labels: [
      "Analyze complex problems","Identify efficient method","Select right formula",
      "Apply theory to practice","Solve within time limit","Break down complex problems",
      "Verify answers","Multi-step problems","Accuracy under pressure",
      "Confident w/ unseen problems","Board exam problem confidence","Problem-solving strategies",
    ],
  },
  {
    id: "motivation", label: "Motivation", icon: "🔥", color: "#f59e0b",
    keys: ["MT1","MT2","MT3","MT4","MT5","MT6","MT7","MT8"],
    labels: [
      "Motivated to pass","Clear passing goal","Sets study targets",
      "Follows study schedule","Manages time effectively","Maintains discipline",
      "Monitors & adjusts plan","Committed to effort",
    ],
  },
  {
    id: "mental_health", label: "Mental Health", icon: "🧘", color: "#10b981",
    keys: ["MH1","MH2","MH3","MH4","MH5","MH6","MH7","MH8"],
    labels: [
      "Manages stress","Mentally prepared","Calm under pressure","Physical health",
      "Sufficient sleep","Balances review & self-care","Stays focused","Positive mindset",
    ],
  },
  {
    id: "support", label: "Support System", icon: "🤝", color: "#ec4899",
    keys: ["SS1","SS2","SS3","SS4","SS5","SS6","SS7","SS8"],
    labels: [
      "Family support","Family encouragement","Peer support","Effective study group",
      "Financial support","Access to resources","Conducive environment","Tech tools",
    ],
  },
  {
    id: "curriculum", label: "Curriculum & Faculty", icon: "🎓", color: "#06b6d4",
    keys: ["CU1","CU2","CU3","CU4","CU5","FQ1","FQ2","FQ3","FQ4","FQ5"],
    labels: [
      "Curriculum prepared me","Core subjects covered EE","Syllabi aligned to board",
      "Theory & problem balance","Subject sequence","Professors showed mastery",
      "Professors explained clearly","Effective teaching techniques",
      "Encouraged critical thinking","Accessible outside class",
    ],
  },
  {
    id: "institutional", label: "Dept & Institution", icon: "🏫", color: "#f97316",
    keys: ["DR1","DR2","DR3","DR4","DR5","FA1","FA2","FA3","FA4","FA5","IC1","IC2","IC3","IC4","IC5"],
    labels: [
      "Dept review programs","Review reinforced concepts","Mock exams provided",
      "Mentoring & support","Review timing","Library resources",
      "Labs equipped","Tech resources","Study areas accessible","Campus study conducive",
      "Promotes excellence","Encourages board exam","Motivates students",
      "Career guidance","Positive institutional influence",
    ],
  },
];

const LIKERT = { 1: "Strongly Agree", 2: "Agree", 3: "Disagree", 4: "Strongly Disagree" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }
function pct(v)        { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }

function sectionScore(keys, answers) {
  const vals = keys.map(k => Number(answers?.[k])).filter(v => v >= 1 && v <= 4);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(((4 - avg) / 3) * 100);
}

function scoreColor(s) {
  if (s == null) return IIEE.dimText;
  if (s >= 80) return IIEE.passGreen;
  if (s >= 65) return IIEE.blue;
  if (s >= 50) return IIEE.amber;
  return IIEE.failRed;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div className="edp-divider">
      <div className="edp-divider-line" />
      <div className="edp-divider-label">{label}</div>
      <div className="edp-divider-line rev" />
    </div>
  );
}

// ─── LikertDot ────────────────────────────────────────────────────────────────
function LikertDot({ value }) {
  const colors = { 1: IIEE.passGreen, 2: IIEE.blue, 3: IIEE.amber, 4: IIEE.failRed };
  const color  = colors[value] ?? IIEE.dimText;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
      <span style={{ fontSize: "clamp(8px,1.1vw,10px)", color, fontWeight: 700 }}>{value}</span>
    </span>
  );
}

// ─── Survey Section Accordion ─────────────────────────────────────────────────
function SurveySection({ section, answers }) {
  const [open, setOpen] = useState(false);
  const score = sectionScore(section.keys, answers);
  const col   = section.color;
  const sCol  = scoreColor(score);

  return (
    <div
      className="edp-acc-card"
      style={{ border: `1px solid ${open ? col + "50" : col + "20"}`, background: open ? `${col}09` : "rgba(11,20,55,0.4)" }}
    >
      <button
        className="edp-acc-btn"
        onClick={() => setOpen(o => !o)}
        style={{ background: open ? `${col}12` : "transparent" }}
      >
        <span className="edp-acc-icon">{section.icon}</span>
        <span className="edp-acc-name">{section.label}</span>
        <div className="edp-acc-minibar">
          <div className="edp-acc-minibar-fill" style={{ width: `${score ?? 0}%`, background: sCol }} />
        </div>
        <span className="edp-acc-pct" style={{ color: sCol }}>{score != null ? `${score}%` : "—"}</span>
        <span className="edp-acc-arrow" style={{ color: open ? col : IIEE.dimText, transform: open ? "rotate(90deg)" : "none" }}>▶</span>
      </button>

      {open && (
        <div className="edp-acc-body edp-fade" style={{ borderTop: `1px solid ${col}20` }}>
          {section.keys.map((k, i) => {
            const val    = Number(answers?.[k]);
            const isWeak = val >= 3;
            const barW   = val >= 1 ? ((4 - val) / 3) * 100 : 0;
            return (
              <div key={k} className="edp-item-row">
                <span className="edp-item-key" style={{ color: isWeak ? IIEE.failRed : col }}>{k}</span>
                <span className="edp-item-label" style={{ color: isWeak ? "#fca5a5" : IIEE.muted }}>{section.labels[i]}</span>
                <div className="edp-item-mini-track">
                  <div className="edp-item-mini-fill" style={{ width: `${barW}%`, background: isWeak ? IIEE.failRed : col }} />
                </div>
                {val >= 1 ? <LikertDot value={val} /> : <span style={{ fontSize: "10px", color: IIEE.dimText, width: 28 }}>—</span>}
                <span className="edp-item-likert">{LIKERT[val] ?? "—"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExamineeDetailPanel({ records, selectedIdx, onSelect, runData, runLoading }) {
  const [showSurvey, setShowSurvey] = useState(false);

  if (!records || records.length === 0) {
    return <p className="edp-empty">No DATA_EVALUATION records loaded.</p>;
  }

  const answers   = runData?.raw_answers ?? {};
  const name      = runData?.name ?? null;
  const actual    = runData?.actual;
  const predicted = runData?.predicted;
  const correct   = actual?.label === predicted?.label;

  const sectionScores = SURVEY_SECTIONS.map(s => ({
    ...s, score: sectionScore(s.keys, answers),
  }));

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <div className="edp-root">
      <style>{STYLES}</style>

      {/* ── Selector row ── */}
      <div className="edp-selector-row">
        <span className="edp-select-label">Examinee</span>
        <select
          className="edp-select"
          value={selectedIdx}
          onChange={e => onSelect(Number(e.target.value))}
        >
          {records.map(it => (
            <option key={it.idx} value={it.idx}>
              #{it.idx + 1} · {it.label}{it.rating != null ? ` · ${num(it.rating, 2)}` : ""}
            </option>
          ))}
        </select>
        {runData && !runLoading && (
          <span
            className="edp-verdict-tag"
            style={{
              background: correct ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
              color:      correct ? IIEE.passGreen          : IIEE.failRed,
              border:     `1px solid ${correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            {correct ? "✓ Correct prediction" : "✗ Mispredicted"}
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      {runLoading && (
        <div className="edp-loading">
          <div className="edp-spinner" />
          <span className="edp-loading-text">Loading examinee data…</span>
        </div>
      )}

      {/* ── Main content ── */}
      {!runLoading && runData && !runData.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,2vw,12px)" }}>

          {/* Identity strip */}
          <div className="edp-identity edp-fade">
            <div className="edp-avatar">🎓</div>
            <div className="edp-identity-info">
              <p className="edp-identity-name">{name ?? `Examinee #${selectedIdx + 1}`}</p>
              <p className="edp-identity-sub">
                2025 DATA_EVALUATION · Row {selectedIdx + 1} of {records.length}
              </p>
            </div>
            <div className="edp-verdict-pair">
              {[
                { lbl: "Actual",    val: actual?.label,    sub: `Rating: ${num(actual?.rating, 2)}` },
                { lbl: "Predicted", val: predicted?.label, sub: `P(Pass): ${pct((predicted?.probability_pass ?? 0) * 100)}` },
              ].map(x => {
                const isPassed = x.val === "PASSED";
                const col = isPassed ? IIEE.passGreen : IIEE.failRed;
                return (
                  <div
                    key={x.lbl} className="edp-verdict-box"
                    style={{
                      background: `${col}09`,
                      border: `1px solid ${col}28`,
                    }}
                  >
                    <p className="edp-verdict-tag-sm">{x.lbl}</p>
                    <p className="edp-verdict-val" style={{ color: col }}>{x.val ?? "—"}</p>
                    <p className="edp-verdict-sub">{x.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regression A / B */}
          <Divider label="📈 Predicted Ratings" />
          <div className="edp-reg-grid edp-fade">
            {[
              { lbl: "Regression A", sub: "EE + MATH + ESAS + GWA", val: predicted?.predicted_rating_a, color: IIEE.blue },
              { lbl: "Regression B", sub: "GWA + Survey only",       val: predicted?.predicted_rating_b, color: IIEE.indigo },
            ].map(x => (
              <div
                key={x.lbl} className="edp-reg-box"
                style={{ background: `${x.color}09`, border: `1px solid ${x.color}25` }}
              >
                <p className="edp-reg-label">{x.lbl}</p>
                <p className="edp-reg-val" style={{ color: x.color }}>{num(x.val, 2)}</p>
                <p className="edp-reg-sub">{x.sub}</p>
                <div className="edp-bar-track">
                  <div className="edp-bar-fill" style={{ width: `${Math.min(x.val ?? 0, 100)}%`, background: x.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Section overview */}
          {hasAnswers && (
            <>
              <Divider label="📋 Survey Section Overview" />
              <div className="edp-overview-card edp-fade">
                {sectionScores.map(s => (
                  <div key={s.id} className="edp-section-row">
                    <span className="edp-section-icon">{s.icon}</span>
                    <span className="edp-section-name">{s.label}</span>
                    <div className="edp-section-bar">
                      <div className="edp-section-bar-fill" style={{ width: `${s.score ?? 0}%`, background: scoreColor(s.score) }} />
                    </div>
                    <span className="edp-section-pct" style={{ color: scoreColor(s.score) }}>
                      {s.score != null ? `${s.score}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Survey detail toggle */}
              <button
                className="edp-toggle-btn"
                onClick={() => setShowSurvey(o => !o)}
                style={{
                  background: showSurvey ? "rgba(56,189,248,0.09)" : "rgba(255,255,255,0.03)",
                  borderColor: showSurvey ? "rgba(56,189,248,0.35)" : IIEE.cardBorder,
                  color: showSurvey ? IIEE.blue : IIEE.muted,
                }}
              >
                <span className="edp-toggle-icon">📋</span>
                {showSurvey ? "Hide Full Survey Answers" : "Show Full Survey Answers"}
                <span className="edp-toggle-arrow" style={{ transform: showSurvey ? "rotate(180deg)" : "none" }}>▼</span>
              </button>

              {showSurvey && (
                <div className="edp-survey-wrap edp-fade">
                  <div className="edp-likert-legend">
                    {[1, 2, 3, 4].map(v => (
                      <span key={v} className="edp-likert-item">
                        <LikertDot value={v} /> {LIKERT[v]}
                      </span>
                    ))}
                  </div>
                  {SURVEY_SECTIONS.map(s => (
                    <SurveySection key={s.id} section={s} answers={answers} />
                  ))}
                </div>
              )}
            </>
          )}

          {!hasAnswers && (
            <div className="edp-warn">
              ⚠️ Survey answers not available for this examinee. Ensure your backend returns{" "}
              <code style={{ color: IIEE.gold, fontFamily: "monospace" }}>raw_answers</code> from{" "}
              <code style={{ color: IIEE.gold, fontFamily: "monospace" }}>/defense/test-2025-predict</code>.
            </div>
          )}
        </div>
      )}

      {!runLoading && runData?.error && (
        <p style={{ fontSize: "clamp(11px,1.3vw,13px)", color: IIEE.failRed }}>{runData.error}</p>
      )}
      {!runLoading && !runData && (
        <p className="edp-empty">Choose a row above to view full examinee details.</p>
      )}
    </div>
  );
}