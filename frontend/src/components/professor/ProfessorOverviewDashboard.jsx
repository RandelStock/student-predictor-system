/**
 * ProfessorOverviewDashboard.jsx
 *
 * Receives all props from ProfessorPage.jsx via sharedProps + individual props.
 * No internal state. No fetch logic. Drop-in replacement.
 *
 * Props expected (all passed from ProfessorPage):
 *   dashFilters, setDashFilters, availableYears, localInsights,
 *   ov, pieData, reviewPieData, filteredYears, passByYear,
 *   filteredReview, passByDur, modelInfo
 */

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  c,
  pct,
  num,
  CustomTooltip,
  MetricCard,
  ChartContainer,
  DashboardGuide,
  FilterPanel,
  InsightBox,
} from "./ProfessorShared";

// ─── Internal sub-components ──────────────────────────────────────────────────

function GwaCompare({ ov }) {
  const gap = num(Number(ov.avg_gwa_failers ?? 0) - Number(ov.avg_gwa_passers ?? 0));
  const barData = [
    { name: "Passers", value: Number(ov.avg_gwa_passers ?? 0) },
    { name: "Failers", value: Number(ov.avg_gwa_failers ?? 0) },
  ];

  return (
    <ChartContainer
      title="GWA: Passers vs Failers"
      icon="📐"
      subtitle="Lower GWA is better in PH grading (1.0 = highest)"
      accent={c.indigo}
    >
      {/* Big number tiles */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Passers Avg GWA", value: ov.avg_gwa_passers, color: c.pass },
          { label: "Failers Avg GWA", value: ov.avg_gwa_failers, color: c.fail },
        ].map((x, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: `${x.color}0d`,
              border: `1px solid ${x.color}25`,
              borderRadius: 14,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {x.label}
            </p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: x.color, fontFamily: "'Syne',sans-serif" }}>
              {num(x.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Mini bar */}
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 3]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(2)} />} />
          <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
            <Cell fill={c.pass} />
            <Cell fill={c.fail} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
          marginTop: 10,
        }}
      >
        💡 GWA gap:{" "}
        <strong style={{ color: "#f1f5f9" }}>{gap} points</strong> — strong predictor of board exam outcome.
      </div>
    </ChartContainer>
  );
}

function ModelMetricsBars({ modelInfo }) {
  if (!modelInfo) {
    return (
      <p style={{ fontSize: 12, color: "#64748b" }}>Loading model metrics…</p>
    );
  }

  const bars = [
    { label: "Classification Accuracy", value: modelInfo.classification?.accuracy, color: c.blue },
    { label: "Classification F1",       value: modelInfo.classification?.f1,       color: c.indigo },
    { label: "CV Accuracy",             value: modelInfo.classification?.cv_acc,   color: c.teal },
    { label: "CV F1",                   value: modelInfo.classification?.cv_f1,    color: c.pass },
  ];

  const tiles = [
    { label: "Reg A — MAE", v: modelInfo.regression_a?.mae, d: 2 },
    { label: "Reg A — R²",  v: modelInfo.regression_a?.r2,  d: 3 },
    { label: "Reg B — MAE", v: modelInfo.regression_b?.mae, d: 2 },
    { label: "Reg B — R²",  v: modelInfo.regression_b?.r2,  d: 3 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {bars.map((m, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>
              {pct((m.value ?? 0) * 100)}
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${((m.value ?? 0) * 100).toFixed(1)}%`,
                background: m.color,
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 8,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {tiles.map((m, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "8px 10px" }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>
              {num(m.v, m.d)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ProfessorOverviewDashboard({
  dashFilters,
  setDashFilters,
  availableYears,
  localInsights,
  ov,
  pieData,
  reviewPieData,
  filteredYears,
  passByYear,
  filteredReview,
  passByDur,
  modelInfo,
}) {
  const displayYears = filteredYears?.length ? filteredYears : passByYear;

  // Stacked bar data (passers + failers counts)
  const stackedData = displayYears.map((d) => ({
    label: d.label,
    Passers: d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0)),
    Failers: d.failers ?? ((d.total ?? 0) - Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0))),
  }));

  return (
    <div className="fade-in">
      {/* ── Page heading ── */}
      <div style={{ marginBottom: 22 }}>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'Syne',sans-serif",
            color: "#f8fafc",
          }}
        >
          Institutional Overview
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Aggregate EE board exam outcomes — first-attempt data only.
        </p>
      </div>

      {/* ── How to read guide ── */}
      <DashboardGuide
        items={[
          { label: "KPI cards",          text: "Show current totals and rates for students, passers/failers, and GWA gap." },
          { label: "Distribution charts",text: "Pie and bar charts compare outcomes by year, review status, and review duration." },
          { label: "Interpretation",     text: "Use 70% reference lines and color cues (green/amber/red) to judge performance level." },
        ]}
      />

      {/* ── Filters ── */}
      <FilterPanel
        filters={dashFilters}
        onChange={setDashFilters}
        availableYears={availableYears}
      />

      {/* ── AI Insights ── */}
      <InsightBox insights={localInsights} />

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard label="Total Students"    value={ov.total_students}  color={c.blue}  icon="👥" />
        <MetricCard label="Total Passers"     value={ov.total_passers}   color={c.pass}  icon="✅" />
        <MetricCard label="Total Failers"     value={ov.total_failers}   color={c.fail}  icon="❌" />
        <MetricCard
          label="Overall Pass Rate"
          value={pct(ov.overall_pass_rate)}
          color={Number(ov.overall_pass_rate) >= 70 ? c.pass : c.amber}
          icon="📊"
        />
        <MetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)} color={c.pass} icon="🎓" sub="1.0 = Highest" />
        <MetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)} color={c.fail} icon="📉" sub="1.0 = Highest" />
      </div>

      {/* ── Distribution pies ── */}
      <div className="dash-grid">

        {/* Pass / Fail pie */}
        <ChartContainer
          title="Pass / Fail Distribution"
          icon="🥧"
          subtitle="Total passers and failers with percentage share"
          accent={c.pass}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={9}
                formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Review attendance pie */}
        <ChartContainer
          title="Review Attendance Share"
          icon="📖"
          subtitle="Examinees who attended formal review vs not"
          accent={c.teal}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={reviewPieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {reviewPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={9}
                formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Pass rate by year — full width */}
        <ChartContainer
          title="Pass Rate by Year"
          icon="📅"
          subtitle="Board exam performance trend per cohort year"
          accent={c.blue}
          fullWidth
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={displayYears} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false} tickLine={false} unit="%"
              />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine
                y={70}
                stroke={c.amber}
                strokeDasharray="5 3"
                label={{ value: "70% threshold", position: "insideTopRight", fill: c.amber, fontSize: 10 }}
              />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                {displayYears.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.pass_rate >= 70
                        ? c.pass
                        : entry.pass_rate >= 55
                        ? c.amber
                        : c.fail
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Pass / Fail stacked counts — full width */}
        <ChartContainer
          title="Pass / Fail Counts by Year"
          icon="📦"
          subtitle="Stacked bar showing pass and fail headcount per year"
          accent={c.indigo}
          fullWidth
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stackedData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={9}
                formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
              />
              <Bar dataKey="Passers" stackId="a" fill={c.pass} />
              <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Review attendance bar */}
        <ChartContainer
          title="Pass Rate by Review Attendance"
          icon="🏫"
          subtitle="Did attending formal review improve results?"
          accent={c.teal}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={filteredReview}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                unit="%" axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false} tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                {filteredReview.map((entry, i) => (
                  <Cell key={i} fill={entry.pass_rate >= 70 ? c.pass : c.fail} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Review duration bar */}
        <ChartContainer
          title="Pass Rate by Review Duration"
          icon="⏱️"
          subtitle="Longer review programs correlate with higher pass rates"
          accent={c.amber}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={passByDur}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                unit="%" axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false} tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                {passByDur.map((entry, i) => (
                  <Cell key={i} fill={[c.fail, c.amber, c.pass][i] ?? c.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* GWA comparison */}
        <GwaCompare ov={ov} />

        {/* Model performance summary */}
        <ChartContainer
          title="Model Performance Summary"
          icon="📈"
          subtitle="Random Forest classification & regression metrics"
          accent={c.blue}
        >
          <ModelMetricsBars modelInfo={modelInfo} />
        </ChartContainer>

      </div>
    </div>
  );
}