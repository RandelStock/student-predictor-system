import { useState } from "react";
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
  CustomTooltip,
  ChartContainer,
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
  teal:       "#2DD4BF",
  indigo:     "#818CF8",
  orange:     "#FB923C",
};

export default function ProfessorFeaturesDashboard({ featureImp }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="iiee-combined fade-in">
      <style>{`
        .iiee-combined * { box-sizing: border-box; }
        .iiee-combined {
          font-family: 'Inter', sans-serif;
          background: ${IIEE.navy};
          color: ${IIEE.white};
          min-height: 100vh;
          padding: clamp(12px, 3vw, 24px);
        }
        .iiee-combined .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .comb-hero {
          background: linear-gradient(135deg, ${IIEE.navyMid} 0%, #1a1060 55%, rgba(245,197,24,0.06) 100%);
          border: 1px solid ${IIEE.goldBorder};
          border-radius: 16px;
          padding: clamp(16px, 3vw, 24px);
          margin-bottom: clamp(16px, 3vw, 24px);
          position: relative;
          overflow: hidden;
        }
        .comb-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, ${IIEE.goldGlow} 50%, transparent 70%);
          pointer-events: none;
        }
        .comb-hero-title {
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
          margin: 0 0 8px;
          color: ${IIEE.white};
          position: relative;
          z-index: 1;
        }
        .comb-hero-sub {
          font-size: clamp(12px, 1.5vw, 14px);
          color: #cbd5e1;
          margin: 0;
          position: relative;
          z-index: 1;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }
        .comb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(280px, 40vw, 400px), 1fr));
          gap: clamp(14px, 3vw, 20px);
          margin-bottom: clamp(14px, 3vw, 20px);
        }
        .chart-hover {
          transition: all 0.2s ease;
        }
        .chart-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        @media (max-width: 768px) {
          .comb-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="comb-hero">
        <h2 className="comb-hero-title">Feature Importance</h2>
        <p className="comb-hero-sub">Top predictors from the Random Forest classifier — what matters most for passing the EE board exam.</p>
      </div>
      <div className="comb-grid">
        <ChartContainer title="Top 10 Predictors (Ranked)" icon="🤖" subtitle="Gini importance — higher = more influence on Pass/Fail" fullWidth={false} accent={IIEE.blue}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {featureImp.map((f, i) => {
              const maxV = featureImp[0]?.value ?? 1;
              const color = i === 0 ? IIEE.blue : i === 1 ? IIEE.indigo : i === 2 ? IIEE.teal : i < 4 ? IIEE.amber : IIEE.muted;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: "0 0 210px", fontSize: "clamp(10px, 1.5vw, 12px)", color: "#cbd5e1", lineHeight: 1.3, fontFamily: "'Inter',sans-serif" }}>{f.label}</span>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(f.value / maxV) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ width: 54, fontSize: "clamp(10px, 1.5vw, 12px)", fontWeight: 700, color, textAlign: "right", flexShrink: 0, fontFamily: "'Montserrat',sans-serif" }}>{f.value.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 10, fontSize: "clamp(11px, 1.5vw, 13px)", color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>
            Ranked list shows the most influential factors in the model's pass/fail predictions, with progress bars indicating relative importance.
          </p>
        </ChartContainer>

        <ChartContainer title="Feature Importance — Bar Chart" icon="📊" subtitle="Visual comparison of top predictors" accent={IIEE.indigo}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={featureImp.slice(0, 8).map((f) => ({ name: f.label.length > 18 ? `${f.label.slice(0, 18)}…` : f.label, value: f.value }))} 
              layout="vertical" 
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              onMouseMove={(e) => {
                if (e.activeLabel) {
                  setHoveredBar(e.activeLabel);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: IIEE.dimText, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: IIEE.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<CustomTooltip formatter={(v) => v.toFixed(4)} />} />
              <Bar dataKey="value" name="Importance" radius={[0, 6, 6, 0]}>
                {featureImp.slice(0, 8).map((_, index) => (
                  <Cell 
                    key={index} 
                    fill={index === 0 ? IIEE.blue : index === 1 ? IIEE.indigo : index === 2 ? IIEE.teal : index === 3 ? IIEE.amber : IIEE.muted}
                    opacity={hoveredBar === null || hoveredBar === _.name ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ marginTop: 8, fontSize: 12, color: IIEE.dimText }}>
            Horizontal bar chart provides visual comparison of the top 8 predictors, making it easier to see relative importance differences.
          </p>
        </ChartContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
        {[
          { icon: "📝", title: "Subject Scores Dominate", desc: "EE, MATH, ESAS scores are the #1–3 predictors, accounting for ~39% of total importance." },
          { icon: "📚", title: "GWA is #4", desc: "Academic performance (GWA) is the strongest non-exam predictor, confirming its role in the model." },
          { icon: "🧠", title: "Survey Factors Matter", desc: "Problem-solving confidence (PS11) and study schedule adherence (MT4) are top survey predictors." },
        ].map((x, i) => (
          <div key={i} style={{ background: IIEE.cardBg, border: `1px solid ${IIEE.cardBorder}`, borderRadius: 14, padding: 16, transition: "all 0.2s ease" }} className="chart-hover">
            <p style={{ margin: "0 0 6px", fontSize: 16 }}>{x.icon}</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: IIEE.white, fontFamily: "'Montserrat',sans-serif" }}>{x.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: IIEE.muted, lineHeight: 1.55, fontFamily: "'Inter',sans-serif" }}>{x.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
