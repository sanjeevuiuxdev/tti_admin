import { useEffect, useState } from "react";
import { api } from "../api/client";
import Topbar from "../components/Topbar";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [metaTitle, setMT] = useState("");
  const [metaDescription, setMD] = useState("");
  const [loading, setL] = useState(false);

  async function load() {
    const { data } = await api.get("/api/categories");
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function createCat(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setL(true);
    await api.post("/api/categories", { name, metaTitle, metaDescription });
    setName(""); setMT(""); setMD("");
    await load();
    setL(false);
  }

  async function remove(id) {
    if (!confirm("Delete category?")) return;
    await api.delete(`/api/categories/${id}`);
    await load();
  }

  return (
    <>
      <Topbar/>
      <div className="page">
        <h2>Categories</h2>

        <form onSubmit={createCat} className="card">
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="Meta Title" value={metaTitle} onChange={e=>setMT(e.target.value)} />
          <input placeholder="Meta Description" value={metaDescription} onChange={e=>setMD(e.target.value)} />
          <button disabled={loading}>{loading ? "Saving..." : "Create"}</button>
        </form>

        <table className="table">
          <thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(c=>(
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>
                  {/* keep it simple: only delete for now */}
                  <button onClick={()=>remove(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
