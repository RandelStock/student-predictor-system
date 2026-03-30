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
          {/* Faculty Portal badge */}
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
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", fontFamily: "'Inter',sans-serif" }}>Faculty Portal</span>
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
            <p style={{ margin: 0, fontSize: 11, color: T.dimText, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter',sans-serif" }}>
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
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.dimText,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'Montserrat',sans-serif",
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
                      fontFamily: "'Inter',sans-serif",
                      fontSize: isCollapsed ? "12px" : "13px",
                      fontWeight: active ? 600 : 400,
                      minHeight: isMobile ? "44px" : "36px",
                      color: active ? T.gold : T.muted,
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
                        fontWeight: active ? 700 : 500,
                        color: active ? T.gold : T.muted,
                        whiteSpace: "nowrap",
                        transition: "color 0.18s",
                        fontFamily: "'Inter',sans-serif",
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
  fontFamily: "'Inter',sans-serif",
});

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
    <div style={{ minHeight: "100vh", background: T.navy, fontFamily: "'Inter',system-ui,sans-serif", color: T.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

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
        .recharts-text { fill: #64748b !important; font-family:'Inter',sans-serif !important; font-size:11px !important; }
        .recharts-legend-item-text { color:#94a3b8 !important; font-family:'Inter',sans-serif !important; }
        .recharts-tooltip-wrapper { filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5)); }

        .att-table { width:100%; border-collapse:collapse; font-size:13px; font-family:'Inter',sans-serif; }
        .att-table th { padding:12px; border-bottom:1px solid rgba(245,197,24,0.1); text-align:left; color:#F5C518; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; font-size:12px; font-family:'Montserrat',sans-serif; }
        .att-table td { padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#94A3B8; font-family:'Inter',sans-serif; }
        .att-table tr:hover td { background:rgba(245,197,24,0.03); }

        .filter-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px 12px; color:#F1F5F9; font-size:14px; font-family:'Inter',sans-serif; outline:none; transition:border-color 0.2s; }
        .filter-input:focus { border-color:rgba(245,197,24,0.45); background:rgba(255,255,255,0.08); }

        .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }

        .prof-ui p { color:#dbeafe; font-size:15px; line-height:1.6; font-family:'Inter',sans-serif; }
        .prof-ui td,.prof-ui th { color:#dbeafe; font-size:14px; font-family:'Inter',sans-serif; }
        .prof-ui label { color:#94A3B8; font-size:14px; font-family:'Inter',sans-serif; }

        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
        .gold-line { width:32px; height:3px; background:#F5C518; border-radius:2px; }
        .hud-card { transition: border-color 0.18s, box-shadow 0.18s; }
        .hud-card:hover { border-color: rgba(245,197,24,0.25) !important; box-shadow: 0 0 0 1px rgba(245,197,24,0.1), 0 8px 24px rgba(0,0,0,0.35) !important; }

        /* ── Mobile hamburger button — only visible on mobile ── */
        .hud-hamburger { display: none; }

        /* ─── Mobile Responsiveness ─── */
        @media(max-width:768px){
          .hud-hamburger { display:flex !important; }
          .dash-grid { grid-template-columns:1fr !important; gap:12px; }
          .hud-content { margin-left:0 !important; }
          main { padding:16px 16px 80px !important; }
          .prof-ui p { font-size:14px; }
          .prof-ui td,.prof-ui th { font-size:13px; }
          .att-table th { padding:10px; font-size:11px; }
          .att-table td { padding:10px; font-size:12px; }
          .filter-input { font-size:13px; padding:7px 10px; }
        }

        @media(max-width:640px){
          .dash-grid { grid-template-columns:1fr !important; gap:10px; }
          main { padding:12px 12px 60px !important; }
          .prof-ui p { font-size:13px; line-height:1.5; }
          .prof-ui td,.prof-ui th { font-size:12px; }
          .att-table { font-size:12px; }
          .att-table th { padding:8px; font-size:10px; }
          .att-table td { padding:8px; font-size:11px; }
          .filter-input { font-size:12px; padding:6px 8px; }
          .recharts-text { font-size:10px !important; }
          h2 { font-size:22px !important; }
          h3 { font-size:18px !important; }
        }

        @media(max-width:480px){
          .dash-grid { grid-template-columns:1fr !important; gap:8px; }
          main { padding:10px 10px 50px !important; }
          .prof-ui p { font-size:12px; }
          .prof-ui td,.prof-ui th { font-size:11px; }
          .att-table { font-size:11px; }
          .att-table th { padding:6px; font-size:9px; }
          .att-table td { padding:6px; font-size:10px; }
          .filter-input { font-size:11px; }
          .recharts-text { font-size:9px !important; }
          h2 { font-size:18px !important; }
          h3 { font-size:16px !important; }
        }
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

      {/* Mobile-only hamburger button — floats top-left, no topbar */}
      {isMobile && (
        <button
          className="hud-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 97,
            background: T.navyMid,
            border: `1px solid ${T.borderSub}`,
            borderRadius: 8,
            padding: "6px 9px",
            color: T.muted,
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            minWidth: "44px",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ☰
        </button>
      )}

      <div className="hud-content" style={{ marginLeft: sidebarWidth }}>
        {/* Dashboard content — no topbar, content starts immediately */}
        <main style={{
          padding: isMobile ? "64px 12px 80px" : "20px 28px 80px",
          maxWidth: "100%",
          overflowX: "hidden",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}