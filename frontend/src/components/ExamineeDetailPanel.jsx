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

// ── Colour palette (matches ProfessorPage) ───────────────────────────────────
const C = {
  pass:   "#34d399",
  fail:   "#f87171",
  blue:   "#38bdf8",
  indigo: "#818cf8",
  amber:  "#fbbf24",
  teal:   "#2dd4bf",
  slate:  "#94a3b8",
};

// ── Survey section definitions (key → short label) ───────────────────────────
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
      "Curriculum prepared me","Core subjects covered EE","Syllabi aligned to board","Theory & problem balance","Subject sequence","Professors showed mastery",
      "Professors explained clearly","Effective teaching techniques","Encouraged critical thinking","Accessible outside class",
    ],
  },
  {
    id: "institutional", label: "Dept & Institution", icon: "🏫", color: "#f97316",
    keys: ["DR1","DR2","DR3","DR4","DR5","FA1","FA2","FA3","FA4","FA5","IC1","IC2","IC3","IC4","IC5"],
    labels: [
      "Dept review programs","Review reinforced concepts","Mock exams provided","Mentoring & support","Review timing","Library resources",
      "Labs equipped","Tech resources","Study areas accessible","Campus study conducive",
      "Promotes excellence","Encourages board exam","Motivates students","Career guidance","Positive institutional influence",
    ],
  },
];

const LIKERT = { 1: "Strongly Agree", 2: "Agree", 3: "Disagree", 4: "Strongly Disagree" };

// ── Small helpers ─────────────────────────────────────────────────────────────
function num(v, d = 2) { return typeof v === "number" ? v.toFixed(d) : "—"; }
function pct(v)        { return typeof v === "number" ? `${v.toFixed(1)}%` : "—"; }

function sectionScore(keys, answers) {
  const vals = keys.map(k => Number(answers?.[k])).filter(v => v >= 1 && v <= 4);
  if (!vals.length) return null;
  const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
  return Math.round(((4 - avg) / 3) * 100);
}

function scoreColor(s) {
  if (s == null) return C.slate;
  if (s >= 80) return C.pass;
  if (s >= 65) return C.blue;
  if (s >= 50) return C.amber;
  return C.fail;
}

// ── LikertDot (1–4 coloured circle) ─────────────────────────────────────────
function LikertDot({ value }) {
  const colors = { 1: C.pass, 2: "#60a5fa", 3: C.amber, 4: C.fail };
  const color  = colors[value] ?? C.slate;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"3px" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, display:"inline-block" }} />
      <span style={{ fontSize:"9px", color, fontWeight:700 }}>{value}</span>
    </span>
  );
}

// ── SurveySection accordion ──────────────────────────────────────────────────
function SurveySection({ section, answers }) {
  const [open, setOpen] = useState(false);
  const score = sectionScore(section.keys, answers);
  const col   = section.color;

  return (
    <div style={{ border:`1px solid ${col}25`, borderRadius:"10px", overflow:"hidden", marginBottom:"6px" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", padding:"9px 12px", display:"flex", alignItems:"center", gap:"8px",
        background: open ? `${col}12` : "rgba(255,255,255,0.02)",
        border:"none", cursor:"pointer", textAlign:"left",
      }}>
        <span style={{ fontSize:"14px", flexShrink:0 }}>{section.icon}</span>
        <span style={{ flex:1, fontSize:"11px", fontWeight:700, color:"#f1f5f9" }}>{section.label}</span>
        {/* mini score bar */}
        <div style={{ width:"60px", height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden", flexShrink:0 }}>
          <div style={{ height:"100%", width:`${score??0}%`, background:scoreColor(score), borderRadius:99 }} />
        </div>
        <span style={{ fontSize:"11px", fontWeight:800, color:scoreColor(score), width:"32px", textAlign:"right", flexShrink:0 }}>
          {score != null ? `${score}%` : "—"}
        </span>
        <span style={{ color: open ? col : "#475569", fontSize:"11px", flexShrink:0, transform: open ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>▶</span>
      </button>

      {open && (
        <div style={{ padding:"0 12px 10px", borderTop:`1px solid ${col}20` }}>
          {section.keys.map((k, i) => {
            const val    = Number(answers?.[k]);
            const isWeak = val >= 3;
            const barW   = val >= 1 ? ((4-val)/3)*100 : 0;
            return (
              <div key={k} style={{
                display:"flex", alignItems:"center", gap:"7px", padding:"5px 0",
                borderBottom: i < section.keys.length-1 ? "1px solid rgba(255,255,255,0.03)" : "none",
              }}>
                <span style={{ fontSize:"9px", fontWeight:700, color: isWeak?C.fail:`${col}`, width:"28px", flexShrink:0 }}>{k}</span>
                <span style={{ flex:1, fontSize:"10px", color: isWeak?"#fca5a5":"#94a3b8", lineHeight:1.3 }}>{section.labels[i]}</span>
                {/* bar */}
                <div style={{ width:"36px", height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden", flexShrink:0 }}>
                  <div style={{ height:"100%", width:`${barW}%`, background: isWeak?C.fail:col, borderRadius:99 }} />
                </div>
                {val >= 1 ? <LikertDot value={val} /> : <span style={{ fontSize:"10px", color:C.slate, width:"28px" }}>—</span>}
                <span style={{ fontSize:"9px", color:"#475569", width:"72px", flexShrink:0, textAlign:"right" }}>
                  {LIKERT[val] ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ExamineeDetailPanel ──────────────────────────────────────────────────
export default function ExamineeDetailPanel({ records, selectedIdx, onSelect, runData, runLoading }) {
  const [showSurvey, setShowSurvey] = useState(false);

  if (!records || records.length === 0) {
    return <p style={{ margin:0, fontSize:"11px", color:"#64748b" }}>No DATA_EVALUATION records loaded.</p>;
  }

  // survey answers are embedded inside runData.raw_answers (added by backend below)
  const answers = runData?.raw_answers ?? {};
  const name    = runData?.name ?? null;

  const actual    = runData?.actual;
  const predicted = runData?.predicted;

  // per-section scores for radar-style overview
  const sectionScores = SURVEY_SECTIONS.map(s => ({
    ...s,
    score: sectionScore(s.keys, answers),
  }));

  return (
    <div className="edp-root" style={{ fontFamily:"'Inter',sans-serif", color:"#f1f5f9", fontSize:"14px", lineHeight:1.45 }}>

      {/* ── Selector row ── */}
      <div className="edp-selector-row" style={{ display:"flex", gap:"12px", alignItems:"center", flexWrap:"wrap", marginBottom:"14px" }}>
        <label style={{ fontSize:"12px", color:"#94a3b8", fontWeight:700, flexShrink:0, fontFamily:"'Inter',sans-serif" }}>Examinee</label>
        <select
          value={selectedIdx}
          onChange={e => onSelect(Number(e.target.value))}
          style={{ background:"rgba(15,23,42,0.7)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#e2e8f0", padding:"9px 12px", minWidth:"240px", cursor:"pointer", fontSize:"12px" }}
        >
          {records.map(it => (
            <option key={it.idx} value={it.idx}>
              #{it.idx+1} · {it.label}{it.rating != null ? ` · ${num(it.rating,2)}` : ""}
            </option>
          ))}
        </select>
        {runData && !runLoading && (
          <span style={{
            fontSize:"10px", padding:"3px 9px", borderRadius:"999px", fontWeight:700,
            background: actual?.label === predicted?.label ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            color:       actual?.label === predicted?.label ? C.pass : C.fail,
            border:`1px solid ${actual?.label === predicted?.label ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          }}>
            {actual?.label === predicted?.label ? "✓ Correct prediction" : "✗ Mispredicted"}
          </span>
        )}
      </div>

      {/* ── Loading state ── */}
      {runLoading && (
        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"16px 0" }}>
          <div style={{ width:"14px", height:"14px", borderRadius:"50%", border:`2px solid ${C.blue}40`, borderTopColor:C.blue, animation:"spin 0.8s linear infinite", flexShrink:0 }} />
          <span style={{ fontSize:"11px", color:"#64748b" }}>Loading examinee data…</span>
        </div>
      )}

      {/* ── Main content ── */}
      {!runLoading && runData && !runData.error && (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

          {/* ── Name + identity strip ── */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"12px 16px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>
              🎓
            </div>
            <div style={{ flex:1 }}>
              <p className="edp-heading" style={{ margin:"0 0 2px", fontSize:"14px", color:"#f1f5f9" }}>
                {name ?? `Examinee #${selectedIdx+1}`}
              </p>
              <p className="edp-subheading" style={{ margin:0, fontSize:"11px", color:"#475569" }}>
                2025 DATA_EVALUATION · Row {selectedIdx+1} of {records.length}
              </p>
            </div>
            {/* actual vs predicted badges */}
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end" }}>
              {[
                { lbl:"Actual",    val:actual?.label,    sub:`Rating: ${num(actual?.rating,2)}` },
                { lbl:"Predicted", val:predicted?.label, sub:`P(Pass): ${pct((predicted?.probability_pass??0)*100)}` },
              ].map(x => (
                <div key={x.lbl} style={{
                  background: x.val==="PASSED"?"rgba(52,211,153,0.07)":"rgba(248,113,113,0.07)",
                  border:`1px solid ${x.val==="PASSED"?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.2)"}`,
                  borderRadius:"10px", padding:"8px 12px", textAlign:"center", minWidth:"90px",
                }}>
                  <p className="edp-subheading" style={{ margin:"0 0 1px", fontSize:"9px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>{x.lbl}</p>
                  <p className="edp-heading" style={{ margin:"0 0 2px", fontSize:"15px", fontWeight:900, color:x.val==="PASSED"?C.pass:C.fail }}>{x.val??"—"}</p>
                  <p className="edp-subheading" style={{ margin:0, fontSize:"9px", color:"#64748b" }}>{x.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Regression A / B scores ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {[
              { lbl:"Regression A", sub:"EE+MATH+ESAS+GWA", val:predicted?.predicted_rating_a, color:C.blue },
              { lbl:"Regression B", sub:"GWA+survey only",  val:predicted?.predicted_rating_b, color:C.indigo },
            ].map(x => (
              <div key={x.lbl} style={{ background:`${x.color}08`, border:`1px solid ${x.color}20`, borderRadius:"10px", padding:"12px 14px" }}>
                <p style={{ margin:"0 0 1px", fontSize:"9px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>{x.lbl}</p>
              <p style={{ margin:"0 0 3px", fontSize:"22px", fontWeight:900, color:x.color, fontFamily:"'Montserrat',sans-serif" }}>{num(x.val,2)}</p>
                  <p style={{ margin:0, fontSize:"10px", color:"#475569", fontFamily:"'Inter',sans-serif" }}>{x.sub}</p>
                <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:99, marginTop:"6px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(x.val??0,100)}%`, background:x.color, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Section score overview strip ── */}
          {Object.keys(answers).length > 0 && (
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"12px 14px" }}>
              <p className="edp-subheading" style={{ margin:"0 0 10px", fontSize:"10px", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Survey Section Overview
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {sectionScores.map(s => (
                  <div key={s.id} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ fontSize:"12px", flexShrink:0, width:"18px" }}>{s.icon}</span>
                    <span style={{ fontSize:"10px", color:"#94a3b8", width:"120px", flexShrink:0 }}>{s.label}</span>
                    <div style={{ flex:1, height:"6px", background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${s.score??0}%`, background:scoreColor(s.score), borderRadius:99, transition:"width 0.8s ease" }} />
                    </div>
                    <span style={{ fontSize:"10px", fontWeight:700, color:scoreColor(s.score), width:"32px", textAlign:"right", flexShrink:0 }}>
                      {s.score != null ? `${s.score}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Survey toggle ── */}
          {Object.keys(answers).length > 0 && (
            <div>
              <button
                onClick={() => setShowSurvey(o => !o)}
                style={{
                  width:"100%", padding:"10px 14px",
                  background: showSurvey ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${showSurvey ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius:"10px", cursor:"pointer", color: showSurvey ? C.blue : "#64748b",
                  fontSize:"11px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  transition:"all 0.2s",
                }}
              >
                <span style={{ fontSize:"13px" }}>📋</span>
                {showSurvey ? "Hide Full Survey Answers" : "Show Full Survey Answers"}
                <span style={{ transform: showSurvey ? "rotate(180deg)" : "none", transition:"transform 0.2s", fontSize:"10px" }}>▼</span>
              </button>

              {showSurvey && (
                <div style={{ marginTop:"8px" }}>
                  <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"12px" }}>
                    <div style={{ display:"flex", gap:"14px", marginBottom:"10px", flexWrap:"wrap" }}>
                      {[1,2,3,4].map(v => (
                        <span key={v} style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", color:"#475569" }}>
                          <LikertDot value={v} /> {LIKERT[v]}
                        </span>
                      ))}
                    </div>
                    {SURVEY_SECTIONS.map(s => (
                      <SurveySection key={s.id} section={s} answers={answers} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {Object.keys(answers).length === 0 && (
            <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:"10px", padding:"10px 14px" }}>
              <p style={{ margin:0, fontSize:"11px", color:"#fcd34d", fontFamily:"'Inter',sans-serif" }}>
                ⚠️ Survey answers not available for this examinee. Ensure your backend returns <code>raw_answers</code> from <code>/defense/test-2025-predict</code>.
              </p>
            </div>
          )}

        </div>
      )}

      {!runLoading && runData?.error && (
        <p style={{ margin:0, fontSize:"11px", color:C.fail, fontFamily:"'Inter',sans-serif" }}>{runData.error}</p>
      )}
      {!runLoading && !runData && (
        <p style={{ margin:0, fontSize:"11px", color:"#64748b", fontFamily:"'Inter',sans-serif" }}>Choose a row to view results.</p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .edp-root .edp-regression-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .edp-root .edp-score-strip { display:flex; flex-direction:column; gap:6px; }

        .edp-root .edp-heading { font-family:'Montserrat',sans-serif; font-weight:800; }
        .edp-root .edp-subheading { font-family:'Inter',sans-serif; font-weight:600; }

        @media (max-width: 900px) {
          .edp-root .edp-regression-grid { grid-template-columns:1fr; }
          .edp-root .edp-selector-row select { min-width: 170px; width:100%; }
        }
        @media (max-width: 640px) {
          .edp-root { font-size: 13px; }
          .edp-root .edp-selector-row { flex-direction: column; align-items: stretch; }
          .edp-root .edp-selector-row button, .edp-root .edp-selector-row select { width: 100%; }
          .edp-root .edp-heading { font-size: clamp(16px, 4vw, 18px); }
          .edp-root .edp-subheading { font-size: clamp(12px, 3.5vw, 14px); }
        }
      `}</style>
    </div>
  );
}