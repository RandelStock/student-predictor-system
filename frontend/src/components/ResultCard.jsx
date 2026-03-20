import { useState } from "react";
import API_BASE_URL from "../apiBase";

// ── Section definitions ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "knowledge",
    label: "Knowledge Self-Assessment",
    icon: "📚",
    color: { accent: "#3b82f6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.2)", text: "#93c5fd", bar: "#3b82f6" },
    fields: [
      { key: "KN1",  label: "Strong math foundation for EE" },
      { key: "KN2",  label: "Circuit analysis & network theorems" },
      { key: "KN3",  label: "Electrical machines & transformers" },
      { key: "KN4",  label: "Power systems & energy management" },
      { key: "KN5",  label: "Electronics & semiconductor devices" },
      { key: "KN6",  label: "Electrical laws, codes & standards" },
      { key: "KN7",  label: "Formula recall & application" },
      { key: "KN8",  label: "All major board exam subjects studied" },
      { key: "KN9",  label: "Understands theory, not just formulas" },
      { key: "KN10", label: "Familiar with EE technical terms" },
      { key: "KN11", label: "Interprets electrical diagrams & schematics" },
      { key: "KN12", label: "Aware of exam scope & coverage" },
    ],
  },
  {
    id: "problem_solving",
    label: "Problem Solving Confidence",
    icon: "🧠",
    color: { accent: "#8b5cf6", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.2)", text: "#c4b5fd", bar: "#8b5cf6" },
    fields: [
      { key: "PS1",  label: "Analyze complex EE problems" },
      { key: "PS2",  label: "Identify most efficient solution method" },
      { key: "PS3",  label: "Select appropriate formula/concept" },
      { key: "PS4",  label: "Apply theory to practical scenarios" },
      { key: "PS5",  label: "Solve within exam time constraints" },
      { key: "PS6",  label: "Break down complex problems" },
      { key: "PS7",  label: "Verify answers & check errors" },
      { key: "PS8",  label: "Handle multi-step problems" },
      { key: "PS9",  label: "Maintain accuracy under pressure" },
      { key: "PS10", label: "Confident with unseen problems" },
      { key: "PS11", label: "Confident analyzing board exam problems" },
      { key: "PS12", label: "Effective problem-solving strategies" },
    ],
  },
  {
    id: "motivation",
    label: "Motivation & Study Discipline",
    icon: "🔥",
    color: { accent: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.2)", text: "#fcd34d", bar: "#f59e0b" },
    fields: [
      { key: "MT1", label: "Motivated to pass the EE exam" },
      { key: "MT2", label: "Clear goal for passing" },
      { key: "MT3", label: "Sets specific study goals & targets" },
      { key: "MT4", label: "Follows structured study schedule" },
      { key: "MT5", label: "Manages time effectively" },
      { key: "MT6", label: "Maintains discipline when unmotivated" },
      { key: "MT7", label: "Monitors & adjusts study plan" },
      { key: "MT8", label: "Committed to necessary effort" },
    ],
  },
  {
    id: "mental_health",
    label: "Mental Health & Wellbeing",
    icon: "🧘",
    color: { accent: "#10b981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.2)", text: "#6ee7b7", bar: "#10b981" },
    fields: [
      { key: "MH1", label: "Manages stress effectively" },
      { key: "MH2", label: "Mentally prepared for exam challenges" },
      { key: "MH3", label: "Calm during high-pressure sessions" },
      { key: "MH4", label: "Physical health through rest & nutrition" },
      { key: "MH5", label: "Gets enough sleep for mental alertness" },
      { key: "MH6", label: "Balances review with self-care" },
      { key: "MH7", label: "Stays focused, avoids distractions" },
      { key: "MH8", label: "Positive mindset towards passing" },
    ],
  },
  {
    id: "support",
    label: "Support System",
    icon: "🤝",
    color: { accent: "#ec4899", bg: "rgba(236,72,153,0.07)", border: "rgba(236,72,153,0.2)", text: "#f9a8d4", bar: "#ec4899" },
    fields: [
      { key: "SS1", label: "Family supports exam preparation" },
      { key: "SS2", label: "Family encourages motivation" },
      { key: "SS3", label: "Peers & classmates are supportive" },
      { key: "SS4", label: "Has effective study group" },
      { key: "SS5", label: "Financial support for review & exam" },
      { key: "SS6", label: "Access to study materials & resources" },
      { key: "SS7", label: "Conducive study environment" },
      { key: "SS8", label: "Technology tools for review" },
    ],
  },
  {
    id: "curriculum",
    label: "Curriculum & Faculty",
    icon: "🎓",
    color: { accent: "#06b6d4", bg: "rgba(6,182,212,0.07)", border: "rgba(6,182,212,0.2)", text: "#67e8f9", bar: "#06b6d4" },
    fields: [
      { key: "CU1", label: "Curriculum prepared me for board exam" },
      { key: "CU2", label: "Core subjects covered key EE topics" },
      { key: "CU3", label: "Syllabi aligned with board exam" },
      { key: "CU4", label: "Balanced theory & problem-solving" },
      { key: "CU5", label: "Subject sequence supported learning" },
      { key: "FQ1", label: "Professors showed subject mastery" },
      { key: "FQ2", label: "Professors explained concepts clearly" },
      { key: "FQ3", label: "Professors used effective techniques" },
      { key: "FQ4", label: "Professors encouraged critical thinking" },
      { key: "FQ5", label: "Professors accessible outside class" },
    ],
  },
  {
    id: "institutional",
    label: "Dept Review & Institution",
    icon: "🏫",
    color: { accent: "#f97316", bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.2)", text: "#fdba74", bar: "#f97316" },
    fields: [
      { key: "DR1", label: "Dept conducted review programs" },
      { key: "DR2", label: "Review sessions reinforced key concepts" },
      { key: "DR3", label: "Dept provided mock exams" },
      { key: "DR4", label: "Dept provided mentoring & support" },
      { key: "DR5", label: "Review conducted at right time" },
      { key: "FA1", label: "Library had adequate review resources" },
      { key: "FA2", label: "Labs equipped for practical learning" },
      { key: "FA3", label: "Technology resources available" },
      { key: "FA4", label: "Study areas accessible for reviewers" },
      { key: "FA5", label: "Campus environment conducive to study" },
      { key: "IC1", label: "Institution promotes academic excellence" },
      { key: "IC2", label: "Institution encourages board exam taking" },
      { key: "IC3", label: "Institution motivates students" },
      { key: "IC4", label: "Institution provides career guidance" },
      { key: "IC5", label: "Institutional environment positively influenced prep" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeScore(keys, answers) {
  const vals = keys.map(k => Number(answers[k])).filter(v => v >= 1 && v <= 4);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(((4 - avg) / 3) * 100);
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Excellent",  color: "#34d399" };
  if (score >= 65) return { label: "Good",        color: "#60a5fa" };
  if (score >= 50) return { label: "Fair",        color: "#fbbf24" };
  return              { label: "Needs Work",   color: "#f87171" };
}

function getRatingColor(score) {
  if (score >= 85) return "#34d399";
  if (score >= 78) return "#60a5fa";
  if (score >= 70) return "#fbbf24";
  if (score >= 60) return "#f97316";
  return "#f87171";
}

// ── AI Recommendation ─────────────────────────────────────────────────────────
async function fetchAIRecommendation(section, answers, score, passed, attempt_id) {
  const questions = section.fields.map(f => ({
    key: f.key, label: f.label, value: Number(answers[f.key]),
  }));
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/ai-recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ section_label: section.label, score, passed, questions, attempt_id }),
  });
  if (!response.ok) throw new Error("Server error");
  const data = await response.json();
  return data.recommendation;
}

// ── Section Card — split-panel layout ────────────────────────────────────────
function SectionCard({ section, answers, passed, isActive, onToggle, attempt_id }) {
  const [rec, setRec]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const score = computeScore(section.fields.map(f => f.key), answers);
  const { label: scoreLabel, color: scoreLabelColor } = getScoreLabel(score);
  const c = section.color;

  const weakItems   = section.fields.filter(f => Number(answers[f.key]) >= 3);
  const strongItems = section.fields.filter(f => Number(answers[f.key]) <= 2);

  const handleToggle = async () => {
    onToggle();
    if (!isActive && !rec && !loading) {
      setLoading(true); setError(null);
      try {
        const text = await fetchAIRecommendation(section, answers, score, passed, attempt_id);
        setRec(text);
      } catch {
        setError("Could not load AI recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      border: `1px solid ${isActive ? c.accent + "60" : c.border}`,
      borderRadius: "14px",
      overflow: "hidden",
      transition: "all 0.25s ease",
      background: isActive ? c.bg : "rgba(15,23,42,0.5)",
    }}>
      {/* ── Header row (always visible) ── */}
      <button onClick={handleToggle} style={{
        width: "100%", padding: "14px 16px",
        display: "flex", alignItems: "center", gap: "12px",
        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontSize: "20px", flexShrink: 0 }}>{section.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>
              {section.label}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                borderRadius: "999px", background: `${scoreLabelColor}20`,
                color: scoreLabelColor, border: `1px solid ${scoreLabelColor}40`,
              }}>{scoreLabel}</span>
              <span style={{ color: c.text, fontWeight: 800, fontSize: "15px" }}>{score}%</span>
            </div>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${score}%`, background: c.accent,
              borderRadius: "99px", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "10px", color: weakItems.length > 0 ? "#94a3b8" : "#6ee7b7" }}>
            {weakItems.length > 0
              ? `${weakItems.length} area${weakItems.length > 1 ? "s" : ""} to improve · ${strongItems.length} strong`
              : `All ${section.fields.length} areas answered positively ✓`}
          </p>
        </div>
        <span style={{
          color: isActive ? c.text : "#64748b",
          fontSize: "14px", flexShrink: 0,
          transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
        }}>▶</span>
      </button>

      {/* ── Expanded: two-column split ── */}
      {isActive && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0",
          borderTop: `1px solid ${c.border}`,
        }}
          className="section-expanded"
        >
          {/* LEFT — item breakdown */}
          <div style={{
            padding: "14px 16px",
            borderRight: `1px solid ${c.border}`,
            maxHeight: "340px",
            overflowY: "auto",
          }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Item Breakdown
            </p>
            {section.fields.map((f, i) => {
              const val = Number(answers[f.key]);
              const isWeak = val >= 3;
              const barW = ((4 - val) / 3) * 100;
              return (
                <div key={f.key} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "7px 0",
                  borderBottom: i < section.fields.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: isWeak ? "rgba(239,68,68,0.04)" : "transparent",
                }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: isWeak ? "#f87171" : "#6ee7b7", flexShrink: 0, width: "26px" }}>{f.key}</span>
                  <span style={{ flex: 1, fontSize: "10px", color: isWeak ? "#fca5a5" : "#94a3b8", lineHeight: 1.35 }}>{f.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                    <div style={{ width: "40px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barW}%`, background: isWeak ? "#f87171" : c.accent, borderRadius: "99px" }} />
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: isWeak ? "#f87171" : c.text, width: "12px", textAlign: "right" }}>{val}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — AI recommendations */}
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px" }}>✨</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                AI Recommendations
              </span>
            </div>
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
                <div style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  border: `2px solid ${c.accent}40`, borderTopColor: c.accent,
                  animation: "spin 0.8s linear infinite", flexShrink: 0,
                }} />
                <span style={{ fontSize: "11px", color: "#64748b" }}>Analyzing…</span>
              </div>
            )}
            {error && <p style={{ fontSize: "11px", color: "#f87171", lineHeight: 1.6 }}>{error}</p>}
            {rec && (
              <div style={{ overflowY: "auto", maxHeight: "300px" }}>
                {rec.split("\n").filter(l => l.trim()).map((line, i) => {
                  const isNumbered = /^\d+\./.test(line.trim());
                  return (
                    <p key={i} style={{
                      fontSize: "11px", lineHeight: 1.65,
                      margin: isNumbered ? "5px 0" : "0 0 8px",
                      color: isNumbered ? "#e2e8f0" : "#94a3b8",
                      fontWeight: isNumbered ? 500 : 400,
                    }}>
                      {isNumbered
                        ? <><span style={{ color: c.text, fontWeight: 700 }}>{line.match(/^\d+/)[0]}.</span>{line.replace(/^\d+\./, "")}</>
                        : line}
                    </p>
                  );
                })}
              </div>
            )}
            {!loading && !rec && !error && (
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>
                Loading AI analysis for this section…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Predicted Rating Section ──────────────────────────────────────────────────
function PredictedRatingSection({ result }) {
  const ratingA = result.predicted_rating_a;
  const ratingB = result.predicted_rating_b;
  const labelA  = result.rating_label_a;
  const labelB  = result.rating_label_b;
  const colorA  = getRatingColor(ratingA);
  const colorB  = getRatingColor(ratingB);
  const passing = result.passing_score ?? 70;
  const subjects = result.subject_status ? Object.entries(result.subject_status) : [];

  return (
    <div style={{
      background: "rgba(15,23,42,0.7)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px", padding: "18px", marginBottom: "18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ fontSize: "16px" }}>📊</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Predicted PRC Rating
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: "10px", color: "#475569" }}>Passing ≥ {passing}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        {[
          { label: "With Subject Scores", rating: ratingA, color: colorA, badge: labelA },
          { label: "GWA + Survey Only",   rating: ratingB, color: colorB, badge: labelB },
        ].map(({ label, rating, color, badge }) => (
          <div key={label} style={{
            background: `${color}10`, border: `1px solid ${color}30`,
            borderRadius: "12px", padding: "14px",
          }}>
            <p style={{ margin: "0 0 3px", fontSize: "9px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "7px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color, lineHeight: 1 }}>{rating != null ? rating.toFixed(1) : "—"}</span>
              <span style={{ fontSize: "12px", color: "#64748b", marginBottom: "3px" }}>/100</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden", marginBottom: "7px" }}>
              <div style={{ height: "100%", width: `${rating ?? 0}%`, background: color, borderRadius: "99px", transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: `${color}20`, color, border: `1px solid ${color}40` }}>{badge}</span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: rating >= passing ? "#34d399" : "#f87171" }}>
                {rating >= passing ? "▲ PASS" : "▼ FAIL"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {subjects.length > 0 && (
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject Scores</p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${subjects.length}, 1fr)`, gap: "7px" }}>
            {subjects.map(([subj, info]) => (
              <div key={subj} style={{
                background: info.passed ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                border: `1px solid ${info.passed ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                borderRadius: "9px", padding: "8px 10px", textAlign: "center",
              }}>
                <p style={{ margin: "0 0 1px", fontSize: "9px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>{subj}</p>
                <p style={{ margin: "0 0 3px", fontSize: "20px", fontWeight: 800, color: info.passed ? "#34d399" : "#f87171" }}>{info.score}</p>
                <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "999px",
                  background: info.passed ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                  color: info.passed ? "#34d399" : "#f87171",
                }}>{info.passed ? `✓ ≥${passing}` : `✗ <${passing}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ margin: 0, fontSize: "10px", color: "#475569", lineHeight: 1.6 }}>
        💡 <strong style={{ color: "#64748b" }}>Model A</strong> uses subject scores + GWA + survey (R² = 0.97).{" "}
        <strong style={{ color: "#64748b" }}>Model B</strong> uses only GWA + survey — useful for early readiness assessment (R² = 0.90).
      </p>
    </div>
  );
}

// ── Main ResultCard ───────────────────────────────────────────────────────────
export default function ResultCard({ result }) {
  const [activeSection, setActiveSection] = useState(null);

  const passed      = result.prediction === 1;
  const passPercent = Math.round(result.probability_pass * 100);
  const failPercent = Math.round(result.probability_fail * 100);
  const confidence  = passed ? passPercent : failPercent;
  const answers     = result.answers || {};
  const attempt_id  = result.attempt_id;

  const reliability = result.reliability_score;
  const reliabilityLabel = result.reliability_category
    ?? (
      reliability == null
        ? "—"
        : reliability >= 80
          ? "Highly consistent answers"
          : reliability >= 60
            ? "Moderate consistency"
            : "Potential random responses"
    );

  const allKeys      = SECTIONS.flatMap(s => s.fields.map(f => f.key));
  const overallScore = computeScore(allKeys, answers);

  const handleToggle = (id) => {
    setActiveSection(prev => prev === id ? null : id);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .result-section { animation: fadeUp 0.35s ease forwards; }

        /* Responsive: stack split panel on small screens */
        @media (max-width: 600px) {
          .section-expanded {
            grid-template-columns: 1fr !important;
          }
          .section-expanded > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            max-height: 220px !important;
          }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>

      {/* ── Verdict banner ── */}
      <div style={{
        background: passed
          ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))"
          : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.06))",
        border: `1px solid ${passed ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
        borderRadius: "20px", padding: "22px", marginBottom: "18px",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: passed ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
              border: `1px solid ${passed ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0,
            }}>
              {passed ? "🎓" : "📋"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: "3px" }}>
                Prediction Result
              </p>
              <p style={{ margin: 0, fontSize: "34px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, color: passed ? "#34d399" : "#f87171" }}>
                {passed ? "PASSED" : "FAILED"}
              </p>
            </div>
          </div>

          {/* Confidence ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flexShrink: 0 }}>
            <div style={{ position: "relative", width: "60px", height: "60px" }}>
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="30" cy="30" r="24" fill="none" stroke="#1e293b" strokeWidth="5" />
                <circle cx="30" cy="30" r="24" fill="none"
                  stroke={passed ? "#34d399" : "#f87171"} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - confidence / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
                />
              </svg>
              <span style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "12px", fontWeight: 800, color: passed ? "#34d399" : "#f87171",
              }}>{confidence}%</span>
            </div>
            <span style={{ fontSize: "9px", color: "#475569" }}>confidence</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: passed ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
          border: `1px solid ${passed ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}`,
          borderRadius: "10px", padding: "10px 14px",
          fontSize: "12px", color: passed ? "rgba(167,243,208,0.85)" : "rgba(252,165,165,0.85)",
          lineHeight: 1.6, marginBottom: "16px",
        }}>
          {passed
            ? "🎉 Based on your profile, you are likely to pass the EE Licensure Exam. Explore each section below to push your readiness to 100%."
            : "📚 Additional preparation is recommended. Review the AI analysis for each section below — every improvement brings you closer to passing."}
        </div>

        {/* Probability bar */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>Pass {passPercent}%</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f87171" }}>Fail {failPercent}%</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${passPercent}%`,
              background: "linear-gradient(90deg, #34d399, #14b8a6)",
              borderRadius: "99px", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>

        {/* Probability chips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
          {[
            { label: "Pass Probability", val: result.probability_pass.toFixed(4), color: "#34d399" },
            { label: "Fail Probability", val: result.probability_fail.toFixed(4), color: "#f87171" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 500 }}>{label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{val}</p>
            </div>
          ))}
        </div>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: "11px",
            color: "#64748b",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.6,
          }}
        >
          Response reliability:{" "}
          <span
            style={{
              fontWeight: 700,
              color:
                reliability == null
                  ? "#e5e7eb"
                  : reliability >= 80
                  ? "#22c55e"
                  : reliability >= 60
                  ? "#eab308"
                  : "#f97316",
            }}
          >
            {reliability != null ? `${reliability.toFixed(1)}%` : "—"}
          </span>
          <span style={{ marginLeft: 8, fontSize: 10, color: "#94a3b8" }}>
            ({reliabilityLabel})
          </span>
        </p>

        {/* Overall survey score */}
        {overallScore !== null && (
          <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Overall Survey Readiness</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: getScoreLabel(overallScore).color }}>{overallScore}%</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${overallScore}%`,
                background: `linear-gradient(90deg, ${getScoreLabel(overallScore).color}, ${getScoreLabel(overallScore).color}aa)`,
                borderRadius: "99px", transition: "width 1s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Predicted PRC Rating ── */}
      <PredictedRatingSection result={result} />

      {/* ── Section breakdown ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Detailed Section Analysis
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: "10px", color: "#475569" }}>Click to expand side-by-side</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SECTIONS.map((section, i) => (
            <div key={section.id} className="result-section" style={{ animationDelay: `${i * 0.04}s` }}>
              <SectionCard
                section={section}
                answers={answers}
                passed={passed}
                isActive={activeSection === section.id}
                onToggle={() => handleToggle(section.id)}
                attempt_id={attempt_id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px", padding: "12px 14px",
      }}>
        <p style={{ margin: 0, fontSize: "10px", color: "#475569", lineHeight: 1.7 }}>
          💬 <strong style={{ color: "#64748b" }}>Note:</strong> AI recommendations are personalized based on your survey answers. Each section targets your specific weak points while affirming strengths. Retake the mock exam after improving flagged areas to see your updated prediction.
        </p>
      </div>
    </div>
  );
}