import ExamineeDetailPanel from "../ExamineeDetailPanel";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  c,
  pct,
  num,
  MetricCard,
  ChartContainer,
  DashboardGuide,
  FilterPanel,
} from "./ProfessorShared";

const IIEE_COLORS = {
  primary: '#1e3a8a',
  secondary: '#fbbf24',
  accent: '#06b6d4',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  muted: '#64748b',
};

const styles = `
  .test2025-dashboard {
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

export default function ProfessorTest2025Dashboard({
  testLoading,
  test2025,
  scatterData,
  test2025Records,
  selectedTestIdx,
  setSelectedTestIdx,
  test2025Run,
  test2025RunLoading,
}) {

  return (
    <div className="test2025-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: IIEE_COLORS.secondary }}>2025 Test Data Evaluation</h2>
        <p style={{ margin: 0, fontSize: 13, color: IIEE_COLORS.muted }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025 only).</p>
      </div>
      <div className="sticky-filter">
        <FilterPanel />
      </div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>2025 Final Defense</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Held-out evaluation on <strong>DATA_TEST.xlsx</strong> (2025).</p>
      </div>
      <DashboardGuide
        items={[
          { label: "What this test is", text: "Held-out 2025 dataset evaluation to check model generalization beyond training data." },
          { label: "Core visuals", text: "Metrics, scatter, and confusion matrix show overall accuracy and error behavior." },
          { label: "Row-level check", text: "Examinee panel validates predictions per student record for defense transparency." },
        ]}
      />

      {testLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#64748b" }}>Loading 2025 metrics…</div>
      ) : test2025?.error ? (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: "14px 18px" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{test2025.error}</p>
        </div>
      ) : test2025 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
            <MetricCard label="Test Accuracy" value={pct((test2025.classification?.accuracy ?? 0) * 100)} color={(test2025.classification?.accuracy ?? 0) >= 0.9 ? c.pass : c.amber} icon="🎯" hint="Overall correct pass/fail predictions on held-out 2025 test set." />
            <MetricCard label="Precision" value={pct((test2025.classification?.precision ?? 0) * 100)} color={c.blue} icon="🔬" hint="Low false positives: correct pass predictions out of all pass predictions." />
            <MetricCard label="Recall" value={pct((test2025.classification?.recall ?? 0) * 100)} color={c.indigo} icon="📡" hint="Low false negatives: true passes captured by the model." />
            <MetricCard label="F1-Score" value={pct((test2025.classification?.f1 ?? 0) * 100)} color={c.teal} icon="⚖️" hint="Balance of precision and recall for 2025 classification performance." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <ChartContainer title="Regression A (EE+MATH+ESAS+GWA)" icon="📉" subtitle="Predicted PRC TOTAL RATING — model A" accent={IIEE_COLORS.accent}>
              {[["R²", "r2", 4], ["MAE", "mae", 4], ["MSE", "mse", 4], ["RMSE", "rmse", 4]].map(([label, key, d]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 13, color: IIEE_COLORS.muted }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: IIEE_COLORS.accent, fontFamily: "'Syne',sans-serif" }}>{num(test2025.regression?.a?.[key], d)}</span>
                </div>
              ))}
              <div className="chart-description">This section shows model A performance on 2025 test data only. Lower MAE/RMSE and higher R² indicate stronger prediction quality for final rating data.</div>
            </ChartContainer>

            <ChartContainer title="Regression B (GWA + Survey only)" icon="🧠" subtitle="Predicted PRC TOTAL RATING — model B (no subjects)" accent={IIEE_COLORS.primary}>
              {[["R²", "r2", 4], ["MAE", "mae", 4], ["MSE", "mse", 4], ["RMSE", "rmse", 4]].map(([label, key, d]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 13, color: IIEE_COLORS.muted }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: c.indigo, fontFamily: "'Syne',sans-serif" }}>{num(test2025.regression?.b?.[key], d)}</span>
                </div>
              ))}
              <div className="chart-description">This section shows model B performance on 2025 test data only. It is built without subject scores to validate survey-only predictive capacity.</div>
            </ChartContainer>
          </div>

          {scatterData.length > 0 && (
            <ChartContainer title="Actual vs Predicted Scores" icon="🎯" subtitle="Scatter plot — dots closer to diagonal = better prediction" fullWidth accent={c.teal}>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 12, right: 24, left: -8, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="actual" name="Actual" domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Actual Score", position: "insideBottom", offset: -5, fill: "#475569", fontSize: 11 }} />
                  <YAxis type="number" dataKey="predicted" name="Predicted" domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Predicted Score", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div style={{ background: "#0f1a2e", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                        <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>Actual: <strong style={{ color: "#f1f5f9" }}>{d.actual?.toFixed(2)}</strong></p>
                        <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>Predicted: <strong style={{ color: "#f1f5f9" }}>{d.predicted?.toFixed(2)}</strong></p>
                        <p style={{ margin: 0, color: d.passed ? c.pass : c.fail }}>{d.passed ? "✅ Passed" : "❌ Failed"}</p>
                      </div>
                    );
                  }} />
                  <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Perfect prediction", position: "insideTopLeft", fill: "#475569", fontSize: 10 }} />
                  <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" label={{ value: "70% pass threshold", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
                  <ReferenceLine y={70} stroke={c.amber} strokeDasharray="4 3" />
                  <Scatter data={scatterData.filter((d) => d.passed)} fill={c.pass} fillOpacity={0.75} r={4} name="Passed" />
                  <Scatter data={scatterData.filter((d) => !d.passed)} fill={c.fail} fillOpacity={0.75} r={4} name="Failed" />
                  <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          <ChartContainer title="Confusion Matrix (Pass/Fail)" icon="🧾" subtitle="Actual vs Predicted on DATA_TEST 2025" fullWidth accent={c.fail}>
            {test2025.confusion_matrix ? (
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confusion Matrix Heatmap</p>
                  <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: 4 }}>
                    <div />
                    <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "4px 8px" }}>Pred FAIL</div>
                    <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "4px 8px" }}>Pred PASS</div>
                    <div style={{ fontSize: 11, color: c.fail, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center" }}>Act FAIL</div>
                    {[{ v: test2025.confusion_matrix.actual_fail.pred_fail, good: true }, { v: test2025.confusion_matrix.actual_fail.pred_pass, good: false }].map((cell, i) => (
                      <div key={i} style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: cell.good ? `${c.pass}20` : `${c.fail}15`, border: `1px solid ${cell.good ? c.pass : c.fail}30`, borderRadius: 10, fontSize: 22, fontWeight: 800, color: cell.good ? c.pass : c.fail, fontFamily: "'Syne',sans-serif" }}>{cell.v}</div>
                    ))}
                    <div style={{ fontSize: 11, color: c.pass, fontWeight: 700, padding: "4px 8px", display: "flex", alignItems: "center" }}>Act PASS</div>
                    {[{ v: test2025.confusion_matrix.actual_pass.pred_fail, good: false }, { v: test2025.confusion_matrix.actual_pass.pred_pass, good: true }].map((cell, i) => (
                      <div key={i} style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: cell.good ? `${c.pass}20` : `${c.fail}15`, border: `1px solid ${cell.good ? c.pass : c.fail}30`, borderRadius: 10, fontSize: 22, fontWeight: 800, color: cell.good ? c.pass : c.fail, fontFamily: "'Syne',sans-serif" }}>{cell.v}</div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 11 }}>Actual \\ Predicted</th>
                          <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>FAIL</th>
                          <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>PASS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: c.fail }}>FAIL</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", fontWeight: 800, color: c.pass }}>{test2025.confusion_matrix.actual_fail.pred_fail}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", color: c.fail }}>{test2025.confusion_matrix.actual_fail.pred_pass}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: c.pass }}>PASS</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", color: c.fail }}>{test2025.confusion_matrix.actual_pass.pred_fail}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", textAlign: "right", fontWeight: 800, color: c.pass }}>{test2025.confusion_matrix.actual_pass.pred_pass}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 12, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                    Parsed from <code style={{ color: "#94a3b8" }}>evaluation_report.txt</code>. Re-run <code style={{ color: "#94a3b8" }}>train_model.py</code> after dataset changes.
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Confusion matrix not available.</p>
            )}
          </ChartContainer>

          <ChartContainer title="Select a 2025 Examinee (Row-level check)" icon="🧪" subtitle="Choose one row from DATA_TEST and view predicted vs actual + survey answers" fullWidth accent={c.teal}>
            <ExamineeDetailPanel records={test2025Records} selectedIdx={selectedTestIdx} onSelect={setSelectedTestIdx} runData={test2025Run} runLoading={test2025RunLoading} />
          </ChartContainer>
        </>
      ) : (
        <p style={{ fontSize: 12, color: "#64748b" }}>No 2025 defense metrics available.</p>
      )}
    </div>
  );
}
