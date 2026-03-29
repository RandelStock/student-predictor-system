import { c, ChartContainer, FilterPanel, CollapsibleGuide } from "./ProfessorShared";

/* ─── IIEE Design Tokens ──────────────────────────────────────────────────── */
const IIEE_COLORS = {
  primary: '#1e3a8a',
  secondary: '#fbbf24',
  accent: '#06b6d4',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  muted: '#64748b',
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

/* ─── Guide content for the CollapsibleGuide ─────────────────────────────── */
const GUIDE_SECTIONS = [
  {
    title: "What is a Correlation Matrix?",
    content:
      "A correlation matrix shows Pearson correlation coefficients (r) between pairs of academic variables. Each cell tells you how strongly two variables move together — whether higher values in one tend to come with higher or lower values in another.",
  },
  {
    title: "How to Read the Values",
    content:
      "Values range from -1.00 to +1.00. A value near +1 means a strong positive relationship (both go up together). Near -1 means a strong negative relationship (one goes up as the other goes down). Near 0 means little to no linear relationship. The diagonal always shows 1.00 — each variable perfectly correlates with itself.",
  },
  {
    title: "Color Coding",
    content:
      "🟢 Green cells (|r| ≥ 0.70) indicate strong correlations worth investigating further. 🟡 Amber cells (0.40 ≤ |r| < 0.70) indicate moderate correlations. ⬜ Muted/gray cells indicate weak or negligible correlations. Diagonal cells are always muted since they are self-correlations.",
  },
  {
    title: "Correlation ≠ Causation",
    content:
      "A high correlation between two variables does not mean one causes the other. A third hidden variable may be influencing both. Use correlations as a starting point for deeper investigation — not as definitive proof of cause and effect.",
  },
  {
    title: "Using This for Interventions",
    content:
      "Variables with strong correlations to exam outcomes (pass/fail, PRC rating) are your highest-leverage targets. If a survey factor like 'Departmental Review Quality' strongly correlates with passing, investing in that area is likely to move outcomes. Cross-reference with the Feature Importance tab to confirm.",
  },
];

export default function ProfessorCorrelationDashboard({ correlation }) {
  return (
    <div className="correlation-dashboard fade-in">
      <style>{styles}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{
          margin: "0 0 4px",
          fontSize: "clamp(18px, 4vw, 24px)",
          fontWeight: 700,
          fontFamily: "'Montserrat', sans-serif",
          color: IIEE_COLORS.secondary,
        }}>
          Correlation Matrix
        </h2>
        <p style={{
          margin: 0,
          fontSize: "clamp(12px, 1.5vw, 14px)",
          color: "#cbd5e1",
          fontFamily: "'Inter', sans-serif",
        }}>
          Pearson correlations between key academic variables and exam outcome.
        </p>
      </div>

      {/* ── How-to Guide (collapsible) ── */}
      <CollapsibleGuide
        title="How to Read This Chart"
        sections={GUIDE_SECTIONS}
      />

      {/* ── Sticky Filter Panel ── */}
      <div className="sticky-filter">
        <FilterPanel />
      </div>

      {/* ── Main Chart Card ── */}
      <ChartContainer
        title="Correlation Matrix"
        icon="🧮"
        subtitle="Pearson correlations between key academic variables and exam outcome"
        fullWidth
        accent={IIEE_COLORS.secondary}
      >
        {correlation ? (
          <>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                borderCollapse: "collapse",
                width: "100%",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                color: IIEE_COLORS.text,
              }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid rgba(148,163,184,0.15)",
                      textAlign: "left",
                      color: IIEE_COLORS.muted,
                      fontWeight: 700,
                      fontSize: 11,
                    }}>
                      Variable
                    </th>
                    {(correlation.columns ?? []).map((col) => (
                      <th key={col} style={{
                        padding: "8px 10px",
                        borderBottom: "1px solid rgba(148,163,184,0.15)",
                        textAlign: "right",
                        color: IIEE_COLORS.muted,
                        fontWeight: 700,
                        fontSize: 11,
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(correlation.matrix ?? []).map((row) => (
                    <tr key={row.row}>
                      <td style={{
                        padding: "8px 10px",
                        borderBottom: "1px solid rgba(30,41,59,0.5)",
                        fontWeight: 700,
                        color: IIEE_COLORS.text,
                      }}>
                        {row.row}
                      </td>
                      {(correlation.columns ?? []).map((col) => {
                        const val = row[col];
                        const absVal = Math.abs(val);
                        const isDiag = col === row.row;
                        const color = isDiag
                          ? IIEE_COLORS.muted
                          : absVal >= 0.7
                          ? c.pass
                          : absVal >= 0.4
                          ? c.amber
                          : IIEE_COLORS.muted;
                        const bg = isDiag
                          ? "transparent"
                          : absVal >= 0.7
                          ? `${c.pass}12`
                          : absVal >= 0.4
                          ? `${c.amber}12`
                          : "transparent";
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

            {/* Description */}
            <div className="chart-description">
              This correlation matrix displays Pearson correlation coefficients between various academic variables
              and exam outcomes. Values range from -1 (perfect negative correlation) to +1 (perfect positive
              correlation), with 0 indicating no linear relationship. Strong correlations (|r|&nbsp;&ge;&nbsp;0.7)
              are highlighted in green, moderate correlations (0.4&nbsp;&le;&nbsp;|r|&nbsp;&lt;&nbsp;0.7) in amber,
              and weak correlations in muted gray. The diagonal shows perfect self-correlations of 1.00.
            </div>

            {/* Explainer box */}
            <div style={{
              marginTop: 14,
              background: "rgba(255,255,255,0.025)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 12,
              color: IIEE_COLORS.muted,
              lineHeight: 1.6,
            }}>
              📊 <strong style={{ color: IIEE_COLORS.text }}>How Correlation Works:</strong>{" "}
              Pearson correlation quantifies how changes in one variable predict changes in another.
              For example, a correlation of 0.8 between study hours and exam scores suggests that
              students who study more tend to score higher. While correlation shows association, it
              doesn't prove causation — other factors may influence the observed relationships.
              Use these insights to guide further investigation and policy decisions.
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: IIEE_COLORS.muted }}>Correlation data not available.</p>
        )}
      </ChartContainer>
    </div>
  );
}