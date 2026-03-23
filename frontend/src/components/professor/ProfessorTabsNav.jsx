import { c } from "./ProfessorShared";

export default function ProfessorTabsNav({ activeTab, tabs, onTabChange, onRefresh, onLogout }) {
  return (
    <>
      {/* ══ STICKY TOP NAV ══ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6,11,20,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["/slsulogo.png", "/slsulogo1.png", "/slsulogo2.png"].map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={`Logo ${idx + 1}`}
                style={{ width: 32, height: 32, objectFit: "contain", opacity: 0.95 }}
              />
            ))}
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 14 }}>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "0.01em",
                fontFamily: "'Syne',sans-serif",
              }}
            >
              Insights Dashboard
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Faculty Portal · SLSU IIEE
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onRefresh}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              padding: "8px 16px",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans',sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.blue)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            ↻ Refresh
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.22)",
              borderRadius: 999,
              padding: "7px 14px",
            }}
          >
            <span style={{ fontSize: 13 }}>🔬</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>Faculty</span>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              padding: "8px 18px",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans',sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = c.fail;
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ══ TAB BAR ══ */}
      <div
        style={{
          background: "rgba(6,11,20,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "0 20px",
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="tab-btn"
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "15px 18px",
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? c.blue : "#475569",
              borderBottom: `2px solid ${activeTab === tab.id ? c.blue : "transparent"}`,
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ marginRight: 5 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}

