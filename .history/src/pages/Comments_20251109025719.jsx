// src/pages/Comments.jsx
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../api/adminFetch";

const PER_PAGE = 20;

export default function Comments() {
  const [rows, setRows] = useState([]);         // [{ _id, post:{slug,title}, name, email, message, approved, createdAt }]
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");  // "all" | "pending" | "approved"
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/comments");
      setRows(Array.isArray(data) ? data : []);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = rows.slice();

    if (status === "pending") list = list.filter(r => !r.approved);
    if (status === "approved") list = list.filter(r => r.approved);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(r =>
        (r.post?.title || "").toLowerCase().includes(s) ||
        (r.post?.slug || "").toLowerCase().includes(s) ||
        (r.name || "").toLowerCase().includes(s) ||
        (r.email || "").toLowerCase().includes(s) ||
        (r.message || "").toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [rows, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
      <h2 style={{ marginBottom: 12 }}>Comments Moderation</h2>

      {/* Controls */}
      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="tf-input"
          style={{ width: 160 }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>

        <input
          className="tf-input"
          placeholder="Search…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ minWidth: 220 }}
        />

        <button onClick={load} style={{ marginLeft: "auto" }}>Refresh</button>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 12, padding: 0, overflowX: "auto", width:"123" }}>
        {loading ? (
          <div style={{ padding: 14 }}>Loading…</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Post</th>
                <th style={{ minWidth: 160 }}>Name / Email</th>
                <th>Message</th>
                <th style={{ width: 90 }}>Status</th>
                <th style={{ width: 150, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.post?.title || "—"}</div>
                    {c.post?.slug && (
                      <a
                        href={`/blog/${c.post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: "#6b7280" }}
                      >
                        /blog/{c.post.slug}
                      </a>
                    )}
                  </td>
                  <td>
                    <div>{c.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{c.email || "—"}</div>
                  </td>
                  <td
                    title={c.message}
                    style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 520 }}
                  >
                    {c.message}
                  </td>
                  <td>{c.approved ? "Approved" : "Pending"}</td>
                  <td style={{ textAlign: "right" }}>
                    {!c.approved && (
                      <button onClick={() => approve(c._id)} style={{ marginRight: 8 }}>
                        Approve
                      </button>
                    )}
                    <button className="danger" onClick={() => remove(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!pageRows.length && !loading && (
                <tr><td colSpan={5} style={{ padding: 14 }}>No comments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pager */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
          <div style={{ padding: "6px 10px", color: "#6b7280" }}>
            Page {page} / {totalPages}
          </div>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next ›</button>
        </div>
      )}

      <style>{`
        .simple-table { width: 100%; border-collapse: collapse; }
        .simple-table th, .simple-table td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; text-align: left; }
        .simple-table thead th { background: #fafafa; font-weight: 700; }
        .danger { background: #111; color: #fff; }
      `}</style>
    </div>
  );
}
