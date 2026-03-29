import { useState, useEffect } from "react";

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
  { icon: "🤖", title: "Machine Learning at the Core", body: "Three Random Forest models — a classifier for Pass/Fail and two regressors for PRC rating — trained on real graduate data from SLSU's College of Engineering. The system achieves 97% classification accuracy and an R² of 0.97 on rating prediction." },
  { icon: "📋", title: "70+ Factor Survey", body: "Covers 10 domains: Knowledge, Problem Solving, Motivation, Mental Health, Support System, Curriculum, Faculty Quality, Departmental Review, Facilities, and Institutional Culture. Each response feeds directly into the prediction pipeline." },
  { icon: "💡", title: "Groq-Powered Recommendations", body: "After prediction, Llama 3.3-70b generates personalized, section-specific action plans. It references your exact weak responses, affirms your strengths, and gives 3–5 concrete steps — all under 200 words for immediate readability." },
  { icon: "🏫", title: "Curriculum Gap Analysis", body: "Faculty unlock a full institutional dashboard: pass rates by year, SHS strand, and review duration; top model feature importances; and the 10 survey items with the most student disagreement — directly surfacing institutional weaknesses." },
];

const T = {
  navy:       "#07102B",
  navyMid:    "#0D1B3E",
  navyCard:   "#112250",
  gold:       "#F5C518",
  goldGlow:   "rgba(245,197,24,0.10)",
  goldBorder: "rgba(245,197,24,0.22)",
  white100:   "#FFFFFF",
  white:      "#F1F5F9",
  muted:      "#94A3B8",
  dim:        "#64748B",
  border:     "rgba(245,197,24,0.18)",
  borderSub:  "rgba(255,255,255,0.09)",
  fail:       "#F87171",
  pass:       "#4ADE80",
};

const logoCircleStyle = (size, glow) => ({
  width: size, height: size, borderRadius: "50%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", flexShrink: 0,
  boxShadow: `0 0 14px ${glow}`,
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
  background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 20%,rgba(245,197,24,.70) 50%,rgba(255,255,255,.18) 80%,transparent 100%)",
};

/* ── SVG Icons ── */
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
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#F5C518" stroke="#F5C518" strokeWidth="1.2">
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
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

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

/* ── Input / Select / Textarea shared style ── */
const fieldBase = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid rgba(255,255,255,0.10)`,
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#F1F5F9",
  fontSize: "14px",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

/* ── Label style ── */
const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "11px",
  fontWeight: 600,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  fontFamily: "'Inter', sans-serif",
};

export default function LandingPage({ onEnter }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const form = useContactForm();
  const CHAR_MAX = 500;

  const navLinks = [
    { id: "home",     label: "Home"     },
    { id: "about",    label: "About"    },
    { id: "features", label: "Features" },
    { id: "contact",  label: "Contact"  },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.navy,
      fontFamily: "'Inter', system-ui, sans-serif",
      color: T.white,
      overflowX: "hidden",
    }}>

      {/* ── GLOBAL CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Typography base ── */
        body, p, li, span, label, input, select, textarea, button, a, small, td, th {
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          font-weight: 400;
        }
        h1, h2, h3, h4, h5, h6,
        .lp-h1, .lp-h2, .lp-h3,
        .lp-montserrat {
          font-family: 'Montserrat', system-ui, -apple-system, sans-serif !important;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        /* Force headings inside components */
        .lp-root * { font-family: 'Inter', system-ui, sans-serif; }
        .lp-root h1, .lp-root h2, .lp-root h3,
        .lp-root h4, .lp-root h5, .lp-root h6 {
          font-family: 'Montserrat', system-ui, sans-serif !important;
        }

        @keyframes pulseGold   { 0%,100%{opacity:.50} 50%{opacity:1} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes goldShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes slideIn     { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }

        .lp-fade-up { animation: fadeUp .65s ease forwards; opacity:0; }
        .lp-d1{animation-delay:.06s} .lp-d2{animation-delay:.16s}
        .lp-d3{animation-delay:.28s} .lp-d4{animation-delay:.40s}
        .lp-d5{animation-delay:.52s}

        .lp-shimmer {
          background: linear-gradient(90deg,#F5C518 0%,#fff 40%,#F5C518 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 3.5s linear infinite;
        }

        /* ── Fixed BG ── */
        .lp-grid-bg {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(245,197,24,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(245,197,24,.025) 1px,transparent 1px);
          background-size:56px 56px;
        }
        .lp-orb1 {
          position:fixed; top:-15%; left:-8%;
          width:700px; height:700px; border-radius:50%;
          background:radial-gradient(circle,rgba(245,197,24,.07),transparent 68%);
          pointer-events:none; z-index:0;
          animation:pulseGold 5s ease-in-out infinite;
        }
        .lp-orb2 {
          position:fixed; bottom:-18%; right:-8%;
          width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle,rgba(56,189,248,.045),transparent 68%);
          pointer-events:none; z-index:0;
          animation:pulseGold 5s ease-in-out infinite 2.5s;
        }

        /* ── Pulse dot ── */
        .lp-dot {
          width:7px; height:7px; border-radius:50%;
          background:#F5C518; flex-shrink:0;
          animation:pulseGold 2s infinite;
        }

        /* ── Buttons ── */
        .lp-btn-gold {
          background:#F5C518; border:none; color:#07102B;
          font-family:'Montserrat',sans-serif !important; font-weight:800;
          cursor:pointer; transition:all .22s; border-radius:12px;
          font-size:15px;
        }
        .lp-btn-gold:hover {
          background:#fff; color:#07102B;
          transform:translateY(-2px);
          box-shadow:0 12px 36px rgba(245,197,24,.45);
        }
        .lp-btn-outline {
          background:transparent;
          border:1.5px solid rgba(245,197,24,.25);
          color:#94A3B8;
          font-family:'Montserrat',sans-serif !important; font-weight:600;
          cursor:pointer; transition:all .22s; border-radius:12px;
          font-size:15px;
        }
        .lp-btn-outline:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
          transform:translateY(-2px);
        }

        /* ── Nav buttons ── */
        .lp-btn-gold-nav {
          background:#F5C518; border:1.5px solid #F5C518;
          color:#07102B; font-family:'Montserrat',sans-serif !important;
          font-weight:800; cursor:pointer; transition:all .2s; border-radius:9px;
        }
        .lp-btn-gold-nav:hover {
          background:#fff; border-color:#fff;
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(245,197,24,.38);
        }
        .lp-btn-outline-nav {
          background:transparent;
          border:1.5px solid rgba(245,197,24,.22);
          color:#94A3B8; font-family:'Montserrat',sans-serif !important;
          font-weight:600; cursor:pointer; transition:all .2s; border-radius:9px;
        }
        .lp-btn-outline-nav:hover {
          border-color:#F5C518; color:#F5C518;
          background:rgba(245,197,24,.08);
        }

        /* ── Desktop nav links ── */
        .lp-nav-link {
          font-family:'Inter',sans-serif !important;
          font-size:15px; font-weight:500;
          color:#94A3B8; text-decoration:none;
          transition:color .2s; letter-spacing:0.01em;
          padding:4px 0;
          position:relative;
        }
        .lp-nav-link::after {
          content:''; position:absolute; bottom:-2px; left:0; right:0;
          height:2px; background:#F5C518; border-radius:2px;
          transform:scaleX(0); transition:transform .2s;
        }
        .lp-nav-link:hover { color:#F5C518; }
        .lp-nav-link:hover::after { transform:scaleX(1); }

        /* ── Desktop nav links container — hidden on mobile ── */
        .lp-nav-links-desktop {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-shrink: 0;
        }
        /* Nav auth buttons group */
        .lp-nav-auth {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── Hamburger button — hidden on desktop ── */
        .lp-hamburger {
          display: none;
          background: rgba(245,197,24,0.07);
          border: 1.5px solid rgba(245,197,24,0.22);
          color: #F5C518;
          border-radius: 10px;
          padding: 8px 9px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: background .2s, border-color .2s;
          flex-shrink: 0;
        }
        .lp-hamburger:hover {
          background: rgba(245,197,24,0.14);
          border-color: #F5C518;
        }

        /* ── Mobile slide-over drawer ── */
        .lp-drawer-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(7,16,43,0.65);
          backdrop-filter: blur(4px);
          opacity: 0;
          pointer-events: none;
          transition: opacity .3s;
        }
        .lp-drawer-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .lp-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          z-index: 201;
          width: min(80vw, 320px);
          background: #0D1B3E;
          border-left: 1px solid rgba(245,197,24,0.18);
          display: flex;
          flex-direction: column;
          padding: 0;
          transform: translateX(100%);
          transition: transform .32s cubic-bezier(.4,0,.2,1);
          box-shadow: -20px 0 60px rgba(0,0,0,.5);
        }
        .lp-drawer.open {
          transform: translateX(0);
        }
        .lp-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid rgba(245,197,24,0.12);
        }
        .lp-drawer-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 12px 0;
          overflow-y: auto;
        }
        .lp-drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 24px;
          font-family: 'Inter', sans-serif !important;
          font-size: 15px;
          font-weight: 600;
          color: #94A3B8;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
          border-left: 3px solid transparent;
          transition: color .2s, background .2s, border-color .2s;
        }
        .lp-drawer-link:hover {
          color: #F5C518;
          background: rgba(245,197,24,0.06);
          border-left-color: #F5C518;
        }
        .lp-drawer-footer {
          padding: 20px 22px;
          border-top: 1px solid rgba(245,197,24,0.12);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Card hovers ── */
        .lp-feature-card:hover {
          transform:translateY(-5px) !important;
          border-color:rgba(245,197,24,.45) !important;
          box-shadow:0 16px 40px rgba(245,197,24,.13) !important;
        }
        .lp-about-card:hover {
          transform:translateY(-4px) !important;
          border-color:rgba(245,197,24,.35) !important;
        }
        .lp-contact-card:hover {
          transform:translateY(-4px) !important;
          border-color:rgba(245,197,24,.40) !important;
          box-shadow:0 12px 32px rgba(245,197,24,.10) !important;
        }
        .lp-action-card:hover {
          transform:translateY(-5px) !important;
          border-color:rgba(245,197,24,.45) !important;
          box-shadow:0 18px 44px rgba(245,197,24,.14) !important;
        }

        /* ── Role buttons ── */
        .lp-role-student {
          background:rgba(245,197,24,.08);
          border:1.5px solid rgba(245,197,24,.22);
          border-radius:20px; cursor:pointer; text-align:center;
          font-family:'Montserrat',sans-serif !important;
          transition:transform .25s,box-shadow .25s,border-color .25s,background .25s;
        }
        .lp-role-student:hover {
          transform:translateY(-5px);
          border-color:#F5C518;
          box-shadow:0 20px 48px rgba(245,197,24,.22);
          background:rgba(245,197,24,.14);
        }
        .lp-role-faculty {
          background:rgba(255,255,255,.025);
          border:1.5px solid rgba(255,255,255,.09);
          border-radius:20px; cursor:pointer; text-align:center;
          font-family:'Montserrat',sans-serif !important;
          transition:transform .25s,box-shadow .25s,border-color .25s,background .25s;
        }
        .lp-role-faculty:hover {
          transform:translateY(-5px);
          border-color:rgba(255,255,255,.26);
          box-shadow:0 20px 48px rgba(255,255,255,.06);
          background:rgba(255,255,255,.055);
        }

        /* ── Contact send button ── */
        .lp-send-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          background:#F5C518; border:none; color:#07102B;
          font-family:'Montserrat',sans-serif !important; font-weight:800;
          cursor:pointer; transition:all .22s; border-radius:999px;
          padding:13px 32px; font-size:14px;
          white-space: nowrap;
        }
        .lp-send-btn:hover {
          background:#fff;
          transform:translateY(-2px);
          box-shadow:0 10px 28px rgba(245,197,24,.45);
        }

        /* ── Logo hover ── */
        .lp-logo { transition:transform .25s; }
        .lp-logo:hover { transform:scale(1.08) translateY(-2px); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar            { width:5px; height:5px; }
        ::-webkit-scrollbar-track      { background:rgba(255,255,255,.02); }
        ::-webkit-scrollbar-thumb      { background:rgba(245,197,24,.22); border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover{ background:rgba(245,197,24,.45); }

        /* ══ RESPONSIVE BREAKPOINTS ══ */

        /* Hide brand subtitle at medium screens to prevent crowding */
        @media(max-width:1100px){
          .lp-brand-sub { display:none !important; }
        }

        /* At 1000px: collapse nav links into hamburger */
        @media(max-width:1000px){
          .lp-nav-links-desktop { display:none !important; }
          .lp-nav-auth          { display:none !important; }
          .lp-hamburger         { display:inline-flex !important; }
        }

        /* Stats grid 2-col on tablets */
        @media(max-width:860px){
          .lp-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
        }

        /* Single-col stacking for narrow screens */
        @media(max-width:680px){
          .lp-usage-grid           { grid-template-columns:1fr !important; }
          .lp-roles-grid           { grid-template-columns:1fr !important; }
          .lp-steps-grid           { grid-template-columns:repeat(2,1fr) !important; }
          .lp-contact-top-cards    { grid-template-columns:1fr !important; }
          .lp-contact-bottom-cards { grid-template-columns:1fr !important; }
          .lp-name-grid            { grid-template-columns:1fr !important; }
          .lp-field-row            { grid-template-columns:1fr !important; }
          .lp-form-footer          { flex-direction:column !important; gap:14px !important; }
          .lp-send-btn             { width:100% !important; justify-content:center !important; }
        }

        @media(max-width:560px){
          .lp-stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .lp-steps-grid  { grid-template-columns:1fr !important; }
          .lp-logo-mid    { display:none !important; }
        }

        @media(max-width:400px){
          .lp-badge-iiee  { display:none !important; }
          .lp-logo-right  { display:none !important; }
          .lp-stat-sub    { display:none !important; }
        }

        /* Footer responsive */
        @media(max-width:760px){ .lp-footer-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:500px){ .lp-footer-grid { grid-template-columns:1fr !important; } }
      `}</style>

      {/* ── BG decorations ── */}
      <div className="lp-grid-bg" />
      <div className="lp-orb1" />
      <div className="lp-orb2" />

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════ */}
      <div className={`lp-drawer-overlay${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`lp-drawer${menuOpen ? " open" : ""}`} role="dialog" aria-label="Navigation menu">
        {/* Drawer header */}
        <div className="lp-drawer-header">
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ ...logoCircleStyle("38px","rgba(245,197,24,0.22)") }}>
              <img src={slsuLogo} alt="SLSU" style={{ width:"85%", height:"85%", objectFit:"contain" }} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:"13px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>EE Predictor</p>
              <p style={{ margin:0, fontSize:"11px", color:T.muted }}>SLSU · IIEE</p>
            </div>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background:"transparent", border:"1.5px solid rgba(255,255,255,0.10)", borderRadius:"8px", color:T.muted, padding:"7px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color .2s, color .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.color=T.gold; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.10)"; e.currentTarget.style.color=T.muted; }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav links */}
        <nav className="lp-drawer-nav">
          {navLinks.map(link => (
            <button key={link.id} className="lp-drawer-link" onClick={() => scrollTo(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Footer CTA buttons */}
        <div className="lp-drawer-footer">
          <button className="lp-btn-outline-nav" onClick={() => { setMenuOpen(false); onEnter("student"); }}
            style={{ padding:"12px 20px", fontSize:"14px", width:"100%" }}>
            Student Login
          </button>
          <button className="lp-btn-gold-nav" onClick={() => { setMenuOpen(false); onEnter("professor"); }}
            style={{ padding:"12px 20px", fontSize:"14px", width:"100%" }}>
            Faculty Login
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════ */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background: scrolled ? "rgba(7,16,43,0.98)" : "rgba(7,16,43,0.90)",
        backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${scrolled ? T.goldBorder : "rgba(245,197,24,0.10)"}`,
        padding:"0 clamp(14px,3vw,32px)",
        display:"flex", alignItems:"center",
        height:"clamp(60px,8vw,72px)",
        transition:"background .35s, border-color .35s",
        gap:"8px",
        overflow:"hidden",        /* prevent any child from ever busting out */
      }}>

        {/* ── Brand (left, shrinks but never wraps) ── */}
        <div style={{
          display:"flex", alignItems:"center", gap:"8px",
          flexShrink:1, minWidth:0,   /* allows brand to shrink gracefully */
          overflow:"hidden",
          marginRight:"auto",         /* pushes everything else to the right */
        }}>
          {/* Logo 1 — always visible */}
          <div className="lp-logo" style={{ ...logoCircleStyle("40px","rgba(245,197,24,0.22)"), flexShrink:0 }}>
            <img src={slsuLogo} alt="SLSU" style={{ width:"85%", height:"85%", objectFit:"contain" }} />
          </div>
          {/* Logo 2 — hidden below 560px */}
          <div className="lp-logo lp-logo-mid" style={{ ...logoCircleStyle("38px","rgba(220,38,38,0.20)"), flexShrink:0 }}>
            <img src={slsuLogo1} alt="COE" style={{ width:"85%", height:"85%", objectFit:"contain" }} />
          </div>
          {/* Logo 3 — hidden below 400px */}
          <div className="lp-logo lp-logo-right" style={{ ...logoCircleStyle("40px","rgba(245,197,24,0.22)"), flexShrink:0 }}>
            <img src={slsuLogo2} alt="IIEE" style={{ width:"85%", height:"85%", objectFit:"contain" }} />
          </div>

          {/* Divider */}
          <div style={{ width:"1px", height:"28px", background:T.border, flexShrink:0 }} />

          {/* Text — clips with ellipsis if needed, never wraps */}
          <div style={{ minWidth:0, overflow:"hidden" }}>
            <p style={{
              margin:0,
              fontSize:"clamp(11px,1.5vw,15px)",
              fontWeight:800,
              color:T.white100,
              fontFamily:"'Montserrat',sans-serif",
              whiteSpace:"nowrap",
              overflow:"hidden",
              textOverflow:"ellipsis",
              letterSpacing:"-0.02em",
              lineHeight:1.2,
            }}>
              EE Licensure Predictor
            </p>
            <p className="lp-brand-sub" style={{
              margin:0, fontSize:"10px", color:T.muted,
              textTransform:"uppercase", letterSpacing:"0.08em",
              whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif",
              fontWeight:500, lineHeight:1.4,
            }}>
              Southern Luzon State University · IIEE
            </p>
          </div>
        </div>

        {/* ── Center: Quick-link nav (desktop only, disappears at 1000px) ── */}
        <div className="lp-nav-links-desktop" style={{ gap:"20px", flexShrink:0 }}>
          {navLinks.map(link => (
            <button key={link.id} className="lp-nav-link" onClick={() => scrollTo(link.id)}
              style={{ background:"transparent", border:"none", cursor:"pointer", whiteSpace:"nowrap" }}>
              {link.label}
            </button>
          ))}
        </div>

        {/* ── Right: Auth buttons (desktop only) ── */}
        <div className="lp-nav-auth" style={{ gap:"8px", flexShrink:0 }}>
          <button className="lp-btn-outline-nav" onClick={() => onEnter("student")}
            style={{ padding:"9px 18px", fontSize:"13px", whiteSpace:"nowrap" }}>
            Student Login
          </button>
          <button className="lp-btn-gold-nav" onClick={() => onEnter("professor")}
            style={{ padding:"9px 18px", fontSize:"13px", whiteSpace:"nowrap" }}>
            Faculty Login
          </button>
        </div>

        {/* ── Hamburger (mobile/tablet only, shows at ≤1000px) ── */}
        <button className="lp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open navigation"
          style={{ flexShrink:0 }}>
          <MenuIcon />
        </button>
      </nav>

      <div style={accentBarStyle} />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section id="home" style={{
        position:"relative", zIndex:1,
        padding:"clamp(52px,8vw,100px) clamp(16px,5vw,40px) clamp(44px,6vw,80px)",
        maxWidth:"1120px", margin:"0 auto",
      }}>
        {/* Badges */}
        <div className="lp-fade-up lp-d1" style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", marginBottom:"28px" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:T.goldGlow, border:`1px solid ${T.goldBorder}`,
            borderRadius:"999px", padding:"7px 18px",
            fontSize:"11px", fontWeight:700, color:T.gold,
            textTransform:"uppercase", letterSpacing:"0.12em",
            fontFamily:"'Inter',sans-serif",
          }}>
            <span className="lp-dot" />
            AI-Powered Research System
          </span>
          <span className="lp-badge-iiee" style={{
            display:"inline-flex", alignItems:"center", gap:"7px",
            background:"rgba(255,255,255,0.04)", border:`1px solid ${T.borderSub}`,
            borderRadius:"999px", padding:"7px 16px",
            fontSize:"11px", fontWeight:500, color:T.muted,
            fontFamily:"'Inter',sans-serif",
          }}>
            College of Engineering · IIEE
          </span>
        </div>

        {/* Headline */}
        <div className="lp-fade-up lp-d2">
          <h1 className="lp-h1" style={{
            fontSize:"clamp(34px,6.8vw,80px)",
            fontWeight:900, lineHeight:1.02,
            letterSpacing:"-0.035em", margin:"0 0 24px",
            color:T.white100,
          }}>
            Predict Your<br />
            <span className="lp-shimmer">EE Board Exam</span><br />
            Outcome with AI
          </h1>
          <p style={{
            fontSize:"clamp(14px,1.8vw,18px)",
            color:"#8da3c0",
            maxWidth:"560px", lineHeight:1.78, margin:"0 0 44px",
            fontWeight:400,
          }}>
            An AI-powered prediction system for Electrical Engineering licensure
            examinees at SLSU. Assess your readiness, receive personalized feedback,
            and help faculty identify institutional gaps — all in one platform.
          </p>
        </div>

        {/* CTA */}
        <div className="lp-fade-up lp-d3" style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"72px" }}>
          <button className="lp-btn-gold" onClick={() => onEnter("student")}
            style={{ padding:"clamp(12px,2vw,16px) clamp(22px,4vw,42px)", fontSize:"clamp(13px,1.8vw,15px)" }}>
            Take the Survey →
          </button>
          <button className="lp-btn-outline" onClick={() => onEnter("professor")}
            style={{ padding:"clamp(12px,2vw,16px) clamp(18px,3vw,34px)", fontSize:"clamp(13px,1.8vw,15px)" }}>
            Faculty Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="lp-fade-up lp-d4 lp-stats-grid" style={{
          display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:"1px", background:T.border,
          borderRadius:"18px", overflow:"hidden",
          border:`1px solid ${T.border}`,
          marginBottom:"64px",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background:T.navyMid, padding:"clamp(16px,3vw,26px) 12px", textAlign:"center" }}>
              <p style={{ margin:"0 0 6px", fontSize:"clamp(22px,3.4vw,38px)", fontWeight:900, color:T.gold, letterSpacing:"-0.02em", lineHeight:1, fontFamily:"'Montserrat',sans-serif" }}>
                {s.value}
              </p>
              <p style={{ margin:0, fontSize:"10px", color:T.muted, textTransform:"uppercase", letterSpacing:"0.10em", fontWeight:600, fontFamily:"'Inter',sans-serif" }}>
                {s.label}
              </p>
              <p className="lp-stat-sub" style={{ margin:"8px 0 0", fontSize:"11px", color:T.dim, lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Snapshot */}
        <div className="lp-fade-up lp-d4" style={{
          background:"rgba(245,197,24,0.03)",
          border:`1px solid ${T.border}`,
          borderRadius:"20px", padding:"20px 24px",
          marginBottom:"80px",
        }}>
          <p style={{ margin:"0 0 8px", fontSize:"13px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>
            System Snapshot
          </p>
          <p style={{ margin:0, fontSize:"14px", color:"#8da3c0", lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
            The system computes a predicted <strong style={{ color:T.white100, fontWeight:600 }}>Pass/Fail probability</strong> and estimates your PRC rating using your survey responses and academic indicators. The panel values provide a research-style summary of model performance and the size of the survey signal used by the predictor.
          </p>
        </div>

        {/* Features */}
        <div id="features" className="lp-fade-up lp-d5">
          <p style={{ margin:"0 0 6px", fontSize:"11px", color:T.gold, textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
            Platform Capabilities
          </p>
          <h2 className="lp-h2" style={{ margin:"0 0 24px", fontSize:"clamp(20px,3vw,32px)", color:T.white100 }}>
            What the System Does
          </h2>
          <div className="lp-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"14px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card" style={{ ...cardStyle, padding:"clamp(18px,3vw,26px)" }}>
                <div style={{ ...iconBoxStyle(46, 12), marginBottom:"16px", fontSize:"22px" }}>{f.icon}</div>
                <p style={{ margin:"0 0 8px", fontSize:"15px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>{f.title}</p>
                <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.70, fontFamily:"'Inter',sans-serif" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ══════════════════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════════════════ */}
      <section id="about" style={{
        position:"relative", zIndex:1,
        padding:"clamp(52px,8vw,96px) clamp(16px,5vw,40px)",
        background:T.navyMid,
        borderTop:`1px solid ${T.border}`,
      }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"120px", height:"2px", background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />

        <div style={{ maxWidth:"1120px", margin:"0 auto" }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <p style={{ margin:"0 0 10px", fontSize:"11px", color:T.gold, textTransform:"uppercase", letterSpacing:"0.20em", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
              About the System
            </p>
            <h2 className="lp-h2" style={{ margin:"0 0 18px", fontSize:"clamp(24px,4vw,44px)", color:T.white100 }}>
              What is the EE Licensure Predictor?
            </h2>
            <p style={{ margin:"0 auto", maxWidth:"640px", fontSize:"clamp(14px,1.5vw,17px)", color:"#8da3c0", lineHeight:1.80, fontWeight:400, fontFamily:"'Inter',sans-serif" }}>
              A research-grade, data-driven platform designed by and for the SLSU College of Engineering.
              It combines machine learning, survey science, and generative AI to give every EE examinee a
              clear, personalized picture of their board exam readiness — before exam day.
            </p>
          </div>

          {/* About cards */}
          <div className="lp-about-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"16px", marginBottom:"56px" }}>
            {ABOUT_ITEMS.map((item, i) => (
              <div key={i} className="lp-about-card" style={{ ...cardStyle, padding:"clamp(20px,3vw,30px) clamp(16px,2.5vw,26px)" }}>
                <div style={{ ...iconBoxStyle(50, 14), marginBottom:"18px", fontSize:"24px" }}>{item.icon}</div>
                <p style={{ margin:"0 0 10px", fontSize:"15px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>{item.title}</p>
                <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.72, fontFamily:"'Inter',sans-serif" }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background:T.goldGlow, border:`1px solid ${T.border}`, borderRadius:"24px", padding:"clamp(26px,4vw,44px) clamp(18px,4vw,40px)" }}>
            <p style={{ margin:"0 0 28px", fontSize:"12px", fontWeight:700, color:T.gold, textTransform:"uppercase", letterSpacing:"0.14em", fontFamily:"'Inter',sans-serif" }}>
              How it works — Student Flow
            </p>
            <div className="lp-steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"28px" }}>
              {[
                { step:"01", title:"Log In",         desc:"Access the student portal using your SLSU credentials." },
                { step:"02", title:"Complete Survey", desc:"Answer 70+ questions across 10 domains — takes about 10 minutes." },
                { step:"03", title:"Get Prediction",  desc:"Receive your Pass/Fail result and predicted PRC rating instantly." },
                { step:"04", title:"Review Insights", desc:"Expand each section to see your score breakdown and AI advice." },
                { step:"05", title:"Take Action",     desc:"Follow personalized action steps and re-take as you improve." },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"38px", height:"38px", borderRadius:"10px", background:"rgba(245,197,24,0.15)", border:`1px solid ${T.border}`, fontSize:"11px", fontWeight:800, color:T.gold, fontFamily:"'Montserrat',sans-serif", marginBottom:"12px" }}>
                    {s.step}
                  </div>
                  <p style={{ margin:"0 0 6px", fontSize:"14px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>{s.title}</p>
                  <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.65, fontFamily:"'Inter',sans-serif" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty callout */}
          <div style={{ marginTop:"16px", background:"rgba(255,255,255,0.025)", border:`1px solid ${T.borderSub}`, borderRadius:"16px", padding:"24px 28px", display:"flex", alignItems:"flex-start", gap:"16px" }}>
            <span style={{ fontSize:"24px", flexShrink:0, marginTop:"2px" }}>🔬</span>
            <div>
              <p style={{ margin:"0 0 8px", fontSize:"15px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>
                For Faculty — Institutional Insights Dashboard
              </p>
              <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
                Faculty choose the <strong style={{ color:T.white, fontWeight:600 }}>Faculty</strong> role on this landing page to access the Insights Dashboard. Four tabs provide
                <strong style={{ color:T.white, fontWeight:600 }}> Overview KPIs</strong> (pass rates, GWA comparison),
                <strong style={{ color:T.white, fontWeight:600 }}> Performance Breakdown</strong> (by SHS strand and survey section),
                <strong style={{ color:T.white, fontWeight:600 }}> Feature Importance</strong> (top 10 ML predictors), and
                <strong style={{ color:T.white, fontWeight:600 }}> Curriculum Gap Analysis</strong> (10 weakest survey items with severity flags). All data is pulled live from the backend — no manual export needed.
              </p>
            </div>
          </div>

          {/* Usage grids */}
          <div className="lp-usage-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px", marginTop:"24px" }}>
            <div style={{ background:T.navyCard, borderRadius:"18px", padding:"clamp(18px,3vw,26px)", border:`1px solid ${T.border}` }}>
              <p style={{ margin:"0 0 12px", fontSize:"11px", color:T.gold, textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
                For Students — How to Use
              </p>
              <ol style={{ margin:0, paddingLeft:"18px", fontSize:"13px", color:"#8da3c0", lineHeight:1.85, fontFamily:"'Inter',sans-serif" }}>
                <li>Choose <strong style={{ color:T.white, fontWeight:600 }}>"I'm a Student"</strong> or use the <strong style={{ color:T.white, fontWeight:600 }}>Student Login</strong> button.</li>
                <li>Fill in your <strong style={{ color:T.white, fontWeight:600 }}>mock or actual subject scores</strong>, GWA, and complete the 10-section survey as honestly as possible.</li>
                <li>Submit to generate your <strong style={{ color:T.white, fontWeight:600 }}>Pass / Fail prediction</strong> and <strong style={{ color:T.white, fontWeight:600 }}>predicted PRC rating</strong>.</li>
                <li>Read section scores and <strong style={{ color:T.white, fontWeight:600 }}>AI recommendations</strong> to identify specific habits and factors to improve.</li>
                <li><strong style={{ color:T.white, fontWeight:600 }}>Repeat any time</strong> to track progress as your preparation changes.</li>
              </ol>
            </div>
            <div style={{ background:T.navyCard, borderRadius:"18px", padding:"clamp(18px,3vw,26px)", border:`1px solid ${T.borderSub}` }}>
              <p style={{ margin:"0 0 12px", fontSize:"11px", color:T.muted, textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
                For Faculty — How to Use
              </p>
              <ol style={{ margin:0, paddingLeft:"18px", fontSize:"13px", color:"#8da3c0", lineHeight:1.85, fontFamily:"'Inter',sans-serif" }}>
                <li>Select <strong style={{ color:T.white, fontWeight:600 }}>"I'm Faculty"</strong> or <strong style={{ color:T.white, fontWeight:600 }}>Faculty Login</strong> to open the professor view.</li>
                <li>Review <strong style={{ color:T.white, fontWeight:600 }}>Overview</strong> cards (overall pass rate, average GWA/rating) and compare cohorts.</li>
                <li>Inspect <strong style={{ color:T.white, fontWeight:600 }}>strand performance</strong>, <strong style={{ color:T.white, fontWeight:600 }}>survey section scores</strong>, and <strong style={{ color:T.white, fontWeight:600 }}>feature importance</strong>.</li>
                <li>Use the weakest-question list to identify <strong style={{ color:T.white, fontWeight:600 }}>curriculum or support areas</strong> needing interventions.</li>
                <li>Combine insights with traditional measures (grades, board performance) before making academic decisions.</li>
              </ol>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop:"20px", background:"rgba(248,113,113,0.05)", borderRadius:"18px", padding:"20px 24px", border:"1px solid rgba(248,113,113,0.30)", display:"flex", alignItems:"flex-start", gap:"14px" }}>
            <span style={{ fontSize:"20px", marginTop:"2px", flexShrink:0 }}>⚠️</span>
            <div>
              <p style={{ margin:"0 0 6px", fontSize:"12px", fontWeight:700, color:T.fail, fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase", letterSpacing:"0.12em" }}>
                Important Disclaimer
              </p>
              <p style={{ margin:0, fontSize:"13px", color:"#e2e8f0", lineHeight:1.78, fontFamily:"'Inter',sans-serif" }}>
                This system is a <strong style={{ fontWeight:600 }}>research tool</strong> that provides estimates based on historical SLSU data and your self-reported answers. The quality of the prediction depends entirely on the <strong style={{ fontWeight:600 }}>accuracy and honesty</strong> of the information you provide. <strong style={{ fontWeight:600 }}>Random, guessed, or intentionally inaccurate responses can produce unreliable results</strong> that do not reflect your true readiness. Always consult your professors and official university guidance when making final decisions about your board exam preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ══════════════════════════════════════════════════════
          ROLE SELECTOR
      ══════════════════════════════════════════════════════ */}
      <section style={{
        position:"relative", zIndex:1,
        background:T.navyMid,
        borderTop:`1px solid ${T.border}`,
        borderBottom:`1px solid ${T.border}`,
        padding:"clamp(52px,8vw,92px) clamp(16px,5vw,40px)",
      }}>
        <div style={{ maxWidth:"720px", margin:"0 auto", textAlign:"center" }}>
          {/* Logo row */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"20px", marginBottom:"36px", flexWrap:"wrap" }}>
            <div className="lp-logo" style={logoCircleStyle("clamp(52px,6vw,68px)","rgba(245,197,24,0.28)")}>
              <img src={slsuLogo} alt="SLSU" style={{ width:"85%",height:"85%",objectFit:"contain" }} />
            </div>
            <div className="lp-logo lp-logo-mid" style={logoCircleStyle("clamp(48px,5.5vw,62px)","rgba(220,38,38,0.22)")}>
              <img src={slsuLogo1} alt="COE" style={{ width:"85%",height:"85%",objectFit:"contain" }} />
            </div>
            <div className="lp-logo" style={logoCircleStyle("clamp(52px,6vw,68px)","rgba(245,197,24,0.28)")}>
              <img src={slsuLogo2} alt="IIEE" style={{ width:"85%",height:"85%",objectFit:"contain" }} />
            </div>
          </div>

          <p style={{ margin:"0 0 10px", fontSize:"11px", color:T.muted, textTransform:"uppercase", letterSpacing:"0.16em", fontFamily:"'Inter',sans-serif", fontWeight:600 }}>
            Get Started
          </p>
          <h2 className="lp-h2" style={{ margin:"0 0 14px", fontSize:"clamp(24px,4vw,44px)", color:T.white100 }}>
            Choose your role
          </h2>
          <p style={{ margin:"0 0 48px", fontSize:"clamp(13px,1.5vw,15px)", color:"#8da3c0", lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
            Students take the board exam readiness survey and receive an AI prediction.<br />
            Faculty access the institutional insights dashboard with class-wide analytics.
          </p>

          <div className="lp-roles-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px", maxWidth:"540px", margin:"0 auto" }}>
            <button className="lp-role-student" onClick={() => onEnter("student")}
              style={{ padding:"clamp(24px,4vw,38px) clamp(16px,3vw,24px)" }}>
              <div style={{ fontSize:"clamp(30px,4vw,40px)", marginBottom:"14px" }}>🎓</div>
              <p style={{ margin:"0 0 8px", fontSize:"clamp(14px,2vw,17px)", fontWeight:800, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>I'm a Student</p>
              <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.60, fontFamily:"'Inter',sans-serif" }}>Take the AI-powered survey and get your board exam prediction.</p>
            </button>
            <button className="lp-role-faculty" onClick={() => onEnter("professor")}
              style={{ padding:"clamp(24px,4vw,38px) clamp(16px,3vw,24px)" }}>
              <div style={{ fontSize:"clamp(30px,4vw,40px)", marginBottom:"14px" }}>🔬</div>
              <p style={{ margin:"0 0 8px", fontSize:"clamp(14px,2vw,17px)", fontWeight:800, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>I'm Faculty</p>
              <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.60, fontFamily:"'Inter',sans-serif" }}>Access institutional analytics, gap analysis, and model insights.</p>
            </button>
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ══════════════════════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════════════════════ */}
      <section id="contact" style={{
        position:"relative", zIndex:1,
        padding:"clamp(52px,8vw,96px) clamp(16px,5vw,40px)",
        background:T.navy,
        borderTop:`1px solid ${T.border}`,
      }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"120px", height:"2px", background:`linear-gradient(90deg,transparent,${T.gold},transparent)` }} />

        <div style={{ maxWidth:"1120px", margin:"0 auto" }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <p style={{ margin:"0 0 10px", fontSize:"11px", color:T.gold, textTransform:"uppercase", letterSpacing:"0.20em", fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
              Get in Touch
            </p>
            <h2 className="lp-h2" style={{ margin:"0 0 14px", fontSize:"clamp(24px,4vw,44px)", color:T.white100 }}>
              Contact Us
            </h2>
            <div style={{ width:"60px", height:"3px", background:T.gold, borderRadius:"2px", margin:"0 auto" }} />
          </div>

          {/* Contact cards */}
          <div className="lp-contact-top-cards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"24px" }}>
            {[
              { Icon:PhoneIcon,  title:"Phone",    line1:"Contact us through our", line2:"official channels" },
              { Icon:MailIcon,   title:"Email",    line1:"electricalengineering.slsu", line2:"@gmail.com" },
              { Icon:MapPinIcon, title:"Location", line1:"Quezon Avenue, Kulapi,", line2:"Lucban, 4328 Quezon, Philippines" },
            ].map(({ Icon, title, line1, line2 }, i) => (
              <div key={i} className="lp-contact-card" style={{ background:T.navyCard, border:`1px solid ${T.border}`, borderRadius:"18px", padding:"clamp(20px,3vw,28px)", display:"flex", alignItems:"flex-start", gap:"16px", transition:"transform 0.25s, border-color 0.25s, box-shadow 0.25s" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(245,197,24,0.13)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon />
                </div>
                <div>
                  <p style={{ margin:"0 0 6px", fontSize:"16px", fontWeight:700, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>{title}</p>
                  <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.70, fontFamily:"'Inter',sans-serif" }}>{line1}<br />{line2}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Form */}
          <div>
            <div className="lp-action-card" style={{ background:T.navyCard, border:`1px solid ${T.border}`, borderRadius:"20px", padding:"clamp(28px,4vw,44px) clamp(22px,4vw,44px)", transition:"transform 0.25s, border-color 0.25s, box-shadow 0.25s" }}>
              {/* Card header */}
              <div style={{ display:"flex", alignItems:"center", gap:"18px", marginBottom:"32px" }}>
                <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(245,197,24,0.14)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <StarIcon />
                </div>
                <div>
                  <p style={{ margin:"0 0 6px", fontSize:"clamp(17px,2.5vw,22px)", fontWeight:800, color:T.white100, fontFamily:"'Montserrat',sans-serif" }}>
                    Evaluation Form
                  </p>
                  <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", fontFamily:"'Inter',sans-serif", lineHeight:1.6 }}>
                    Share your feedback and help us improve our services. We typically respond within 1–2 business days.
                  </p>
                </div>
              </div>

              {/* Name row */}
              <div className="lp-name-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                {[
                  { key:"fname", label:"First Name", placeholder:"Juan",      type:"text" },
                  { key:"lname", label:"Last Name",  placeholder:"Dela Cruz", type:"text" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input style={fieldBase} type={f.type} placeholder={f.placeholder}
                      value={form.fields[f.key]} onChange={e => form.update(f.key, e.target.value)}
                      onFocus={e  => { e.target.style.borderColor = T.gold; }}
                      onBlur={e   => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }} />
                  </div>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom:"14px" }}>
                <label style={labelStyle}>Email Address</label>
                <input style={fieldBase} type="email" placeholder="you@example.com"
                  value={form.fields.email} onChange={e => form.update("email", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = T.gold; }}
                  onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }} />
              </div>

              {/* Role + Subject row */}
              <div className="lp-field-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                <div>
                  <label style={labelStyle}>I am a…</label>
                  <select style={{ ...fieldBase, appearance:"none", cursor:"pointer", color: form.fields.role ? T.white100 : "#64748B" }}
                    value={form.fields.role} onChange={e => form.update("role", e.target.value)}
                    onFocus={e => { e.target.style.borderColor = T.gold; }}
                    onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }}>
                    <option value="" disabled>Select your role</option>
                    <option value="student">Student — EE Board Exam Examinee</option>
                    <option value="faculty">Faculty — SLSU College of Engineering</option>
                    <option value="researcher">Researcher / Collaborator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select style={{ ...fieldBase, appearance:"none", cursor:"pointer", color: form.fields.subject ? T.white100 : "#64748B" }}
                    value={form.fields.subject} onChange={e => form.update("subject", e.target.value)}
                    onFocus={e => { e.target.style.borderColor = T.gold; }}
                    onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }}>
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

              {/* Message */}
              <div style={{ marginBottom:"6px" }}>
                <label style={labelStyle}>Message</label>
                <textarea style={{ ...fieldBase, resize:"vertical", minHeight:"120px", lineHeight:1.65 }}
                  placeholder="Write your message here…" maxLength={CHAR_MAX}
                  value={form.fields.message} onChange={e => form.update("message", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = T.gold; }}
                  onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }} />
              </div>
              <p style={{ margin:"0 0 18px", fontSize:"11px", color:T.dim, textAlign:"right", fontFamily:"'Inter',sans-serif" }}>
                {form.fields.message.length} / {CHAR_MAX}
              </p>

              {/* Error */}
              {form.error && (
                <div style={{ marginBottom:"14px", padding:"12px 16px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.28)", borderRadius:"10px", fontSize:"13px", color:T.fail, fontFamily:"'Inter',sans-serif" }}>
                  {form.error}
                </div>
              )}

              {/* Footer row */}
              <div className="lp-form-footer" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", flexWrap:"wrap" }}>
                <p style={{ fontSize:"12px", color:T.dim, lineHeight:1.65, flex:1, minWidth:"180px", fontFamily:"'Inter',sans-serif" }}>
                  Your information is used only to respond to your inquiry and will not be shared with third parties.
                </p>
                <button className="lp-send-btn" onClick={form.submit}>
                  <PencilIcon /> Submit Evaluation
                </button>
              </div>

              {/* Success */}
              {form.submitted && (
                <div style={{ marginTop:"16px", display:"flex", alignItems:"center", gap:"12px", background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.28)", borderRadius:"12px", padding:"14px 18px" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <p style={{ margin:0, fontSize:"13px", color:T.pass, fontWeight:600, fontFamily:"'Inter',sans-serif" }}>
                    Message sent! We'll get back to you within 1–2 business days.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div style={accentBarStyle} />

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ position:"relative", zIndex:1, background:T.navyMid, borderTop:`1px solid ${T.border}` }}>
        <div className="lp-footer-grid" style={{
          maxWidth:"1120px", margin:"0 auto",
          padding:"clamp(40px,5vw,60px) clamp(16px,5vw,40px) 0",
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:"clamp(28px,4vw,52px)",
        }}>
          {/* Col 1 */}
          <div>
            <p style={{ margin:"0 0 10px", fontSize:"16px", fontWeight:800, color:T.gold, fontFamily:"'Montserrat',sans-serif", letterSpacing:"-0.02em" }}>
              SLSU EE Licensure Predictor
            </p>
            <p style={{ margin:0, fontSize:"13px", color:"#8da3c0", lineHeight:1.75, fontFamily:"'Inter',sans-serif" }}>
              Tracking excellence, celebrating success.
            </p>
          </div>
          {/* Col 2 */}
          <div>
            <p style={{ margin:"0 0 18px", fontSize:"14px", fontWeight:700, color:T.gold, fontFamily:"'Montserrat',sans-serif" }}>
              Quick Links
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {navLinks.map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)}
                  style={{ background:"none", border:"none", padding:0, textAlign:"left", cursor:"pointer", fontSize:"14px", color:"#8da3c0", fontFamily:"'Inter',sans-serif", fontWeight:500, transition:"color 0.2s" }}
                  onMouseEnter={e => { e.target.style.color = T.white100; }}
                  onMouseLeave={e => { e.target.style.color = "#8da3c0"; }}>
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          {/* Col 3 */}
          <div>
            <p style={{ margin:"0 0 18px", fontSize:"14px", fontWeight:700, color:T.gold, fontFamily:"'Montserrat',sans-serif" }}>
              Connect
            </p>
            <div style={{ display:"flex", gap:"10px" }}>
              {[
                { Icon:FacebookIcon,   label:"Facebook" },
                { Icon:EmailSocialIcon, label:"Email"   },
              ].map(({ Icon, label }) => (
                <button key={label} aria-label={label}
                  style={{ width:"42px", height:"42px", borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:`1px solid ${T.borderSub}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:T.muted, transition:"background 0.2s, border-color 0.2s, color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(245,197,24,0.12)"; e.currentTarget.style.borderColor=T.goldBorder; e.currentTarget.style.color=T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor=T.borderSub; e.currentTarget.style.color=T.muted; }}>
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ maxWidth:"1120px", margin:"0 auto", padding:"clamp(22px,3vw,32px) clamp(16px,5vw,40px)", borderTop:`1px solid ${T.border}`, marginTop:"clamp(32px,4vw,48px)", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:"13px", color:T.muted, fontFamily:"'Inter',sans-serif" }}>
            © 2026 Southern Luzon State University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}