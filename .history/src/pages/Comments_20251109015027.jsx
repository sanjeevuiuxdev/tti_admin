import { useEffect, useState } from "react";
import { adminFetch } from "../api/adminFetch";

export default function Comments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/comments"); // all comments
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(id) {
    await adminFetch(`/api/admin/comments/${id}/approve`, { method: "PUT" });
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete comment?")) return;
    await adminFetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="page">
      <h2>Comments Moderation</h2>
      {loading ? <p>Loading…</p> : null}
      <table className="card" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Post</th>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c._id}>
              {/* <td>{c.post?.title} <small>({c.post?.slug})</small></td> */}
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{c.message}</td>
              <td>{c.approved ? "Yes" : "No"}</td>
              <td>
                {!c.approved && (
                  <button onClick={() => approve(c._id)} style={{ marginRight: 8 }}>
                    Approve
                  </button>
                )}
                <button onClick={() => remove(c._id)} className="danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loading && (
            <tr><td colSpan={6}>No comments yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
