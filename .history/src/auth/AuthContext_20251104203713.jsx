import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return setReady(true);
    api.get("/api/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
      })
      .finally(() => setReady(true));
  }, []);

  function loginSuccess({ token, admin }) {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_username", admin?.username || "");
    setUser(admin);
  }
  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setUser(null);
    window.location.href = "/login";
  }

  return <AuthCtx.Provider value={{ user, ready, loginSuccess, logout }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
