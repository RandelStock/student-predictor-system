
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  c,
  pct,
  CustomTooltip,
  MetricCard,
  ChartContainer,
  FilterPanel,
} from "./ProfessorShared";

/* ─── IIEE Design Tokens ──────────────────────────────────────────────────── */
const IIEE_COLORS = {
  primary: '#1e3a8a', // Navy blue
  secondary: '#fbbf24', // Gold
  accent: '#06b6d4', // Cyan
  background: '#0f172a', // Dark navy
  surface: '#1e293b', // Slate
  text: '#f8fafc', // Light gray
  muted: '#64748b', // Muted slate
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  .classification-dashboard {
    background: ${IIEE_COLORS.background};
    min-height: 100vh;
    color: #cbd5e1;
    font-family: 'Inter', sans-serif;
  }
  .sticky-filter {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(15, 26, 42, 0.95);
    border: 1px solid rgba(251, 191, 36, 0.18);
    border-radius: 14px;
    padding: clamp(10px, 2vw, 18px);
    margin-bottom: clamp(12px, 3vw, 24px);
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .chart-description {
    margin-top: 10px;
    font-size: clamp(11px, 1.5vw, 13px);
    color: #cbd5e1;
    line-height: 1.5;
  }
  @media (max-width: 768px) {
    .sticky-filter {
      padding: 12px;
      margin-bottom: 16px;
    }
  }
`;

export default function ProfessorClassificationMetricsDashboard({ modelInfo }) {

  return (
    <div className="classification-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, fontFamily: "'Montserrat',sans-serif", color: IIEE_COLORS.secondary }}>Classification Metrics</h2>
        <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>Model performance on Pass/Fail prediction task.</p>
      </div>

      <div className="sticky-filter">
        <FilterPanel />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Accuracy", value: modelInfo?.classification?.accuracy, color: IIEE_COLORS.accent, hint: "Overall correct predictions / total samples; higher is better." },
          { label: "Precision", value: modelInfo?.classification?.precision, color: c.indigo, hint: "Low false positives: how many predicted pass are true pass." },
          { label: "Recall", value: modelInfo?.classification?.recall, color: c.teal, hint: "Low false negatives: how many actual pass cases were found." },
          { label: "F1-Score", value: modelInfo?.classification?.f1, color: c.pass, hint: "Harmonic mean of precision and recall for balanced performance." },
          { label: "CV Acc", value: modelInfo?.classification?.cv_acc, color: IIEE_COLORS.secondary, hint: "Cross-validated accuracy: stability across folds." },
          { label: "CV F1", value: modelInfo?.classification?.cv_f1, color: c.orange, hint: "Cross-validated F1: stability of balance between precision/recall." },
        ].map((m, i) => (
          <MetricCard key={i} label={m.label} value={typeof m.value === "number" ? pct(m.value * 100) : "—"} color={m.color} icon={["🎯", "🔬", "📡", "⚖️", "🔄", "📊"][i]} hint={m.hint} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ChartContainer title="Classification Metric Comparison" icon="📊" subtitle="Bar chart comparison of all classification metrics" accent={IIEE_COLORS.secondary}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Accuracy", value: (modelInfo?.classification?.accuracy ?? 0) * 100 },
                { name: "Precision", value: (modelInfo?.classification?.precision ?? 0) * 100 },
                { name: "Recall", value: (modelInfo?.classification?.recall ?? 0) * 100 },
                { name: "F1-Score", value: (modelInfo?.classification?.f1 ?? 0) * 100 },
                { name: "CV Acc", value: (modelInfo?.classification?.cv_acc ?? 0) * 100 },
                { name: "CV F1", value: (modelInfo?.classification?.cv_f1 ?? 0) * 100 },
              ]}
              margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: IIEE_COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: IIEE_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(2)}%`} />} />
              <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                {[IIEE_COLORS.accent, c.indigo, c.teal, c.pass, IIEE_COLORS.secondary, c.orange].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-description">
            This bar chart provides a visual comparison of all key classification metrics, allowing you to quickly identify strengths and weaknesses in the model's performance. Each bar represents a different metric, with higher values indicating better performance. The cross-validation metrics (CV Acc and CV F1) show how consistently the model performs across different data subsets, helping assess model stability.
          </div>
        </ChartContainer>

        <ChartContainer title="When to Use Each Metric" icon="📖" subtitle="Decision guide for model evaluation" accent={IIEE_COLORS.accent}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "clamp(10px, 1.5vw, 12px)", fontFamily: "'Inter',sans-serif" }}>
              <thead>
                <tr>
                  {["METRIC", "SYSTEM VALUE", "FOCUS", "WHEN TO USE"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#94a3b8", fontWeight: 700, fontSize: "clamp(9px, 1.2vw, 11px)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Montserrat',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Accuracy", modelInfo?.classification?.accuracy, "Overall correctness", "Balanced classes"],
                  ["Precision", modelInfo?.classification?.precision, "Avoid false positives", "Spam/fraud"],
                  ["Recall", modelInfo?.classification?.recall, "Catch all positives", "Medical/safety"],
                  ["F1-Score", modelInfo?.classification?.f1, "Precision-recall balance", "Imbalanced data"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1", fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>{row[0]}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.accent, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{typeof row[1] === "number" ? pct(row[1] * 100) : "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>{row[2]}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chart-description">
            This reference table explains the practical application of each classification metric. It helps you understand when to prioritize different aspects of model performance based on your specific use case. For example, in medical diagnosis, recall might be more important than precision to ensure all potential cases are identified, even if it means more false positives.
          </div>
          {modelInfo?.dataset_size && (
            <p style={{ marginTop: 10, fontSize: "clamp(11px, 1.5vw, 13px)", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>Dataset size: <strong style={{ color: "#cbd5e1" }}>{modelInfo.dataset_size}</strong> records.</p>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
