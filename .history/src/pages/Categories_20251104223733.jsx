import { useEffect, useState } from "react";
import { api } from "../api/client";
import Topbar from "../components/Topbar";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", metaTitle: "", metaDescription: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await api.get("/api/categories");
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    await api.post("/api/categories", form);
    setForm({ name: "", metaTitle: "", metaDescription: "" });
    await load();
    setLoading(false);
  }

  async function startEdit(cat) {
    setEditingId(cat._id);
    setForm({ name: cat.name, metaTitle: cat.metaTitle || "", metaDescription: cat.metaDescription || "" });
  }

  async function saveEdit() {
    if (!editingId) return;
    await api.put(`/api/categories/${editingId}`, form);
    setEditingId(null);
    setForm({ name: "", metaTitle: "", metaDescription: "" });
    await load();
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

        <form onSubmit={create} className="card" style={{maxWidth:600}}>
          <strong>{editingId ? "Editing category" : "Create new category"}</strong>
          <input placeholder="Name *" value={form.name} onChange={e=>setForm(s=>({...s, name:e.target.value}))}/>
          <input placeholder="Meta Title" value={form.metaTitle} onChange={e=>setForm(s=>({...s, metaTitle:e.target.value}))}/>
          <input placeholder="Meta Description" value={form.metaDescription} onChange={e=>setForm(s=>({...s, metaDescription:e.target.value}))}/>
          {editingId ? (
            <div style={{display:"flex",gap:8}}>
              <button type="button" onClick={()=>{setEditingId(null); setForm({name:"",metaTitle:"",metaDescription:""});}}>Cancel</button>
              <button type="button" onClick={saveEdit} style={{background:"#111",color:"#fff"}}>Save</button>
            </div>
          ) : (
            <button disabled={loading} style={{background:"#111",color:"#fff"}}>{loading?"Saving...":"Create"}</button>
          )}
        </form>

        <table className="table" style={{marginTop:16}}>
          <thead><tr><th>Name</th><th>Slug</th><th>SEO Title</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(c=>(
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.metaTitle || "-"}</td>
                <td>
                  <button onClick={()=>startEdit(c)}>Edit</button>
                  <button onClick={()=>remove(c._id)} style={{marginLeft:8}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
