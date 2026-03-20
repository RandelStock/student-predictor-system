import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function LoginPage({ role, onSuccess, onBack }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const isProfessor = role === "professor";

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in name, email, and password.");
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name, email, password, role, student_id: role === "student" ? email : undefined }
        : { email, password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Unable to sign in. Please try again.");
      }

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.name) localStorage.setItem("name", data.name);
        onSuccess(data.role || role);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060b14",
      fontFamily: "'Syne', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .login-card { animation: fadeUp 0.5s ease forwards; }
        .login-input {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:12px 14px;
          color:#f1f5f9; font-size:14px;
          font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
          box-sizing:border-box;
        }
        .login-input:focus { border-color:rgba(14,165,233,0.6); box-shadow:0 0 0 3px rgba(14,165,233,0.1); }
        .login-input::placeholder { color:#334155; }
        .login-btn {
          width:100%; padding:13px;
          border-radius:12px; border:none;
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:14px; cursor:pointer;
          transition:all 0.2s ease; letter-spacing:0.03em;
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed",
        top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: "500px", height: "500px", borderRadius: "50%",
        background: isProfessor
          ? "radial-gradient(circle, rgba(139,92,246,0.09), transparent 70%)"
          : "radial-gradient(circle, rgba(14,165,233,0.09), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <button onClick={onBack} style={{
        position: "fixed", top: "20px", left: "20px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px", padding: "8px 14px",
        color: "#64748b", fontSize: "12px", fontFamily: "'DM Sans',sans-serif",
        cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
        transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
      >
        ← Back
      </button>

      <div className="login-card" style={{
        width: "100%", maxWidth: "400px",
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${isProfessor ? "rgba(139,92,246,0.2)" : "rgba(14,165,233,0.2)"}`,
        borderRadius: "24px", padding: "36px 32px",
        boxShadow: isProfessor ? "0 24px 64px rgba(139,92,246,0.1)" : "0 24px 64px rgba(14,165,233,0.1)",
      }}>
        {/* Icon */}
        <div style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: isProfessor ? "rgba(139,92,246,0.15)" : "rgba(14,165,233,0.15)",
          border: `1px solid ${isProfessor ? "rgba(139,92,246,0.3)" : "rgba(14,165,233,0.3)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "26px", marginBottom: "20px",
        }}>
          {isProfessor ? "🔬" : "🎓"}
        </div>

        {/* Header */}
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#f1f5f9" }}>
          {isRegister
            ? isProfessor ? "Register as Faculty" : "Register as Student"
            : isProfessor ? "Faculty Login" : "Student Login"}
        </h2>
        <p style={{ margin: "0 0 28px", fontSize: "13px", color: "#475569", fontFamily: "'DM Sans',sans-serif" }}>
          {isRegister
            ? "Create a simple account for this research system."
            : isProfessor
              ? "Access the institutional insights dashboard"
              : "Take the EE board exam readiness survey"}
        </p>

        {/* Role badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: isProfessor ? "rgba(139,92,246,0.1)" : "rgba(14,165,233,0.1)",
          border: `1px solid ${isProfessor ? "rgba(139,92,246,0.25)" : "rgba(14,165,233,0.25)"}`,
          borderRadius: "999px", padding: "4px 12px",
          fontSize: "10px", fontWeight: 700,
          color: isProfessor ? "#a78bfa" : "#38bdf8",
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: "24px",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: isProfessor ? "#a78bfa" : "#38bdf8",
          }} />
          {isProfessor ? "Faculty · IIEE" : "Student · SLSU EE"}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {isRegister && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Sans',sans-serif" }}>
                Full Name
              </label>
              <input
                className="login-input"
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Sans',sans-serif" }}>
              Email
            </label>
            <input
              className="login-input"
              type="email"
              placeholder={isProfessor ? "e.g. professor@slsu.edu.ph" : "e.g. student@slsu.edu.ph"}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Sans',sans-serif" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="login-input"
                type={showPass ? "text" : "password"}
                placeholder={isRegister ? "Create a password" : "Enter password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
                style={{ paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#475569", fontSize: "16px", lineHeight: 1,
              }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "10px", padding: "10px 12px",
              fontSize: "12px", color: "#fca5a5", fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", gap: "7px",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "rgba(255,255,255,0.05)"
                : isProfessor
                ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: loading ? "#475569" : "#fff",
              marginTop: "6px",
              boxShadow: loading ? "none" : isProfessor
                ? "0 8px 24px rgba(124,58,237,0.3)"
                : "0 8px 24px rgba(14,165,233,0.3)",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg style={{ animation: "spin 0.8s linear infinite", width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none">
                  <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                {isRegister ? "Creating account…" : "Signing in…"}
              </span>
            ) : isRegister
              ? `Register as ${isProfessor ? "Faculty" : "Student"} →`
              : `Sign In as ${isProfessor ? "Faculty" : "Student"} →`}
          </button>
        </form>

        {/* Toggle login / register */}
        <div style={{ marginTop: "18px", fontSize: "11px", color: "#64748b", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(""); }}
                style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Sans',sans-serif" }}
              >
                Sign in instead
              </button>
            </>
          ) : (
            <>
              First time here?{" "}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(""); }}
                style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Sans',sans-serif" }}
              >
                Create an account
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: "24px", fontSize: "11px", color: "#1e293b", fontFamily: "'DM Sans',sans-serif" }}>
        Southern Luzon State University · College of Engineering · IIEE
      </p>
    </div>
  );
}