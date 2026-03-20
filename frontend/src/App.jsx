import { useState } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import StudentPage from "./components/StudentPage";
import ProfessorPage from "./components/ProfessorPage";

export default function App() {
  // role: null | "student" | "professor"
  const [page, setPage] = useState("landing"); // landing | login | student | professor
  const [loginRole, setLoginRole] = useState(null);

  const goToLogin = (role) => {
    setLoginRole(role);
    setPage("login");
  };

  const onLoginSuccess = (role) => {
    setPage(role === "professor" ? "professor" : "student");
  };

  const onLogout = () => {
    setPage("landing");
    setLoginRole(null);
  };

  if (page === "landing") return <LandingPage onEnter={goToLogin} />;
  if (page === "login")   return <LoginPage role={loginRole} onSuccess={onLoginSuccess} onBack={() => setPage("landing")} />;
  if (page === "student") return <StudentPage onLogout={onLogout} />;
  if (page === "professor") return <ProfessorPage onLogout={onLogout} />;
  return null;
}