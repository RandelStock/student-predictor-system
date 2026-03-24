import { useState, useEffect } from "react";

// ─── Colour tokens (SLSU IIEE palette) ───────────────────────────────────────
const T = {
  navy:      "#07102B",
  navyMid:   "#0D1B3E",
  navyCard:  "#112250",
  navyHover: "#162B60",
  gold:      "#F5C518",
  goldDim:   "#C9A010",
  goldGlow:  "rgba(245,197,24,0.18)",
  blue:      "#38BDF8",
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
      { id: "model_overview", icon: "🧭", label: "Overview"           },
      { id: "performance",    icon: "📈", label: "Performance"        },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "features",     icon: "🤖", label: "Feature Importance"  },
      { id: "curriculum",   icon: "🏫", label: "Curriculum Gaps"     },
      { id: "correlation",  icon: "🧮", label: "Correlation"         },
    ],
  },
  {
    label: "Metrics",
    items: [
      { id: "classification_metrics", icon: "🎯", label: "Classification" },
      { id: "regression_metrics",     icon: "📐", label: "Regression"     },
    ],
  },
  {
    label: "Defense & Ops",
    items: [
      { id: "test2025", icon: "🧪", label: "2025 Defense"        },
      { id: "trends",   icon: "📅", label: "Trends & Monitoring" },
    ],
  },
];

function labelFor(id) {
  for (const g of NAV_GROUPS) {
    const found = g.items.find(i => i.id === id);
    if (found) return found.label;
  }
  return id;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, onRefresh, onLogout, collapsed, setCollapsed, mobileOpen, setMobileOpen, windowWidth }) {
  const isCollapsed = collapsed && !mobileOpen;
  const isMobile = windowWidth < 768;

  return (
    <>
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
        transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}>
        {/* Logo / brand */}
        <div style={{
          padding: isCollapsed ? "14px 0" : "14px 12px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "flex-start",
          gap: 8,
          minHeight: isCollapsed ? 72 : "auto",
          justifyContent: "center",
        }}>
          {/* Faculty Portal badge — top */}
          {!isCollapsed && (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.28)",
              borderRadius: 999,
              padding: "5px 10px",
              alignSelf: "flex-start",
            }}>
              <span style={{ fontSize: 11 }}>🔬</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", fontFamily: "'DM Sans',sans-serif" }}>Faculty Portal</span>
            </div>
          )}

          {/* Logo circles row */}
          <div style={{ display: "flex", gap: isCollapsed ? 0 : 5, flexShrink: 0, flexDirection: isCollapsed ? "column" : "row", alignItems: "center" }}>
            {[
              { src: "/slsulogo.png",  glow: "rgba(14,165,233,0.25)"  },
              { src: "/slsulogo1.png", glow: "rgba(220,38,38,0.22)"   },
              { src: "/slsulogo2.png", glow: "rgba(251,191,36,0.25)"  },
            ].map((logo, i) => (
              <div key={i} style={{
                width: isCollapsed ? 32 : 26,
                height: isCollapsed ? 32 : 26,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.13)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: `0 0 8px ${logo.glow}`,
                marginBottom: isCollapsed ? 4 : 0,
              }}>
                <img src={logo.src} alt="" style={{ width: "85%", height: "85%", objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </div>

          {/* SLSU IIEE label */}
          {!isCollapsed && (
            <p style={{ margin: 0, fontSize: 9, color: T.dimText, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>
              SLSU IIEE
            </p>
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
          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(c => !c)}
              style={actionBtnStyle(isCollapsed)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span style={{ fontSize: 14, color: T.muted }}>{isCollapsed ? "»" : "«"}</span>
              {!isCollapsed && <span style={{ fontSize: 11, color: T.muted }}>Collapse</span>}
            </button>
          )}

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
function Topbar({ activeTab, setMobileOpen }) {
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
          display: "none",
        }}
        className="hud-hamburger"
      >☰</button>

      <div>
        <p style={{ margin: 0, fontSize: 10, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
          {labelFor(activeTab)}
        </p>
      </div>
    </header>
  );
}

// ─── Main exported wrapper ────────────────────────────────────────────────────
export default function ProfessorSidebarLayout({
  activeTab,
  onTabChange,
  onRefresh,
  onLogout,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;

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

        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}
        ::-webkit-scrollbar-thumb{background:rgba(245,197,24,0.2);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(245,197,24,0.4)}

        .recharts-cartesian-grid line { stroke: rgba(255,255,255,0.05) !important; }
        .recharts-text { fill: #64748b !important; font-family:'DM Sans',sans-serif !important; font-size:11px !important; }
        .recharts-legend-item-text { color:#94a3b8 !important; }
        .recharts-tooltip-wrapper { filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5)); }

        .att-table { width:100%; border-collapse:collapse; font-size:12px; font-family:'DM Sans',sans-serif; }
        .att-table th { padding:10px 12px; border-bottom:1px solid rgba(245,197,24,0.1); text-align:left; color:${T.gold}; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; font-size:10px; }
        .att-table td { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.05); color:${T.muted}; }
        .att-table tr:hover td { background:rgba(245,197,24,0.03); }

        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:7px 11px; color:${T.white}; font-size:12px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .filter-input:focus { border-color:rgba(245,197,24,0.45); }

        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }

        .prof-ui p { color:#dbeafe; font-size:14px; line-height:1.6; }
        .prof-ui td,.prof-ui th { color:#dbeafe; font-size:13px; }
        .prof-ui label { color:${T.muted}; font-size:13px; }

        @media(max-width:767px){
          .hud-hamburger { display:flex !important; }
          .dash-grid { grid-template-columns:1fr !important; }
          .hud-content { margin-left:0 !important; }
        }
        @media(max-width:640px){
          .dash-grid { grid-template-columns:1fr !important; }
        }

        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .gold-line { width:32px; height:3px; background:${T.gold}; border-radius:2px; }
        .hud-card { transition: border-color 0.18s, box-shadow 0.18s; }
        .hud-card:hover { border-color: rgba(245,197,24,0.25) !important; box-shadow: 0 0 0 1px rgba(245,197,24,0.1), 0 8px 24px rgba(0,0,0,0.35) !important; }
      `}</style>

      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onRefresh={onRefresh}
        onLogout={onLogout}
        collapsed={effectiveCollapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        windowWidth={windowWidth}
      />

      <div className="hud-content" style={{ marginLeft: sidebarWidth }}>
        {/* Mobile topbar only */}
        <Topbar activeTab={activeTab} setMobileOpen={setMobileOpen} />

        {/* ✅ Page header banner REMOVED as requested */}

        {/* Dashboard content */}
        <main style={{ padding: "20px 28px 80px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════
 *  ✅ FIX FOR WHITE SCREEN — ProfessorPage.jsx
 * ══════════════════════════════════════════════════════════════════
 *
 *  The white screen happens because the old code had:
 *    {!loading && data && (...tab content...)}
 *
 *  The `data` object only covers some tabs. For tabs like
 *  correlation, classification_metrics, regression_metrics,
 *  test2025, and trends — their props come from SEPARATE fetches,
 *  not from the main `data` object. So `data` is falsy → blank screen.
 *
 *  SOLUTION — replace your render block in ProfessorPage.jsx with:
 *
 *  return (
 *    <ProfessorSidebarLayout
 *      activeTab={activeTab}
 *      onTabChange={setActiveTab}
 *      onRefresh={fetchAnalytics}
 *      onLogout={onLogout}
 *    >
 *      {loading && <LoadingSpinner />}
 *
 *      {!loading && (                          // ← REMOVE "&& data" from here
 *        <>
 *          {activeTab === "model_overview"         && <ModelOverviewDashboard         {...props} />}
 *          {activeTab === "performance"            && <ProfessorPerformanceDashboard  {...props} />}
 *          {activeTab === "features"               && <ProfessorFeaturesDashboard     {...props} />}
 *          {activeTab === "curriculum"             && <ProfessorCurriculumDashboard   {...props} />}
 *          {activeTab === "correlation"            && <ProfessorCorrelationDashboard  correlation={correlation} />}
 *          {activeTab === "classification_metrics" && <ProfessorClassificationMetricsDashboard modelInfo={modelInfo} />}
 *          {activeTab === "regression_metrics"     && <ProfessorRegressionMetricsDashboard     modelInfo={modelInfo} />}
 *          {activeTab === "test2025"               && <ProfessorTest2025Dashboard     {...test2025Props} />}
 *          {activeTab === "trends"                 && <ProfessorTrendsDashboard       {...trendsProps} />}
 *        </>
 *      )}
 *    </ProfessorSidebarLayout>
 *  );
 *
 *  Each child dashboard already handles missing data gracefully
 *  with optional chaining (?.) and "—" fallbacks, so removing
 *  the `&& data` gate is safe.
 */