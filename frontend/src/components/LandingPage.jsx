import { useState, useEffect } from "react";

// Images are in /public folder — reference them as absolute paths (no import needed)
const slsuLogo  = "/slsulogo.png";
const slsuLogo1 = "/slsulogo1.png";
const slsuLogo2 = "/slsulogo2.png";

const FEATURES = [
  { icon: "🎯", title: "AI Prediction",         desc: "Random Forest model trained on real SLSU EE data computes your predicted Pass/Fail probability and estimates outcomes using your survey responses." },
  { icon: "📊", title: "PRC Rating Estimate",    desc: "Get your predicted PRC rating before you even take the exam — two models for with/without subject scores." },
  { icon: "🔬", title: "Institutional Insights", desc: "Professors access aggregated analytics revealing curriculum gaps, strand performance, and class-wide trends." },
  { icon: "🧠", title: "Personalized Advice",    desc: "Groq AI-powered recommendations targeting your exact weak points across all 10 survey sections." },
];

const STATS = [
  {
    value: "97%",
    label: "Model Accuracy (R²)",
    sub: "On PRC rating prediction (held-out evaluation)."
  },
  {
    value: "3",
    label: "Trained ML Models",
    sub: "1 Pass/Fail classifier + 2 PRC rating regressors."
  },
  {
    value: "70+",
    label: "Survey Dimensions",
    sub: "Across 10 domains (Likert items) feeding the model."
  },
  {
    value: "1964",
    label: "SLSU Est.",
    sub: "Southern Luzon State University history."
  },
];

const ABOUT_ITEMS = [
  {
    icon: "🤖",
    title: "Machine Learning at the Core",
    body: "Three Random Forest models — a classifier for Pass/Fail and two regressors for PRC rating — trained on real graduate data from SLSU's College of Engineering. The system achieves 97% classification accuracy and an R² of 0.97 on rating prediction.",
  },
  { 
    icon: "📋",
    title: "70+ Factor Survey",
    body: "Covers 10 domains: Knowledge, Problem Solving, Motivation, Mental Health, Support System, Curriculum, Faculty Quality, Departmental Review, Facilities, and Institutional Culture. Each response feeds directly into the prediction pipeline.",
  },
  {
    icon: "💡",
    title: "Groq-Powered Recommendations",
    body: "After prediction, Llama 3.3-70b generates personalized, section-specific action plans. It references your exact weak responses, affirms your strengths, and gives 3–5 concrete steps — all under 200 words for immediate readability.",
  },
  {
    icon: "🏫",
    title: "Curriculum Gap Analysis",
    body: "Faculty unlock a full institutional dashboard: pass rates by year, SHS strand, and review duration; top model feature importances; and the 10 survey items with the most student disagreement — directly surfacing institutional weaknesses.",
  },
];

export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060b14",
      fontFamily: "'Syne', system-ui, sans-serif",
      color: "#f1f5f9",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes pulse-glow { 0%,100%{opacity:0.45} 50%{opacity:1} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer    { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }

        .fade-up  { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        .glow-orb { animation: pulse-glow 4s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8 0%, #818cf8 40%, #38bdf8 80%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(56,189,248,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.035) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        .card-hover {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(56,189,248,0.32) !important;
          box-shadow: 0 14px 36px rgba(14,165,233,0.1);
        }

        .about-card {
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .about-card:hover {
          transform: translateY(-4px);
          border-color: rgba(56,189,248,0.25) !important;
          background: rgba(255,255,255,0.03) !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #0369a1);
          border: none; color: #fff;
          font-family: 'Syne', sans-serif; font-weight: 700;
          cursor: pointer; transition: all 0.22s ease;
          letter-spacing: 0.03em; position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1));
          opacity:0; transition: opacity 0.2s;
        }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(14,165,233,0.38); }

        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.13); color: #94a3b8;
          font-family: 'Syne', sans-serif; font-weight: 600;
          cursor: pointer; transition: all 0.22s ease;
        }
        .btn-outline:hover {
          border-color: rgba(255,255,255,0.3); color: #f1f5f9;
          background: rgba(255,255,255,0.04); transform: translateY(-2px);
        }

        .role-btn {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .logo-slot {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .logo-slot:hover {
          transform: scale(1.08) translateY(-2px);
        }
      `}</style>

      {/* Fixed grid bg */}
      <div className="grid-bg" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Ambient orbs */}
      <div className="glow-orb" style={{
        position: "fixed", top: "-15%", left: "-8%",
        width: "660px", height: "660px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.10), transparent 68%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div className="glow-orb" style={{
        position: "fixed", bottom: "-18%", right: "-8%",
        width: "560px", height: "560px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 68%)",
        pointerEvents: "none", zIndex: 0, animationDelay: "2s",
      }} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(6,11,20,0.97)" : "rgba(6,11,20,0.82)",
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"}`,
        padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "72px",
        transition: "background 0.35s, border-color 0.35s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          <div className="logo-slot" style={{
            width: "46px", height: "46px", flexShrink: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 0 10px rgba(14,165,233,0.2)",
          }}>
            <img src={slsuLogo} alt="SLSU Seal"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>

          <div className="logo-slot" style={{
            width: "44px", height: "44px", flexShrink: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 0 10px rgba(220,38,38,0.2)",
          }}>
            <img src={slsuLogo1} alt="College of Engineering"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>

          <div className="logo-slot" style={{
            width: "46px", height: "46px", flexShrink: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 0 10px rgba(251,191,36,0.2)",
          }}>
            <img src={slsuLogo2} alt="IIEE Student Chapter"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>

          <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.01em" }}>
              EE Licensure Predictor
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
              Southern Luzon State University · IIEE
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="btn-outline" onClick={() => onEnter("student")}
            style={{ padding: "11px 24px", borderRadius: "12px", fontSize: "13px" }}>
            Student Login
          </button>
          <button className="btn-primary" onClick={() => onEnter("professor")}
            style={{ padding: "11px 24px", borderRadius: "12px", fontSize: "13px" }}>
            Faculty Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "92px 36px 72px",
        maxWidth: "1120px", margin: "0 auto",
      }}>
        <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: "26px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(14,165,233,0.09)", border: "1px solid rgba(14,165,233,0.22)",
            borderRadius: "999px", padding: "6px 16px",
            fontSize: "11px", fontWeight: 700, color: "#38bdf8",
            textTransform: "uppercase", letterSpacing: "0.1em",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8", animation: "pulse-glow 2s infinite" }} />
            AI-Powered Research System
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "999px", padding: "6px 14px",
            fontSize: "11px", fontWeight: 600, color: "#a78bfa",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            College of Engineering · IIEE
          </span>
        </div>

        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
          <h1 style={{
            fontSize: "clamp(38px, 6.5vw, 78px)",
            fontWeight: 800, lineHeight: 1.03,
            letterSpacing: "-0.035em", margin: "0 0 22px",
          }}>
            Predict Your
            <br />
            <span className="shimmer-text">EE Board Exam</span>
            <br />
            Outcome with AI
          </h1>
          <p style={{
            fontSize: "clamp(14px, 1.8vw, 18px)",
            color: "#64748b", maxWidth: "560px",
            lineHeight: 1.75, margin: "0 0 44px",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          }}>
            An AI-powered prediction system for Electrical Engineering licensure
            examinees at SLSU. Assess your readiness, receive personalized feedback,
            and help faculty identify institutional gaps — all in one platform.
          </p>
        </div>

        <div className="fade-up" style={{ animationDelay: "0.27s", display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "72px" }}>
          <button className="btn-primary" onClick={() => onEnter("student")}
            style={{ padding: "15px 38px", borderRadius: "14px", fontSize: "15px" }}>
            Take the Survey →
          </button>
          <button className="btn-outline" onClick={() => onEnter("professor")}
            style={{ padding: "15px 32px", borderRadius: "14px", fontSize: "15px" }}>
            Faculty Dashboard
          </button>
        </div>

        <div className="fade-up" style={{
          animationDelay: "0.4s",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          gap: "1px", background: "rgba(255,255,255,0.055)",
          borderRadius: "18px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.055)",
          marginBottom: "88px",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: "#060b14", padding: "24px 16px", textAlign: "center" }}>
              <p style={{
                margin: "0 0 7px",
                fontSize: "clamp(26px, 3.4vw, 36px)",
                fontWeight: 900,
                color: "#38bdf8",
                letterSpacing: "-0.02em",
                lineHeight: 1.0
              }}>
                {s.value}
              </p>
              <p style={{
                margin: 0,
                fontSize: "12px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
              }}>
                {s.label}
              </p>
              {s.sub && (
                <p style={{
                  margin: "10px 0 0",
                  fontSize: "12px",
                  color: "#64748b",
                  lineHeight: 1.55,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.58s",
            margin: "0 auto 88px",
            maxWidth: "1120px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "18px 18px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: 900,
              color: "#f1f5f9",
              fontFamily: "'Syne', system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            System Snapshot
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#94a3b8",
              lineHeight: 1.7,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            The system computes a predicted <strong>Pass/Fail probability</strong> and estimates your PRC rating using your survey responses and academic indicators. The panel values provide a research-style summary of model performance and the size of the survey signal used by the predictor.
          </p>
        </div>

        <div className="fade-up" style={{ animationDelay: "0.52s" }}>
          <p style={{ margin: "0 0 22px", fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "'DM Sans', sans-serif" }}>
            Platform Capabilities
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover" style={{
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px", padding: "24px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: "rgba(14,165,233,0.09)", border: "1px solid rgba(14,165,233,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", marginBottom: "16px",
                }}>{f.icon}</div>
                <p style={{ margin: "0 0 7px", fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>{f.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "88px 36px",
        background: "rgba(255,255,255,0.008)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "120px", height: "2px",
          background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
        }} />

        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
              About the System
            </p>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              What is the EE Licensure Predictor?
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "640px", fontSize: "clamp(13px, 1.5vw, 16px)", color: "#64748b", lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              A research-grade, data-driven platform designed by and for the SLSU College of Engineering.
              It combines machine learning, survey science, and generative AI to give every EE examinee a
              clear, personalized picture of their board exam readiness — before exam day.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "56px" }}>
            {ABOUT_ITEMS.map((item, i) => (
              <div key={i} className="about-card" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px", padding: "28px 24px",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", marginBottom: "18px",
                }}>{item.icon}</div>
                <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: "24px", padding: "40px 36px" }}>
            <p style={{ margin: "0 0 28px", fontSize: "13px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'DM Sans', sans-serif" }}>
              How it works — Student Flow
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
              {[
                { step: "01", title: "Log In",          desc: "Access the student portal using your SLSU credentials."           },
                { step: "02", title: "Complete Survey",  desc: "Answer 70+ questions across 10 domains — takes about 10 minutes." },
                { step: "03", title: "Get Prediction",   desc: "Receive your Pass/Fail result and predicted PRC rating instantly." },
                { step: "04", title: "Review Insights",  desc: "Expand each section to see your score breakdown and AI advice."    },
                { step: "05", title: "Take Action",      desc: "Follow personalized action steps and re-take as you improve."     },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)",
                    fontSize: "11px", fontWeight: 800, color: "#38bdf8",
                    fontFamily: "'Syne', sans-serif", marginBottom: "12px",
                  }}>{s.step}</div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#475569", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "16px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "16px", padding: "22px 28px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>🔬</span>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 800, color: "#a78bfa", fontFamily: "'Syne', sans-serif" }}>
                For Faculty — Institutional Insights Dashboard
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                Faculty choose the <strong style={{ color: "#94a3b8" }}>Faculty</strong> role on this landing
                page (no separate registration yet) to access the Insights Dashboard. Four tabs provide
                <strong style={{ color: "#94a3b8" }}> Overview KPIs</strong> (pass rates, GWA comparison),
                <strong style={{ color: "#94a3b8" }}> Performance Breakdown</strong> (by SHS strand and survey section),
                <strong style={{ color: "#94a3b8" }}> Feature Importance</strong> (top 10 ML predictors), and
                <strong style={{ color: "#94a3b8" }}> Curriculum Gap Analysis</strong> (10 weakest survey items with severity flags).
                All data is pulled live from the backend — no manual export needed.
              </p>
            </div>
          </div>

          {/* Usage guidelines + disclaimer */}
          <div style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 3fr)",
            gap: "18px",
          }}>
            {/* For Students */}
            <div style={{ background: "rgba(15,23,42,0.9)", borderRadius: "18px", padding: "22px 22px", border: "1px solid rgba(148,163,184,0.22)" }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                For Students — How to Use
              </p>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", color: "#94a3b8", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <li>On this page, choose <strong>“I&apos;m a Student”</strong> or use the <strong>Student Login</strong> button.</li>
                <li>Fill in your <strong>mock or actual subject scores</strong>, GWA, and complete the 10-section survey as honestly as possible.</li>
                <li>Submit to generate your <strong>Pass / Fail prediction</strong> and <strong>predicted PRC rating</strong>.</li>
                <li>Read the section scores and <strong>AI recommendations</strong> to identify specific habits and factors you can still improve.</li>
                <li>You may <strong>repeat the process</strong> any time to track your progress as your preparation changes.</li>
              </ol>
            </div>

            {/* For Faculty */}
            <div style={{ background: "rgba(15,23,42,0.9)", borderRadius: "18px", padding: "22px 22px", border: "1px solid rgba(167,139,250,0.28)" }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                For Faculty — How to Use
              </p>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", color: "#cbd5f5", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                <li>From this page, select <strong>“I&apos;m Faculty”</strong> or the <strong>Faculty Login</strong> button to open the professor view.</li>
                <li>Review the <strong>Overview</strong> cards (overall pass rate, average GWA/rating) and compare cohorts.</li>
                <li>Use the filters and graphs to inspect <strong>strand performance</strong>, <strong>survey section scores</strong>, and <strong>feature importance</strong>.</li>
                <li>Use the weakest-question list to identify <strong>curriculum or support areas</strong> that may require interventions.</li>
                <li>Combine these insights with traditional measures (grades, board performance) before making academic decisions.</li>
              </ol>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: "20px",
            background: "rgba(248,250,252,0.03)",
            borderRadius: "18px",
            padding: "18px 20px",
            border: "1px solid rgba(248,113,113,0.4)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}>
            <span style={{ fontSize: "18px", marginTop: "2px" }}>⚠️</span>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 800, color: "#f97373", fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Important Disclaimer
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#e2e8f0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                This system is a <strong>research tool</strong> that provides estimates based on historical SLSU data
                and your self-reported answers. The quality of the prediction depends entirely on the
                <strong> accuracy and honesty</strong> of the information you provide. <strong>Random, guessed, or intentionally
                inaccurate responses can produce unreliable results</strong> that do not reflect your true readiness
                for the Electrical Engineering Licensure Examination. Always consult your professors and official
                university guidance when making final decisions about your board exam preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE SELECTOR */}
      <section style={{
        position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.012)",
        borderTop: "1px solid rgba(255,255,255,0.055)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        padding: "84px 36px",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>

          {/* 3 logos row — now using the variables */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
            {[
              { src: slsuLogo,  alt: "SLSU Seal",             size: 64, glow: "rgba(14,165,233,0.2)"  },
              { src: slsuLogo1, alt: "College of Engineering", size: 58, glow: "rgba(220,38,38,0.2)"   },
              { src: slsuLogo2, alt: "IIEE Student Chapter",   size: 64, glow: "rgba(251,191,36,0.2)"  },
            ].map((l, i) => (
              <div key={i} className="logo-slot" style={{
                width: `${l.size}px`, height: `${l.size}px`, flexShrink: 0,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                boxShadow: `0 0 14px ${l.glow}`,
              }}>
                <img src={l.src} alt={l.alt}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </div>

          <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "'DM Sans', sans-serif" }}>
            Get Started
          </p>
          <h2 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Choose your role
          </h2>
          <p style={{ margin: "0 0 44px", fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
            Students take the board exam readiness survey and receive an AI prediction.<br />
            Faculty access the institutional insights dashboard with class-wide analytics.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "540px", margin: "0 auto" }}>
            {[
              { role: "student",   icon: "🎓", title: "I'm a Student", desc: "Take the AI-powered survey and get your board exam prediction.",    color: "#0ea5e9", glow: "rgba(14,165,233,0.1)"  },
              { role: "professor", icon: "🔬", title: "I'm Faculty",    desc: "Access institutional analytics, gap analysis, and model insights.", color: "#8b5cf6", glow: "rgba(139,92,246,0.1)" },
            ].map((r) => (
              <button key={r.role} className="role-btn" onClick={() => onEnter(r.role)}
                style={{
                  background: r.glow, border: `1px solid ${r.color}28`,
                  borderRadius: "20px", padding: "34px 22px",
                  cursor: "pointer", textAlign: "center",
                  fontFamily: "'Syne', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = r.color + "60";
                  e.currentTarget.style.boxShadow = `0 18px 44px ${r.color}1a`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.borderColor = r.color + "28";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "14px" }}>{r.icon}</div>
                <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#f1f5f9" }}>{r.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — now using the variables */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: "32px 24px", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {[slsuLogo, slsuLogo1, slsuLogo2].map((src, i) => (
            <div key={i} style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.3 }} />
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
          Southern Luzon State University · College of Engineering · IIEE · EE Licensure Predictor · For Research Use Only
        </p>
      </footer>
    </div>
  );
}