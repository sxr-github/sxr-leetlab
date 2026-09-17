import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";
import SignUpPage from "./page/SignUpPage";
import ProblemPage from "./page/ProblemPage";
import PlaylistsPage from "./page/PlaylistsPage";
import ProfilePage from "./page/ProfilePage";
import LeaderboardPage from "./page/LeaderboardPage";
import FriendsPage from "./page/FriendsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered">Loading your workspace…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  return <Routes>
    <Route path="/login" element={!loading && user ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route path="/signup" element={!loading && user ? <Navigate to="/" replace /> : <SignUpPage />} />
    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
    <Route path="/problems/:id" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />
    <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
    <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
