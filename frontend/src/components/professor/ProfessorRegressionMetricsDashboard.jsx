import { useState } from "react";
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
  .regression-dashboard {
    background: ${IIEE_COLORS.background};
    min-height: 100vh;
    color: ${IIEE_COLORS.text};
    font-family: 'DM Sans', sans-serif;
  }
  .sticky-filter {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(15, 26, 42, 0.95);
    border: 1px solid rgba(251, 191, 36, 0.18);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 24px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .chart-description {
    margin-top: 10px;
    font-size: 12px;
    color: ${IIEE_COLORS.muted};
    line-height: 1.5;
  }
`;

export default function ProfessorRegressionMetricsDashboard({ modelInfo }) {

  return (
    <div className="regression-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: IIEE_COLORS.secondary }}>Regression Metrics</h2>
        <p style={{ margin: 0, fontSize: 13, color: IIEE_COLORS.muted }}>System metrics for rating prediction model development (Model A & B).</p>
      </div>

      <div className="sticky-filter">
        <FilterPanel />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Reg A — MAE", value: num(modelInfo?.regression_a?.mae, 2), color: IIEE_COLORS.accent, hint: "Mean absolute error; lower = smaller average absolute deviation." },
          { label: "Reg A — RMSE", value: num(modelInfo?.regression_a?.rmse, 2), color: c.indigo, hint: "Root mean squared error; lower = smaller average prediction variance; penalizes large errors." },
          { label: "Reg A — R²", value: num(modelInfo?.regression_a?.r2, 3), color: c.pass, hint: "Variance explained; higher = better predictive power." },
          { label: "Reg B — MAE", value: num(modelInfo?.regression_b?.mae, 2), color: c.teal, hint: "Mean absolute error; lower = smaller average absolute deviation." },
          { label: "Reg B — RMSE", value: num(modelInfo?.regression_b?.rmse, 2), color: IIEE_COLORS.secondary, hint: "Root mean squared error; lower = smaller average prediction variance; penalizes large errors." },
          { label: "Reg B — R²", value: num(modelInfo?.regression_b?.r2, 3), color: c.orange, hint: "Variance explained; higher = better predictive power." },
        ].map((m, i) => (
          <MetricCard key={i} label={m.label} value={m.value} color={m.color} icon={["📉", "📈", "🎯", "📉", "📈", "🎯"][i]} hint={m.hint} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ChartContainer title="Model A vs Model B Comparison" icon="📊" subtitle="MAE, RMSE, R² side-by-side" accent={IIEE_COLORS.secondary}>
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
              <XAxis dataKey="name" tick={{ fill: IIEE_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: IIEE_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(4)} />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: IIEE_COLORS.muted, fontSize: 12 }}>Model {v}</span>} />
              <Bar dataKey="A" name="A" fill={IIEE_COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" name="B" fill={c.indigo} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-description">
            This bar chart provides a direct visual comparison between Regression Model A and Model B across three key metrics. Model A uses basic features (EE, MATH, ESAS, GWA) from a larger combined dataset, while Model B uses advanced features (including survey responses) from a smaller focused dataset. Lower bars for MAE and RMSE indicate better accuracy, while higher bars for R² indicate better variance explanation.
          </div>
        </ChartContainer>

        <ChartContainer title="Regression Metrics Reference" icon="📐" subtitle="Error types and optimization goals" accent={IIEE_COLORS.accent}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr>
                  {["METRIC", "MODEL A", "MODEL B", "UNITS", "SENSITIVITY", "GOAL"].map((h) => (
                    <th key={h} style={{ padding: "9px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: IIEE_COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
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
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.text, fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.accent, fontWeight: 700 }}>{typeof row[1] === "number" ? row[1].toFixed(4) : "—"}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: c.indigo, fontWeight: 700 }}>{typeof row[2] === "number" ? row[2].toFixed(4) : "—"}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.text }}>{row[3]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.muted }}>{row[4]}</td>
                    <td style={{ padding: "9px 10px", borderBottom: "1px solid rgba(30,41,59,0.6)", color: IIEE_COLORS.muted }}>{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chart-description">
            This reference table provides detailed information about each regression metric, including the actual values for both models, measurement units, sensitivity to outliers, and optimization goals. MAE (Mean Absolute Error) measures average prediction error, RMSE (Root Mean Square Error) penalizes large errors more heavily, and R² indicates the proportion of variance in the target variable that is explained by the model. Use this table to understand which metrics are most important for your specific use case.
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
