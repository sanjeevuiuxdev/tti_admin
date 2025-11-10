import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  const name = typeof window !== "undefined" ? localStorage.getItem("admin_username") : "Admin";
  return (
    <div style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>Dashboard</h1>
        <button onClick={logout} style={{background:"#111",color:"#fff",padding:"8px 12px",borderRadius:8}}>Logout</button>
      </div>
      <p>Welcome, {name || "Admin"}.</p>
    </div>
  );
}
