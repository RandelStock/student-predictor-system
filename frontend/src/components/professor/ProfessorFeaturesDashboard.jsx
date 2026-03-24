import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  c,
  CHART_COLORS,
  CustomTooltip,
  ChartContainer,
  DashboardGuide,
} from "./ProfessorShared";

export default function ProfessorFeaturesDashboard({ featureImp }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Feature Importance</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Top predictors from the Random Forest classifier — what matters most for passing the EE board exam.</p>
      </div>
      <DashboardGuide
        items={[
          { label: "What the data is", text: "Feature-importance scores from the trained Random Forest classifier." },
          { label: "How to read", text: "Higher importance means stronger influence on the model's pass/fail prediction." },
          { label: "Use in analysis", text: "Prioritize top-ranked features for explanations, advisories, and targeted interventions." },
        ]}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ChartContainer title="Top 10 Predictors (Ranked)" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail" fullWidth={false} accent={c.blue}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {featureImp.map((f, i) => {
              const maxV = featureImp[0]?.value ?? 1;
              const color = i === 0 ? c.blue : i === 1 ? c.indigo : i === 2 ? c.teal : i < 4 ? c.amber : "#475569";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: "0 0 210px", fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{f.label}</span>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(f.value / maxV) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ width: 54, fontSize: 11, fontWeight: 700, color, textAlign: "right", flexShrink: 0 }}>{f.value.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </ChartContainer>

        <ChartContainer title="Feature Importance — Bar Chart" icon="📊" subtitle="Visual comparison of top predictors" accent={c.indigo}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={featureImp.slice(0, 8).map((f) => ({ name: f.label.length > 18 ? `${f.label.slice(0, 18)}…` : f.label, value: f.value }))} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<CustomTooltip formatter={(v) => v.toFixed(4)} />} />
              <Bar dataKey="value" name="Importance" radius={[0, 6, 6, 0]}>
                {featureImp.slice(0, 8).map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
        {[
          { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS scores are the #1–3 predictors, accounting for ~39% of total importance." },
          { icon: "📚", title: "GWA is #4", desc: "Academic performance (GWA) is the strongest non-exam predictor, confirming its role in the model." },
          { icon: "🧠", title: "Survey Factors Matter", desc: "Problem-solving confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
        ].map((x, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 16 }}>{x.icon}</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{x.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>{x.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
