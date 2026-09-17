/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/auth/check").then(({ user: checkedUser }) => setUser(checkedUser)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  const login = async (credentials, register = false) => {
    const data = await api(register ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    setUser(data.user); return data;
  };
  const logout = async () => { await api("/auth/logout", { method: "POST" }); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
