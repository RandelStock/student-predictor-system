import { c, ChartContainer, FilterPanel } from "./ProfessorShared";

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
  .correlation-dashboard {
    background: ${IIEE_COLORS.background};
    min-height: 100vh;
    color: ${IIEE_COLORS.text};
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
    line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  @media (max-width: 768px) {
    .correlation-dashboard { padding: 12px; }
  }
  @media (max-width: 640px) {
    .correlation-dashboard { padding: 8px; }
  }
`;

export default function ProfessorCorrelationDashboard({ correlation }) {
  return (
    <div className="correlation-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, fontFamily: "'Montserrat',sans-serif", color: IIEE_COLORS.secondary }}>Correlation Matrix</h2>
        <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>Pearson correlations between key academic variables and exam outcome.</p>
      </div>

      <div className="sticky-filter">
        <FilterPanel />
      </div>
      <ChartContainer title="Correlation Matrix" icon="🧮" subtitle="Pearson correlations between key academic variables and exam outcome" fullWidth accent={IIEE_COLORS.secondary}>
        {correlation ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: IIEE_COLORS.text }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: IIEE_COLORS.muted, fontWeight: 700, fontSize: 11 }}>Variable</th>
                    {(correlation.columns ?? []).map((col) => (
                      <th key={col} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: IIEE_COLORS.muted, fontWeight: 700, fontSize: 11 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(correlation.matrix ?? []).map((row) => (
                    <tr key={row.row}>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: IIEE_COLORS.text }}>{row.row}</td>
                      {(correlation.columns ?? []).map((col) => {
                        const val = row[col];
                        const absVal = Math.abs(val);
                        const isDiag = col === row.row;
                        const color = isDiag ? IIEE_COLORS.muted : absVal >= 0.7 ? c.pass : absVal >= 0.4 ? c.amber : IIEE_COLORS.muted;
                        const bg = isDiag ? "transparent" : absVal >= 0.7 ? `${c.pass}12` : absVal >= 0.4 ? `${c.amber}12` : "transparent";
                        return (
                          <td
                            key={col}
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid rgba(30,41,59,0.5)",
                              textAlign: "right",
                              fontWeight: absVal >= 0.4 && !isDiag ? 700 : 400,
                              color,
                              background: bg,
                              borderRadius: absVal >= 0.4 ? 4 : 0,
                            }}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-description">
              This correlation matrix displays Pearson correlation coefficients between various academic variables and exam outcomes. Correlation measures the strength and direction of linear relationships between variables. Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation), with 0 indicating no linear relationship. Strong correlations (|r| &ge; 0.7) are highlighted in green, moderate correlations (0.4 &le; |r| &lt; 0.7) in amber, and weak correlations in muted gray. The diagonal shows perfect self-correlations of 1.00. This analysis helps identify which factors most strongly predict academic success and informs targeted interventions.
            </div>
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: IIEE_COLORS.muted, lineHeight: 1.6 }}>
              📊 <strong style={{ color: IIEE_COLORS.text }}>How Correlation Works:</strong> Pearson correlation quantifies how changes in one variable predict changes in another. For example, a correlation of 0.8 between study hours and exam scores suggests that students who study more tend to score higher. This relationship is made possible through statistical analysis of paired observations across the dataset, calculating covariance divided by the product of standard deviations. While correlation shows association, it doesn't prove causation — other factors may influence the observed relationships. Use these insights to guide further investigation and policy decisions.
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: IIEE_COLORS.muted }}>Correlation data not available.</p>
        )}
      </ChartContainer>
    </div>
  );
}
