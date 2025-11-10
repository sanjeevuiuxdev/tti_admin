import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);

  async function load() {
    const { data } = await api.get("/api/blogs"); // public list (published=true)
    setBlogs(data);
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Delete blog?")) return;
    await api.delete(`/api/blogs/${id}`);
    await load();
  }

  return (
    <>
      <Topbar/>
      <div className="page">
        <div className="row">
          <h2>Blogs</h2>
          <Link className="btn" to="/blogs/create">+ New</Link>
        </div>

        <table className="table">
          <thead><tr><th>Title</th><th>Category</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            {blogs.map(b=>(
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.category?.name || "-"}</td>
                <td>{b.published ? "Yes" : "No"}</td>
                <td>
                  <Link to={`/blogs/${b._id}/edit`}>Edit</Link>
                  <button onClick={()=>remove(b._id)} style={{marginLeft:8}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
