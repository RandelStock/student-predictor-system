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
  DashboardGuide,
} from "./ProfessorShared";

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
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Curriculum Gap Analysis</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Survey items with the lowest scores — indicating institutional weaknesses.</p>
      </div>
      <DashboardGuide
        items={[
          { label: "What the scores mean", text: "Higher average Likert values indicate stronger disagreement and larger curriculum gaps." },
          { label: "Category summary", text: "Groups weak items by section to show which curriculum areas need priority action." },
          { label: "Decision use", text: "Focus first on high-severity items and sections, then track score shifts over time." },
        ]}
      />
      <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#fcd34d", fontFamily: "'Syne',sans-serif" }}>Objective 4 — Curriculum Weakness Indicators</p>
          <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
            Items sorted by average Likert score (1=Strongly Agree → 4=Strongly Disagree). Higher scores mean more disagreement — institutional gaps.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <ChartContainer title="Weakest Survey Items" icon="🔎" subtitle="Top 10 items with highest disagreement score" accent={c.fail}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weakestQ.map((q) => ({ name: q.key, avg: q.avg, label: q.label, section: q.section }))} layout="vertical" margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[2, 3]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: "#0f1a2e", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f1f5f9", maxWidth: 220 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: c.fail }}>{d.name}</p>
                    <p style={{ margin: "0 0 2px", color: "#94a3b8" }}>{d.label}</p>
                    <p style={{ margin: 0 }}>Score: <strong style={{ color: c.fail }}>{d.avg?.toFixed(2)}/4</strong> · {d.section}</p>
                  </div>
                );
              }} />
              <ReferenceLine x={2.5} stroke={c.amber} strokeDasharray="4 3" label={{ value: "2.5 critical", position: "insideTopRight", fill: c.amber, fontSize: 9 }} />
              <Bar dataKey="avg" name="Avg Score" radius={[0, 5, 5, 0]}>
                {weakestQ.map((entry, index) => (
                  <Cell key={index} fill={entry.avg >= 2.7 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Gap Summary by Category" icon="📋" subtitle="Which categories have the most weak items?" accent={c.amber}>
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[2, 3]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={(v) => `${v?.toFixed(2)}/4`} />} />
                <Bar dataKey="avg" name="Avg Score" radius={[5, 5, 0, 0]}>
                  {categories.map((entry, index) => (
                    <Cell key={index} fill={entry.avg >= 2.65 ? c.fail : entry.avg >= 2.55 ? c.amber : c.orange} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8, marginTop: 12 }}>
              {categories.map((cat, i) => {
                const sev = cat.avg >= 2.65 ? c.fail : cat.avg >= 2.55 ? c.amber : c.orange;
                return (
                  <div key={i} style={{ background: `${sev}0d`, border: `1px solid ${sev}25`, borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{cat.label}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 10, color: "#475569" }}>{cat.count} weak item{cat.count > 1 ? "s" : ""}</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: sev, fontFamily: "'Syne',sans-serif" }}>{num(cat.avg)}<span style={{ fontSize: 10, color: "#475569" }}>/4</span></p>
                  </div>
                );
              })}
            </div>
          </>
        </ChartContainer>
      </div>

      <ChartContainer title="Detailed Weak Survey Items" icon="📋" subtitle="All 10 weakest items with severity ratings" fullWidth accent={c.amber}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10 }}>
          {weakestQ.map((q, i) => {
            const severity = q.avg >= 2.7 ? "high" : q.avg >= 2.55 ? "medium" : "low";
            const sColor = severity === "high" ? c.fail : severity === "medium" ? c.amber : c.orange;
            const barPct = ((q.avg - 1) / 3) * 100;
            return (
              <div key={i} style={{ background: `${sColor}08`, border: `1px solid ${sColor}22`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: `${sColor}20`, color: sColor, border: `1px solid ${sColor}40`, flexShrink: 0 }}>{q.key}</span>
                    <span style={{ fontSize: 9, color: "#475569", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 999 }}>{q.section}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, background: `${sColor}15`, border: `1px solid ${sColor}30`, borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: sColor }}>{q.avg.toFixed(2)}</span>
                    <span style={{ fontSize: 9, color: `${sColor}99` }}>/4</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#cbd5e1", lineHeight: 1.45 }}>{q.label}</p>
                <TinyBar value={barPct} max={100} color={sColor} height={5} />
                <p style={{ margin: "5px 0 0", fontSize: 10, color: "#475569" }}>
                  {severity === "high" ? "🔴 Critical — requires immediate attention" : severity === "medium" ? "🟡 Moderate — monitor and improve" : "🟠 Low concern — room for improvement"}
                </p>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
          🎯 <strong style={{ color: "#f1f5f9" }}>Key Finding:</strong> Facilities and Dept. Review items consistently score highest (most disagreement), suggesting physical resources and department-organized review programs are the most critical gaps.
        </div>
      </ChartContainer>
    </div>
  );
}
