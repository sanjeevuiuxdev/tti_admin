import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  const name = typeof window !== "undefined" ? localStorage.getItem("admin_username") : "Admin";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <button onClick={logout} style={{ background: "#111", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>
          Logout
        </button>
      </div>

      <p>Welcome, {name || "Admin"}.</p>

      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        <Link to="/categories" style={linkStyle}>Manage Categories</Link>
        <Link to="/blogs" style={linkStyle}>Manage Blogs</Link>
        <Link to="/blogs/create" style={linkStyle}>+ Create Blog</Link>
      </div>
    </div>
  );
}

const linkStyle = {
  background: "#111",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 8,
  textDecoration: "none"
};
