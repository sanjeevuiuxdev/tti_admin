import Topbar from "../components/Topbar";
export default function Dashboard() {
  const name = localStorage.getItem("admin_username") || "Admin";
  return (
    <>
      <Topbar/>
      <div className="page">
        <h1>Welcome, {name}</h1>
        <p>Use the top navigation to manage Categories and Blogs.</p>
      </div>
    </>
  );
}
