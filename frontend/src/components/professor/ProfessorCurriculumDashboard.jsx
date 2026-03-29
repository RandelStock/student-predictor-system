import { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  c,
  num,
  CustomTooltip,
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
  .curriculum-dashboard {
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
  .scrollable-chart {
    max-height: 400px;
    overflow-y: auto;
  }
  @media (max-width: 768px) {
    .sticky-filter {
      padding: 12px;
      margin-bottom: 16px;
    }
  }
`;

function TinyBar({ value = 0, max = 100, color = "#38bdf8", height = 5 }) {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
  return (
    <div style={{ width: "100%", height, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width, height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}

export default function ProfessorCurriculumDashboard({ weakestQ }) {
  const categories = useMemo(() => {
    const counts = {};
    weakestQ.forEach((q) => {
      if (!counts[q.section]) counts[q.section] = { count: 0, avgTotal: 0 };
      counts[q.section].count += 1;
      counts[q.section].avgTotal += q.avg;
    });
    return Object.entries(counts)
      .map(([label, v]) => ({ label, count: v.count, avg: v.avgTotal / v.count }))
      .sort((a, b) => b.avg - a.avg);
  }, [weakestQ]);

  return (
    <div className="curriculum-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, fontFamily: "'Montserrat',sans-serif", color: IIEE_COLORS.secondary }}>Curriculum Gap Analysis</h2>
        <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>Survey items with the lowest scores — indicating institutional weaknesses.</p>
      </div>

      <div className="sticky-filter">
        <FilterPanel />
      </div>

      <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: IIEE_COLORS.secondary, fontFamily: "'Montserrat',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
          <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
            Items sorted by average Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores mean more disagreement — institutional gaps.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <ChartContainer title="Weakest Survey Items" icon="🔎" subtitle="All survey items ranked by disagreement score" accent={IIEE_COLORS.secondary}>
          <div className="scrollable-chart">
            <ResponsiveContainer width="100%" height={Math.max(320, weakestQ.length * 20)}>
              <BarChart data={weakestQ.map((q) => ({ name: q.key, avg: q.avg, label: q.label, section: q.section }))} layout="vertical" margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[2, 3]} tick={{ fill: IIEE_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: IIEE_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: IIEE_COLORS.surface, border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: IIEE_COLORS.text, maxWidth: 220 }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, color: c.fail }}>{d.name}</p>
                      <p style={{ margin: "0 0 2px", color: IIEE_COLORS.muted }}>{d.label}</p>
                      <p style={{ margin: 0 }}>Score: <strong style={{ color: c.fail }}>{d.avg?.toFixed(2)}/4</strong> · {d.section}</p>
                    </div>
                  );
                }} />
                <ReferenceLine x={2.5} stroke={IIEE_COLORS.secondary} strokeDasharray="4 3" label={{ value: "2.5 critical", position: "insideTopRight", fill: IIEE_COLORS.secondary, fontSize: 9 }} />
                <Bar dataKey="avg" name="Avg Score" radius={[0, 5, 5, 0]}>
                  {weakestQ.map((entry, index) => (
                    <Cell key={index} fill={entry.avg >= 2.7 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-description">
            This chart displays all {weakestQ.length} survey questions ranked by their average disagreement score. Higher scores indicate greater institutional gaps. Scroll to view all items and identify priority areas for curriculum improvement.
          </div>
        </ChartContainer>

        <ChartContainer title="Gap Summary by Category" icon="📋" subtitle="Categories ranked by average weakness score" accent={IIEE_COLORS.secondary}>
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: IIEE_COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[2, 3]} tick={{ fill: IIEE_COLORS.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v?.toFixed(2)}/4`} />} />
                <Bar dataKey="avg" name="Avg Score" radius={[5, 5, 0, 0]}>
                  {categories.map((entry, index) => (
                    <Cell key={index} fill={entry.avg >= 2.65 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginTop: 12 }}>
              {categories.slice(0, 12).map((cat, i) => {  // Show more items
                const sev = cat.avg >= 2.65 ? c.fail : cat.avg >= 2.55 ? c.amber : c.orange;
                return (
                  <div key={i} style={{ background: `${sev}0d`, border: `1px solid ${sev}25`, borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: IIEE_COLORS.text }}>{cat.label}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 10, color: IIEE_COLORS.muted }}>{cat.count} weak item{cat.count > 1 ? "s" : ""}</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: sev, fontFamily: "'Montserrat',sans-serif" }}>{num(cat.avg)}<span style={{ fontSize: 10, color: IIEE_COLORS.muted }}>/4</span></p>
                  </div>
                );
              })}
            </div>
            <div className="chart-description">
              This summary groups survey items by category and calculates average disagreement scores. Categories with higher averages indicate systemic weaknesses in specific curriculum areas. The grid below shows detailed metrics for each category, helping prioritize improvement efforts.
            </div>
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: IIEE_COLORS.muted, lineHeight: 1.6 }}>
              📊 <strong style={{ color: IIEE_COLORS.text }}>Analysis:</strong> Categories like Facilities and Department Review show the highest average scores, suggesting critical gaps in physical resources and departmental evaluation processes. Medium-scoring categories such as Curriculum Development and Student Support indicate areas needing moderate attention. Low-scoring categories may still have individual weak items that require targeted interventions. Overall, this distribution highlights the need for comprehensive curriculum enhancement across multiple dimensions.
            </div>
          </>
        </ChartContainer>
      </div>

      <ChartContainer title="Detailed Weak Survey Items" icon="📋" subtitle="Comprehensive view of all weak survey items with severity ratings" fullWidth accent={IIEE_COLORS.secondary}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10, maxHeight: 600, overflowY: "auto" }}>
          {weakestQ.map((q, i) => {
            const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
            const sColor = severity === "high" ? c.fail : severity === "medium" ? c.amber : c.orange;
            const barPct = ((q.avg - 1) / 3) * 100;
            return (
              <div key={i} style={{ background: `${sColor}08`, border: `1px solid ${sColor}22`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: `${sColor}20`, color: sColor, border: `1px solid ${sColor}40`, flexShrink: 0 }}>{q.key}</span>
                    <span style={{ fontSize: 9, color: IIEE_COLORS.muted, background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 999 }}>{q.section}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, background: `${sColor}15`, border: `1px solid ${sColor}30`, borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: sColor }}>{q.avg.toFixed(2)}</span>
                    <span style={{ fontSize: 9, color: `${sColor}99` }}>/4</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: IIEE_COLORS.text, lineHeight: 1.45 }}>{q.label}</p>
                <TinyBar value={barPct} max={100} color={sColor} height={5} />
                <p style={{ margin: "5px 0 0", fontSize: 10, color: IIEE_COLORS.muted }}>
                  {severity === "high" ? "🔴 Critical — requires immediate attention" : severity === "medium" ? "🟡 Moderate — monitor and improve" : "🟠 Low concern — room for improvement"}
                </p>
              </div>
            );
          })}
        </div>
        <div className="chart-description">
          This detailed view presents all {weakestQ.length} survey questions with their individual scores, categorized by severity. Each card shows the question text, section, score visualization, and recommended action level. Scroll through the grid to explore all items comprehensively.
        </div>
        <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: IIEE_COLORS.muted, lineHeight: 1.6 }}>
          🎯 <strong style={{ color: IIEE_COLORS.text }}>Key Finding:</strong> Facilities and Dept. Review items consistently score highest (most disagreement), suggesting physical resources and department-organized review programs are the most critical gaps. Curriculum Development and Student Support areas show moderate weaknesses, while Assessment and Evaluation items indicate emerging concerns. This comprehensive analysis reveals that institutional curriculum gaps span multiple operational dimensions, requiring a multifaceted improvement strategy that addresses both infrastructure and pedagogical aspects.
        </div>
      </ChartContainer>
    </div>
  );
}
