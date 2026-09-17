import { Code2, LogOut, UserRound, UsersRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  return <><header className="navbar"><Link to="/" className="brand"><Code2 size={23} /> SXR LEETLAB</Link><nav><NavLink to="/">Problems</NavLink><NavLink to="/playlists">Playlists</NavLink><NavLink to="/leaderboard">Leaderboard</NavLink><NavLink to="/friends" className="friends-nav"><UsersRound size={16} /> Friends</NavLink></nav><div className="user-menu"><NavLink to="/profile" title="Open profile"><UserRound size={17} /></NavLink><span>{user?.name || user?.email}</span><button className="icon-button" title="Log out" onClick={logout}><LogOut size={18} /></button></div></header><main className="page">{children}</main></>;
}
