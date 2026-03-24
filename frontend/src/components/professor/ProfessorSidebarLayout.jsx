/**
 * ProfessorSidebarLayout.jsx
 *
 * DROP-IN REPLACEMENT for ProfessorPage's outer shell.
 * - Replaces the top nav + tab-bar with a fixed HUD sidebar (left)
 * - Preserves ALL existing dashboard tabs / logic / state — unchanged
 * - Uses the SLSU deep-blue + gold palette from the IIEE banner image
 * - Responsive: desktop = fixed sidebar | tablet = icon-only | mobile = drawer
 *
 * HOW TO USE
 * ----------
 * Replace the <nav> + tab-bar JSX inside ProfessorPage.jsx with:
 *
 *   import ProfessorSidebarLayout from "./professor/ProfessorSidebarLayout";
 *
 *   // wrap your <main> content:
 *   return (
 *     <ProfessorSidebarLayout
 *       activeTab={activeTab}
 *       tabs={TABS}
 *       onTabChange={setActiveTab}
 *       onRefresh={fetchAnalytics}
 *       onLogout={onLogout}
 *       dashFilters={dashFilters}
 *       setDashFilters={setDashFilters}s
 *       availableYears={availableYears}
 *     >
 *       {/* your existing <main> content goes here *\/}
 *     </ProfessorSidebarLayout>
 *   );
 */

import { useState, useEffect } from "react";

// ─── Colour tokens (SLSU IIEE palette) ───────────────────────────────────────
const T = {
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

// ─── Sidebar navigation groups ────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Analytics",
    items: [
      { id: "model_overview",         icon: "🧭", label: "Model Overview"       },
      { id: "overview",               icon: "📊", label: "Overview"             },
      { id: "performance",            icon: "📈", label: "Performance"          },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "features",               icon: "🤖", label: "Feature Importance"   },
      { id: "curriculum",             icon: "🏫", label: "Curriculum Gaps"      },
      { id: "correlation",            icon: "🧮", label: "Correlation"          },
    ],
  },
  {
    label: "Metrics",
    items: [
      { id: "classification_metrics", icon: "🎯", label: "Classification"       },
      { id: "regression_metrics",     icon: "📐", label: "Regression"           },
    ],
  },
  {
    label: "Defense & Ops",
    items: [
      { id: "test2025",               icon: "🧪", label: "2025 Defense"         },
      { id: "trends",                 icon: "📅", label: "Trends & Monitoring"  },
    ],
  },
];

// ─── TAB_DESCRIPTIONS (same as original ProfessorPage) ───────────────────────
const TAB_DESCRIPTIONS = {
  model_overview:         "Comprehensive model analysis: data patterns, reliability, correlations, and curriculum-linked insights.",
  overview:               "Institution-level snapshot of outcomes, pass/fail distribution, review participation, and key KPI trends.",
  performance:            "Detailed performance breakdown by strand, survey sections, and subject-score movement over time.",
  features:               "Top model predictors ranked by importance — which factors most influence pass/fail outcomes.",
  curriculum:             "Curriculum gap view of weakest survey indicators to help prioritize intervention areas.",
  classification_metrics: "Accuracy, precision, recall, F1, and CV results for pass/fail prediction.",
  regression_metrics:     "MAE, RMSE, and R² comparisons for score prediction models.",
  correlation:            "Correlation matrix of major variables — strength and direction of academic relationships.",
  test2025:               "Held-out 2025 defense evaluation: generalization metrics, confusion matrix, and row-level checks.",
  trends:                 "Live operational monitoring: usage, yearly/monthly outcomes, timing behavior, and recent attempts.",
};

// ─── Helper: get flat label for a tab id ─────────────────────────────────────
function labelFor(id) {
  for (const g of NAV_GROUPS) {
    const found = g.items.find(i => i.id === id);
    if (found) return found.label;
  }
  return id;
}

// ─── FilterPanel ─────────────────────────────────────────────────────────────
function FilterPanel({ dashFilters, setDashFilters, availableYears }) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const sel = (key, val) => setDashFilters(f => ({ ...f, [key]: val === f[key] ? "" : val }));

  return (
    <div style={{
      background: T.navyCard,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "14px 18px",
      marginBottom: 20,
      display: "flex",
      flexWrap: "wrap",
      gap: 14,
      alignItems: "center",
    }}>
      {/* Year */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
        <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Year</span>
        <select
          value={dashFilters.year}
          onChange={e => setDashFilters(f => ({ ...f, year: e.target.value }))}
          style={selectStyle}
        >
          <option value="">All Years</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Month */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
        <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Month</span>
        <select
          value={dashFilters.month}
          onChange={e => setDashFilters(f => ({ ...f, month: e.target.value }))}
          style={selectStyle}
        >
          <option value="">All Months</option>
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {/* Review toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Formal Review</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["Yes", "No"].map(v => (
            <button
              key={v}
              onClick={() => sel("review", v)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${dashFilters.review === v ? T.gold : T.borderSub}`,
                background: dashFilters.review === v ? T.goldGlow : "transparent",
                color: dashFilters.review === v ? T.gold : T.muted,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(dashFilters.year || dashFilters.month || dashFilters.review) && (
        <button
          onClick={() => setDashFilters({ year: "", month: "", review: "", subject: "" })}
          style={{
            marginLeft: "auto",
            padding: "7px 16px",
            borderRadius: 8,
            border: `1px solid ${T.borderSub}`,
            background: "transparent",
            color: T.dimText,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.fail; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.dimText; e.currentTarget.style.borderColor = T.borderSub; }}
        >✕ Clear filters</button>
      )}
    </div>
  );
}

const selectStyle = {
  background: T.navyHover,
  border: `1px solid ${T.borderSub}`,
  borderRadius: 8,
  padding: "7px 11px",
  color: T.white,
  fontSize: 12,
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  cursor: "pointer",
  minWidth: 120,
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, onRefresh, onLogout, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const isCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 98,
            background: "rgba(7,16,43,0.7)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <aside style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 99,
        width: isCollapsed ? 68 : 240,
        background: T.navyMid,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(.4,0,.2,1), transform 0.28s cubic-bezier(.4,0,.2,1)",
        // Mobile: slide in/out
        transform: window.innerWidth < 768 && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}>
        {/* Logo / brand */}
        <div style={{
          padding: isCollapsed ? "18px 0" : "18px 16px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: isCollapsed ? "center" : "flex-start",
          minHeight: 72,
        }}>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {["/slsulogo.png", "/slsulogo1.png", "/slsulogo2.png"].map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
            ))}
          </div>
          {!isCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.white, fontFamily: "'Syne',sans-serif", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                Insights HUD
              </p>
              <p style={{ margin: 0, fontSize: 9, color: T.dimText, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                SLSU IIEE · Faculty
              </p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: isCollapsed ? "12px 6px" : "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!isCollapsed && (
                <p style={{
                  margin: "10px 6px 4px",
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.dimText,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  {group.label}
                </p>
              )}
              {isCollapsed && <div style={{ height: 8 }} />}
              {group.items.map(item => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                    title={isCollapsed ? item.label : undefined}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: isCollapsed ? "10px 0" : "9px 12px",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      borderRadius: 10,
                      border: active ? `1px solid ${T.border}` : "1px solid transparent",
                      background: active ? T.goldGlow : "transparent",
                      cursor: "pointer",
                      transition: "all 0.18s",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = T.navyHover;
                        e.currentTarget.style.borderColor = T.borderSub;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    {!isCollapsed && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: active ? 700 : 400,
                        color: active ? T.gold : T.muted,
                        whiteSpace: "nowrap",
                        transition: "color 0.18s",
                      }}>
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && active && (
                      <span style={{
                        marginLeft: "auto",
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: T.gold,
                        flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{
          padding: isCollapsed ? "12px 6px" : "12px 10px",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              ...actionBtnStyle(isCollapsed),
              display: window.innerWidth < 768 ? "none" : "flex",
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span style={{ fontSize: 14 }}>{isCollapsed ? "»" : "«"}</span>
            {!isCollapsed && <span style={{ fontSize: 11, color: T.muted }}>Collapse</span>}
          </button>

          <button onClick={onRefresh} style={actionBtnStyle(isCollapsed)} title="Refresh data">
            <span style={{ fontSize: 14, color: T.blue }}>↻</span>
            {!isCollapsed && <span style={{ fontSize: 11, color: T.muted }}>Refresh</span>}
          </button>

          <button
            onClick={onLogout}
            style={actionBtnStyle(isCollapsed)}
            title="Sign out"
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSub; }}
          >
            <span style={{ fontSize: 14, color: T.fail }}>⏻</span>
            {!isCollapsed && <span style={{ fontSize: 11, color: T.fail }}>Sign Out</span>}
          </button>

          {/* Faculty badge */}
          {!isCollapsed && (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.22)",
              borderRadius: 999,
              padding: "7px 12px",
              marginTop: 4,
            }}>
              <span style={{ fontSize: 12 }}>🔬</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>Faculty Portal</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

const actionBtnStyle = (collapsed) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: collapsed ? "10px 0" : "9px 12px",
  justifyContent: collapsed ? "center" : "flex-start",
  borderRadius: 10,
  border: `1px solid ${T.borderSub}`,
  background: "transparent",
  cursor: "pointer",
  transition: "all 0.18s",
  fontFamily: "'DM Sans',sans-serif",
});

// ─── Topbar (mobile hamburger + breadcrumb) ───────────────────────────────────
function Topbar({ activeTab, mobileOpen, setMobileOpen }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(7,16,43,0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${T.border}`,
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      {/* Hamburger (mobile only) */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        style={{
          background: "transparent",
          border: `1px solid ${T.borderSub}`,
          borderRadius: 8,
          padding: "6px 9px",
          color: T.muted,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          display: "none", // shown via CSS below
        }}
        className="hud-hamburger"
      >☰</button>

      {/* Breadcrumb */}
      <div>
        <p style={{ margin: 0, fontSize: 10, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
          {labelFor(activeTab)}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: T.dimText, lineHeight: 1.4 }}>
          {TAB_DESCRIPTIONS[activeTab]?.slice(0, 80)}…
        </p>
      </div>
    </header>
  );
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export default function ProfessorSidebarLayout({
  activeTab,
  tabs,
  onTabChange,
  onRefresh,
  onLogout,
  dashFilters,
  setDashFilters,
  availableYears = [],
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;

  // On tablet auto-collapse sidebar
  const effectiveCollapsed = collapsed || isTablet;
  const sidebarWidth = isMobile ? 0 : (effectiveCollapsed ? 68 : 240);

  return (
    <div style={{ minHeight: "100vh", background: T.navy, fontFamily: "'DM Sans',system-ui,sans-serif", color: T.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes goldPop { 0%{box-shadow:0 0 0 0 rgba(245,197,24,.35)} 70%{box-shadow:0 0 0 10px rgba(245,197,24,0)} 100%{box-shadow:0 0 0 0 rgba(245,197,24,0)} }

        .fade-in { animation: fadeUp 0.38s ease; }
        .hud-content { transition: margin-left 0.28s cubic-bezier(.4,0,.2,1); }

        /* Scrollbar */
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}
        ::-webkit-scrollbar-thumb{background:rgba(245,197,24,0.2);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(245,197,24,0.4)}

        /* Recharts overrides */
        .recharts-cartesian-grid line { stroke: rgba(255,255,255,0.05) !important; }
        .recharts-text { fill: #64748b !important; font-family:'DM Sans',sans-serif !important; font-size:11px !important; }
        .recharts-legend-item-text { color:#94a3b8 !important; }
        .recharts-tooltip-wrapper { filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5)); }

        /* Table styles */
        .att-table { width:100%; border-collapse:collapse; font-size:12px; font-family:'DM Sans',sans-serif; }
        .att-table th { padding:10px 12px; border-bottom:1px solid rgba(245,197,24,0.1); text-align:left; color:${T.gold}; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; font-size:10px; }
        .att-table td { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.05); color:${T.muted}; }
        .att-table tr:hover td { background:rgba(245,197,24,0.03); }

        /* Filter inputs */
        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:7px 11px; color:${T.white}; font-size:12px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .filter-input:focus { border-color:rgba(245,197,24,0.45); }

        /* Dashboard grid */
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }

        /* Prose */
        .prof-ui p { color:#dbeafe; font-size:14px; line-height:1.6; }
        .prof-ui td,.prof-ui th { color:#dbeafe; font-size:13px; }
        .prof-ui label { color:${T.muted}; font-size:13px; }

        /* Mobile */
        @media(max-width:767px){
          .hud-hamburger { display:flex !important; }
          .dash-grid { grid-template-columns:1fr !important; }
          .hud-content { margin-left:0 !important; }
        }
        @media(max-width:640px){
          .dash-grid { grid-template-columns:1fr !important; }
        }

        /* Tab btn (kept for sub-components that might use it) */
        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }

        /* Gold accent line */
        .gold-line { width:32px; height:3px; background:${T.gold}; border-radius:2px; }

        /* Card hover */
        .hud-card { transition: border-color 0.18s, box-shadow 0.18s; }
        .hud-card:hover { border-color: rgba(245,197,24,0.25) !important; box-shadow: 0 0 0 1px rgba(245,197,24,0.1), 0 8px 24px rgba(0,0,0,0.35) !important; }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onRefresh={onRefresh}
        onLogout={onLogout}
        collapsed={effectiveCollapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Content area */}
      <div
        className="hud-content"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Mobile / tablet topbar */}
        <Topbar activeTab={activeTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Page header banner */}
        <div style={{
          background: `linear-gradient(135deg, ${T.navyMid} 0%, ${T.navy} 100%)`,
          borderBottom: `1px solid ${T.border}`,
          padding: "22px 28px 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
              Faculty Portal · SLSU IIEE
            </p>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 800,
              color: T.white,
              fontFamily: "'Syne',sans-serif",
              letterSpacing: "0.01em",
              lineHeight: 1.15,
            }}>
              {labelFor(activeTab)}
            </h1>
            <div className="gold-line" style={{ marginTop: 8 }} />
          </div>

          {/* Quick stats pill */}
          <div style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}>
            {[
              { label: "Live Data", dot: T.pass },
              { label: "ML-Powered", dot: T.blue },
              { label: "SLSU 2025", dot: T.gold },
            ].map(p => (
              <div key={p.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${T.borderSub}`,
                borderRadius: 999,
                padding: "5px 12px",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: "0.07em" }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {dashFilters !== undefined && (
          <div style={{ padding: "18px 28px 0" }}>
            <FilterPanel
              dashFilters={dashFilters}
              setDashFilters={setDashFilters}
              availableYears={availableYears}
            />
          </div>
        )}

        {/* Tab description card */}
        <div style={{ padding: "0 28px" }}>
          <div
            className="fade-in"
            style={{
              marginBottom: 18,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(245,197,24,0.06)",
              border: `1px solid rgba(245,197,24,0.18)`,
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
              <span style={{ color: T.gold, fontWeight: 700 }}>{labelFor(activeTab)} · </span>
              {TAB_DESCRIPTIONS[activeTab] || "Dashboard view."}
            </p>
          </div>
        </div>

        {/* Dashboard children content */}
        <main style={{ padding: "0 28px 80px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  USAGE — replace the return statement in ProfessorPage.jsx:
 * ═══════════════════════════════════════════════════════════════
 *
 *  import ProfessorSidebarLayout from "./professor/ProfessorSidebarLayout";
 *
 *  return (
 *    <ProfessorSidebarLayout
 *      activeTab={activeTab}
 *      tabs={TABS}
 *      onTabChange={setActiveTab}
 *      onRefresh={fetchAnalytics}
 *      onLogout={onLogout}
 *      dashFilters={dashFilters}
 *      setDashFilters={setDashFilters}
 *      availableYears={availableYears}
 *    >
 *      {loading && <LoadingSpinner />}
 *
 *      {!loading && data && (
 *        <>
 *          {activeTab === "model_overview"         && <ModelOverviewDashboard         {...props} />}
 *          {activeTab === "overview"               && <ProfessorOverviewDashboard     {...props} />}
 *          {activeTab === "performance"            && <ProfessorPerformanceDashboard  {...props} />}
 *          {activeTab === "features"               && <ProfessorFeaturesDashboard     {...props} />}
 *          {activeTab === "curriculum"             && <ProfessorCurriculumDashboard   {...props} />}
 *          {activeTab === "classification_metrics" && <ProfessorClassificationMetricsDashboard {...props} />}
 *          {activeTab === "regression_metrics"     && <ProfessorRegressionMetricsDashboard     {...props} />}
 *          {activeTab === "correlation"            && <ProfessorCorrelationDashboard  {...props} />}
 *          {activeTab === "test2025"               && <ProfessorTest2025Dashboard     {...props} />}
 *          {activeTab === "trends"                 && <ProfessorTrendsDashboard       {...props} />}
 *        </>
 *      )}
 *    </ProfessorSidebarLayout>
 *  );
 *
 *  NOTE: Remove the old <ProfessorTabsNav> and its <style> block.
 *        Keep ALL state, fetch logic, and child component props exactly as-is.
 */