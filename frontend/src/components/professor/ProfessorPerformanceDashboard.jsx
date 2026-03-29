
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  c,
  pct,
  num,
  CustomTooltip,
  ChartContainer,
  CollapsibleGuide,
} from "./ProfessorShared";

export default function ProfessorPerformanceDashboard({
  passByStrand,
  sectionScores,
  subjectTrends,
  filteredSubjectTrends,
  weakestSubject,
}) {
  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr minmax(280px, 340px)", gap: 16 }}>
      <div>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Performance Breakdown</h2>
          <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>Pass rates by SHS strand, survey section scores, and subject score trends by year.</p>
        </div>
      </div>

      <CollapsibleGuide
        storageKey="professor-perf-guide"
        title="Data Analysis Guide"
        summary="Use this workflow to align pipeline steps with your dataset (GWA, pass/fail, subject scores, and survey factors)."
        items={[
          { title: "Preprocessing:", text: "missing values, data cleaning, category handling, SHS strand mapping" },
          { title: "Encoding:", text: "one-hot (strand, choices), label/ordinal (S1-S5 ratings), target for large categories" },
          { title: "Engineering:", text: "ESAS/MATH/GWA indexes + cohort trend deltas, college preparation score, time-to-graduation flag" },
          { title: "Selection:", text: "correlation matrix, AUC/RF importance, Pearson/Point-Biserial/Chi-Square tests" },
          { title: "Validation:", text: "holdout sets, stratified pass/fail split, and sanity check on insufficient factors" },
        ]}
      />

      <div style={{ gridColumn: "1 / 2" }}>
        <div style={{ marginBottom: 10, background: "rgba(15, 28, 77, 0.75)", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 14, padding: "12px 14px", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>
          <strong>Focus:</strong> Total GWA, exam score predictors (Math/EE/ESAS), and survey dimensions are combined via feature engineering and correlation analysis.
        </div>

        <div style={{
        position: "sticky",
        top: 86,
        zIndex: 30,
        background: "rgba(7, 16, 43, 0.95)",
        padding: "clamp(8px, 2vw, 14px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.26)",
        backdropFilter: "blur(12px)",
        marginBottom: 12,
      }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={passByStrand} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: "clamp(10px, 1.5vw, 12px)" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                {passByStrand.map((entry, index) => (
                  <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : entry.pass_rate >= 55 ? c.amber : c.fail} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ marginTop: 10, fontSize: "clamp(11px, 1.5vw, 13px)", color: "#94a3b8", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
            This chart compares SHS strands on pass rate, showing areas below the 70% threshold (reference line) for targeted improvement.
          </p>
          {passByStrand.length > 0 && (
            <div style={{ marginTop: 10, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "clamp(8px, 1.5vw, 12px)", fontSize: "clamp(11px, 1.5vw, 13px)", color: "#cbd5e1", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
              💡 STEM graduates lead with <strong style={{ color: "#f1f5f9", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>{pct(passByStrand[0]?.pass_rate)}</strong>, aligned with its math-heavy curriculum.
            </div>
          )}
        </div>

        <ChartContainer title="Survey Section Scores — Radar" icon="🕸️" subtitle="Passers vs Failers across all survey dimensions" accent={c.indigo}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={sectionScores.map((s) => ({ subject: s.label, Passers: s.pass, Failers: s.fail }))}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[40, 100]} tick={{ fill: "#475569", fontSize: 9 }} />
              <Radar name="Passers" dataKey="Passers" stroke={c.pass} fill={c.pass} fillOpacity={0.15} />
              <Radar name="Failers" dataKey="Failers" stroke={c.fail} fill={c.fail} fillOpacity={0.1} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
            </RadarChart>
          </ResponsiveContainer>
          <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
            Radar view reveals relative strengths and weaknesses across survey sections for passers versus failers.
          </p>
        </ChartContainer>

        <ChartContainer title="Survey Section Scores — Comparison" icon="📊" subtitle="Average section score split by exam outcome" fullWidth accent={c.blue}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectionScores.map((s) => ({ name: s.label, Passers: s.pass, Failers: s.fail }))} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Passers" fill={c.pass} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Failers" fill={c.fail} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
            Compare average survey section scores for passers and failers to identify major non-academic gaps.
          </p>
        </ChartContainer>

        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 14, borderRadius: 12 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: "#f8fafc", fontFamily: "'Montserrat',sans-serif" }}>Survey Section Scores - Result Explanation</h3>
          <p style={{ margin: "0 8px 10px", color: "#cbd5e1", fontSize: "clamp(11px, 1.2vw, 12px)", fontFamily: "'Inter',sans-serif" }}>
            Performance scores are interpreted via domain outcomes: higher passers means a stronger instructional alignment in that area.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", fontSize: "clamp(11px, 1.2vw, 12px)", lineHeight: 1.6 }}>
            <li><strong>Knowledge:</strong> Strong correlation with GWA and ESAS mastery.</li>
            <li><strong>Problem Solving:</strong> Predictor of improved MATH and EE performance.</li>
            <li><strong>Motivation:</strong> High passers here predicts consistent study habits and exam readiness.</li>
            <li><strong>Mental Health:</strong> Low scores often coincide with increased fail probability; monitor support needs.</li>
            <li><strong>Support System:</strong> Family/peer encouragement correlated with higher pass rates, especially in non-cognitive clusters.</li>
            <li><strong>Curriculum:</strong> Underprepared courses are major dropout signals for first-choice vs non-first-choice EE students.</li>
            <li><strong>Faculty Quality:</strong> Top influence in both subject results and overall pass/fail output.</li>
            <li><strong>Department Review / Facilities / Institutional Culture:</strong> Serve as ambient factors; strong relationships with `departmental_support_index`.</li>
          </ul>
        </div>

        {subjectTrends.length > 0 && (
          <ChartContainer title="Subject Score Trends by Year" icon="📐" subtitle="EE, MATH, ESAS average score trends over time" fullWidth accent={c.teal}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={filteredSubjectTrends.length ? filteredSubjectTrends : subjectTrends} margin={{ top: 8, right: 24, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[55, 85]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v}`} />} />
                <ReferenceLine y={70} stroke={c.amber} strokeDasharray="5 3" label={{ value: "70%", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                <Line type="monotone" dataKey="EE_avg" name="EE" stroke={c.blue} strokeWidth={2.5} dot={{ fill: c.blue, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="MATH_avg" name="MATH" stroke={c.indigo} strokeWidth={2.5} dot={{ fill: c.indigo, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ESAS_avg" name="ESAS" stroke={c.teal} strokeWidth={2.5} dot={{ fill: c.teal, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
              Year-over-year subject trends show curriculum performance momentum and identify which domains are consistently below the passing line.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
              {["EE", "MATH", "ESAS"].map((subj, i) => {
                const last = subjectTrends[subjectTrends.length - 1];
                const first = subjectTrends[0];
                const totalDelta = last[`${subj}_avg`] - first[`${subj}_avg`];
                const col = [c.blue, c.indigo, c.teal][i];
                return (
                  <div key={subj} style={{ background: `${col}0d`, border: `1px solid ${col}25`, borderRadius: 12, padding: "12px 14px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{subj} Trend</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: col, fontFamily: "'Montserrat',sans-serif" }}>{last[`${subj}_avg`]}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: totalDelta >= 0 ? c.pass : c.fail, fontFamily: "'Inter',sans-serif" }}>
                      {totalDelta >= 0 ? "▲" : "▼"} {Math.abs(totalDelta).toFixed(1)} pts overall
                    </p>
                  </div>
                );
              })}
            </div>

            {weakestSubject && (
              <div style={{ marginTop: 12, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                ⚠ Weakest subject: <strong style={{ color: "#f1f5f9" }}>{weakestSubject.id}</strong> (avg {num(weakestSubject.avg, 1)}) —{" "}
                <strong style={{ color: weakestSubject.delta >= 0 ? c.pass : c.fail }}>
                  {weakestSubject.delta >= 0 ? "▲ improving" : "▼ declining"} ({Math.abs(weakestSubject.delta).toFixed(1)} pts overall)
                </strong>
              </div>
            )}
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
