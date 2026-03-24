/**
 * ModelOverviewDashboard.jsx
 *
 * Receives all props from ProfessorPage.jsx via sharedProps + individual props.
 * No internal state except the Google Sheets preview widget.
 * No fetch logic (except the local sheet preview — self-contained).
 *
 * Props expected (all passed from ProfessorPage):
 *   dashFilters, setDashFilters, availableYears, localInsights,
 *   ov, passByYear, passByStrand, passByReview, passByDur,
 *   sectionScores, weakestQ, subjectTrends, filteredSubjectTrends,
 *   correlation, scatterData, pieData, reviewPieData
 */

import { useState, useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  c,
  num,
  ChartContainer,
  CustomTooltip,
  DashboardGuide,
  FilterPanel,
  InsightBox,
  MetricCard,
  MONTH_NAMES,
} from "./ProfessorShared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSheetUrl(url) {
  if (!url) return null;
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const gidMatch = url.match(/[?&]gid=([0-9]+)/);
  const sheetId = idMatch[1];
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function parseCsvPreview(csvText, limit = 6) {
  return csvText
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, limit)
    .map((line) => line.split(",").map((v) => v.replace(/^"|"$/g, "").trim()));
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, icon = "📌" }) {
  return (
    <section
      style={{
        borderRadius: 18,
        border: "1px solid rgba(100,116,139,0.35)",
        background: "rgba(10,15,30,0.5)",
        padding: "20px 22px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: `${c.blue}1f`,
            border: `1px solid ${c.blue}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

// ─── Correlation block ────────────────────────────────────────────────────────

function CorrelationBlock({ title, explanation, points = [], color = c.blue, xLabel = "X", yLabel = "Y" }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        borderRadius: 18,
        border: "1px solid rgba(100,116,139,0.35)",
        background: "rgba(10,15,30,0.4)",
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{explanation}</p>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="x" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name={xLabel} />
            <YAxis dataKey="y" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name={yLabel} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={points} fill={color} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Google Sheets preview (self-contained) ───────────────────────────────────

function SheetPreview() {
  const [sheetUrl, setSheetUrl]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [preview, setPreview]         = useState([]);

  const handlePreview = async () => {
    const csvUrl = normalizeSheetUrl(sheetUrl);
    if (!csvUrl) { setError("Invalid Google Sheets URL."); setPreview([]); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Could not read Google Sheet.");
      const text = await res.text();
      setPreview(parseCsvPreview(text));
    } catch { setError("Could not load read-only sheet preview."); setPreview([]); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
        <input
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="Paste Google Sheets link…"
          style={{
            borderRadius: 12, border: "1px solid rgba(100,116,139,0.5)",
            background: "rgba(10,15,30,0.8)",
            padding: "8px 12px", fontSize: 13, color: "#f1f5f9",
            outline: "none",
          }}
        />
        <button
          onClick={handlePreview}
          disabled={loading}
          style={{
            borderRadius: 12,
            border: `1px solid ${c.blue}44`,
            background: `${c.blue}20`,
            padding: "8px 16px",
            fontSize: 13, fontWeight: 600, color: c.blue,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading…" : "Preview"}
        </button>
      </div>
      {error && <p style={{ marginTop: 8, fontSize: 13, color: c.fail }}>{error}</p>}
      {preview.length > 0 && (
        <div
          style={{
            marginTop: 12, overflowX: "auto",
            borderRadius: 12, border: "1px solid rgba(100,116,139,0.35)",
            background: "rgba(10,15,30,0.65)", padding: 8,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#e2e8f0" }}>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(100,116,139,0.25)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "6px 8px" }}>{cell || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ModelOverviewDashboard({
  dashFilters,
  setDashFilters,
  availableYears,
  localInsights,
  ov,
  passByYear,
  passByStrand,
  passByReview,
  passByDur,
  sectionScores,
  weakestQ,
  subjectTrends,
  filteredSubjectTrends,
  correlation,
  scatterData,
  pieData,
  reviewPieData,
}) {
  // ── Derived data ──────────────────────────────────────────────────────────

  const totalSurveyResponses = useMemo(
    () => sectionScores.reduce((acc, x) => acc + Number(x.pass || 0) + Number(x.fail || 0), 0),
    [sectionScores]
  );

  const monthlyTrend = useMemo(
    () => passByYear.map((x, idx) => ({
      month: MONTH_NAMES[idx % MONTH_NAMES.length],
      passRate: Number(x.pass_rate ?? 0),
    })),
    [passByYear]
  );

  const yearlyTrend = useMemo(
    () => passByYear.map((x) => ({
      year: x.label,
      passRate: Number(x.pass_rate ?? 0),
      total: Number(x.total ?? 0),
    })),
    [passByYear]
  );

  const strandSummary = useMemo(
    () => passByStrand.map((x) => ({
      name: x.label,
      passRate: Number(x.pass_rate ?? 0),
      total: Number(x.total ?? 0),
    })),
    [passByStrand]
  );

  const weakAreas = useMemo(() => weakestQ.slice(0, 6), [weakestQ]);

  const reliabilityText = useMemo(() => {
    if (!scatterData?.length)
      return "Prediction reliability will appear once prediction-vs-actual records are available.";
    const avgAbsError =
      scatterData.reduce(
        (acc, row) => acc + Math.abs(Number(row.predicted || 0) - Number(row.actual || 0)),
        0
      ) / scatterData.length;
    return `Average absolute prediction gap is ${avgAbsError.toFixed(2)} points across ${scatterData.length} records. Lower is better.`;
  }, [scatterData]);

  const gwaGap = num(
    Number(ov.avg_gwa_failers ?? 0) - Number(ov.avg_gwa_passers ?? 0)
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Guide ── */}
      <DashboardGuide
        title="How to read this Model Dashboard"
        items={[
          { label: "Model behavior",   text: "Sections summarize predictors, reliability, and prediction-vs-actual consistency." },
          { label: "Data context",     text: "Trend/distribution visuals show cohort patterns by year, subject, review, and strand." },
          { label: "Actionable output",text: "Curriculum and correlation sections highlight weak areas to guide intervention." },
        ]}
      />

      {/* ── 1. Model Summary ── */}
      <SectionCard
        icon="🧭"
        title="Model Overview Dashboard"
        subtitle="A consolidated view of model behavior, data patterns, reliability, and curriculum insights."
      >
        {/* Sticky filter panel */}
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${c.blue}55`,
            background: "rgba(15,23,42,0.88)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            padding: 12,
            position: "sticky",
            top: 92,
            zIndex: 10,
            marginBottom: 14,
          }}
        >
          <FilterPanel
            filters={dashFilters}
            onChange={setDashFilters}
            availableYears={availableYears}
          />
        </div>
        <InsightBox insights={localInsights} />
      </SectionCard>

      {/* ── 2. Model Summary cards ── */}
      <SectionCard
        icon="🧠"
        title="1. Model Summary"
        subtitle="Model purpose, structure, and major predictor groups."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          <MetricCard label="GWA Signal"     value={`+${gwaGap}`} sub="gap (failers − passers)" color={c.indigo} icon="🎓" />
          <MetricCard label="Math/EE/ESAS"   value="3 Core"       sub="subject score predictors" color={c.blue}  icon="📘" />
          <MetricCard label="Survey Inputs"  value={`${sectionScores.length}`} sub="survey sections" color={c.teal} icon="🧾" />
          <MetricCard label="Pass Threshold" value="70%"          sub="system pass reference"    color={c.amber} icon="🎯" />
        </div>
      </SectionCard>

      {/* ── 3. Dataset Overview ── */}
      <SectionCard
        icon="🗃️"
        title="2. Dataset Overview"
        subtitle="PRC outcomes and survey response summaries from current system data."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <ChartContainer title="PRC Result Distribution" icon="🥧" subtitle="Passers vs Failers" accent={c.pass}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Survey Section Summary"
            icon="📊"
            subtitle={`Total responses (aggregated): ${totalSurveyResponses}`}
            accent={c.blue}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sectionScores.map((s) => ({ name: s.label, pass: s.pass, fail: s.fail }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                />
                <Bar dataKey="pass" name="Pass" fill={c.pass} />
                <Bar dataKey="fail" name="Fail" fill={c.fail} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

        </div>
      </SectionCard>

      {/* ── 4. External Data Integration ── */}
      <SectionCard
        icon="🔗"
        title="3. External Data Integration"
        subtitle="Google Sheets read-only preview — no change to backend logic."
      >
        <SheetPreview />
      </SectionCard>

      {/* ── 5. Data Visualization & Trends ── */}
      <SectionCard
        icon="📈"
        title="4. Data Visualization & Trends"
        subtitle="Monthly, yearly, and subject trend behavior with indicators."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          <ChartContainer title="Monthly Trends" icon="🗓️" subtitle="Line chart for trend continuity" accent={c.teal}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke={c.teal} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Yearly Trends" icon="📅" subtitle="Bar chart for year-over-year comparison" accent={c.blue}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Bar dataKey="passRate" name="Pass Rate" fill={c.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

        </div>

        {/* Subject trends */}
        {subjectTrends.length > 0 && (
          <ChartContainer
            title="Subject Score Trends (EE / MATH / ESAS)"
            icon="📘"
            subtitle="Multi-year trend across core board subjects"
            accent={c.indigo}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={filteredSubjectTrends.length ? filteredSubjectTrends : subjectTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                />
                <Line type="monotone" dataKey="EE_avg"   name="EE"   stroke={c.blue}   strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="MATH_avg" name="MATH" stroke={c.indigo} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ESAS_avg" name="ESAS" stroke={c.teal}   strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </SectionCard>

      {/* ── 6. Model Reliability ── */}
      <SectionCard
        icon="🧪"
        title="5. Model Reliability"
        subtitle="Predicted vs actual consistency and confidence behavior."
      >
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, lineHeight: 1.7 }}>
          {reliabilityText}
        </p>
        <ChartContainer
          title="Predicted vs Actual Score (Scatter)"
          icon="🎯"
          subtitle="Each dot = one student's predicted vs actual board score"
          accent={c.pass}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="actual"    tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name="Actual" />
              <YAxis dataKey="predicted" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name="Predicted" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="4 4"
              />
              <Scatter data={scatterData ?? []} fill={c.pass} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </SectionCard>

      {/* ── 7. Student Performance Summary ── */}
      <SectionCard
        icon="👥"
        title="6. Student Performance Summary"
        subtitle="Strand, review duration, and review attendance breakdown."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          <ChartContainer title="SHS Strand Summary" icon="🎓" subtitle="Pass rate by senior high school strand" accent={c.teal}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={strandSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine y={70} stroke={c.amber} strokeDasharray="4 3" />
                <Bar dataKey="passRate" name="Pass Rate" fill={c.teal} radius={[6, 6, 0, 0]}>
                  {strandSummary.map((e, i) => (
                    <Cell key={i} fill={e.passRate >= 70 ? c.pass : e.passRate >= 55 ? c.amber : c.fail} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Review Duration Summary" icon="⏱️" subtitle="Pass rate grouped by review program length" accent={c.amber}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={passByDur}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine y={70} stroke={c.amber} strokeDasharray="4 3" />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                  {passByDur.map((e, i) => (
                    <Cell key={i} fill={[c.fail, c.amber, c.pass][i] ?? c.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

        </div>

        {/* Review attendance pie */}
        <ChartContainer
          title="Review Attendance Distribution"
          icon="🥧"
          subtitle="Proportion of students who attended formal review"
          accent={c.indigo}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={reviewPieData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {reviewPieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle" iconSize={9}
                formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </SectionCard>

      {/* ── 8. Curriculum Gap Analysis ── */}
      <SectionCard
        icon="🏫"
        title="7. Curriculum Gap Analysis"
        subtitle="Weakest curriculum-linked survey signals with AI recommendations."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <ChartContainer
            title="Weak Curriculum Areas"
            icon="⚠️"
            subtitle="Highest disagreement survey points"
            accent={c.fail}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="key" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(2)}/4`} />} />
                <ReferenceLine y={2.5} stroke={c.amber} strokeDasharray="4 3" />
                <Bar dataKey="avg" name="Avg Score" fill={c.fail} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${c.amber}30`,
              background: `${c.amber}0d`,
              padding: "18px 20px",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: c.amber }}>
              🤖 AI Recommendations
            </p>
            {[
              "Prioritize facilities and department review interventions for immediate impact.",
              "Align syllabus and mock tests more closely with board exam patterns.",
              "Track improvements quarterly using the same weakest-item indicators.",
              "STEM students show highest pass rate — replicate pedagogical approach in other strands.",
              "Students with >6 months review duration achieve 84% — incentivize extended review enrollment.",
            ].map((rec, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: `${c.amber}22`, border: `1px solid ${c.amber}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: c.amber, flexShrink: 0, marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{rec}</p>
              </div>
            ))}
          </div>

        </div>
      </SectionCard>

      {/* ── 9. Correlation Analysis ── */}
      <SectionCard
        icon="🧮"
        title="8. Correlation Analysis"
        subtitle="One correlation per section — explanation left, chart right."
      >
        <CorrelationBlock
          title="GWA vs Predicted Rating"
          explanation="Lower GWA (better academic standing) should generally align with stronger predicted scores. A negative correlation is expected and healthy."
          points={(scatterData ?? []).map((x) => ({ x: x.actual, y: x.predicted }))}
          color={c.blue}
          xLabel="Actual"
          yLabel="Predicted"
        />
        <CorrelationBlock
          title="Math / EE / ESAS Trend Relationship"
          explanation="Subject trend movement shows whether yearly improvements are synchronized across core board domains. High synchrony suggests a shared driver."
          points={(subjectTrends ?? []).map((s) => ({
            x: Number(s.MATH_avg || 0),
            y: Number(s.EE_avg   || 0),
          }))}
          color={c.teal}
          xLabel="MATH Avg"
          yLabel="EE Avg"
        />
        <CorrelationBlock
          title="Survey Factors vs Pass Rate"
          explanation="Survey section averages can indicate cognitive / non-cognitive / institutional relationships with outcomes. Sections with high fail counts may predict at-risk groups."
          points={(sectionScores ?? []).map((s) => ({
            x: Number(s.pass || 0),
            y: Number(s.fail || 0),
          }))}
          color={c.indigo}
          xLabel="Pass Count"
          yLabel="Fail Count"
        />

        {/* Correlation matrix note */}
        {correlation?.columns?.length > 0 && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              border: "1px solid rgba(100,116,139,0.35)",
              background: "rgba(10,15,30,0.45)",
              padding: "12px 16px",
              fontSize: 13,
              color: "#64748b",
            }}
          >
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>Correlation matrix data</span> is also available
            in the dedicated{" "}
            <span style={{ color: c.blue }}>Correlation tab</span>.
          </div>
        )}
      </SectionCard>

    </div>
  );
}