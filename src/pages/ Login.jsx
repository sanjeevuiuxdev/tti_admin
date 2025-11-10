import { useState } from "react";
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
    if (!username || !password) { setErr("Both fields required"); return; }
    try {
      setL(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error((await res.json().catch(()=>({})))?.message || "Login failed");
      const data = await res.json();
      loginSuccess(data);
      window.location.href = "/";
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setL(false);
    }
  }

  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>
      <form onSubmit={submit} style={{width:380,background:"#fff",padding:16,borderRadius:10,border:"1px solid #eee",display:"grid",gap:10}}>
        <h2>Admin Login</h2>
        {err && <div style={{background:"#ffecec",color:"#b10000",padding:8,borderRadius:8}}>{err}</div>}
        <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button disabled={loading} style={{background:"#111",color:"#fff",padding:10,borderRadius:8}}>
          {loading ? "..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
