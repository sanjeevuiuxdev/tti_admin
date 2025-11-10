import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  return (
    <div className="topbar">
      <div className="left">
        <Link to="/">Dashboard</Link>
        <Link className={pathname.startsWith("/categories")?"active":""} to="/categories">Categories</Link>
        <Link className={pathname.startsWith("/blogs")?"active":""} to="/blogs">Blogs</Link>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
