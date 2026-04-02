import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import StudentPage from "./components/StudentPage";
import ProfessorPage from "./components/ProfessorPage";
import { getAuthToken, getAuthRole, clearAuth } from "./api-service";

export default function App() {
  const [page, setPage] = useState("landing");
  const [loginRole, setLoginRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ─── On Mount: Check for existing auth ──────────────────────────────────
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const token = getAuthToken();
        const role = getAuthRole();

        if (token && role) {
          // Restore authenticated session
          console.log(`Restored auth session: ${role}`);
          setPage(role === "professor" ? "professor" : "student");
        } else {
          // No auth found, go to landing
          setPage("landing");
        }
      } catch (err) {
        console.error("Auth restoration error:", err);
        clearAuth();
        setAuthError("Failed to restore session. Please log in again.");
        setPage("landing");
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // ─── Navigation Handlers ────────────────────────────────────────────────

  const goToLogin = (role) => {
    setLoginRole(role);
    setPage("login");
  };

  const onLoginSuccess = (role) => {
    console.log(`Login successful: ${role}`);
    setPage(role === "professor" ? "professor" : "student");
    setAuthError(null);
  };

  const onLogout = () => {
    console.log("Logging out...");
    clearAuth();
    setPage("landing");
    setLoginRole(null);
    setAuthError(null);
  };

  // ─── Show loading state ────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B1437",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          color: "#F8FAFC",
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .loader {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(245,197,24,0.2);
            border-top-color: #F5C518;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="loader" />
      </div>
    );
  }

  // ─── Show error if auth restoration failed ────────────────────────────

  if (authError && page === "landing") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B1437",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          padding: "20px",
        }}
      >
        <style>{`
          .error-card {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.3);
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            color: #F8FAFC;
            text-align: center;
          }
          .error-card h2 {
            margin: 0 0 12px;
            color: #F87171;
            font-size: 20px;
          }
          .error-card p {
            margin: 0 0 16px;
            color: #CBD5E1;
            font-size: 14px;
          }
          .error-btn {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          .error-btn:hover { opacity: 0.88; }
        `}</style>
        <div className="error-card">
          <h2>⚠️ Connection Error</h2>
          <p>{authError}</p>
          <button
            className="error-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render Pages ──────────────────────────────────────────────────────

  if (page === "landing") return <LandingPage onEnter={goToLogin} />;
  if (page === "login")
    return (
      <LoginPage role={loginRole} onSuccess={onLoginSuccess} onBack={() => setPage("landing")} />
    );
  if (page === "student") return <StudentPage onLogout={onLogout} />;
  if (page === "professor") return <ProfessorPage onLogout={onLogout} />;

  return null;
}