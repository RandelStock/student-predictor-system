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
  DashboardGuide,
} from "./ProfessorShared";

export default function ProfessorClassificationMetricsDashboard({ modelInfo }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Classification Metrics</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Model performance on Pass/Fail prediction task.</p>
      </div>
      <DashboardGuide
        items={[
          { label: "Metric meaning", text: "Accuracy = overall correctness; precision/recall/F1 show error balance in class predictions." },
          { label: "Chart/table use", text: "Bar chart compares metric levels; reference table explains when each metric matters most." },
          { label: "Interpretation", text: "Use CV metrics to judge stability and avoid over-trusting a single run result." },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Accuracy", value: modelInfo?.classification?.accuracy, color: c.blue },
          { label: "Precision", value: modelInfo?.classification?.precision, color: c.indigo },
          { label: "Recall", value: modelInfo?.classification?.recall, color: c.teal },
          { label: "F1-Score", value: modelInfo?.classification?.f1, color: c.pass },
          { label: "CV Acc", value: modelInfo?.classification?.cv_acc, color: c.amber },
          { label: "CV F1", value: modelInfo?.classification?.cv_f1, color: c.orange },
        ].map((m, i) => (
          <MetricCard key={i} label={m.label} value={typeof m.value === "number" ? pct(m.value * 100) : "—"} color={m.color} icon={["🎯", "🔬", "📡", "⚖️", "🔄", "📊"][i]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ChartContainer title="Classification Metric Comparison" icon="📊" subtitle="Bar chart comparison of all classification metrics" accent={c.blue}>
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
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(2)}%`} />} />
              <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                {[c.blue, c.indigo, c.teal, c.pass, c.amber, c.orange].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="When to Use Each Metric" icon="📖" subtitle="Decision guide for model evaluation" accent={c.indigo}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr>
                  {["METRIC", "SYSTEM VALUE", "FOCUS", "WHEN TO USE"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
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
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#f8fafc", fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.blue, fontWeight: 700 }}>{typeof row[1] === "number" ? pct(row[1] * 100) : "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1" }}>{row[2]}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {modelInfo?.dataset_size && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>Dataset size: <strong style={{ color: "#f8fafc" }}>{modelInfo.dataset_size}</strong> records.</p>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
