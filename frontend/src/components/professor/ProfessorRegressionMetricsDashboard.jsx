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
  c,
  num,
  CustomTooltip,
  MetricCard,
  ChartContainer,
  DashboardGuide,
} from "./ProfessorShared";

export default function ProfessorRegressionMetricsDashboard({ modelInfo }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Regression Metrics</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>System metrics for rating prediction model development (Model A & B).</p>
      </div>
      <DashboardGuide
        items={[
          { label: "Metric meaning", text: "MAE/RMSE measure prediction error size, while R² indicates explained variance." },
          { label: "Model comparison", text: "Side-by-side bars show which model performs better per metric." },
          { label: "Interpretation", text: "Lower MAE/RMSE and higher R² generally indicate a stronger score-prediction model." },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Reg A — MAE", value: num(modelInfo?.regression_a?.mae, 2), color: c.blue },
          { label: "Reg A — RMSE", value: num(modelInfo?.regression_a?.rmse, 2), color: c.indigo },
          { label: "Reg A — R²", value: num(modelInfo?.regression_a?.r2, 3), color: c.pass },
          { label: "Reg B — MAE", value: num(modelInfo?.regression_b?.mae, 2), color: c.teal },
          { label: "Reg B — RMSE", value: num(modelInfo?.regression_b?.rmse, 2), color: c.amber },
          { label: "Reg B — R²", value: num(modelInfo?.regression_b?.r2, 3), color: c.orange },
        ].map((m, i) => (
          <MetricCard key={i} label={m.label} value={m.value} color={m.color} icon={["📉", "📈", "🎯", "📉", "📈", "🎯"][i]} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ChartContainer title="Model A vs Model B Comparison" icon="📊" subtitle="MAE, RMSE, R² side-by-side" accent={c.blue}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={[
                { name: "MAE", A: modelInfo?.regression_a?.mae, B: modelInfo?.regression_b?.mae },
                { name: "RMSE", A: modelInfo?.regression_a?.rmse, B: modelInfo?.regression_b?.rmse },
                { name: "R²", A: modelInfo?.regression_a?.r2, B: modelInfo?.regression_b?.r2 },
              ]}
              margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(4)} />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>Model {v}</span>} />
              <Bar dataKey="A" name="A" fill={c.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" name="B" fill={c.indigo} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Regression Metrics Reference" icon="📐" subtitle="Error types and optimization goals" accent={c.indigo}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr>
                  {["METRIC", "MODEL A", "MODEL B", "UNITS", "SENSITIVITY", "GOAL"].map((h) => (
                    <th key={h} style={{ padding: "9px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["MAE", modelInfo?.regression_a?.mae, modelInfo?.regression_b?.mae, "Same as target", "Low", "Minimize avg error"],
                  ["RMSE", modelInfo?.regression_a?.rmse, modelInfo?.regression_b?.rmse, "Same as target", "High", "Avoid large misses"],
                  ["R² Score", modelInfo?.regression_a?.r2, modelInfo?.regression_b?.r2, "None (Percentage)", "Moderate", "Maximize variance explained"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#f8fafc", fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.blue, fontWeight: 700 }}>{typeof row[1] === "number" ? row[1].toFixed(4) : "—"}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.indigo, fontWeight: 700 }}>{typeof row[2] === "number" ? row[2].toFixed(4) : "—"}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#cbd5e1" }}>{row[3]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[4]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: "#94a3b8" }}>{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
