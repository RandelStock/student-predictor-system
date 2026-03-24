import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
  ChartContainer,
  CustomTooltip,
  DashboardGuide,
  FilterPanel,
  InsightBox,
  MetricCard,
  MONTH_NAMES,
  num,
} from "./ProfessorShared";

function SectionCard({ title, subtitle, children, icon = "📌" }) {
  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:brightness-95">
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ background: `${c.blue}1f`, borderColor: `${c.blue}66` }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function CorrelationBlock({ title, explanation, points = [], color = c.blue, xKey = "x", yKey = "y", xLabel = "X", yLabel = "Y" }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-100">{title}</p>
        <p className="text-sm leading-6 text-slate-300">{explanation}</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
            <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name={xLabel} />
            <YAxis dataKey={yKey} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} name={yLabel} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={points} fill={color} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
  const lines = csvText.split(/\r?\n/).filter(Boolean).slice(0, limit);
  return lines.map((line) => line.split(",").map((v) => v.replace(/^"|"$/g, "").trim()));
}

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
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [sheetPreview, setSheetPreview] = useState([]);

  const totalSurveyResponses = useMemo(
    () => sectionScores.reduce((acc, x) => acc + Number(x.pass || 0) + Number(x.fail || 0), 0),
    [sectionScores]
  );

  const monthlyTrend = useMemo(() => {
    if (!passByYear.length) return [];
    return passByYear.map((x, idx) => ({
      month: MONTH_NAMES[idx % MONTH_NAMES.length],
      passRate: Number(x.pass_rate ?? 0),
    }));
  }, [passByYear]);

  const yearlyTrend = useMemo(
    () => passByYear.map((x) => ({ year: x.label, passRate: Number(x.pass_rate ?? 0), total: Number(x.total ?? 0) })),
    [passByYear]
  );

  const strandSummary = useMemo(
    () => passByStrand.map((x) => ({ name: x.label, passRate: Number(x.pass_rate ?? 0), total: Number(x.total ?? 0) })),
    [passByStrand]
  );

  const weakAreas = useMemo(() => weakestQ.slice(0, 6), [weakestQ]);

  const reliabilityText = useMemo(() => {
    if (!scatterData?.length) return "Prediction reliability will appear once prediction-vs-actual records are available.";
    const avgAbsError =
      scatterData.reduce((acc, row) => acc + Math.abs(Number(row.predicted || 0) - Number(row.actual || 0)), 0) /
      scatterData.length;
    return `Average absolute prediction gap is ${avgAbsError.toFixed(2)} points across ${scatterData.length} records. Lower is better.`;
  }, [scatterData]);

  const handlePreviewSheet = async () => {
    const csvUrl = normalizeSheetUrl(sheetUrl);
    if (!csvUrl) {
      setSheetError("Invalid Google Sheets URL.");
      setSheetPreview([]);
      return;
    }
    setSheetLoading(true);
    setSheetError("");
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Could not read Google Sheet.");
      const text = await res.text();
      setSheetPreview(parseCsvPreview(text));
    } catch {
      setSheetError("Could not load read-only sheet preview.");
      setSheetPreview([]);
    } finally {
      setSheetLoading(false);
    }
  };

  return (
    <div className="fade-in space-y-4">
      <DashboardGuide
        title="How to Read This Model Dashboard"
        items={[
          { label: "Model behavior", text: "Sections summarize predictors, reliability, and prediction-vs-actual consistency." },
          { label: "Data context", text: "Trend/distribution visuals show cohort patterns by year, subject, review, and strand." },
          { label: "Actionable output", text: "Curriculum and correlation sections highlight weak areas and relationships to guide intervention." },
        ]}
      />
      <SectionCard
        icon="🧭"
        title="Model Overview Dashboard"
        subtitle="A consolidated view of model behavior, data patterns, reliability, and curriculum insights."
      >
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: "rgba(56,189,248,0.35)",
            background: "rgba(15,23,42,0.88)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            position: "sticky",
            top: 92,
            zIndex: 10,
          }}
        >
          <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
        </div>
        <InsightBox insights={localInsights} />
      </SectionCard>

      <SectionCard icon="🧠" title="1. Model Summary" subtitle="Model purpose, structure, and major predictor groups.">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="GWA Signal" value={num(ov.avg_gwa_failers - ov.avg_gwa_passers)} sub="gap (failers - passers)" color={c.indigo} icon="🎓" />
          <MetricCard label="Math/EE/ESAS" value="3 Core" sub="subject score predictors" color={c.blue} icon="📘" />
          <MetricCard label="Survey Inputs" value={`${sectionScores.length}`} sub="survey sections considered" color={c.teal} icon="🧾" />
          <MetricCard label="Pass Threshold" value="70%" sub="system pass reference" color={c.amber} icon="🎯" />
        </div>
      </SectionCard>

      <SectionCard icon="🗃️" title="2. Dataset Overview" subtitle="PRC outcomes and survey response summaries from current system data.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="PRC Result Distribution" icon="🥧" subtitle="Passers vs Failers" accent={c.pass}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={90} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Survey Section Summary" icon="📊" subtitle={`Total responses (aggregated): ${totalSurveyResponses}`} accent={c.blue}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sectionScores.map((s) => ({ name: s.label, pass: s.pass, fail: s.fail }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="pass" fill={c.pass} />
                <Bar dataKey="fail" fill={c.fail} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </SectionCard>

      <SectionCard icon="🔗" title="3. External Data Integration" subtitle="Google Sheets read-only preview (no change to backend logic).">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            placeholder="Paste Google Sheets link..."
          />
          <button
            onClick={handlePreviewSheet}
            disabled={sheetLoading}
            className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:brightness-95 disabled:opacity-60"
          >
            {sheetLoading ? "Loading..." : "Preview"}
          </button>
        </div>
        {sheetError && <p className="mt-2 text-sm text-rose-300">{sheetError}</p>}
        {sheetPreview.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/65 p-2">
            <table className="w-full text-left text-sm text-slate-200">
              <tbody>
                {sheetPreview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700/40 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1.5">{cell || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard icon="📈" title="4. Data Visualization & Trends" subtitle="Monthly, yearly, and subject trend behavior with indicators.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="Monthly Trends" icon="🗓️" subtitle="Line chart for trend continuity" accent={c.teal}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Line type="monotone" dataKey="passRate" stroke={c.teal} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Yearly Trends" icon="📅" subtitle="Bar chart for year-over-year comparison" accent={c.blue}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Bar dataKey="passRate" fill={c.blue} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {subjectTrends.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-3">
            <ChartContainer title="Subject Trends" icon="📘" subtitle="EE, MATH, ESAS trend line behavior" accent={c.indigo}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={filteredSubjectTrends.length ? filteredSubjectTrends : subjectTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line dataKey="EE_avg" stroke={c.blue} />
                  <Line dataKey="MATH_avg" stroke={c.indigo} />
                  <Line dataKey="ESAS_avg" stroke={c.teal} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </SectionCard>

      <SectionCard icon="🧪" title="5. Model Reliability" subtitle="Predicted vs actual consistency and confidence behavior.">
        <p className="mb-3 text-sm text-slate-300">{reliabilityText}</p>
        <ChartContainer title="Predicted vs Actual (Scatter)" icon="🎯" subtitle="Scatter = relationship / consistency" accent={c.pass}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="actual" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="predicted" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 100, y: 100 }]} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
              <Scatter data={scatterData || []} fill={c.pass} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </SectionCard>

      <SectionCard icon="👥" title="6. Student Performance Summary" subtitle="Strand, review duration, and review attendance split.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="SHS Strand Summary" icon="🎓" subtitle="Bar chart comparison" accent={c.teal}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={strandSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Bar dataKey="passRate" fill={c.teal} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Review Duration Summary" icon="⏱️" subtitle="Bar chart comparison" accent={c.orange}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={passByDur}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <Bar dataKey="pass_rate" fill={c.orange} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4">
          <ChartContainer title="Review Attendance Distribution" icon="🥧" subtitle="Pie chart distribution" accent={c.indigo}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={reviewPieData} dataKey="value" innerRadius={60} outerRadius={95}>
                  {reviewPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </SectionCard>

      <SectionCard icon="🏫" title="7. Curriculum Gap Analysis" subtitle="Weakest curriculum-linked survey signals with recommendations.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="Weak Curriculum Areas" icon="⚠️" subtitle="Highest disagreement survey points" accent={c.fail}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weakAreas.map((w) => ({ key: w.key, avg: w.avg }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="key" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(2)}/4`} />} />
                <Bar dataKey="avg" fill={c.fail} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="mb-2 font-bold">AI Recommendations</p>
            <ul className="list-disc space-y-1 pl-5 text-amber-50/90">
              <li>Prioritize facilities and department review interventions for immediate impact.</li>
              <li>Align syllabus and mock tests more closely with board exam patterns.</li>
              <li>Track improvements quarterly using the same weakest-item indicators.</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🧮" title="8. Correlation Analysis Module" subtitle="One correlation per section, explanation left and chart right.">
        <div className="space-y-4">
          <CorrelationBlock
            title="GWA vs Predicted Rating"
            explanation="Lower GWA (better academic standing) should generally align with stronger predicted scores."
            points={(scatterData || []).map((x) => ({ x: x.actual, y: x.predicted }))}
            color={c.blue}
            xLabel="Actual"
            yLabel="Predicted"
          />
          <CorrelationBlock
            title="Math/EE/ESAS Trend Relationship"
            explanation="Subject trend movement shows whether yearly improvements are synchronized across core board domains."
            points={(subjectTrends || []).map((s) => ({ x: Number(s.MATH_avg || 0), y: Number(s.EE_avg || 0) }))}
            color={c.teal}
            xLabel="MATH"
            yLabel="EE"
          />
          <CorrelationBlock
            title="Survey Factors vs Pass Rate"
            explanation="Survey section averages can indicate cognitive/non-cognitive/institutional relationships with outcomes."
            points={(sectionScores || []).map((s) => ({ x: Number(s.pass || 0), y: Number(s.fail || 0) }))}
            color={c.indigo}
            xLabel="Passers Avg"
            yLabel="Failers Avg"
          />
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-950/45 p-4 text-sm text-slate-300">
        <p className="font-semibold text-slate-100">Smart Visualization Mapping</p>
        <p className="mt-1">
          Line charts are used for trends, bar charts for comparisons, pie charts for distribution, and scatter plots for relationship/reliability views.
        </p>
        {correlation?.columns?.length ? (
          <p className="mt-2 text-slate-400">Correlation matrix data is also available in the dedicated Correlation tab.</p>
        ) : null}
      </div>
    </div>
  );
}

