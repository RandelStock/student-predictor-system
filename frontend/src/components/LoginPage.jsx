import { useState } from "react";
import { apiCall, setAuthToken } from "../api-service";

// ─── SLSU IIEE Design Tokens (matches ProfessorSidebarLayout exactly) ─────────
const T = {
  navy:        "#07102B",
  navyMid:     "#0D1B3E",
  navyCard:    "#112250",
  navyHover:   "#162B60",
  gold:        "#F5C518",
  goldDim:     "#C9A010",
  goldGlow:    "rgba(245,197,24,0.18)",
  goldBorder:  "rgba(245,197,24,0.25)",
  blue:        "#38BDF8",
  white:       "#F1F5F9",
  muted:       "#94A3B8",
  dimText:     "#64748B",
  border:      "rgba(245,197,24,0.14)",
  borderSub:   "rgba(255,255,255,0.07)",
  fail:        "#F87171",
  pass:        "#4ADE80",
  purple:      "#a78bfa",
  purpleDim:   "rgba(139,92,246,0.18)",
  purpleBorder:"rgba(139,92,246,0.28)",
};

export default function LoginPage({ role, onSuccess, onBack }) {
  const FACULTY_CODE_ENV = import.meta.env.VITE_FACULTY_CODE || "";
  const [inviteCode, setInviteCode] = useState(FACULTY_CODE_ENV);

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showCode, setShowCode]     = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // Faculty login security: two-step process
  const [facultyCodeVerified, setFacultyCodeVerified] = useState(false);
  const [facultyCodeInput, setFacultyCodeInput] = useState("");
  const [facultyCodeLoading, setFacultyCodeLoading] = useState(false);

  const isProfessor  = role === "professor";
  const accentColor  = isProfessor ? T.purple    : T.blue;
  const accentGlow   = isProfessor ? T.purpleDim : "rgba(56,189,248,0.15)";
  const accentBorder = isProfessor ? T.purpleBorder : "rgba(56,189,248,0.3)";
  const gradientBtn  = isProfessor
    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
    : "linear-gradient(135deg, #0ea5e9, #0284c7)";
  const shadowBtn = isProfessor
    ? "0 8px 28px rgba(124,58,237,0.35)"
    : "0 8px 28px rgba(14,165,233,0.35)";

  const passwordContainsNameOrEmail = (() => {
    const lower = password.toLowerCase();
    const normalizedName = name.trim().toLowerCase();
    if (normalizedName) {
      const parts = normalizedName.split(/\s+/).filter(Boolean);
      if (parts.some(part => part && lower.includes(part))) return true;
    }
    return email && lower.includes(email.trim().toLowerCase());
  })();

  const passwordValidations = {
    minLength: password.length >= 8,
    hasNumberOrSymbol: /[0-9\W]/.test(password),
    noNameOrEmail: !passwordContainsNameOrEmail,
  };

  const passwordsMatch = confirmPassword.trim() === "" || password === confirmPassword;
  const showPasswordChecklist = password.length > 0;

  // Faculty code verification (two-step login)
  const handleFacultyCodeVerify = async (e) => {
    e?.preventDefault();
    setError("");

    if (!facultyCodeInput.trim()) {
      setError("Please enter the faculty access code.");
      return;
    }

    if (facultyCodeInput.trim() !== "smbrjl") {
      setError("Invalid faculty access code. Please contact your administrator.");
      return;
    }

    setFacultyCodeLoading(true);
    // Simulate brief verification delay
    setTimeout(() => {
      setFacultyCodeVerified(true);
      setFacultyCodeLoading(false);
      setError("");
    }, 500);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in name, email, and password.");
        return;
      }

      // SLSU email validation for account creation
      if (!email.toLowerCase().endsWith("@slsu.edu.ph")) {
        setError("Account creation is restricted to SLSU institutional emails (@slsu.edu.ph).");
        return;
      }

      if (isProfessor && !inviteCode.trim()) {
        setError("Faculty access code is required to register.");
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password.");
        return;
      }
    }

    if (isRegister) {
      if (!confirmPassword.trim()) {
        setError("Please confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (!/[0-9\W]/.test(password)) {
        setError("Password must contain at least one number or symbol.");
        return;
      }

      if (passwordContainsNameOrEmail) {
        setError("Password cannot contain your name or email address.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload  = isRegister
        ? {
            name,
            email,
            password,
            role,
            student_id:  role === "student"   ? email      : undefined,
            invite_code: role === "professor"  ? inviteCode : undefined,
          }
        : { email, password };

      // Use new apiCall with retry logic
      const result = await apiCall(endpoint, {
        method: "POST",
        body: payload,
        noRetry: true, // Auth requests should not retry
      });

      const data = result.data;

      // Role mismatch guard
      if (data.role && data.role !== role) {
        throw new Error(
          `Access denied. This portal is for ${role}s only. You are registered as a ${data.role}.`
        );
      }

      if (data.access_token) {
        // Use centralized auth token management
        setAuthToken(data.access_token, data.role || role, data.name);
        onSuccess(data.role || role);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      "100vh",
      background:     T.navy,
      fontFamily:     "'Inter', system-ui, sans-serif",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "20px 16px",
      position:       "relative",
      overflow:       "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes lp-fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-spin     { to{transform:rotate(360deg)} }
        @keyframes lp-pulse    { 0%,100%{opacity:0.4} 50%{opacity:0.75} }

        .lp-card    { animation: lp-fadeUp 0.45s cubic-bezier(.4,0,.2,1) forwards; }

        .lp-input {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:11px 14px;
          color:${T.white}; font-size:clamp(13px, 1.5vw, 14px);
          font-family:'Inter',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
          box-sizing:border-box;
        }
        .lp-input:focus {
          border-color:${accentColor}aa;
          box-shadow:0 0 0 3px ${accentGlow};
        }
        .lp-input::placeholder { color:${T.dimText}; }

        .lp-code-input {
          border-color:${accentBorder} !important;
          background:${accentGlow} !important;
          letter-spacing:0.1em;
          font-weight:600;
        }
        .lp-code-input:focus {
          border-color:${accentColor} !important;
          box-shadow:0 0 0 3px ${accentGlow} !important;
        }

        .lp-btn {
          width:100%; padding:12px 16px;
          border-radius:12px; border:none;
          font-family:'Montserrat',sans-serif; font-weight:700;
          font-size:clamp(13px, 1.5vw, 14px); cursor:pointer;
          transition:all 0.2s ease; letter-spacing:0.04em;
        }
        .lp-btn:hover:not(:disabled) { filter:brightness(1.12); transform:translateY(-1px); }
        .lp-btn:active:not(:disabled){ transform:translateY(0px); }

        .lp-eye-btn {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:${T.dimText}; font-size:15px; line-height:1; padding:2px;
          transition:color 0.2s;
        }
        .lp-eye-btn:hover { color:${T.muted}; }

        .lp-toggle {
          background:none; border:none;
          color:${accentColor}; cursor:pointer;
          font-size:clamp(10px, 1.2vw, 11px); font-family:'Inter',sans-serif;
          text-decoration:underline; text-underline-offset:2px; padding:0;
        }
        .lp-toggle:hover { opacity:0.8; }

        .lp-back-btn {
          position:fixed; top:16px; left:16px; z-index:10;
          background:rgba(255,255,255,0.04);
          border:1px solid ${T.borderSub};
          border-radius:10px; padding:7px 14px;
          color:${T.muted}; font-size:clamp(11px, 1.3vw, 12px);
          font-family:'Inter',sans-serif;
          cursor:pointer; display:flex; align-items:center; gap:6px;
          transition:all 0.2s;
        }
        .lp-back-btn:hover {
          color:${T.white};
          border-color:rgba(255,255,255,0.2);
        }

        /* scrollbar */
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background:${T.goldGlow}; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(245,197,24,0.4); }

        /* Responsive tweaks */
        @media (max-width:480px) {
          .lp-card-body  { padding:24px 18px !important; }
          .lp-page-title { font-size:19px !important; }
          .lp-logos      { gap:6px !important; }
        }
      `}</style>

      {/* ── Ambient background glow ────────────────────────────────────────── */}
      <div style={{
        position:"fixed", top:"10%", left:"50%",
        transform:"translateX(-50%)",
        width:700, height:700, borderRadius:"50%",
        background: isProfessor
          ? "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)"
          : "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 65%)",
        pointerEvents:"none",
        animation:"lp-pulse 5s ease infinite",
      }} />
      <div style={{
        position:"fixed", bottom:"-10%", right:"-5%",
        width:450, height:450, borderRadius:"50%",
        background:`radial-gradient(circle, ${T.goldGlow} 0%, transparent 65%)`,
        pointerEvents:"none",
      }} />

      {/* ── Back button ─────────────────────────────────────────────────────── */}
      <button className="lp-back-btn" onClick={onBack}>← Back</button>

      {/* ── Card wrapper ────────────────────────────────────────────────────── */}
      <div className="lp-card" style={{ width:"100%", maxWidth:420 }}>

        {/* ── Institution logos + name ─────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:20 }}>
          <div className="lp-logos" style={{ display:"flex", alignItems:"center", gap:10 }}>
            {[
              { src:"/slsulogo.png",  glow:"rgba(14,165,233,0.4)"  },
              { src:"/slsulogo1.png", glow:"rgba(220,38,38,0.35)"  },
              { src:"/slsulogo2.png", glow:"rgba(251,191,36,0.4)"  },
            ].map((logo, i) => (
              <div key={i} style={{
                width:38, height:38, borderRadius:"50%",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden",
                boxShadow:`0 0 14px ${logo.glow}`,
                flexShrink:0,
              }}>
                <img src={logo.src} alt="" style={{ width:"82%", height:"82%", objectFit:"contain" }} />
              </div>
            ))}
          </div>
          <p style={{
            margin:0, fontSize:"clamp(8px, 1vw, 9px)",
            color:T.dimText,
            textTransform:"uppercase",
            letterSpacing:"0.14em",
            fontFamily:"'Inter',sans-serif",
          }}>
            Southern Luzon State University · IIEE
          </p>
        </div>

        {/* ── Card body ───────────────────────────────────────────────────── */}
        <div
          className="lp-card-body"
          style={{
            background:   T.navyMid,
            border:       `1px solid ${accentBorder}`,
            borderRadius: 20,
            padding:      "30px 26px",
            boxShadow:    `0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px ${T.border}`,
          }}
        >
          {/* Role icon + heading row */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <div style={{
              width:46, height:46, borderRadius:13, flexShrink:0,
              background:  accentGlow,
              border:      `1px solid ${accentBorder}`,
              display:     "flex", alignItems:"center", justifyContent:"center",
              fontSize:    20,
            }}>
              {isProfessor ? "🔬" : "🎓"}
            </div>
            <div>
              {/* Role pill badge */}
              <div style={{
                display:"inline-flex", alignItems:"center", gap:5,
                background:  accentGlow,
                border:      `1px solid ${accentBorder}`,
                borderRadius:999,
                padding:     "3px 10px",
                marginBottom:5,
              }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:accentColor, display:"inline-block" }} />
                <span style={{
                  fontSize:"clamp(8px, 1vw, 9px)", fontWeight:700, color:accentColor,
                  letterSpacing:"0.1em", textTransform:"uppercase",
                  fontFamily:"'Inter',sans-serif",
                }}>
                  {isProfessor ? "Faculty · IIEE" : "Student · SLSU EE"}
                </span>
              </div>
              {/* Page title */}
              <h2 className="lp-page-title" style={{
                margin:0, fontSize:"clamp(19px, 4vw, 21px)", fontWeight:700,
                color:T.white,
                fontFamily:"'Montserrat',sans-serif",
                lineHeight:1.1,
              }}>
                {isProfessor && !isRegister && !facultyCodeVerified
                  ? "Faculty Access Verification"
                  : isRegister
                    ? isProfessor ? "Faculty Registration" : "Student Register"
                    : isProfessor ? "Faculty Login" : "Student Login"}
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <p style={{
            margin:"0 0 18px",
            fontSize:"clamp(11px, 1.5vw, 12px)", color:"#cbd5e1",
            fontFamily:"'Inter',sans-serif",
            lineHeight:1.65,
            borderLeft:`2px solid ${T.border}`,
            paddingLeft:10,
          }}>
            {isProfessor && !isRegister && !facultyCodeVerified
              ? "Enter your faculty access code to proceed with login."
              : isRegister
                ? isProfessor
                  ? "Faculty registration requires a valid institutional email and the department access code."
                  : "Create your account to access the EE board exam readiness survey."
                : isProfessor
                  ? "Access the institutional analytics and insights dashboard."
                  : "Take the EE board exam readiness predictor survey."}
          </p>

          {/* Faculty-only access warning */}
          {isProfessor && isRegister && (
            <div style={{
              background:   T.purpleDim,
              border:       `1px solid ${T.purpleBorder}`,
              borderRadius: 10,
              padding:      "10px 14px",
              marginBottom: 16,
              display:      "flex", alignItems:"flex-start", gap:8,
            }}>
              <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>🔒</span>
              <p style={{ margin:0, fontSize:"clamp(11px, 1.5vw, 12px)", color:"#cbd5e1", fontFamily:"'Inter',sans-serif", lineHeight:1.6 }}>
                Faculty access is restricted. You need the{" "}
                <strong style={{ color:T.purple }}>department access code</strong> to register.
              </p>
            </div>
          )}

          {/* ── Form fields ─────────────────────────────────────────────── */}
          {/* Faculty two-step login: Code verification first */}
          {isProfessor && !isRegister && !facultyCodeVerified ? (
            <form onSubmit={handleFacultyCodeVerify} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{
                  display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                  color:T.dimText, textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:6,
                  fontFamily:"'Inter',sans-serif",
                }}>🔑 Faculty Access Code</label>
                <div style={{ position:"relative" }}>
                  <input
                    className="lp-input lp-code-input"
                    type={showCode ? "text" : "password"}
                    placeholder="Enter faculty access code"
                    value={facultyCodeInput}
                    onChange={e => { setFacultyCodeInput(e.target.value); setError(""); }}
                    autoComplete="off"
                    style={{ paddingRight:44 }}
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowCode(p => !p)}>
                    {showCode ? "🙈" : "👁️"}
                  </button>
                </div>
                <p style={{ margin:"5px 0 0", fontSize:11, color:T.dimText, fontFamily:"'Inter',sans-serif" }}>
                  Enter the department access code to proceed with login.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  background:"rgba(239,68,68,0.08)",
                  border:"1px solid rgba(239,68,68,0.25)",
                  borderRadius:10, padding:"10px 12px",
                  fontSize:12, color:"#fca5a5",
                  fontFamily:"'Inter',sans-serif",
                  display:"flex", alignItems:"flex-start", gap:7,
                }}>
                  <span style={{ flexShrink:0 }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Verify button */}
              <button
                className="lp-btn"
                type="submit"
                disabled={facultyCodeLoading}
                style={{
                  background:  facultyCodeLoading ? "rgba(255,255,255,0.05)" : gradientBtn,
                  color:       facultyCodeLoading ? T.dimText : T.white,
                  marginTop:   4,
                  boxShadow:   facultyCodeLoading ? "none" : shadowBtn,
                }}
              >
                {facultyCodeLoading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <svg style={{ animation:"lp-spin 0.8s linear infinite", width:14, height:14 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Verifying…
                  </span>
                ) : "Verify Code →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Full Name — register only */}
              {isRegister && (
                <div>
                  <label style={{
                    display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                    color:T.dimText, textTransform:"uppercase",
                    letterSpacing:"0.1em", marginBottom:6,
                    fontFamily:"'Inter',sans-serif",
                  }}>Full Name</label>
                  <input
                    className="lp-input"
                    type="text"
                    placeholder="e.g. Juan Dela Cruz"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(""); }}
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{
                  display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                  color:T.dimText, textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:6,
                  fontFamily:"'Inter',sans-serif",
                }}>Email</label>
                <input
                  className="lp-input"
                  type="email"
                  placeholder={isProfessor ? "professor@slsu.edu.ph" : "student@slsu.edu.ph"}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                  color:T.dimText, textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:6,
                  fontFamily:"'Inter',sans-serif",
                }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input
                    className="lp-input"
                    type={showPass ? "text" : "password"}
                    placeholder={isRegister ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    style={{ paddingRight:44 }}
                  />
                  <button type="button" className="lp-eye-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label style={{
                      display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                      color:T.dimText, textTransform:"uppercase",
                      letterSpacing:"0.1em", marginBottom:6,
                      fontFamily:"'Inter',sans-serif",
                    }}>Confirm Password</label>
                    <div style={{ position:"relative" }}>
                      <input
                        className="lp-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                        autoComplete="new-password"
                        style={{ paddingRight:44 }}
                      />
                      <button type="button" className="lp-eye-btn" onClick={() => setShowPass(p => !p)}>
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p style={{ margin:"8px 0 0", color:T.fail, fontSize:12, fontFamily:"'Inter',sans-serif" }}>
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  {showPasswordChecklist && (
                    <div style={{ marginTop:16, padding:"14px 16px", borderRadius:16, background:"rgba(255,255,255,0.06)", border:`1px solid ${T.borderSub}` }}>
                      <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:T.white, fontFamily:"'Inter',sans-serif" }}>
                        Password requirements
                      </p>
                      {[
                        { label: "Cannot contain your name or email address", valid: passwordValidations.noNameOrEmail },
                        { label: "At least 8 characters", valid: passwordValidations.minLength },
                        { label: "Contains a number or symbol", valid: passwordValidations.hasNumberOrSymbol },
                      ].map((item, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <span style={{ color:item.valid ? T.pass : T.fail, fontSize:14 }}>{item.valid ? "✔" : "✕"}</span>
                          <span style={{ color:item.valid ? T.white : T.dimText, fontSize:12, fontFamily:"'Inter',sans-serif" }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Faculty Access Code — professor register only */}
              {isProfessor && isRegister && (
                <div>
                  <label style={{
                    display:"block", fontSize:"clamp(9px, 1.2vw, 10px)", fontWeight:700,
                    color:accentColor, textTransform:"uppercase",
                    letterSpacing:"0.1em", marginBottom:6,
                    fontFamily:"'Inter',sans-serif",
                  }}>🔑 Faculty Access Code</label>
                  <div style={{ position:"relative" }}>
                    <input
                      className="lp-input lp-code-input"
                      type={showCode ? "text" : "password"}
                      placeholder="Enter access code"
                      value={inviteCode}
                      onChange={e => { setInviteCode(e.target.value); setError(""); }}
                      autoComplete="off"
                      style={{ paddingRight:44 }}
                    />
                    <button type="button" className="lp-eye-btn" onClick={() => setShowCode(p => !p)}>
                      {showCode ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <p style={{ margin:"5px 0 0", fontSize:11, color:T.dimText, fontFamily:"'Inter',sans-serif" }}>
                    Contact your department administrator for this code.
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div style={{
                  background:"rgba(239,68,68,0.08)",
                  border:"1px solid rgba(239,68,68,0.25)",
                  borderRadius:10, padding:"10px 12px",
                  fontSize:12, color:"#fca5a5",
                  fontFamily:"'Inter',sans-serif",
                  display:"flex", alignItems:"flex-start", gap:7,
                }}>
                  <span style={{ flexShrink:0 }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                className="lp-btn"
                type="submit"
                disabled={loading}
                style={{
                  background:  loading ? "rgba(255,255,255,0.05)" : gradientBtn,
                  color:       loading ? T.dimText : T.white,
                  marginTop:   4,
                  boxShadow:   loading ? "none" : shadowBtn,
                }}
              >
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <svg style={{ animation:"lp-spin 0.8s linear infinite", width:14, height:14 }} viewBox="0 0 24 24" fill="none">
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
          )}

          {/* Back to code verification for faculty login */}
          {isProfessor && !isRegister && facultyCodeVerified && (
            <div style={{
              marginTop:  14,
              paddingTop: 12,
              borderTop:  `1px solid ${T.borderSub}`,
              textAlign:  "center",
            }}>
              <button
                type="button"
                className="lp-toggle"
                onClick={() => { setFacultyCodeVerified(false); setFacultyCodeInput(""); setError(""); }}
              >
                ← Back to code verification
              </button>
            </div>
          )}

          {/* Toggle login ↔ register */}
          <div style={{
            marginTop:  14,
            paddingTop: 12,
            borderTop:  `1px solid ${T.borderSub}`,
            fontSize:   11,
            color:      T.dimText,
            fontFamily: "'Inter',sans-serif",
            textAlign:  "center",
          }}>
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="lp-toggle"
                  onClick={() => { setIsRegister(false); setError(""); setInviteCode(""); setConfirmPassword(""); setPassword(""); setFacultyCodeVerified(false); setFacultyCodeInput(""); }}
                >
                  Sign in instead
                </button>
              </>
            ) : (
              <>
                {isProfessor ? "New faculty member?" : "First time here?"}{" "}
                <button
                  type="button"
                  className="lp-toggle"
                  onClick={() => { setIsRegister(true); setError(""); setConfirmPassword(""); setPassword(""); setFacultyCodeVerified(false); setFacultyCodeInput(""); }}
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer text */}
        <p style={{
          marginTop:      16,
          fontSize:       10,
          color:          T.navyCard,
          fontFamily:     "'DM Sans',sans-serif",
          textAlign:      "center",
          letterSpacing:  "0.05em",
        }}>
          College of Engineering · EE Licensure Predictor System
        </p>
      </div>
    </div>
  );
}