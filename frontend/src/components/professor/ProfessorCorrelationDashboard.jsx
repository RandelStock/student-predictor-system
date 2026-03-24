import { c, ChartContainer, DashboardGuide } from "./ProfessorShared";

export default function ProfessorCorrelationDashboard({ correlation }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Correlation Matrix</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pearson correlations between key academic variables and exam outcome.</p>
      </div>
      <DashboardGuide
        items={[
          { label: "What this matrix is", text: "Pearson correlations among key variables related to outcomes." },
          { label: "How to read values", text: "Near +1/-1 means stronger relationship; near 0 means weak relationship." },
          { label: "Use in decisions", text: "Treat correlation as association only; validate with additional analysis before action." },
        ]}
      />
      <ChartContainer title="Correlation Matrix" icon="🧮" subtitle="Pearson correlations between key academic variables and exam outcome" fullWidth accent={c.blue}>
        {correlation ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: 11 }}>Variable</th>
                    {(correlation.columns ?? []).map((col) => (
                      <th key={col} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.15)", textAlign: "right", color: "#64748b", fontWeight: 700, fontSize: 11 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(correlation.matrix ?? []).map((row) => (
                    <tr key={row.row}>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid rgba(30,41,59,0.5)", fontWeight: 700, color: "#f1f5f9" }}>{row.row}</td>
                      {(correlation.columns ?? []).map((col) => {
                        const val = row[col];
                        const absVal = Math.abs(val);
                        const isDiag = col === row.row;
                        const color = isDiag ? "#475569" : absVal >= 0.7 ? c.pass : absVal >= 0.4 ? c.amber : "#94a3b8";
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
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
              💡 Values <strong style={{ color: c.pass }}>&gt; 0.7</strong> = strong correlation. <strong style={{ color: c.amber }}>0.4–0.7</strong> = moderate. Diagonal = 1.00 (self).
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: "#64748b" }}>Correlation data not available.</p>
        )}
      </ChartContainer>
    </div>
  );
}
