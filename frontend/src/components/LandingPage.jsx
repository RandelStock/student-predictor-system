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
  { value: "97%",  label: "Model Accuracy (R²)", sub: "On PRC rating prediction (held-out evaluation)." },
  { value: "3",    label: "Trained ML Models",    sub: "1 Pass/Fail classifier + 2 PRC rating regressors." },
  { value: "70+",  label: "Survey Dimensions",    sub: "Across 10 domains (Likert items) feeding the model." },
  { value: "1964", label: "SLSU Est.",             sub: "Southern Luzon State University history." },
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

// ── colour tokens ─────────────────────────────────────────────────────────────
const T = {
  navy:       "#07102B",
  navyMid:    "#0D1B3E",
  navyCard:   "#112250",
  gold:       "#F5C518",
  goldGlow:   "rgba(245,197,24,0.10)",
  goldBorder: "rgba(245,197,24,0.18)",
  white100:   "#FFFFFF",
  white:      "#F1F5F9",
  muted:      "#94A3B8",
  dim:        "#64748B",
  border:     "rgba(245,197,24,0.14)",
  borderSub:  "rgba(255,255,255,0.07)",
  fail:       "#F87171",
  pass:       "#4ADE80",
};

// ── small helpers ─────────────────────────────────────────────────────────────
const logoCircleStyle = (size, glow) => ({
  width: size, height: size, borderRadius: "50%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", flexShrink: 0,
  boxShadow: `0 0 12px ${glow}`,
  transition: "transform 0.25s",
});

const iconBoxStyle = (size = 44, radius = 12) => ({
  width: size, height: size, borderRadius: radius,
  background: T.goldGlow, border: `1px solid ${T.border}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
});

const cardStyle = {
  background: T.navyCard,
  border: `1px solid ${T.border}`,
  borderRadius: "18px",
  transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
};

const accentBarStyle = {
  width: "100%", height: "2px", position: "relative", zIndex: 1,
  background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,.20) 20%,rgba(245,197,24,.65) 50%,rgba(255,255,255,.20) 80%,transparent 100%)",
};

const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${T.borderSub}`,
  borderRadius: "10px",
  padding: "11px 14px",
  color: T.white100,
  fontSize: "13px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
};

// ── Contact form state hook ───────────────────────────────────────────────────
function useContactForm() {
  const empty = { fname: "", lname: "", email: "", role: "", subject: "", message: "" };
  const [fields, setFields]       = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const update = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const submit = () => {
    const { fname, lname, email, role, subject, message } = fields;
    if (!fname || !lname || !email || !role || !subject || !message) {
      setError("Please fill in all fields before sending.");
      return;
    }
    setError("");
    setSubmitted(true);
    setFields(empty);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return { fields, update, submit, submitted, error };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  const form = useContactForm();
  const CHAR_MAX = 500;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.navy,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: T.white,
      overflowX: "hidden",
    }}>

      {/* ── GLOBAL CSS ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes pulseGold   { 0%,100%{opacity:.50} 50%{opacity:1} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes goldShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }

        .lp-fade-up { animation: fadeUp .7s ease forwards; opacity:0; }
        .lp-d1{animation-delay:.05s} .lp-d2{animation-delay:.15s}
        .lp-d3{animation-delay:.27s} .lp-d4{animation-delay:.40s}
        .lp-d5{animation-delay:.52s}

        .lp-shimmer {
          background: linear-gradient(90deg,#F5C518 0%,#fff 40%,#F5C518 80%);
          background-size: 200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: goldShimmer 3.5s linear infinite;
        }

        /* Fixed background decorations */
        .lp-grid-bg {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(245,197,24,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(245,197,24,.03) 1px,transparent 1px);
          background-size:52px 52px;
        }
        .lp-orb1 {
          position:fixed; top:-15%; left:-8%;
          width:660px; height:660px; border-radius:50%;
          background:radial-gradient(circle,rgba(245,197,24,.07),transparent 68%);
          pointer-events:none; z-index:0;
          animation:pulseGold 5s ease-in-out infinite;
        }
        .lp-orb2 {
          position:fixed; bottom:-18%; right:-8%;
          width:560px; height:560px; border-radius:50%;
          background:radial-gradient(circle,rgba(56,189,248,.05),transparent 68%);
          pointer-events:none; z-index:0;
          animation:pulseGold 5s ease-in-out infinite 2.5s;
        }

        /* Logo hover */
        .lp-logo { transition:transform .25s; }
        .lp-logo:hover { transform:scale(1.08) translateY(-2px); }

        /* Pulse dot */
        .lp-dot {
          width:6px; height:6px; border-radius:50%;
          background:#F5C518; flex-shrink:0;
          animation:pulseGold 2s infinite;
        }

        /* ── Buttons ── */
        .lp-btn-gold {
          background:#F5C518; border:none; color:#07102B;
          font-family:'Syne',sans-serif; font-weight:800;
          cursor:pointer; transition:all .22s; border-radius:12px;
        }
        .lp-btn-gold:hover {
          background:#fff; color:#07102B;
          transform:translateY(-2px);
          box-shadow:0 10px 32px rgba(245,197,24,.45);
        }
        .lp-btn-outline {
          background:transparent;
          border:1px solid rgba(245,197,24,.18);
          color:#94A3B8;
          font-family:'Syne',sans-serif; font-weight:600;
          cursor:pointer; transition:all .22s; border-radius:12px;
        }
        .lp-btn-outline:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
          transform:translateY(-2px);
        }
        .lp-btn-gold-nav {
          background:#F5C518; border:1px solid #F5C518;
          color:#07102B; font-family:'Syne',sans-serif;
          font-weight:800; cursor:pointer; transition:all .2s; border-radius:10px;
        }
        .lp-btn-gold-nav:hover {
          background:#fff; border-color:#fff;
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(245,197,24,.38);
        }
        .lp-btn-outline-nav {
          background:transparent;
          border:1px solid rgba(245,197,24,.18);
          color:#94A3B8; font-family:'Syne',sans-serif;
          font-weight:600; cursor:pointer; transition:all .2s; border-radius:10px;
        }
        .lp-btn-outline-nav:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
        }
        .lp-btn-submit {
          background:#F5C518; border:none; color:#07102B;
          font-family:'Syne',sans-serif; font-weight:800;
          cursor:pointer; transition:all .22s; border-radius:11px;
          white-space:nowrap; flex-shrink:0;
        }
        .lp-btn-submit:hover {
          background:#fff;
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(245,197,24,.42);
        }

        /* ── Card hovers ── */
        .lp-feature-card:hover {
          transform:translateY(-5px) !important;
          border-color:rgba(245,197,24,.42) !important;
          box-shadow:0 14px 36px rgba(245,197,24,.12) !important;
        }
        .lp-about-card:hover {
          transform:translateY(-4px) !important;
          border-color:rgba(245,197,24,.32) !important;
        }
        .lp-contact-detail:hover {
          transform:translateX(4px) !important;
          border-color:rgba(245,197,24,.38) !important;
        }
        .lp-cic-card:hover {
          transform:translateY(-3px) !important;
          border-color:rgba(245,197,24,.35) !important;
        }

        /* ── Role buttons ── */
        .lp-role-student {
          background:rgba(245,197,24,.09);
          border:1px solid rgba(245,197,24,.18);
          border-radius:20px; cursor:pointer; text-align:center;
          font-family:'Syne',sans-serif;
          transition:transform .25s,box-shadow .25s,border-color .25s,background .25s;
        }
        .lp-role-student:hover {
          transform:translateY(-5px);
          border-color:#F5C518;
          box-shadow:0 18px 44px rgba(245,197,24,.22);
          background:rgba(245,197,24,.14);
        }
        .lp-role-faculty {
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.08);
          border-radius:20px; cursor:pointer; text-align:center;
          font-family:'Syne',sans-serif;
          transition:transform .25s,box-shadow .25s,border-color .25s,background .25s;
        }
        .lp-role-faculty:hover {
          transform:translateY(-5px);
          border-color:rgba(255,255,255,.24);
          box-shadow:0 18px 44px rgba(255,255,255,.06);
          background:rgba(255,255,255,.05);
        }

        /* ── Social links ── */
        .lp-social-btn {
          display:flex; align-items:center; gap:7px;
          padding:9px 14px; border-radius:10px;
          background:#112250;
          border:1px solid rgba(245,197,24,.18);
          color:#94A3B8; font-size:12px; font-weight:600;
          cursor:pointer; transition:all .2s;
          text-decoration:none; white-space:nowrap;
          font-family:'DM Sans',sans-serif;
        }
        .lp-social-btn:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
        }

        /* ── Form inputs ── */
        .lp-input:focus, .lp-select:focus, .lp-textarea:focus {
          border-color:#F5C518 !important;
          background:rgba(245,197,24,.04) !important;
          outline:none;
        }
        .lp-select {
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat:no-repeat;
          background-position:right 12px center;
          padding-right:32px !important;
          cursor:pointer;
        }
        .lp-select option { background:#0D1B3E; color:#F1F5F9; }
        .lp-textarea     { resize:vertical; min-height:110px; line-height:1.6; }

        /* ── RESPONSIVE GRIDS ── */
        .lp-stats-grid    { display:grid; grid-template-columns:repeat(4,1fr); }
        .lp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
        .lp-about-grid    { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:16px; }
        .lp-steps-grid    { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:24px; }
        .lp-usage-grid    { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .lp-roles-grid    { display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:540px; margin:0 auto; }
        .lp-contact-top   { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-bottom:48px; align-items:start; }
        .lp-contact-btm   { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .lp-form-row      { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }

        /* ── BREAKPOINTS ── */
        @media(max-width:900px){
          .lp-stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .lp-contact-top { grid-template-columns:1fr !important; gap:24px !important; }
          .lp-contact-btm { grid-template-columns:1fr 1fr !important; }
          .lp-brand-sub   { display:none !important; }
        }
        @media(max-width:680px){
          .lp-usage-grid  { grid-template-columns:1fr !important; }
          .lp-roles-grid  { grid-template-columns:1fr !important; }
          .lp-contact-btm { grid-template-columns:1fr !important; }
          .lp-steps-grid  { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media(max-width:540px){
          .lp-form-row      { grid-template-columns:1fr !important; }
          .lp-logo-mid      { display:none !important; }
          .lp-steps-grid    { grid-template-columns:1fr !important; }
          .lp-form-footer   { flex-direction:column !important; align-items:stretch !important; }
          .lp-btn-submit    { text-align:center; }
        }
        @media(max-width:420px){
          .lp-badge-iiee  { display:none !important; }
          .lp-logo-right  { display:none !important; }
          .lp-stat-sub    { display:none !important; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar            { width:5px; height:5px; }
        ::-webkit-scrollbar-track      { background:rgba(255,255,255,.02); }
        ::-webkit-scrollbar-thumb      { background:rgba(245,197,24,.2); border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover{ background:rgba(245,197,24,.4); }
      `}</style>

      {/* ── Fixed bg decorations ── */}
      <div className="lp-grid-bg" />
      <div className="lp-orb1" />
      <div className="lp-orb2" />

      {/* ════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "rgba(7,16,43,0.98)" : "rgba(7,16,43,0.88)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? T.goldBorder : "rgba(245,197,24,0.10)"}`,
        padding: "0 clamp(16px,4vw,28px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "clamp(58px,8vw,72px)",
        transition: "background .35s, border-color .35s",
        gap: "12px",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {/* Logo 1 — always visible */}
          <div className="lp-logo" style={logoCircleStyle("clamp(36px,4vw,46px)", "rgba(245,197,24,0.22)")}>
            <img src={slsuLogo} alt="SLSU" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>
          {/* Logo 2 — hidden on ≤540px */}
          <div className="lp-logo lp-logo-mid" style={logoCircleStyle("clamp(34px,4vw,44px)", "rgba(220,38,38,0.20)")}>
            <img src={slsuLogo1} alt="COE" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>
          {/* Logo 3 — hidden on ≤420px */}
          <div className="lp-logo lp-logo-right" style={logoCircleStyle("clamp(36px,4vw,46px)", "rgba(245,197,24,0.22)")}>
            <img src={slsuLogo2} alt="IIEE" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>

          <div style={{ width: "1px", height: "32px", background: T.border, flexShrink: 0 }} />

          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "clamp(11px,1.8vw,15px)", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              EE Licensure Predictor
            </p>
            <p className="lp-brand-sub" style={{ margin: 0, fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              Southern Luzon State University · IIEE
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button className="lp-btn-outline-nav" onClick={() => onEnter("student")}
            style={{ padding: "clamp(8px,1.5vw,11px) clamp(10px,2vw,22px)", fontSize: "clamp(10px,1.4vw,13px)" }}>
            Student Login
          </button>
          <button className="lp-btn-gold-nav" onClick={() => onEnter("professor")}
            style={{ padding: "clamp(8px,1.5vw,11px) clamp(10px,2vw,22px)", fontSize: "clamp(10px,1.4vw,13px)" }}>
            Faculty Login
          </button>
        </div>
      </nav>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "clamp(48px,8vw,92px) clamp(16px,5vw,36px) clamp(40px,6vw,72px)",
        maxWidth: "1120px", margin: "0 auto",
      }}>
        {/* Badges */}
        <div className="lp-fade-up lp-d1" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "26px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: T.goldGlow, border: `1px solid ${T.goldBorder}`,
            borderRadius: "999px", padding: "6px 16px",
            fontSize: "11px", fontWeight: 700, color: T.gold,
            textTransform: "uppercase", letterSpacing: "0.10em",
          }}>
            <span className="lp-dot" />
            AI-Powered Research System
          </span>
          <span className="lp-badge-iiee" style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSub}`,
            borderRadius: "999px", padding: "6px 14px",
            fontSize: "11px", fontWeight: 600, color: T.muted,
          }}>
            College of Engineering · IIEE
          </span>
        </div>

        {/* Headline */}
        <div className="lp-fade-up lp-d2">
          <h1 style={{
            fontSize: "clamp(32px,6.5vw,78px)",
            fontWeight: 800, lineHeight: 1.03,
            letterSpacing: "-0.035em", margin: "0 0 22px",
            fontFamily: "'Syne',sans-serif", color: T.white100,
          }}>
            Predict Your
            <br />
            <span className="lp-shimmer">EE Board Exam</span>
            <br />
            Outcome with AI
          </h1>
          <p style={{
            fontSize: "clamp(13px,1.8vw,18px)",
            color: T.dim, maxWidth: "560px",
            lineHeight: 1.75, margin: "0 0 44px", fontWeight: 300,
          }}>
            An AI-powered prediction system for Electrical Engineering licensure
            examinees at SLSU. Assess your readiness, receive personalized feedback,
            and help faculty identify institutional gaps — all in one platform.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="lp-fade-up lp-d3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "72px" }}>
          <button className="lp-btn-gold" onClick={() => onEnter("student")}
            style={{ padding: "clamp(11px,2vw,15px) clamp(20px,4vw,38px)", fontSize: "clamp(13px,1.8vw,15px)" }}>
            Take the Survey →
          </button>
          <button className="lp-btn-outline" onClick={() => onEnter("professor")}
            style={{ padding: "clamp(11px,2vw,15px) clamp(16px,3vw,32px)", fontSize: "clamp(13px,1.8vw,15px)" }}>
            Faculty Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="lp-fade-up lp-d4 lp-stats-grid" style={{
          gap: "1px", background: T.border,
          borderRadius: "18px", overflow: "hidden",
          border: `1px solid ${T.border}`,
          marginBottom: "72px",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: T.navyMid, padding: "clamp(14px,3vw,24px) 12px", textAlign: "center" }}>
              <p style={{ margin: "0 0 7px", fontSize: "clamp(20px,3.4vw,36px)", fontWeight: 900, color: T.gold, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>
                {s.value}
              </p>
              <p style={{ margin: 0, fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>
                {s.label}
              </p>
              <p className="lp-stat-sub" style={{ margin: "8px 0 0", fontSize: "11px", color: T.dim, lineHeight: 1.55 }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* System Snapshot */}
        <div className="lp-fade-up lp-d4" style={{
          background: "rgba(245,197,24,0.03)",
          border: `1px solid ${T.border}`,
          borderRadius: "20px", padding: "18px 20px",
          marginBottom: "80px",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 900, color: T.white100, fontFamily: "'Syne',sans-serif" }}>
            System Snapshot
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: T.muted, lineHeight: 1.7 }}>
            The system computes a predicted <strong style={{ color: T.white100 }}>Pass/Fail probability</strong> and estimates your PRC rating using your survey responses and academic indicators. The panel values provide a research-style summary of model performance and the size of the survey signal used by the predictor.
          </p>
        </div>

        {/* Features */}
        <div className="lp-fade-up lp-d5">
          <p style={{ margin: "0 0 22px", fontSize: "10px", color: T.gold, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}>
            Platform Capabilities
          </p>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card" style={{ ...cardStyle, padding: "clamp(16px,3vw,24px)" }}>
                <div style={{ ...iconBoxStyle(44, 12), marginBottom: "16px", fontSize: "20px" }}>{f.icon}</div>
                <p style={{ margin: "0 0 7px", fontSize: "14px", fontWeight: 700, color: T.white100, fontFamily: "'Syne',sans-serif" }}>{f.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: T.dim, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          ABOUT SECTION
      ════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "clamp(48px,8vw,88px) clamp(16px,5vw,36px)",
        background: T.navyMid,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "120px", height: "2px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />

        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", color: T.gold, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700 }}>
              About the System
            </p>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(22px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, fontFamily: "'Syne',sans-serif", color: T.white100 }}>
              What is the EE Licensure Predictor?
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "640px", fontSize: "clamp(13px,1.5vw,16px)", color: T.dim, lineHeight: 1.8, fontWeight: 300 }}>
              A research-grade, data-driven platform designed by and for the SLSU College of Engineering.
              It combines machine learning, survey science, and generative AI to give every EE examinee a
              clear, personalized picture of their board exam readiness — before exam day.
            </p>
          </div>

          {/* About cards */}
          <div className="lp-about-grid" style={{ marginBottom: "56px" }}>
            {ABOUT_ITEMS.map((item, i) => (
              <div key={i} className="lp-about-card" style={{ ...cardStyle, padding: "clamp(18px,3vw,28px) clamp(14px,2.5vw,24px)" }}>
                <div style={{ ...iconBoxStyle(48, 14), marginBottom: "18px", fontSize: "22px" }}>{item.icon}</div>
                <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: T.dim, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background: T.goldGlow, border: `1px solid ${T.border}`, borderRadius: "24px", padding: "clamp(24px,4vw,40px) clamp(16px,4vw,36px)" }}>
            <p style={{ margin: "0 0 28px", fontSize: "13px", fontWeight: 800, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              How it works — Student Flow
            </p>
            <div className="lp-steps-grid">
              {[
                { step: "01", title: "Log In",          desc: "Access the student portal using your SLSU credentials." },
                { step: "02", title: "Complete Survey",  desc: "Answer 70+ questions across 10 domains — takes about 10 minutes." },
                { step: "03", title: "Get Prediction",   desc: "Receive your Pass/Fail result and predicted PRC rating instantly." },
                { step: "04", title: "Review Insights",  desc: "Expand each section to see your score breakdown and AI advice." },
                { step: "05", title: "Take Action",      desc: "Follow personalized action steps and re-take as you improve." },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(245,197,24,0.15)", border: `1px solid ${T.border}`,
                    fontSize: "11px", fontWeight: 800, color: T.gold,
                    fontFamily: "'Syne',sans-serif", marginBottom: "12px",
                  }}>{s.step}</div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: T.dim, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty callout */}
          <div style={{
            marginTop: "16px",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${T.borderSub}`,
            borderRadius: "16px", padding: "22px 28px",
            display: "flex", alignItems: "flex-start", gap: "14px",
          }}>
            <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>🔬</span>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>
                For Faculty — Institutional Insights Dashboard
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: T.dim, lineHeight: 1.7 }}>
                Faculty choose the <strong style={{ color: T.white }}>Faculty</strong> role on this landing page (no separate registration yet) to access the Insights Dashboard. Four tabs provide
                <strong style={{ color: T.white }}> Overview KPIs</strong> (pass rates, GWA comparison),
                <strong style={{ color: T.white }}> Performance Breakdown</strong> (by SHS strand and survey section),
                <strong style={{ color: T.white }}> Feature Importance</strong> (top 10 ML predictors), and
                <strong style={{ color: T.white }}> Curriculum Gap Analysis</strong> (10 weakest survey items with severity flags).
                All data is pulled live from the backend — no manual export needed.
              </p>
            </div>
          </div>

          {/* Usage guidelines */}
          <div className="lp-usage-grid" style={{ marginTop: "24px" }}>
            {/* Students */}
            <div style={{ background: T.navyCard, borderRadius: "18px", padding: "22px", border: `1px solid ${T.border}` }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", color: T.gold, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700 }}>
                For Students — How to Use
              </p>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", color: T.muted, lineHeight: 1.75 }}>
                <li>On this page, choose <strong style={{ color: T.white }}>"I'm a Student"</strong> or use the <strong style={{ color: T.white }}>Student Login</strong> button.</li>
                <li>Fill in your <strong style={{ color: T.white }}>mock or actual subject scores</strong>, GWA, and complete the 10-section survey as honestly as possible.</li>
                <li>Submit to generate your <strong style={{ color: T.white }}>Pass / Fail prediction</strong> and <strong style={{ color: T.white }}>predicted PRC rating</strong>.</li>
                <li>Read the section scores and <strong style={{ color: T.white }}>AI recommendations</strong> to identify specific habits and factors you can still improve.</li>
                <li>You may <strong style={{ color: T.white }}>repeat the process</strong> any time to track your progress as your preparation changes.</li>
              </ol>
            </div>
            {/* Faculty */}
            <div style={{ background: T.navyCard, borderRadius: "18px", padding: "22px", border: `1px solid ${T.borderSub}` }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700 }}>
                For Faculty — How to Use
              </p>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", color: "#cbd5e1", lineHeight: 1.75 }}>
                <li>From this page, select <strong style={{ color: T.white }}>"I'm Faculty"</strong> or the <strong style={{ color: T.white }}>Faculty Login</strong> button to open the professor view.</li>
                <li>Review the <strong style={{ color: T.white }}>Overview</strong> cards (overall pass rate, average GWA/rating) and compare cohorts.</li>
                <li>Use the filters and graphs to inspect <strong style={{ color: T.white }}>strand performance</strong>, <strong style={{ color: T.white }}>survey section scores</strong>, and <strong style={{ color: T.white }}>feature importance</strong>.</li>
                <li>Use the weakest-question list to identify <strong style={{ color: T.white }}>curriculum or support areas</strong> that may require interventions.</li>
                <li>Combine these insights with traditional measures (grades, board performance) before making academic decisions.</li>
              </ol>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: "20px",
            background: "rgba(248,113,113,0.04)",
            borderRadius: "18px", padding: "18px 20px",
            border: "1px solid rgba(248,113,113,0.32)",
            display: "flex", alignItems: "flex-start", gap: "12px",
          }}>
            <span style={{ fontSize: "18px", marginTop: "2px", flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 800, color: T.fail, fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Important Disclaimer
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#e2e8f0", lineHeight: 1.7 }}>
                This system is a <strong>research tool</strong> that provides estimates based on historical SLSU data
                and your self-reported answers. The quality of the prediction depends entirely on the
                <strong> accuracy and honesty</strong> of the information you provide.{" "}
                <strong>Random, guessed, or intentionally inaccurate responses can produce unreliable results</strong> that do not reflect your true readiness
                for the Electrical Engineering Licensure Examination. Always consult your professors and official
                university guidance when making final decisions about your board exam preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          ROLE SELECTOR
      ════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        background: T.navyMid,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        padding: "clamp(48px,8vw,84px) clamp(16px,5vw,36px)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>

          {/* Logos row */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
            <div className="lp-logo" style={{ ...logoCircleStyle("clamp(50px,6vw,64px)", "rgba(245,197,24,0.26)") }}>
              <img src={slsuLogo} alt="SLSU" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
            <div className="lp-logo lp-logo-mid" style={{ ...logoCircleStyle("clamp(46px,5.5vw,58px)", "rgba(220,38,38,0.22)") }}>
              <img src={slsuLogo1} alt="COE" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
            <div className="lp-logo" style={{ ...logoCircleStyle("clamp(50px,6vw,64px)", "rgba(245,197,24,0.26)") }}>
              <img src={slsuLogo2} alt="IIEE" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            </div>
          </div>

          <p style={{ margin: "0 0 10px", fontSize: "11px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Get Started
          </p>
          <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.025em", fontFamily: "'Syne',sans-serif", color: T.white100 }}>
            Choose your role
          </h2>
          <p style={{ margin: "0 0 44px", fontSize: "clamp(12px,1.5vw,14px)", color: T.muted, lineHeight: 1.7 }}>
            Students take the board exam readiness survey and receive an AI prediction.<br />
            Faculty access the institutional insights dashboard with class-wide analytics.
          </p>

          <div className="lp-roles-grid">
            <button className="lp-role-student" onClick={() => onEnter("student")}
              style={{ padding: "clamp(22px,4vw,34px) clamp(14px,3vw,22px)" }}>
              <div style={{ fontSize: "clamp(28px,4vw,36px)", marginBottom: "14px" }}>🎓</div>
              <p style={{ margin: "0 0 8px", fontSize: "clamp(13px,2vw,16px)", fontWeight: 800, color: T.white100 }}>I'm a Student</p>
              <p style={{ margin: 0, fontSize: "12px", color: T.dim, lineHeight: 1.55 }}>Take the AI-powered survey and get your board exam prediction.</p>
            </button>
            <button className="lp-role-faculty" onClick={() => onEnter("professor")}
              style={{ padding: "clamp(22px,4vw,34px) clamp(14px,3vw,22px)" }}>
              <div style={{ fontSize: "clamp(28px,4vw,36px)", marginBottom: "14px" }}>🔬</div>
              <p style={{ margin: "0 0 8px", fontSize: "clamp(13px,2vw,16px)", fontWeight: 800, color: T.white100 }}>I'm Faculty</p>
              <p style={{ margin: 0, fontSize: "12px", color: T.dim, lineHeight: 1.55 }}>Access institutional analytics, gap analysis, and model insights.</p>
            </button>
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          CONTACT SECTION
      ════════════════════════════════════════════════════════ */}
      <section id="contact" style={{
        position: "relative", zIndex: 1,
        padding: "clamp(48px,8vw,88px) clamp(16px,5vw,36px)",
        background: T.navy,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "120px", height: "2px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />

        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", color: T.gold, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700 }}>
              Get in Touch
            </p>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(22px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, fontFamily: "'Syne',sans-serif", color: T.white100 }}>
              Contact Us
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "580px", fontSize: "clamp(13px,1.5vw,16px)", color: T.dim, lineHeight: 1.8, fontWeight: 300 }}>
              Have questions about the EE Licensure Predictor? Reach out to the research team
              or the College of Engineering — we're happy to help.
            </p>
          </div>

          {/* Top: info + form */}
          <div className="lp-contact-top">

            {/* ── Info column ── */}
            <div>
              <p style={{ margin: "0 0 24px", fontSize: "clamp(12px,1.5vw,14px)", color: T.dim, lineHeight: 1.75 }}>
                Whether you're a student needing guidance, a faculty member exploring the dashboard,
                or a researcher interested in collaboration — drop us a message.
              </p>

              {/* Detail cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {[
                  { icon: "📍", label: "Address",    value: "Southern Luzon State University", sub: "Lucban, Quezon, Philippines 4328" },
                  { icon: "📧", label: "Email",      value: "ee.research@slsu.edu.ph",         sub: "College of Engineering — IIEE Chapter" },
                  { icon: "📞", label: "Phone",      value: "(042) 000-0000",                  sub: "Mon – Fri, 8:00 AM – 5:00 PM PHT" },
                  { icon: "🏛️", label: "Department", value: "College of Engineering",          sub: "Electrical Engineering Department" },
                ].map((item, i) => (
                  <div key={i} className="lp-contact-detail" style={{
                    display: "flex", alignItems: "flex-start", gap: "14px",
                    background: T.navyCard, border: `1px solid ${T.border}`,
                    borderRadius: "14px", padding: "14px 16px",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}>
                    <div style={{ ...iconBoxStyle(38, 10), flexShrink: 0, fontSize: "16px" }}>{item.icon}</div>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: "10px", color: T.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em" }}>
                        {item.label}
                      </p>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", color: T.white100, fontWeight: 500, lineHeight: 1.4 }}>
                        {item.value}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: T.dim }}>
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { icon: "🌐", label: "slsu.edu.ph" },
                  { icon: "📘", label: "Facebook"    },
                  { icon: "💼", label: "LinkedIn"    },
                ].map((s, i) => (
                  <a key={i} href="#" className="lp-social-btn">
                    <span style={{ fontSize: "14px" }}>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Form column ── */}
            <div style={{ background: T.navyCard, border: `1px solid ${T.border}`, borderRadius: "20px", padding: "clamp(20px,4vw,32px)" }}>
              <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>
                Send a Message
              </p>
              <p style={{ margin: "0 0 24px", fontSize: "12px", color: T.dim }}>
                We typically respond within 1–2 business days.
              </p>

              {/* Name row */}
              <div className="lp-form-row">
                {[
                  { key: "fname", label: "First Name", placeholder: "Juan"      },
                  { key: "lname", label: "Last Name",  placeholder: "Dela Cruz" },
                ].map(f => (
                  <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</label>
                    <input
                      className="lp-input"
                      style={{ ...inputBase }}
                      type="text"
                      placeholder={f.placeholder}
                      value={form.fields[f.key]}
                      onChange={e => form.update(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Address</label>
                <input className="lp-input" style={{ ...inputBase }} type="email" placeholder="you@example.com"
                  value={form.fields.email} onChange={e => form.update("email", e.target.value)} />
              </div>

              {/* Role */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>I am a…</label>
                <select className="lp-input lp-select" style={{ ...inputBase }}
                  value={form.fields.role} onChange={e => form.update("role", e.target.value)}>
                  <option value="" disabled>Select your role</option>
                  <option value="student">Student — EE Board Exam Examinee</option>
                  <option value="faculty">Faculty — SLSU College of Engineering</option>
                  <option value="researcher">Researcher / Collaborator</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</label>
                <select className="lp-input lp-select" style={{ ...inputBase }}
                  value={form.fields.subject} onChange={e => form.update("subject", e.target.value)}>
                  <option value="" disabled>Select a topic</option>
                  <option>General Inquiry about the System</option>
                  <option>Technical Issue / Bug Report</option>
                  <option>Access &amp; Login Problems</option>
                  <option>Research Collaboration</option>
                  <option>Faculty Dashboard Access</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                <textarea className="lp-input lp-textarea" style={{ ...inputBase, minHeight: "110px", resize: "vertical", lineHeight: 1.6 }}
                  placeholder="Write your message here…" maxLength={CHAR_MAX}
                  value={form.fields.message} onChange={e => form.update("message", e.target.value)} />
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "10px", color: T.dim, textAlign: "right" }}>
                {form.fields.message.length} / {CHAR_MAX}
              </p>

              {/* Error */}
              {form.error && (
                <div style={{ marginBottom: "12px", padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "10px", fontSize: "12px", color: T.fail }}>
                  {form.error}
                </div>
              )}

              {/* Footer */}
              <div className="lp-form-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <p style={{ fontSize: "10px", color: T.dim, lineHeight: 1.55, flex: 1, minWidth: 0 }}>
                  🔒 Your information is used only to respond to your inquiry and will not be shared with third parties.
                </p>
                <button className="lp-btn-submit" onClick={form.submit}
                  style={{ padding: "12px 26px", fontSize: "13px" }}>
                  Send Message →
                </button>
              </div>

              {/* Success toast */}
              {form.submitted && (
                <div style={{
                  marginTop: "14px", display: "flex", alignItems: "center", gap: "10px",
                  background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.28)",
                  borderRadius: "12px", padding: "12px 16px",
                  animation: "fadeUp .4s ease",
                }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>✅</span>
                  <p style={{ margin: 0, fontSize: "12px", color: T.pass, fontWeight: 600 }}>
                    Message sent! We'll get back to you within 1–2 business days.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom info cards */}
          <div className="lp-contact-btm">
            {[
              {
                icon: "🕐",
                title: "Office Hours",
                body: "Monday to Friday\n8:00 AM – 5:00 PM PHT\nClosed on weekends & holidays",
                tag: "Available Now",
              },
              {
                icon: "📬",
                title: "Response Time",
                body: "Email inquiries are typically answered within 1–2 business days. Urgent concerns may be raised directly at the department office.",
                tag: "1–2 Business Days",
              },
              {
                icon: "🔬",
                title: "Research Collaboration",
                body: "Interested in partnering with the SLSU EE Research Team? Select "Research Collaboration" in the contact form above.",
                tag: "Open to Partners",
              },
            ].map((c, i) => (
              <div key={i} className="lp-cic-card" style={{
                background: T.navyCard, border: `1px solid ${T.border}`,
                borderRadius: "16px", padding: "clamp(16px,3vw,22px)",
                textAlign: "center",
                transition: "border-color 0.2s, transform 0.2s",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{c.icon}</div>
                <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>{c.title}</p>
                <p style={{ margin: "0 0 12px", fontSize: "11px", color: T.dim, lineHeight: 1.65, whiteSpace: "pre-line" }}>{c.body}</p>
                <span style={{
                  display: "inline-block",
                  padding: "4px 12px", borderRadius: "999px",
                  background: T.goldGlow, border: `1px solid ${T.border}`,
                  fontSize: "10px", fontWeight: 700, color: T.gold,
                }}>
                  {c.tag}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: "clamp(20px,4vw,32px) clamp(16px,5vw,24px)",
        textAlign: "center",
        borderTop: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {[slsuLogo, slsuLogo1, slsuLogo2].map((src, i) => (
            <div key={i} style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.3 }} />
            </div>
          ))}
        </div>
        <div style={{ width: "40px", height: "1px", background: T.border }} />
        <p style={{ margin: 0, fontSize: "clamp(10px,1.5vw,12px)", color: T.muted }}>
          Southern Luzon State University · College of Engineering · IIEE · EE Licensure Predictor · For Research Use Only
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: T.dim }}>
          © 2025 SLSU IIEE Chapter · All rights reserved
        </p>
      </footer>

    </div>
  );
}