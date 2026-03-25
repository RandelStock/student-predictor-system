// Shared helpers/components for `ProfessorPage` (extracted to keep file size manageable).

export const c = {
  pass: "#34d399",
  fail: "#f87171",
  blue: "#38bdf8",
  indigo: "#818cf8",
  amber: "#fbbf24",
  orange: "#fb923c",
  pink: "#f472b6",
  teal: "#2dd4bf",
  bg: "#060b14",
  surface: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
};

export const T = {
  navy:      "#07102B",   // deepest background
  navyMid:   "#0D1B3E",   // sidebar fill
  navyCard:  "#112250",   // card surface
  navyHover: "#162B60",   // hover surface
  gold:      "#F5C518",   // primary accent
  goldDim:   "#C9A010",   // pressed / muted gold
  goldGlow:  "rgba(245,197,24,0.18)",
  blue:      "#38BDF8",   // chart / info accent
  white:     "#F1F5F9",
  muted:     "#94A3B8",
  dimText:   "#64748B",
  border:    "rgba(245,197,24,0.14)",
  borderSub: "rgba(255,255,255,0.07)",
  fail:      "#F87171",
  pass:      "#4ADE80",
};

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const CHART_COLORS = [c.blue, c.indigo, c.teal, c.amber, c.pink, c.orange, c.pass, c.fail];

export function pct(v) {
  return typeof v === "number" ? `${v.toFixed(1)}%` : "—";
}

export function num(v, d = 2) {
  return typeof v === "number" ? v.toFixed(d) : "—";
}

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
export function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#0f1a2e",
        border: "1px solid rgba(56,189,248,0.2)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "'DM Sans',sans-serif",
        color: "#f1f5f9",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {label && <p style={{ margin: "0 0 6px", color: "#94a3b8", fontWeight: 700 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: "2px 0", color: entry.color || "#f1f5f9" }}>
          <span style={{ color: "#94a3b8" }}>{entry.name}: </span>
          <strong>{formatter ? formatter(entry.value) : entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, color = c.blue, icon, trend, hint }) {
  const up = trend > 0;
  const zero = trend === 0;
  return (
    <div
      title={hint}
      style={{
        background: `linear-gradient(135deg, ${color}0d 0%, ${color}06 100%)`,
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        cursor: hint ? "help" : "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `${color}08`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 11,
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 3px",
          fontSize: 28,
          fontWeight: 800,
          color,
          fontFamily: "'Syne',sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {sub && <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>{sub}</p>}
        {trend !== undefined && !zero && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 999,
              background: `${up ? c.pass : c.fail}18`,
              color: up ? c.pass : c.fail,
              border: `1px solid ${up ? c.pass : c.fail}30`,
            }}
          >
            {up ? `▲ +${trend}` : `▼ ${trend}`}
          </span>
        )}
      </div>
    </div>
  );
}

// ── ChartContainer ────────────────────────────────────────────────────────────
export function ChartContainer({
  title,
  icon,
  subtitle,
  children,
  fullWidth = false,
  accent = c.blue,
  action,
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.022)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "22px 24px",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: subtitle ? 4 : 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#f1f5f9",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              {title}
            </p>
            {subtitle && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#475569" }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {subtitle && <div style={{ height: 12 }} />}
      {children}
    </div>
  );
}

// ── DashboardGuide ────────────────────────────────────────────────────────────
export function DashboardGuide({ title = "How to Read This Dashboard", items = [] }) {
  if (!items.length) return null;
  return (
    <div
      style={{
        background: "rgba(56,189,248,0.06)",
        border: "1px solid rgba(56,189,248,0.2)",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          color: c.blue,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 700,
        }}
      >
        {title}
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((item, idx) => (
          <p key={idx} style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.55 }}>
            <strong style={{ color: "#f1f5f9" }}>{item.label}:</strong> {item.text}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── FilterPanel ───────────────────────────────────────────────────────────────
export function FilterPanel({ filters = {}, onChange = () => {}, availableYears = [], availablePeriods = [] }) {
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "#f1f5f9",
    fontSize: 12,
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontSize: 11,
    color: T.gold,
    fontFamily: "'DM Sans',sans-serif",
    display: "block",
    marginBottom: 5,
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 20,
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "flex-end",
    }}>

      {/* ── Year dropdown ── */}
      <div>
        <label style={labelStyle}>📅 Year</label>
        <select
          style={{
            ...inputStyle,
            background: "rgba(15,26,46,0.75)",
            borderColor: "rgba(56,189,248,0.35)",
            appearance: "none",
            minWidth: 110,
          }}
          value={filters.year || ""}
          onChange={(e) => onChange({ ...filters, year: e.target.value, period: "" })}
        >
          <option value="" style={{ background: "#0f1a2e" }}>All Years</option>
          {availableYears.map((y) => (
            <option key={y} value={y} style={{ background: "#0f1a2e" }}>{y}</option>
          ))}
        </select>
      </div>

      {/* ── Exam Period pills ── */}
      {availablePeriods.length > 0 && (
        <div>
          <label style={labelStyle}>📆 Exam Period</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 640 }}>
            {/* All button */}
            <button
              onClick={() => onChange({ ...filters, period: "", year: "" })}
              style={{
                ...inputStyle,
                background: !filters.period ? "rgba(245,197,24,0.18)" : "rgba(255,255,255,0.04)",
                borderColor: !filters.period ? T.gold : "rgba(255,255,255,0.1)",
                color: !filters.period ? T.gold : "#94a3b8",
                padding: "7px 14px",
                fontWeight: !filters.period ? 700 : 400,
              }}
            >
              All
            </button>

            {/* One pill per unique period */}
            {availablePeriods.map((p) => {
              const active = filters.period === p.value;
              const isApril = p.month?.toLowerCase().startsWith("apr");
              const accent  = isApril ? "#38BDF8" : "#FB923C";
              return (
                <button
                  key={p.value}
                  onClick={() => onChange({ ...filters, period: p.value, year: p.year })}
                  style={{
                    ...inputStyle,
                    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
                    borderColor: active ? accent : "rgba(255,255,255,0.1)",
                    color: active ? accent : "#94a3b8",
                    padding: "7px 14px",
                    fontWeight: active ? 700 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Review filter ── */}
      <div>
        <label style={labelStyle}>📖 Attended Formal Review?</label>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Yes", "No"].map((v) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, review: v === "All" ? "" : v })}
              style={{
                ...inputStyle,
                background: (filters.review === v || (!filters.review && v === "All"))
                  ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.04)",
                borderColor: (filters.review === v || (!filters.review && v === "All"))
                  ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.1)",
                color: (filters.review === v || (!filters.review && v === "All"))
                  ? "#38BDF8" : "#94a3b8",
                padding: "7px 14px",
                fontWeight: 600,
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reset ── */}
      <button
        onClick={() => onChange({ year: "", period: "", review: "", subject: "" })}
        style={{ ...inputStyle, padding: "8px 16px", color: "#64748b", marginTop: "auto" }}
      >
        ↺ Reset
      </button>
    </div>
  );
}

// ── InsightBox ────────────────────────────────────────────────────────────────
export function InsightBox({ insights = [] }) {
  if (!insights.length) return null;
  const icons = ["📈", "📉", "⚠️", "✅", "🔍", "💡", "🎯", "📊"];
  return (
    <div
      style={{
        background: "rgba(56,189,248,0.04)",
        border: "1px solid rgba(56,189,248,0.15)",
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 20,
      }}
    >
      <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: c.blue, fontFamily: "'Syne',sans-serif" }}>
        ✨ AI-Generated Insights
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
        {insights.map((insight, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[i % icons.length]}</span>
            <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── buildMockData — kept identical to original for fallback ──────────────────
export function buildMockData() {
  return {
    overview: {
      total_students: 87,
      total_passers: 61,
      total_failers: 26,
      overall_pass_rate: 70.1,
      avg_gwa_passers: 1.82,
      avg_gwa_failers: 2.41,
      avg_rating_passers: 78.4,
      avg_rating_failers: 63.1,
      passing_score: 70,
    },
    pass_rate_by_year: [
      { label: "2021", pass_rate: 62.5, total: 24 },
      { label: "2022", pass_rate: 68.0, total: 25 },
      { label: "2023", pass_rate: 71.4, total: 28 },
      { label: "2024", pass_rate: 80.0, total: 10 },
    ],
    pass_rate_by_strand: [
      { label: "STEM", pass_rate: 78.3, total: 46 },
      { label: "GAS", pass_rate: 55.6, total: 18 },
      { label: "TVL", pass_rate: 50.0, total: 8 },
      { label: "HUMSS", pass_rate: 60.0, total: 10 },
      { label: "ABM", pass_rate: 40.0, total: 5 },
    ],
    pass_rate_by_review: [
      { label: "Attended Review", pass_rate: 79.5, total: 44 },
      { label: "No Formal Review", pass_rate: 58.1, total: 43 },
    ],
    pass_rate_by_duration: [
      { label: "No Review", pass_rate: 58.1, total: 43 },
      { label: "~3 Months", pass_rate: 72.2, total: 18 },
      { label: "~6 Months", pass_rate: 84.6, total: 26 },
    ],
    gwa_comparison: { passers: 1.82, failers: 2.41 },
    feature_importance: [
      { label: "EE Score", value: 0.142 },
      { label: "MATH Score", value: 0.131 },
      { label: "ESAS Score", value: 0.118 },
      { label: "GWA", value: 0.094 },
      { label: "PS11 – Confident: Board Exam Problems", value: 0.041 },
      { label: "KN8 – Subjects Covered Board Topics", value: 0.038 },
      { label: "MT4 – Follows Study Schedule", value: 0.034 },
      { label: "KN1 – Strong Math Foundation", value: 0.031 },
      { label: "PS5 – Solves Within Time Limit", value: 0.028 },
      { label: "Review Duration", value: 0.026 },
    ],
    section_scores: [
      { label: "Knowledge", pass: 72.4, fail: 54.1 },
      { label: "Prob. Solving", pass: 70.8, fail: 51.3 },
      { label: "Motivation", pass: 80.2, fail: 66.9 },
      { label: "Mental Health", pass: 74.5, fail: 63.2 },
      { label: "Support", pass: 76.1, fail: 68.4 },
      { label: "Curriculum", pass: 69.3, fail: 60.8 },
      { label: "Faculty", pass: 73.7, fail: 64.5 },
      { label: "Dept Review", pass: 65.4, fail: 55.2 },
      { label: "Facilities", pass: 62.8, fail: 57.1 },
      { label: "Inst. Culture", pass: 68.9, fail: 60.3 },
    ],
    weakest_questions: [
      { key: "FA2", label: "Labs equipped for practical learning", avg: 2.71, section: "Facilities" },
      { key: "DR3", label: "Mock exams reflected actual board difficulty", avg: 2.68, section: "Dept Review" },
      { key: "FA1", label: "Library had adequate review resources", avg: 2.64, section: "Facilities" },
      { key: "KN8", label: "Subjects covered board exam topics", avg: 2.62, section: "Knowledge" },
      { key: "DR1", label: "Dept conducted review programs", avg: 2.58, section: "Dept Review" },
      { key: "CU3", label: "Syllabi aligned with board exam", avg: 2.55, section: "Curriculum" },
      { key: "FA4", label: "Study areas accessible for reviewers", avg: 2.54, section: "Facilities" },
      { key: "DR5", label: "Review conducted at right time before exam", avg: 2.51, section: "Dept Review" },
      { key: "CU1", label: "Curriculum aligned with EE licensure exam", avg: 2.49, section: "Curriculum" },
      { key: "IC4", label: "Institution provides career guidance", avg: 2.47, section: "Institution" },
    ],
    subject_trends_by_year: [
      { year: 2021, EE_avg: 62.1, MATH_avg: 70.3, ESAS_avg: 65.4 },
      { year: 2022, EE_avg: 65.8, MATH_avg: 72.1, ESAS_avg: 67.2, EE_delta: 3.7, MATH_delta: 1.8, ESAS_delta: 1.8 },
      { year: 2023, EE_avg: 68.4, MATH_avg: 74.9, ESAS_avg: 70.1, EE_delta: 2.6, MATH_delta: 2.8, ESAS_delta: 2.9 },
      { year: 2024, EE_avg: 72.0, MATH_avg: 78.5, ESAS_avg: 73.8, EE_delta: 3.6, MATH_delta: 3.6, ESAS_delta: 3.7 },
    ],
  };
}

// ── generate local insights from data ────────────────────────────────────────
export function generateInsights(data, filters) {
  const insights = [];
  if (!data) return insights;

  const ov = data.overview ?? {};
  const passByYear = data.pass_rate_by_year ?? [];
  const passByReview = data.pass_rate_by_review ?? [];
  const subjectTrends = data.subject_trends_by_year ?? [];
  const featureImp = data.feature_importance ?? [];

  // Pass rate trend
  if (passByYear.length >= 2) {
    const first = passByYear[0];
    const last = passByYear[passByYear.length - 1];
    const delta = (last.pass_rate - first.pass_rate).toFixed(1);
    insights.push(
      `Pass rate ${delta > 0 ? "increased" : "decreased"} by ${Math.abs(delta)}% from ${first.label} to ${last.label} (${first.pass_rate.toFixed(1)}% → ${last.pass_rate.toFixed(1)}%).`
    );
  }

  // Review impact
  if (passByReview.length >= 2) {
    const attended = passByReview.find((x) => x.label?.toLowerCase().includes("attended"));
    const notAttended = passByReview.find((x) => x.label?.toLowerCase().includes("no formal"));
    if (attended && notAttended) {
      const diff = (attended.pass_rate - notAttended.pass_rate).toFixed(1);
      insights.push(
        `Students who attended formal review outperformed those who did not by ${diff}% (${attended.pass_rate.toFixed(1)}% vs ${notAttended.pass_rate.toFixed(1)}%).`
      );
    }
  }

  // Subject trend
  if (subjectTrends.length >= 2) {
    const first = subjectTrends[0];
    const last = subjectTrends[subjectTrends.length - 1];
    const subjects = [
      { id: "EE", delta: last.EE_avg - first.EE_avg },
      { id: "MATH", delta: last.MATH_avg - first.MATH_avg },
      { id: "ESAS", delta: last.ESAS_avg - first.ESAS_avg },
    ];
    const weakest = subjects.reduce((a, b) => (last[`${a.id}_avg`] < last[`${b.id}_avg`] ? a : b));
    insights.push(
      `Subject ${weakest.id} has the lowest latest-cohort average (${last[`${weakest.id}_avg`]}). ${
        weakest.delta >= 0 ? "It is improving." : "It shows a declining trend."
      }`
    );
  }

  // GWA gap
  if (ov.avg_gwa_passers && ov.avg_gwa_failers) {
    insights.push(
      `GWA gap between passers (${num(ov.avg_gwa_passers)}) and failers (${num(ov.avg_gwa_failers)}) is ${
        num(ov.avg_gwa_failers - ov.avg_gwa_passers)
      } points — a strong predictive signal.`
    );
  }

  // Top feature
  if (featureImp.length) {
    insights.push(
      `Top predictor for board exam success: "${featureImp[0]?.label}" (importance = ${featureImp[0]?.value?.toFixed(4)}), followed by "${featureImp[1]?.label}".`
    );
  }

  // Review filter insight
  if (filters?.review) {
    const reviewed = data.pass_rate_by_review?.find((x) =>
      filters.review === "Yes" ? x.label?.toLowerCase().includes("attended") : x.label?.toLowerCase().includes("no formal")
    );
    if (reviewed) {
      insights.push(
        `Filtered view: Students who ${filters.review === "Yes" ? "attended" : "did not attend"} formal review — pass rate: ${pct(
          reviewed.pass_rate
        )} (n=${reviewed.total}).`
      );
    }
  }

  return insights.slice(0, 6);
}

