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

// ── SVG icon helpers (copyright-safe, no emoji) ───────────────────────────────
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l1.63-1.63a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="#F5C518" stroke="#F5C518" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const EmailSocialIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

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
      fontFamily: "'Inter', system-ui, sans-serif",
      color: T.white,
      overflowX: "hidden",
    }}>

      {/* ── GLOBAL CSS ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        :root { --lp-base-font-size: 16px; }
        html { font-size: var(--lp-base-font-size); }

        body, p, li, input, select, textarea, button {
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
          font-weight: 400;
        }
        h1, h2, h3, h4, h5, h6, .lp-heading {
          font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        @media (max-width: 480px) {
          p, li, label, small { font-size: 12.5px !important; line-height: 1.7; }
          .lp-btn-gold, .lp-btn-outline, .lp-btn-gold-nav, .lp-btn-outline-nav { font-size: 14px !important; }
        }

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
          font-family:'Montserrat',sans-serif; font-weight:800;
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
          font-family:'Montserrat',sans-serif; font-weight:600;
          cursor:pointer; transition:all .22s; border-radius:12px;
        }
        .lp-btn-outline:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
          transform:translateY(-2px);
        }
        .lp-btn-gold-nav {
          background:#F5C518; border:1px solid #F5C518;
          color:#07102B; font-family:'Montserrat',sans-serif;
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
          color:#94A3B8; font-family:'Montserrat',sans-serif;
          font-weight:600; cursor:pointer; transition:all .2s; border-radius:10px;
        }
        .lp-btn-outline-nav:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
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
        .lp-contact-card:hover {
          transform:translateY(-4px) !important;
          border-color:rgba(245,197,24,.38) !important;
          box-shadow:0 12px 32px rgba(245,197,24,.10) !important;
        }
        .lp-action-card:hover {
          transform:translateY(-5px) !important;
          border-color:rgba(245,197,24,.42) !important;
          box-shadow:0 16px 40px rgba(245,197,24,.14) !important;
        }

        /* ── Role buttons ── */
        .lp-role-student {
          background:rgba(245,197,24,.09);
          border:1px solid rgba(245,197,24,.18);
          border-radius:20px; cursor:pointer; text-align:center;
          font-family:'Montserrat',sans-serif;
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
          font-family:'Montserrat',sans-serif;
          transition:transform .25s,box-shadow .25s,border-color .25s,background .25s;
        }
        .lp-role-faculty:hover {
          transform:translateY(-5px);
          border-color:rgba(255,255,255,.24);
          box-shadow:0 18px 44px rgba(255,255,255,.06);
          background:rgba(255,255,255,.05);
        }

        /* ── Contact action buttons ── */
        .lp-contact-action-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          background:#F5C518; border:none; color:#07102B;
          font-family:'Montserrat',sans-serif; font-weight:800;
          cursor:pointer; transition:all .22s; border-radius:999px;
          padding:11px 28px; font-size:13px;
        }
        .lp-contact-action-btn:hover {
          background:#fff;
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(245,197,24,.42);
        }

        /* ── RESPONSIVE GRIDS ── */
        .lp-stats-grid    { display:grid; grid-template-columns:repeat(4,1fr); }
        .lp-features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
        .lp-about-grid    { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:16px; }
        .lp-steps-grid    { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:24px; }
        .lp-usage-grid    { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .lp-roles-grid    { display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:540px; margin:0 auto; }
        .lp-contact-top-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .lp-contact-bottom-cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

        /* ── BREAKPOINTS ── */
        @media(max-width:900px){
          .lp-stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .lp-brand-sub   { display:none !important; }
          .lp-contact-top-cards { grid-template-columns:1fr !important; }
        }
        @media(max-width:680px){
          .lp-usage-grid  { grid-template-columns:1fr !important; }
          .lp-roles-grid  { grid-template-columns:1fr !important; }
          .lp-steps-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .lp-contact-top-cards { grid-template-columns:1fr !important; }
          .lp-contact-bottom-cards { grid-template-columns:1fr !important; }
        }
        @media(max-width:540px){
          .lp-logo-mid      { display:none !important; }
          .lp-steps-grid    { grid-template-columns:1fr !important; }
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
          <div className="lp-logo" style={logoCircleStyle("clamp(36px,4vw,46px)", "rgba(245,197,24,0.22)")}>
            <img src={slsuLogo} alt="SLSU" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>
          <div className="lp-logo lp-logo-mid" style={logoCircleStyle("clamp(34px,4vw,44px)", "rgba(220,38,38,0.20)")}>
            <img src={slsuLogo1} alt="COE" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>
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
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(22px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, fontFamily: "'Syne',sans-serif", color: T.white100 }}>
              Get In Touch
            </h2>
            {/* Gold underline accent */}
            <div style={{ width: "60px", height: "3px", background: T.gold, borderRadius: "2px", margin: "0 auto" }} />
          </div>


          {/* Top row — Phone, Email, Location (SVG icons) */}
          <div className="lp-contact-top-cards">
            {[
              { Icon: PhoneIcon,  title: "Phone",    line1: "Contact us through our", line2: "official channels" },
              { Icon: MailIcon,   title: "Email",    line1: "electricalengineering.slsu", line2: "@gmail.com" },
              { Icon: MapPinIcon, title: "Location", line1: "Quezon Avenue, Kulapi,", line2: "Lucban, 4328 Quezon, Philippines" },
            ].map(({ Icon, title, line1, line2 }, i) => (
              <div key={i} className="lp-contact-card" style={{
                background: T.navyCard, border: `1px solid ${T.border}`,
                borderRadius: "18px", padding: "clamp(20px,3vw,28px)",
                display: "flex", alignItems: "flex-start", gap: "16px",
                transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "rgba(245,197,24,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon />
                </div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>{title}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: T.muted, lineHeight: 1.65 }}>{line1}<br />{line2}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Form — full width, wired to real form */}
          <div style={{ marginTop: "16px" }}>
            <div className="lp-action-card" style={{
              background: T.navyCard, border: `1px solid ${T.border}`,
              borderRadius: "18px", padding: "clamp(28px,4vw,40px) clamp(20px,4vw,40px)",
              transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
            }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "rgba(245,197,24,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <StarIcon />
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "clamp(16px,2.5vw,20px)", fontWeight: 800, color: T.white100, fontFamily: "'Syne',sans-serif" }}>
                    Evaluation Form
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: T.muted }}>
                    Share your feedback and help us improve our services. We typically respond within 1–2 business days.
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                {[
                  { key: "fname", label: "First Name", placeholder: "Juan",      type: "text" },
                  { key: "lname", label: "Last Name",  placeholder: "Dela Cruz", type: "text" },
                ].map(f => (
                  <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</label>
                    <input
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${T.borderSub}`, borderRadius: "10px",
                        padding: "11px 14px", color: T.white100, fontSize: "13px",
                        fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      type={f.type} placeholder={f.placeholder}
                      value={form.fields[f.key]}
                      onChange={e => form.update(f.key, e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.gold; }}
                      onBlur={e => { e.target.style.borderColor = T.borderSub; }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Address</label>
                <input
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSub}`, borderRadius: "10px", padding: "11px 14px", color: T.white100, fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  type="email" placeholder="you@example.com"
                  value={form.fields.email} onChange={e => form.update("email", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = T.gold; }} onBlur={e => { e.target.style.borderColor = T.borderSub; }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>I am a…</label>
                  <select
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSub}`, borderRadius: "10px", padding: "11px 14px", color: form.fields.role ? T.white100 : T.muted, fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", appearance: "none", cursor: "pointer" }}
                    value={form.fields.role} onChange={e => form.update("role", e.target.value)}
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="student">Student — EE Board Exam Examinee</option>
                    <option value="faculty">Faculty — SLSU College of Engineering</option>
                    <option value="researcher">Researcher / Collaborator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</label>
                  <select
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSub}`, borderRadius: "10px", padding: "11px 14px", color: form.fields.subject ? T.white100 : T.muted, fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", appearance: "none", cursor: "pointer" }}
                    value={form.fields.subject} onChange={e => form.update("subject", e.target.value)}
                  >
                    <option value="" disabled>Select a topic</option>
                    <option>General Inquiry about the System</option>
                    <option>Technical Issue / Bug Report</option>
                    <option>Access &amp; Login Problems</option>
                    <option>Research Collaboration</option>
                    <option>Faculty Dashboard Access</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "4px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                <textarea
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSub}`, borderRadius: "10px", padding: "11px 14px", color: T.white100, fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: "110px", lineHeight: 1.6 }}
                  placeholder="Write your message here…" maxLength={CHAR_MAX}
                  value={form.fields.message} onChange={e => form.update("message", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = T.gold; }} onBlur={e => { e.target.style.borderColor = T.borderSub; }}
                />
              </div>
              <p style={{ margin: "0 0 16px", fontSize: "10px", color: T.dim, textAlign: "right" }}>
                {form.fields.message.length} / {CHAR_MAX}
              </p>

              {form.error && (
                <div style={{ marginBottom: "12px", padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "10px", fontSize: "12px", color: T.fail }}>
                  {form.error}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "10px", color: T.dim, lineHeight: 1.55, flex: 1, minWidth: "160px" }}>
                  Your information is used only to respond to your inquiry and will not be shared with third parties.
                </p>
                <button className="lp-contact-action-btn" onClick={form.submit}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <PencilIcon /> Submit Evaluation
                </button>
              </div>

              {form.submitted && (
                <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.28)", borderRadius: "12px", padding: "12px 16px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <p style={{ margin: 0, fontSize: "12px", color: T.pass, fontWeight: 600 }}>
                    Message sent! We'll get back to you within 1–2 business days.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 1,
        background: T.navyMid,
        borderTop: `1px solid ${T.border}`,
      }}>
        {/* ── 3-column footer body ── */}
        <div style={{
          maxWidth: "1120px", margin: "0 auto",
          padding: "clamp(36px,5vw,56px) clamp(16px,5vw,36px) 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "clamp(24px,4vw,48px)",
        }} className="lp-footer-grid">
          {/* Col 1 — Brand */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 800, color: T.gold, fontFamily: "'Syne',sans-serif" }}>
              SLSU EE Licensure Predictor
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: T.muted, lineHeight: 1.7 }}>
              Tracking excellence, celebrating success.
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 800, color: T.gold, fontFamily: "'Syne',sans-serif" }}>
              Quick Links
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Home", "About", "Features", "Contact"].map(link => (
                <button key={link}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", fontSize: "13px", color: T.muted, fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.target.style.color = T.white100; }}
                  onMouseLeave={e => { e.target.style.color = T.muted; }}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3 — Connect */}
          <div>
            <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 800, color: T.gold, fontFamily: "'Syne',sans-serif" }}>
              Connect
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: EmailSocialIcon, label: "Email" },
              ].map(({ Icon, label }) => (
                <button key={label}
                  aria-label={label}
                  style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${T.borderSub}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: T.muted,
                    transition: "background 0.2s, border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,197,24,0.12)"; e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = T.borderSub; e.currentTarget.style.color = T.muted; }}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider + copyright ── */}
        <div style={{
          maxWidth: "1120px", margin: "0 auto",
          padding: "clamp(20px,3vw,28px) clamp(16px,5vw,36px)",
          borderTop: `1px solid ${T.border}`,
          marginTop: "clamp(28px,4vw,44px)",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontSize: "12px", color: T.muted }}>
            © 2026 Southern Luzon State University. All rights reserved.
          </p>
        </div>

        <style>{`
          @media(max-width:680px){ .lp-footer-grid { grid-template-columns:1fr !important; } }
          @media(max-width:900px){ .lp-footer-grid { grid-template-columns:1fr 1fr !important; } }
        `}</style>
      </footer>

    </div>
  );
}
