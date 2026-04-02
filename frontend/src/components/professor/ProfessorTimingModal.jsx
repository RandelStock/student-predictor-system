import { c } from "./ProfessorShared";

// Corrected timing rules: short questions 2-4s, problem solving 5-7s
const CORRECTED_TIME_RULES = {
  knowledge:        [2, 4],
  problem_solving:  [5, 7],
  motivation:       [2, 4],
  mental_health:    [2, 4],
  support:          [2, 4],
  institutional:    [2, 4],
};

function getCorrectedRange(stepId) {
  const key = (stepId || "").toLowerCase().replace(/[\s-]/g, "_");
  return CORRECTED_TIME_RULES[key] || [2, 4];
}

export default function ProfessorTimingModal({
  attempt,
  open,
  loading,
  data,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(980px, 96vw)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "#0b1220",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 16,
          padding: "clamp(12px, 3vw, 24px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 700, color: "#f8fafc", fontFamily: "'Montserrat',sans-serif" }}>
              Attempt Timer Drill-down
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "clamp(11px, 1.5vw, 13px)", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
              {attempt?.name || "Unknown"} · {attempt?.attempt_id ? attempt.attempt_id.slice(0, 8) : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "7px 12px",
              color: "#cbd5e1",
              cursor: "pointer",
              fontSize: "clamp(12px, 1.5vw, 13px)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Legend note */}
        <div style={{
          marginBottom: 14,
          padding: "8px 12px",
          background: "rgba(56,189,248,0.06)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 8,
          fontSize: "clamp(10px, 1.3vw, 11px)",
          color: "#94a3b8",
          fontFamily: "'Inter',sans-serif",
          lineHeight: 1.6,
        }}>
          ⚡ Expected ranges recalculated using updated rules —{" "}
          <span style={{ color: "#38bdf8" }}>Short questions: 2–4s</span>{" "}
          ·{" "}
          <span style={{ color: "#818cf8" }}>Problem Solving: 5–7s</span>.
          Human-like status reflects the corrected thresholds.
        </div>

        {loading ? (
          <p style={{ color: "#cbd5e1", fontSize: "clamp(12px, 1.5vw, 13px)", fontFamily: "'Inter',sans-serif" }}>Loading timing details…</p>
        ) : data?.error ? (
          <p style={{ color: "#fca5a5", fontSize: "clamp(12px, 1.5vw, 13px)", fontFamily: "'Inter',sans-serif" }}>{data.error}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="att-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Section</th>
                  <th>Order</th>
                  <th>Actual Duration (sec)</th>
                  <th>Expected Range (sec)</th>
                  <th>Human-like?</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map((t, i) => {
                  const [corrMin, corrMax] = getCorrectedRange(t.step_id);
                  const duration = t.duration_sec;
                  const isHumanLike = duration != null
                    ? duration >= corrMin && duration <= corrMax
                    : t.is_human_like;

                  return (
                    <tr key={i}>
                      <td>{t.question_key}</td>
                      <td>{t.step_id || "—"}</td>
                      <td>{t.question_index ?? "—"}</td>
                      <td>{duration ?? "—"}</td>
                      <td style={{ color: "#38bdf8", fontWeight: 600 }}>
                        {corrMin} - {corrMax}
                      </td>
                      <td style={{ color: isHumanLike ? c.pass : c.fail, fontWeight: 700 }}>
                        {isHumanLike ? "Yes" : "No"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}