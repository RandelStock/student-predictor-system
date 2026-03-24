import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  CustomTooltip,
  MetricCard,
  ChartContainer,
  DashboardGuide,
  FilterPanel,
  InsightBox,
} from "./ProfessorShared";

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
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#f8fafc" }}>
          Institutional Overview
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Aggregate statistics across all EE board exam takers. First-attempt outcomes only.
        </p>
      </div>
      <DashboardGuide
        items={[
          { label: "KPI cards", text: "Show the current totals and rates for students, passers/failers, and GWA gap." },
          { label: "Distribution charts", text: "Pie and bar charts compare outcomes by year, review status, and review duration." },
          { label: "Interpretation", text: "Use the 70% reference lines and color cues (green/amber/red) to quickly judge performance level." },
        ]}
      />

      <FilterPanel filters={dashFilters} onChange={setDashFilters} availableYears={availableYears} />
      <InsightBox insights={localInsights} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total Students" value={ov.total_students} color={c.blue} icon="👥" hint="Total examinees included in the dataset after filters." />
        <MetricCard label="Total Passers" value={ov.total_passers} color={c.pass} icon="✅" hint="Number of examinees who passed on first attempt." />
        <MetricCard label="Total Failers" value={ov.total_failers} color={c.fail} icon="❌" hint="Number of examinees who failed on first attempt." />
        <MetricCard label="Overall Pass Rate" value={pct(ov.overall_pass_rate)} color={ov.overall_pass_rate >= 70 ? c.pass : c.amber} icon="📊" hint="Percentage passed out of total students; target = 70%." />
        <MetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)} color={c.pass} icon="🎓" sub="1.0=Highest" hint="Lower is better for average GWA among passers (1.0 best)." />
        <MetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)} color={c.fail} icon="📉" sub="1.0=Highest" hint="Lower is better for average GWA among failers (1.0 best)." />
      </div>

      <div className="dash-grid">
        <ChartContainer title="Pass / Fail Distribution" icon="🥧" subtitle="Total passers and failers with percentage share" accent={c.pass}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Review Attendance Share" icon="📖" subtitle="Examinees who attended formal review vs not" accent={c.teal}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={reviewPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {reviewPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pass Rate by Year" icon="📅" subtitle="Board exam performance trend per cohort year" accent={c.blue} fullWidth>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredYears.length ? filteredYears : passByYear} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine y={70} stroke={c.amber} strokeDasharray="5 3" label={{ value: "70% threshold", position: "insideTopRight", fill: c.amber, fontSize: 10 }} />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                {(filteredYears.length ? filteredYears : passByYear).map((entry, index) => (
                  <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : entry.pass_rate >= 55 ? c.amber : c.fail} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pass / Fail Counts by Year" icon="📦" subtitle="Stacked bar showing pass and fail composition per year" accent={c.indigo} fullWidth>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(filteredYears.length ? filteredYears : passByYear).map((d) => ({
                label: d.label,
                Passers: d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0)),
                Failers: d.failers ?? ((d.total ?? 0) - Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0))),
              }))}
              margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pass Rate by Review Attendance" icon="🏫" subtitle="Did attending formal review improve results?" accent={c.teal}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredReview} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                {filteredReview.map((entry, index) => (
                  <Cell key={index} fill={entry.pass_rate >= 70 ? c.pass : c.fail} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Pass Rate by Review Duration" icon="⏱️" subtitle="Longer review programs correlate with higher pass rates" accent={c.orange}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={passByDur} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <ReferenceLine x={70} stroke={c.amber} strokeDasharray="4 3" />
              <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                {passByDur.map((entry, index) => (
                  <Cell key={index} fill={[c.fail, c.amber, c.pass][index] || c.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="GWA: Passers vs Failers" icon="📐" subtitle="Lower GWA is better in PH grading (1.0 = highest)" accent={c.indigo}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Passers Avg GWA", value: ov.avg_gwa_passers, color: c.pass },
              { label: "Failers Avg GWA", value: ov.avg_gwa_failers, color: c.fail },
            ].map((x, i) => (
              <div key={i} style={{ flex: 1, background: `${x.color}0d`, border: `1px solid ${x.color}25`, borderRadius: 14, padding: "16px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>{x.label}</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: x.color, fontFamily: "'Syne',sans-serif" }}>{num(x.value)}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={[{ name: "Passers", value: ov.avg_gwa_passers }, { name: "Failers", value: ov.avg_gwa_failers }]} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 3]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => v?.toFixed(2)} />} />
              <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
                <Cell fill={c.pass} />
                <Cell fill={c.fail} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 10 }}>
            💡 GWA gap: <strong style={{ color: "#f1f5f9" }}>{num(ov.avg_gwa_failers - ov.avg_gwa_passers)} points</strong> — strong predictor.
          </div>
        </ChartContainer>

        <ChartContainer title="Model Performance Summary" icon="📈" subtitle="Random Forest classification & regression metrics" accent={c.blue}>
          {modelInfo ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Classification Accuracy", value: modelInfo.classification?.accuracy, color: c.blue },
                { label: "Classification F1", value: modelInfo.classification?.f1, color: c.indigo },
                { label: "CV Accuracy", value: modelInfo.classification?.cv_acc, color: c.teal },
                { label: "CV F1", value: modelInfo.classification?.cv_f1, color: c.pass },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{pct((m.value ?? 0) * 100)}</span>
                  </div>
                  <Bar value={(m.value ?? 0) * 100} color={m.color} height={7} />
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Reg A — MAE", v: modelInfo.regression_a?.mae, d: 2 },
                  { label: "Reg A — R²", v: modelInfo.regression_a?.r2, d: 3 },
                  { label: "Reg B — MAE", v: modelInfo.regression_b?.mae, d: 2 },
                  { label: "Reg B — R²", v: modelInfo.regression_b?.r2, d: 3 },
                ].map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{num(m.v, m.d)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#64748b" }}>Loading model metrics…</p>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
