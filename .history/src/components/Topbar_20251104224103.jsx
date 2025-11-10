// src/components/Topbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { logout } = useAuth();
  return (
    <div style={{ background: "#111", padding: "10px 20px", color: "#fff", display: "flex", gap: 16, alignItems: "center" }}>
      <Link to="/" style={linkStyle}>Dashboard</Link>
      <Link to="/categories" style={linkStyle}>Categories</Link>
      <Link to="/blogs" style={linkStyle}>Blogs</Link>
      <Link to="/blogs/create" style={linkStyle}>+ New Blog</Link>
      <button onClick={logout} style={{ marginLeft: "auto", background: "#444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 }}>Logout</button>
    </div>
  );
}

const linkStyle = { color: "#fff", textDecoration: "none" };
