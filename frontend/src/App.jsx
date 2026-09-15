import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ZenMode from "./components/ZenMode.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { useUser } from "./context/UserContext.jsx";

export default function App() {
  const { zenMode, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*"         element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!zenMode && <Navbar />}
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/quiz"        element={<QuizPage />} />
        <Route path="/dashboard"   element={<DashboardPage />} />
        <Route path="/notes"       element={<NotesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login"       element={<Navigate to="/" />} />
        <Route path="/register"    element={<Navigate to="/" />} />
        <Route path="*"            element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
