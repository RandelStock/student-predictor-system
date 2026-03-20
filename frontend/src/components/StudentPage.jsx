import { useState, useEffect } from "react";
import PredictorForm from "./PredictorForm";
import ResultCard from "./ResultCard";
import API_BASE_URL from "../apiBase";

// ── helpers ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "ee_predictor_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

async function fetchDbHistory({ token, pageSize = 20 }) {
  if (!token) throw new Error("Missing auth token");

  const res = await fetch(`${API_BASE_URL}/student/attempts?page_size=${pageSize}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let msg = "Failed to load DB history.";
    try {
      const e = await res.json();
      msg = e.detail || JSON.stringify(e);
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.items || [];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getRatingColor(score) {
  if (score >= 85) return "#34d399";
  if (score >= 78) return "#60a5fa";
  if (score >= 70) return "#fbbf24";
  if (score >= 60) return "#f97316";
  return "#f87171";
}

// ── tiny stat chip ─────────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}25`,
      borderRadius: "12px", padding: "12px 14px",
    }}>
      <p style={{ margin: "0 0 2px", fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.09em", fontFamily: "'DM Sans',sans-serif" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

// ── history result row ────────────────────────────────────────────────────────
function HistoryRow({ entry, index, onView }) {
  const passed     = entry.prediction === 1;
  const passColor  = passed ? "#34d399" : "#f87171";
  const ratingColor = getRatingColor(entry.predicted_rating_a);
  const reliability  = entry.reliability_score;
  const reliabilityColor =
    reliability == null
      ? "#94a3b8"
      : reliability >= 80
        ? "#22c55e"
        : reliability >= 60
          ? "#eab308"
          : "#f97316";
  const reliabilityText = entry.reliability_category ?? (reliability != null ? `${reliability.toFixed(1)}%` : "—");
  const reliabilityBg = `${reliabilityColor}18`;
  const reliabilityBorder = `${reliabilityColor}35`;
  const isRecent   = index === 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 16px",
      background: isRecent ? "rgba(56,189,248,0.04)" : "rgba(255,255,255,0.015)",
      border: `1px solid ${isRecent ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: "12px",
      transition: "all 0.2s",
      cursor: "pointer",
    }}
      onClick={onView}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
      onMouseLeave={e => e.currentTarget.style.background = isRecent ? "rgba(56,189,248,0.04)" : "rgba(255,255,255,0.015)"}
    >
      {/* Result badge */}
      <div style={{
        width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
        background: `${passColor}15`, border: `1px solid ${passColor}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px",
      }}>
        {passed ? "🎓" : "📋"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
            background: `${passColor}20`, color: passColor, border: `1px solid ${passColor}35`,
          }}>{passed ? "PASSED" : "FAILED"}</span>
          {isRecent && (
            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}>
              Latest
            </span>
          )}
          <span style={{ fontSize: "10px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>{formatDate(entry.date)}</span>
        </div>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>
            Pass prob: <strong style={{ color: passColor }}>{(entry.probability_pass * 100).toFixed(1)}%</strong>
          </span>
          <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>
            Rating A: <strong style={{ color: ratingColor }}>{entry.predicted_rating_a?.toFixed(1)}</strong>
          </span>
          <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>
            Rating B: <strong style={{ color: getRatingColor(entry.predicted_rating_b) }}>{entry.predicted_rating_b?.toFixed(1)}</strong>
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              background: reliabilityBg,
              color: reliabilityColor,
              border: `1px solid ${reliabilityBorder}`,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
            }}
            title={reliabilityText}
          >
            {entry.reliability_category ? entry.reliability_category : reliabilityText}
          </span>
        </div>
      </div>

      {/* View arrow */}
      <span style={{ fontSize: "12px", color: "#334155", flexShrink: 0 }}>→</span>
    </div>
  );
}

// ── main StudentPage ──────────────────────────────────────────────────────────
export default function StudentPage({ onLogout }) {
  const [view, setView]           = useState("dashboard"); // "dashboard" | "predictor" | "result"
  const [history, setHistory]     = useState([]);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Load history on mount (DB-based if available)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setHistoryLoading(true);
      try {
        const items = await fetchDbHistory({ token, pageSize: 50 });
        if (!cancelled) setHistory(items);
      } catch (e) {
        // Fallback: local history (for thesis demo environments where DB isn't set up)
        if (!cancelled) setHistory(loadHistory());
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by PredictorForm when a result comes back
  const handleResult = (result) => {
    const entry = {
      ...result,
      date: new Date().toISOString(),
      id: Date.now(),
    };
    // Optimistically show result immediately; DB history refresh below.
    setHistory([entry, ...history]);
    setPendingResult(result);
    setView("result");

    // Refresh DB history so the history table is account-based
    (async () => {
      try {
        const items = await fetchDbHistory({ token, pageSize: 50 });
        setHistory(items);
        // Keep local cache in sync for fallback mode
        saveHistory(items);
      } catch {
        // ignore; local optimistic state remains
      }
    })();
  };

  const handleViewEntry = (entry) => {
    setViewingEntry(entry);
    setView("result");
  };

  const handleBackToDashboard = () => {
    setViewingEntry(null);
    setPendingResult(null);
    setView("dashboard");
    // Refresh DB view (fallback happens inside StudentPage mount/fetchDbHistory)
    (async () => {
      try {
        setHistoryLoading(true);
        const items = await fetchDbHistory({ token, pageSize: 50 });
        setHistory(items);
        saveHistory(items);
      } catch {
        setHistory(loadHistory());
      } finally {
        setHistoryLoading(false);
      }
    })();
  };

  // Summary stats from history
  const totalAttempts = history.length;
  const passCount     = history.filter(h => h.prediction === 1).length;
  const latestEntry   = history[0] || null;
  const bestRating    = history.length
    ? Math.max(...history.map(h => h.predicted_rating_a || 0)).toFixed(1)
    : "—";

  const displayedResult = viewingEntry || pendingResult;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .student-fade { animation: fadeUp 0.35s ease forwards; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
      `}</style>

      {/* ══ TOP NAV ══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(6,11,20,0.94)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "76px",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <img src="/slsulogo.png" alt="SLSU"
              style={{ width: "46px", height: "46px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(14,165,233,0.28))" }}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <div style={{ display: "none", width: "46px", height: "46px", borderRadius: "11px", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "14px" }}>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.01em", fontFamily: "'Syne',sans-serif" }}>EE Licensure Predictor</p>
            <p style={{ margin: 0, fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Sans',sans-serif" }}>Student Portal · SLSU IIEE</p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Nav buttons */}
          {view !== "dashboard" && (
            <button onClick={handleBackToDashboard} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "10px", padding: "8px 14px", color: "#94a3b8",
              fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >← Dashboard</button>
          )}
          {view === "dashboard" && (
            <button onClick={() => setView("predictor")} style={{
              background: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2))",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: "10px", padding: "8px 16px",
              color: "#38bdf8", fontSize: "12px", fontWeight: 700,
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(99,102,241,0.3))"}
              onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2))"}
            >+ Take Prediction</button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "999px", padding: "6px 14px" }}>
            <span style={{ fontSize: "13px" }}>🎓</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", fontFamily: "'DM Sans',sans-serif" }}>Student</span>
          </div>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "10px", padding: "8px 18px", color: "#64748b",
            fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
          >Sign Out</button>
        </div>
      </nav>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 16px 80px" }}>

        {/* ── DASHBOARD VIEW ── */}
        {view === "dashboard" && (
          <div className="student-fade">

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>Student Dashboard</span>
              </div>
              <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>
                Your Readiness Overview
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>
                Track your board exam predictions and review past results to monitor your progress.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "10px", marginBottom: "24px" }}>
              <StatChip label="Total Attempts"  value={totalAttempts || "—"} color="#38bdf8" />
              <StatChip label="Predicted Pass"  value={passCount || "—"}     color="#34d399" />
              <StatChip label="Best Rating A"   value={bestRating}            color="#fbbf24" />
              <StatChip
                label="Latest Result"
                value={latestEntry ? (latestEntry.prediction === 1 ? "PASS" : "FAIL") : "—"}
                color={latestEntry ? (latestEntry.prediction === 1 ? "#34d399" : "#f87171") : "#475569"}
              />
            </div>

            {/* Latest result preview */}
            {latestEntry && (
              <div style={{
                background: "linear-gradient(135deg, rgba(14,165,233,0.06), rgba(99,102,241,0.04))",
                border: "1px solid rgba(14,165,233,0.18)",
                borderRadius: "16px", padding: "18px 20px", marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{latestEntry.prediction === 1 ? "🎓" : "📋"}</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans',sans-serif" }}>Latest Prediction</p>
                      <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: latestEntry.prediction === 1 ? "#34d399" : "#f87171", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
                        {latestEntry.prediction === 1 ? "PASSED" : "FAILED"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => handleViewEntry(latestEntry)} style={{
                      background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
                      borderRadius: "10px", padding: "8px 16px", color: "#38bdf8",
                      fontSize: "12px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.1)"}
                    >View Full Result →</button>
                    <button onClick={() => setView("predictor")} style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px", padding: "8px 16px", color: "#94a3b8",
                      fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                    >↻ Retake</button>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {[
                    { label: "Pass Probability", val: `${(latestEntry.probability_pass * 100).toFixed(1)}%`, color: latestEntry.prediction === 1 ? "#34d399" : "#f87171" },
                    { label: "Predicted Rating A", val: latestEntry.predicted_rating_a?.toFixed(1), color: getRatingColor(latestEntry.predicted_rating_a) },
                    { label: "Predicted Rating B", val: latestEntry.predicted_rating_b?.toFixed(1), color: getRatingColor(latestEntry.predicted_rating_b) },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Sans',sans-serif" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: item.color, fontFamily: "'Syne',sans-serif" }}>{item.val}</p>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "10px 0 0", fontSize: "10px", color: "#334155", fontFamily: "'DM Sans',sans-serif" }}>
                  Taken on {formatDate(latestEntry.date)}
                </p>
              </div>
            )}

            {/* No history CTA */}
            {history.length === 0 && (
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: "16px", padding: "40px 24px", textAlign: "center", marginBottom: "20px",
              }}>
                <p style={{ fontSize: "36px", marginBottom: "12px" }}>📋</p>
                <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>No predictions yet</p>
                <p style={{ margin: "0 0 20px", fontSize: "12px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>Take your first EE board exam readiness prediction to get started.</p>
                <button onClick={() => setView("predictor")} style={{
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  border: "none", borderRadius: "12px", padding: "12px 28px",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(14,165,233,0.3)", transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >Start Prediction →</button>
              </div>
            )}

            {/* History list */}
            {history.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>
                    Prediction History
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  <span style={{ fontSize: "10px", color: "#334155", fontFamily: "'DM Sans',sans-serif" }}>{history.length} attempt{history.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {history.map((entry, i) => (
                    <HistoryRow key={entry.id || entry.attempt_id || i} entry={entry} index={i} onView={() => handleViewEntry(entry)} />
                  ))}
                </div>

                {/* Retake CTA */}
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button onClick={() => setView("predictor")} style={{
                    background: "transparent",
                    border: "1px solid rgba(56,189,248,0.25)",
                    borderRadius: "12px", padding: "12px 32px",
                    color: "#38bdf8", fontSize: "13px", fontWeight: 700,
                    fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >↻ Take a New Prediction</button>
                </div>
              </div>
            )}

            {/* Info footer */}
            <div style={{
              marginTop: "28px", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px", padding: "12px 16px",
            }}>
              <p style={{ margin: 0, fontSize: "10px", color: "#334155", lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
                💡 <strong style={{ color: "#475569" }}>Tip:</strong> Retake the prediction after improving your weak areas to see your updated score. Your attempts are stored to your account (DB-based) when configured.
              </p>
            </div>
          </div>
        )}

        {/* ── PREDICTOR VIEW ── */}
        {view === "predictor" && (
          <div className="student-fade">
            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>
                New Prediction
              </p>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>
                EE Board Exam Readiness Survey
              </h2>
            </div>
            <PredictorForm onResult={handleResult} />
          </div>
        )}

        {/* ── RESULT VIEW ── */}
        {view === "result" && displayedResult && (
          <div className="student-fade">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>
                  {viewingEntry ? `Result from ${formatDate(viewingEntry.date)}` : "Your Prediction Result"}
                  {displayedResult?.attempt_id ? ` · Attempt ${displayedResult.attempt_id.slice(0, 8)}` : ""}
                </p>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>
                  {viewingEntry ? "Past Result Review" : "Your Result"}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setView("predictor")} style={{
                  background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: "10px", padding: "8px 16px", color: "#38bdf8",
                  fontSize: "12px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.08)"}
                >↻ Retake</button>
                <button onClick={handleBackToDashboard} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "10px", padding: "8px 16px", color: "#94a3b8",
                  fontSize: "12px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >← Dashboard</button>
              </div>
            </div>
            <ResultCard result={displayedResult} />
          </div>
        )}
      </main>
    </div>
  );
}