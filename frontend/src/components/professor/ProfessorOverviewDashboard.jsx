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
  pct,
  num,
  DashboardGuide,
  FilterPanel,
  InsightBox,
} from "./ProfessorShared";

/* ─── IIEE Design Tokens ──────────────────────────────────────────────────── */
const IIEE = {
  navy:       "#0B1437",
  navyMid:    "#0F1C4D",
  navyLight:  "#162259",
  gold:       "#F5C518",
  goldDim:    "#C9A114",
  goldGlow:   "rgba(245,197,24,0.18)",
  goldBorder: "rgba(245,197,24,0.35)",
  white:      "#F8FAFC",
  muted:      "#94A3B8",
  dimText:    "#64748B",
  cardBg:     "rgba(15,28,77,0.72)",
  cardBorder: "rgba(245,197,24,0.18)",
  glassBg:    "rgba(11,20,55,0.85)",
  passGreen:  "#22C55E",
  failRed:    "#EF4444",
  amber:      "#F59E0B",
  blue:       "#38BDF8",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  .iiee-overview * { box-sizing: border-box; }

  .iiee-overview {
    font-family: 'DM Sans', sans-serif;
    background: ${IIEE.navy};
    min-height: 100vh;
    color: ${IIEE.white};
    padding: 0;
  }

  /* ── Section Header ── */
  .ov-hero {
    background: linear-gradient(135deg, ${IIEE.navyMid} 0%, ${IIEE.navyLight} 60%, rgba(245,197,24,0.06) 100%);
    border-bottom: 1px solid ${IIEE.goldBorder};
    padding: 28px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .ov-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .ov-hero-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${IIEE.gold};
    margin-bottom: 10px;
  }
  .ov-hero-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 30px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${IIEE.white};
    margin: 0 0 4px;
    line-height: 1;
  }
  .ov-hero-title span { color: ${IIEE.gold}; }
  .ov-hero-sub {
    font-size: 12px;
    color: ${IIEE.muted};
    margin: 0;
    letter-spacing: 0.02em;
  }

  /* ── Body Padding ── */
  .ov-body { padding: 24px 28px; }

  /* ── Guide + Filter Strip ── */
  .ov-filter-strip {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 20px;
    backdrop-filter: blur(12px);
  }

  /* ── Insight Banner ── */
  .ov-insights {
    border-left: 3px solid ${IIEE.gold};
    background: linear-gradient(90deg, rgba(245,197,24,0.08) 0%, transparent 100%);
    border-radius: 0 10px 10px 0;
    padding: 10px 16px;
    margin-bottom: 22px;
    font-size: 12.5px;
    color: ${IIEE.white};
  }

  /* ── Metric Cards Grid ── */
  .ov-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
  }
  .ov-metric-card {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 14px;
    padding: 18px 16px 14px;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    cursor: default;
  }
  .ov-metric-card:hover {
    transform: translateY(-2px);
    border-color: ${IIEE.gold};
    box-shadow: 0 8px 28px rgba(245,197,24,0.12);
  }
  .ov-metric-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent, ${IIEE.gold});
    opacity: 0.7;
  }
  .ov-metric-icon {
    font-size: 18px;
    margin-bottom: 10px;
    display: block;
  }
  .ov-metric-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${IIEE.muted};
    margin-bottom: 6px;
  }
  .ov-metric-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 34px;
    font-weight: 900;
    line-height: 1;
    color: var(--accent, ${IIEE.gold});
  }
  .ov-metric-sub {
    font-size: 10px;
    color: ${IIEE.dimText};
    margin-top: 4px;
  }

  /* ── Section Divider ── */
  .ov-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 28px 0 16px;
  }
  .ov-section-header-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${IIEE.goldBorder} 0%, transparent 100%);
  }
  .ov-section-header-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${IIEE.gold};
    white-space: nowrap;
  }

  /* ── Charts Grid ── */
  .ov-charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .ov-charts-grid .full-width { grid-column: 1 / -1; }

  /* ── Chart Card ── */
  .ov-chart-card {
    background: ${IIEE.cardBg};
    border: 1px solid ${IIEE.cardBorder};
    border-radius: 16px;
    padding: 18px;
    backdrop-filter: blur(10px);
    transition: border-color 0.18s ease;
  }
  .ov-chart-card:hover { border-color: rgba(245,197,24,0.4); }
  .ov-chart-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
  }
  .ov-chart-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    background: ${IIEE.goldGlow};
    border: 1px solid ${IIEE.goldBorder};
    flex-shrink: 0;
  }
  .ov-chart-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${IIEE.white};
    margin: 0 0 2px;
  }
  .ov-chart-subtitle {
    font-size: 11px;
    color: ${IIEE.dimText};
    margin: 0;
  }

  /* ── Chart Description ── */
  .ov-chart-desc {
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(245,197,24,0.04);
    border-left: 2px solid ${IIEE.goldBorder};
    border-radius: 0 8px 8px 0;
    font-size: 11.5px;
    color: ${IIEE.muted};
    line-height: 1.6;
  }
  .ov-chart-desc strong { color: ${IIEE.gold}; font-weight: 600; }

  /* ── GWA Comparison Card ── */
  .ov-gwa-pills {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }
  .ov-gwa-pill {
    flex: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
  }
  .ov-gwa-pill-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${IIEE.dimText};
    margin-bottom: 6px;
  }
  .ov-gwa-pill-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px;
    font-weight: 900;
    line-height: 1;
  }

  /* ── Model Summary Card ── */
  .ov-model-metrics {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ov-model-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ov-model-row-label {
    font-size: 12px;
    color: ${IIEE.muted};
  }
  .ov-model-row-val {
    font-size: 12px;
    font-weight: 700;
  }
  .ov-progress-track {
    height: 6px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
    margin-top: 4px;
  }
  .ov-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(.4,0,.2,1);
  }
  .ov-model-mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .ov-model-mini {
    background: rgba(255,255,255,0.025);
    border-radius: 8px;
    padding: 8px 10px;
  }
  .ov-model-mini-label {
    font-size: 9px;
    color: ${IIEE.dimText};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 2px;
  }
  .ov-model-mini-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: ${IIEE.white};
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ov-charts-grid { grid-template-columns: 1fr; }
    .ov-charts-grid .full-width { grid-column: 1; }
    .ov-metrics { grid-template-columns: repeat(2, 1fr); }
    .ov-body { padding: 16px; }
  }
  @media (max-width: 540px) {
    .ov-metrics { grid-template-columns: 1fr 1fr; }
    .ov-hero { padding: 18px 16px 14px; }
  }

  .fade-in { animation: fadeInUp 0.45s ease both; }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function IIEEMetricCard({ label, value, icon, color = IIEE.gold, sub }) {
  return (
    <div className="ov-metric-card" style={{ "--accent": color }}>
      <span className="ov-metric-icon">{icon}</span>
      <div className="ov-metric-label">{label}</div>
      <div className="ov-metric-value">{value}</div>
      {sub && <div className="ov-metric-sub">{sub}</div>}
    </div>
  );
}

function IIEEChartCard({ title, icon, subtitle, children, fullWidth, description, insight }) {
  return (
    <div className={`ov-chart-card${fullWidth ? " full-width" : ""}`}>
      <div className="ov-chart-header">
        <div className="ov-chart-icon">{icon}</div>
        <div>
          <div className="ov-chart-title">{title}</div>
          {subtitle && <div className="ov-chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
      {(description || insight) && (
        <div className="ov-chart-desc">
          {description && <span>{description}</span>}
          {insight && <><br /><strong>↳ Insight: </strong>{insight}</>}
        </div>
      )}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="ov-section-header">
      <div className="ov-section-header-line" />
      <div className="ov-section-header-label">{label}</div>
      <div className="ov-section-header-line" style={{ background: `linear-gradient(90deg, transparent 0%, ${IIEE.goldBorder} 100%)` }} />
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="ov-progress-track">
      <div
        className="ov-progress-fill"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

/* ─── IIEE Custom Tooltip ─────────────────────────────────────────────────── */
function IIEETooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: IIEE.navyMid,
      border: `1px solid ${IIEE.goldBorder}`,
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      color: IIEE.white,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      {label && <div style={{ color: IIEE.gold, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.color || IIEE.gold, display: "inline-block" }} />
          <span style={{ color: IIEE.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
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
  const chartData = filteredYears.length ? filteredYears : passByYear;
  const stackData = chartData.map((d) => ({
    label: d.label,
    Passers: d.passers ?? Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0)),
    Failers: d.failers ?? ((d.total ?? 0) - Math.round(((d.pass_rate ?? 0) / 100) * (d.total ?? 0))),
  }));

  const barColor = (rate) =>
    rate >= 70 ? IIEE.passGreen : rate >= 55 ? IIEE.amber : IIEE.failRed;

  return (
    <div className="iiee-overview fade-in">
      <style>{styles}</style>

      {/* ── Hero Header ── */}
      <div className="ov-hero">
        <div className="ov-hero-tag">📊 Dashboard</div>
        <h2 className="ov-hero-title">
          Institutional <span>Overview</span>
        </h2>
        <p className="ov-hero-sub">
          Aggregate statistics across all EE board exam takers — first-attempt outcomes only.
        </p>
      </div>

      <div className="ov-body">
        {/* ── Guide + Filters ── */}
        <div className="ov-filter-strip">
          <DashboardGuide
            items={[
              { label: "KPI cards", text: "Show totals and rates for students, passers/failers, and GWA gap." },
              { label: "Charts", text: "Pie and bar charts compare outcomes by year, review status, and duration." },
              { label: "Threshold", text: "70% reference lines and color cues (green/amber/red) judge performance." },
            ]}
          />
          <FilterPanel
            filters={dashFilters}
            onChange={setDashFilters}
            availableYears={availableYears}
          />
        </div>

        {/* ── Insights ── */}
        {localInsights?.length > 0 && (
          <div className="ov-insights">
            <InsightBox insights={localInsights} />
          </div>
        )}

        {/* ── Metric Cards ── */}
        <SectionDivider label="Key Performance Indicators" />
        <div className="ov-metrics">
          <IIEEMetricCard label="Total Students"    value={ov.total_students}                                                         icon="👥" color={IIEE.blue} />
          <IIEEMetricCard label="Total Passers"     value={ov.total_passers}                                                          icon="✅" color={IIEE.passGreen} />
          <IIEEMetricCard label="Total Failers"     value={ov.total_failers}                                                          icon="❌" color={IIEE.failRed} />
          <IIEEMetricCard label="Overall Pass Rate" value={pct(ov.overall_pass_rate)} color={ov.overall_pass_rate >= 70 ? IIEE.passGreen : IIEE.amber} icon="📊" />
          <IIEEMetricCard label="Avg GWA (Passers)" value={num(ov.avg_gwa_passers)}  icon="🎓" color={IIEE.passGreen} sub="1.0 = Highest" />
          <IIEEMetricCard label="Avg GWA (Failers)" value={num(ov.avg_gwa_failers)}  icon="📉" color={IIEE.failRed}   sub="1.0 = Highest" />
        </div>

        {/* ── Distribution Charts ── */}
        <SectionDivider label="Distribution Analysis" />
        <div className="ov-charts-grid">
          {/* Pass/Fail Pie */}
          <IIEEChartCard
            title="Pass / Fail Distribution"
            icon="🥧"
            subtitle="Total passers and failers with percentage share"
            description="Donut chart showing the proportion of exam takers who passed vs failed their first attempt."
            insight="A larger green slice indicates stronger cohort performance above the 70% benchmark."
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </IIEEChartCard>

          {/* Review Attendance Pie */}
          <IIEEChartCard
            title="Review Attendance Share"
            icon="📖"
            subtitle="Examinees who attended formal review vs not"
            description="Shows how many students enrolled in a formal board review program before taking the PRC exam."
            insight="Higher review attendance often correlates with improved pass rates — see the bar chart below."
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={reviewPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                  {reviewPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </IIEEChartCard>

          {/* Pass Rate by Year — full width */}
          <IIEEChartCard
            title="Pass Rate by Year"
            icon="📅"
            subtitle="Board exam performance trend per cohort year"
            fullWidth
            description="Bar chart tracking year-over-year pass rate movement across all exam cohorts."
            insight="Bars above the gold 70% threshold line are strong; amber/red bars indicate cohorts requiring intervention."
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                <XAxis dataKey="label"    tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]}  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine y={70} stroke={IIEE.gold} strokeDasharray="5 3"
                  label={{ value: "70% threshold", position: "insideTopRight", fill: IIEE.gold, fontSize: 10 }} />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.pass_rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </IIEEChartCard>

          {/* Stacked bar — full width */}
          <IIEEChartCard
            title="Pass / Fail Counts by Year"
            icon="📦"
            subtitle="Stacked bar showing pass and fail composition per year"
            fullWidth
            description="Stacked composition chart revealing the absolute number of passers and failers in each cohort year."
            insight="Years with large total bars but low green proportion are high-volume low-performance cohorts."
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stackData} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" />
                <XAxis dataKey="label" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis                 tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<IIEETooltip />} />
                <Legend iconType="circle" iconSize={9}
                  formatter={(v) => <span style={{ color: IIEE.muted, fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Passers" stackId="a" fill={IIEE.passGreen} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Failers" stackId="a" fill={IIEE.failRed}   radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </IIEEChartCard>
        </div>

        {/* ── Review & Duration Analysis ── */}
        <SectionDivider label="Review Program Analysis" />
        <div className="ov-charts-grid">
          <IIEEChartCard
            title="Pass Rate by Review Attendance"
            icon="🏫"
            subtitle="Did attending formal review improve results?"
            description="Horizontal bar comparing pass rates of students who attended formal review vs those who did not."
            insight="A significant gap between groups validates the impact of review programs on board exam outcomes."
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredReview} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                  {filteredReview.map((entry, i) => (
                    <Cell key={i} fill={entry.pass_rate >= 70 ? IIEE.passGreen : IIEE.failRed} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </IIEEChartCard>

          <IIEEChartCard
            title="Pass Rate by Review Duration"
            icon="⏱️"
            subtitle="Longer review programs correlate with higher pass rates"
            description="Compares pass rates across different review program durations to find optimal preparation length."
            insight="Progressively higher bars for longer durations would confirm that review length is a key predictor."
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={passByDur} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,197,24,0.07)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: IIEE.dimText, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: IIEE.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<IIEETooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                <ReferenceLine x={70} stroke={IIEE.gold} strokeDasharray="4 3" />
                <Bar dataKey="pass_rate" name="Pass Rate" radius={[0, 6, 6, 0]}>
                  {passByDur.map((entry, i) => (
                    <Cell key={i} fill={[IIEE.failRed, IIEE.amber, IIEE.passGreen][i] || IIEE.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </IIEEChartCard>
        </div>

        {/* ── GWA & Model Summary ── */}
        <SectionDivider label="Academic Signal & Model" />
        <div className="ov-charts-grid">
          {/* GWA Comparison */}
          <IIEEChartCard
            title="GWA: Passers vs Failers"
            icon="📐"
            subtitle="Lower GWA is better in PH grading (1.0 = highest)"
            description="Compares average General Weighted Average between passers and failers — a core predictive signal."
            insight={`GWA gap: ${num(ov.avg_gwa_failers - ov.avg_gwa_passers)} points — a strong board exam predictor.`}
          >
            <div className="ov-gwa-pills">
              <div className="ov-gwa-pill">
                <div className="ov-gwa-pill-label">Passers Avg GWA</div>
                <div className="ov-gwa-pill-val" style={{ color: IIEE.passGreen }}>{num(ov.avg_gwa_passers)}</div>
              </div>
              <div className="ov-gwa-pill">
                <div className="ov-gwa-pill-label">Failers Avg GWA</div>
                <div className="ov-gwa-pill-val" style={{ color: IIEE.failRed }}>{num(ov.avg_gwa_failers)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart
                data={[
                  { name: "Passers", value: ov.avg_gwa_passers },
                  { name: "Failers", value: ov.avg_gwa_failers },
                ]}
                margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 3]}  tick={{ fill: IIEE.dimText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<IIEETooltip formatter={(v) => v?.toFixed(2)} />} />
                <Bar dataKey="value" name="Avg GWA" radius={[6, 6, 0, 0]}>
                  <Cell fill={IIEE.passGreen} />
                  <Cell fill={IIEE.failRed} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </IIEEChartCard>

          {/* Model Performance Summary */}
          <IIEEChartCard
            title="Model Performance Summary"
            icon="📈"
            subtitle="Random Forest classification & regression metrics"
            description="Summarizes the predictive model's accuracy, F1 score, and cross-validation performance."
            insight="Higher accuracy and F1 confirm the model reliably identifies at-risk students before the exam."
          >
            {modelInfo ? (
              <div className="ov-model-metrics">
                {[
                  { label: "Classification Accuracy", value: modelInfo.classification?.accuracy,  color: IIEE.blue },
                  { label: "Classification F1",        value: modelInfo.classification?.f1,        color: IIEE.gold },
                  { label: "CV Accuracy",              value: modelInfo.classification?.cv_acc,    color: "#A78BFA" },
                  { label: "CV F1",                    value: modelInfo.classification?.cv_f1,     color: IIEE.passGreen },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="ov-model-row">
                      <span className="ov-model-row-label">{m.label}</span>
                      <span className="ov-model-row-val" style={{ color: m.color }}>
                        {pct((m.value ?? 0) * 100)}
                      </span>
                    </div>
                    <ProgressBar value={(m.value ?? 0) * 100} color={m.color} />
                  </div>
                ))}

                <div className="ov-model-mini-grid">
                  {[
                    { label: "Reg A — MAE", v: modelInfo.regression_a?.mae, d: 2 },
                    { label: "Reg A — R²",  v: modelInfo.regression_a?.r2,  d: 3 },
                    { label: "Reg B — MAE", v: modelInfo.regression_b?.mae, d: 2 },
                    { label: "Reg B — R²",  v: modelInfo.regression_b?.r2,  d: 3 },
                  ].map((m, i) => (
                    <div key={i} className="ov-model-mini">
                      <div className="ov-model-mini-label">{m.label}</div>
                      <div className="ov-model-mini-val">{num(m.v, m.d)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: IIEE.dimText }}>Loading model metrics…</p>
            )}
          </IIEEChartCard>
        </div>
      </div>
    </div>
  );
}