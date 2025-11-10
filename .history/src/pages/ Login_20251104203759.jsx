import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { loginSuccess } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!username || !password) return setErr("Both fields required");
    try {
      setL(true);
      const { data } = await api.post("/api/auth/login", { username, password });
      loginSuccess(data);
      window.location.href = "/";
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setL(false);
    }
  }

  return (
    <div className="container">
      <form onSubmit={submit} className="card">
        <h2>Admin Login</h2>
        {err && <div className="error">{err}</div>}
        <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button disabled={loading}>{loading ? "..." : "Sign in"}</button>
      </form>
    </div>
  );
}
