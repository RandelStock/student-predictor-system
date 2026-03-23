import { c } from "./ProfessorShared";

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
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#f8fafc", fontFamily: "'Syne',sans-serif" }}>
              Attempt Timer Drill-down
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
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
              fontSize: 13,
            }}
          >
            ✕ Close
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading timing details…</p>
        ) : data?.error ? (
          <p style={{ color: "#fca5a5" }}>{data.error}</p>
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
                {(data?.items ?? []).map((t, i) => (
                  <tr key={i}>
                    <td>{t.question_key}</td>
                    <td>{t.step_id || "—"}</td>
                    <td>{t.question_index ?? "—"}</td>
                    <td>{t.duration_sec ?? "—"}</td>
                    <td>
                      {t.expected_min_sec != null && t.expected_max_sec != null
                        ? `${t.expected_min_sec} - ${t.expected_max_sec}`
                        : "—"}
                    </td>
                    <td style={{ color: t.is_human_like ? c.pass : c.fail, fontWeight: 700 }}>{t.is_human_like ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

