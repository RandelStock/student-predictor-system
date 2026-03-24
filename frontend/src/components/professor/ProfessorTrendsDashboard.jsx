import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  c,
  MONTH_NAMES,
  CustomTooltip,
  MetricCard,
  ChartContainer,
  DashboardGuide,
  FilterPanel,
} from "./ProfessorShared";

const IIEE_COLORS = {
  primary: '#1e3a8a',
  secondary: '#fbbf24',
  accent: '#06b6d4',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  muted: '#64748b',
};

const styles = `
  .trends-dashboard {
    background: ${IIEE_COLORS.background};
    min-height: 100vh;
    color: ${IIEE_COLORS.text};
    font-family: 'DM Sans', sans-serif;
  }
  .sticky-filter {
    position: sticky;
    top: 0;
    z-index: 25;
    background: rgba(15, 26, 42, 0.95);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 18px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  }
  .chart-description {
    margin-top: 10px;
    font-size: 12px;
    color: ${IIEE_COLORS.muted};
    line-height: 1.5;
  }
`;

export default function ProfessorTrendsDashboard({
  usageLoading,
  usageSummary,
  downloadPerformanceReport,
  reportLoading,
  insightsLoading,
  trendInsights,
  fetchTrendInsights,
  yearlyPF,
  reviewAnalysis,
  timingAnalysis,
  openTimingModal,
  selectedYear,
  setSelectedYear,
  monthly,
  attFilter,
  setAttFilter,
  setAttPage,
  attempts,
  attPage,
}) {
  return (
    <div className="trends-dashboard fade-in">
      <style>{styles}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: IIEE_COLORS.secondary }}>Trends & Monitoring</h2>
        <p style={{ margin: 0, fontSize: 13, color: IIEE_COLORS.muted }}>Live data from the prediction database — student attempts, monthly summaries, and AI trend insights.</p>
      </div>
      <div className="sticky-filter">
        <FilterPanel />
      </div>
      <DashboardGuide
        items={[
          { label: "Live monitoring", text: "Uses runtime database activity (usage, attempts, pass/fail by period)." },
          { label: "Behavior analysis", text: "Timing and review-split sections show potential quality and process issues." },
          { label: "How to use", text: "Track direction month-to-month and investigate sudden drops or outlier behavior." },
        ]}
      />

      <ChartContainer title="System Usage & User Activity" icon="📊" subtitle="Active student users and prediction volume (last 30 days)" fullWidth accent={c.blue}>
        {usageLoading ? (
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Loading system usage…</p>
        ) : usageSummary ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={downloadPerformanceReport}
                disabled={reportLoading}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "#94a3b8",
                  fontSize: 12,
                  cursor: reportLoading ? "not-allowed" : "pointer",
                  opacity: reportLoading ? 0.6 : 1,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {reportLoading ? "Preparing…" : "⬇ Download Performance Report"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12 }}>
              <MetricCard label="Total Predictions" value={usageSummary.total_predictions} color={c.blue} icon="🔮" />
              <MetricCard label="Active Users" value={usageSummary.active_users} color={c.pass} icon="👥" sub="distinct student users" />
            </div>

            {(usageSummary.predictions_by_day ?? []).length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Predictions by Day (last 10 days)</p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={(usageSummary.predictions_by_day ?? []).slice(-10).map((d) => ({ day: d.day ? d.day.slice(5) : "—", total: d.total ?? 0 }))} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Predictions" fill={c.blue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {(usageSummary.active_users_recent ?? []).length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Most Active Students</p>
                <table className="att-table">
                  <thead><tr><th>Student</th><th>Attempts</th><th>Last Activity</th></tr></thead>
                  <tbody>
                    {(usageSummary.active_users_recent ?? []).map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{u.name || u.user_id || "—"}</td>
                        <td>{u.attempts ?? 0}</td>
                        <td style={{ color: "#64748b" }}>{u.last_at ? new Date(u.last_at).toLocaleDateString("en-PH") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="chart-description">Daily predictions and active users show system load trends; peak activity correlates with deadline and review cycles.</div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>No usage data yet.</p>
        )}
      </ChartContainer>

      <div style={{ marginTop: 14 }}>
        <ChartContainer title="AI Trend Insights" icon="✨" subtitle="Groq AI summary of year-over-year prediction trends" fullWidth accent={c.blue}>
          {insightsLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${c.blue}40`, borderTopColor: c.blue, animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#64748b" }}>Generating AI summary…</span>
            </div>
          ) : trendInsights ? (
            <div>
              {(trendInsights.stats?.years ?? []).length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
                  {(trendInsights.stats.years ?? []).map((yr, i) => (
                    <div key={i} style={{ background: `${c.blue}0d`, border: `1px solid ${c.blue}25`, borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{yr.year}</p>
                      <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: yr.pass_rate >= 70 ? c.pass : c.amber, fontFamily: "'Syne',sans-serif" }}>{yr.pass_rate.toFixed(1)}%</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#475569" }}>{yr.total} attempts · avg {yr.avg_rating?.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: c.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p>
                <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{trendInsights.summary}</p>
              </div>
              <button onClick={fetchTrendInsights} style={{ marginTop: 10, background: "transparent", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 8, padding: "5px 12px", color: c.blue, fontSize: 12, cursor: "pointer" }}>
                ↻ Refresh Insights
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#64748b" }}>No trend data yet. Submit more predictions to generate insights.</p>
          )}
          <div className="chart-description">AI Trend Insights blends historical patterns and current metrics for guided action; refresh to stay updated with latest data behavior.</div>
        </ChartContainer>
      </div>

      {(yearlyPF ?? []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <ChartContainer title="Pass / Fail by Year (Live DB)" icon="📊" subtitle="From prediction_attempts table — real student submissions" fullWidth accent={c.pass}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(yearlyPF ?? []).map((yr) => {
                  const total = yr.pass_count + yr.fail_count;
                  return { year: String(yr.year), Passers: yr.pass_count, Failers: yr.fail_count, passRate: total ? (yr.pass_count / total) * 100 : 0 };
                })}
                margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-description">Use the stacked pass/fail bars as an early warning for cohort performance shifts and compare reliability across years.</div>
          </ChartContainer>
        </div>
      )}

      {(reviewAnalysis?.items ?? []).length > 0 && (
        <div style={{ marginTop: 14 }}>
          <ChartContainer title="Formal Review Split Analysis" icon="📚" subtitle="Separated results by Attended Formal Review = Yes / No" fullWidth accent={c.teal}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 14 }}>
              {(reviewAnalysis.items ?? []).map((item, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: item.review_program === "Yes" ? c.pass : c.amber, fontWeight: 700 }}>{item.review_program === "Yes" ? "✅ Attended Review" : "⚠️ No Formal Review"}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 26, color: "#f1f5f9", fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{item.pass_rate?.toFixed(1)}%</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    {item.pass_count}/{item.total} predicted pass
                    {item.human_like_rate != null ? ` · Human-like timing: ${item.human_like_rate.toFixed(1)}%` : ""}
                  </p>
                </div>
              ))}
            </div>
            <div className="chart-description">Compare pass rate with/without formal review to assess the coaching program ROI and focus interventions.</div>
          </ChartContainer>
        </div>
      )}

      {timingAnalysis?.summary && (
        <div style={{ marginTop: 14 }}>
          <ChartContainer title="Predictor Timer Analysis" icon="⏱️" subtitle="Response timing captured from Predictor Form" fullWidth accent={c.orange}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 16 }}>
              <MetricCard label="Timed Questions" value={timingAnalysis.summary.timed_questions ?? 0} color={c.blue} icon="⏱️" />
              <MetricCard label="Human-like" value={timingAnalysis.summary.human_like_rate != null ? `${timingAnalysis.summary.human_like_rate.toFixed(1)}%` : "—"} color={c.pass} icon="🧑" sub={`${timingAnalysis.summary.human_like_count ?? 0} answers`} />
              <MetricCard label="Too Fast" value={timingAnalysis.summary.too_fast_rate != null ? `${timingAnalysis.summary.too_fast_rate.toFixed(1)}%` : "—"} color={c.amber} icon="⚡" sub={`${timingAnalysis.summary.too_fast_count ?? 0} answers`} />
              <MetricCard label="Too Slow" value={timingAnalysis.summary.too_slow_rate != null ? `${timingAnalysis.summary.too_slow_rate.toFixed(1)}%` : "—"} color={c.orange} icon="🐢" sub={`${timingAnalysis.summary.too_slow_count ?? 0} answers`} />
            </div>
            {(timingAnalysis.sections ?? []).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Timer by Section</p>
                <table className="att-table">
                  <thead><tr><th>Section</th><th>Timed Qs</th><th>Avg Duration (sec)</th><th>Human-like Rate</th></tr></thead>
                  <tbody>
                    {(timingAnalysis.sections ?? []).map((s, i) => (
                      <tr key={i}>
                        <td>{s.section}</td>
                        <td>{s.timed_questions ?? 0}</td>
                        <td>{s.avg_duration_sec != null ? s.avg_duration_sec.toFixed(1) : "—"}</td>
                        <td style={{ color: (s.human_like_rate ?? 0) >= 70 ? c.pass : c.amber, fontWeight: 700 }}>{s.human_like_rate != null ? `${s.human_like_rate.toFixed(1)}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(timingAnalysis.suspicious_attempts ?? []).length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Potentially Random / Too-fast Attempts</p>
                <table className="att-table">
                  <thead><tr><th>Name</th><th>Date</th><th>Too Fast Rate</th><th>Timed Qs</th></tr></thead>
                  <tbody>
                    {(timingAnalysis.suspicious_attempts ?? []).map((a, i) => (
                      <tr key={i} style={{ cursor: "pointer" }} onClick={() => openTimingModal(a)} title="Click to view per-question timings">
                        <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{a.name || "Unknown"}</td>
                        <td style={{ color: "#64748b" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td style={{ color: c.fail, fontWeight: 700 }}>{a.too_fast_rate?.toFixed(1)}%</td>
                        <td>{a.timed_questions ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          <div className="chart-description">Timing analysis highlights potential integrity risks (too-fast behavior) and helps guide adaptive exam pacing decisions.</div>
          </ChartContainer>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <ChartContainer title="Monthly Summary" icon="📆" subtitle="Pass/fail counts per month for a selected year" fullWidth accent={c.teal}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#64748b" }}>Year:</label>
            <select className="filter-input" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
          {(monthly ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={(monthly ?? []).map((m) => {
                  const total = m.total || 1;
                  return { month: MONTH_NAMES[m.month - 1], Passers: m.pass_count, Failers: m.fail_count, passRate: (m.pass_count / total) * 100 };
                })}
                margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Passers" stackId="a" fill={c.pass} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Failers" stackId="a" fill={c.fail} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: 12, color: "#475569" }}>No data for {selectedYear}. Students need to submit predictions first.</p>
          )}
          <div className="chart-description">Monthly pass/fail bars show seasonality and allow quick comparison of the passage rate with respect to high/low months.</div>
        </ChartContainer>
      </div>

      <div style={{ marginTop: 14 }}>
        <ChartContainer title="Recent Prediction Attempts" icon="🗃️" subtitle="Paginated log from prediction_attempts table" fullWidth accent={c.indigo}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, color: "#64748b" }}>Year:</label>
              <input className="filter-input" type="number" placeholder="e.g. 2025" value={attFilter.year} onChange={(e) => { setAttFilter((f) => ({ ...f, year: e.target.value })); setAttPage(1); }} style={{ width: 90 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, color: "#64748b" }}>Month:</label>
              <input className="filter-input" type="number" placeholder="1–12" min="1" max="12" value={attFilter.month} onChange={(e) => { setAttFilter((f) => ({ ...f, month: e.target.value })); setAttPage(1); }} style={{ width: 70 }} />
            </div>
            <button onClick={() => { setAttFilter({ year: "", month: "" }); setAttPage(1); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "#64748b", fontSize: 12, cursor: "pointer" }}>Clear</button>
            {attempts && <span style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>{attempts.total} total · Page {attPage}</span>}
          </div>
          {attempts && (attempts.items ?? []).length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="att-table">
                  <thead><tr><th>Date</th><th>Result</th><th>Pass Prob.</th><th>Pred. Rating A</th><th>Student</th><th>Email</th></tr></thead>
                  <tbody>
                    {(attempts.items ?? []).map((item, i) => (
                      <tr key={i}>
                        <td style={{ color: "#64748b" }}>{new Date(item.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: item.label === "PASSED" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: item.label === "PASSED" ? c.pass : c.fail, border: `1px solid ${item.label === "PASSED" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}` }}>{item.label}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: item.probability_pass >= 0.7 ? c.pass : item.probability_pass >= 0.5 ? c.amber : c.fail }}>{(item.probability_pass * 100).toFixed(1)}%</td>
                        <td style={{ color: item.predicted_rating_a >= 70 ? c.pass : item.predicted_rating_a >= 60 ? c.amber : c.fail }}>{item.predicted_rating_a?.toFixed(1) ?? "—"}</td>
                        <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{item.full_name || item.name || "—"}</td>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{item.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "flex-end" }}>
                <button onClick={() => setAttPage((p) => Math.max(1, p - 1))} disabled={attPage === 1} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: attPage === 1 ? "#334155" : "#94a3b8", fontSize: 12, cursor: attPage === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
                <span style={{ fontSize: 12, color: "#475569" }}>{attPage} / {Math.ceil((attempts.total || 1) / 20)}</span>
                <button onClick={() => setAttPage((p) => p + 1)} disabled={attPage >= Math.ceil((attempts.total || 1) / 20)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: attPage >= Math.ceil((attempts.total || 1) / 20) ? "#334155" : "#94a3b8", fontSize: 12, cursor: attPage >= Math.ceil((attempts.total || 1) / 20) ? "not-allowed" : "pointer" }}>Next →</button>
              </div>
            </>
          ) : (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#475569" }}>No prediction attempts found.</p>
              <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Students need to log in and submit predictions first.</p>
            </div>
          )}          <div className="chart-description">Recent attempts table reveals user behavior and probability accuracy, with name/email for identification instead of raw IDs.</div>        </ChartContainer>
      </div>
    </div>
  );
}
