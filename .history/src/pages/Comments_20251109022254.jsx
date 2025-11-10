// src/pages/Comments.tsx
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../api/adminFetch";

type Cmt = {
  _id: string;
  post?: { _id: string; slug: string; title: string };
  name: string;
  email: string;
  message: string;
  approved: boolean;
  createdAt?: string;
};

const PER_PAGE = 20;

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

export default function Comments() {
  const [rows, setRows] = useState<Cmt[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/comments"); // returns newest first or not—doesn’t matter, we sort below
      setRows(Array.isArray(data) ? data : []);
      setSelected(new Set());
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ------- derived list -------
  const filtered = useMemo(() => {
    let list = [...rows].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta; // newest first
    });

    if (tab === "pending") list = list.filter((r) => !r.approved);
    if (tab === "approved") list = list.filter((r) => r.approved);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.message.toLowerCase().includes(s) ||
          (r.post?.title || "").toLowerCase().includes(s) ||
          (r.post?.slug || "").toLowerCase().includes(s)
      );
    }

    return list;
  }, [rows, q, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ------- actions -------
  async function approveOne(id: string) {
    await adminFetch(`/api/admin/comments/${id}/approve`, { method: "PUT" });
    await load();
  }

  async function deleteOne(id: string) {
    if (!confirm("Delete this comment?")) return;
    await adminFetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    await load();
  }

  async function bulkApprove() {
    const ids = [...selected];
    if (!ids.length) return;
    await Promise.all(ids.map((id) => adminFetch(`/api/admin/comments/${id}/approve`, { method: "PUT" })));
    await load();
  }

  async function bulkDelete() {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} selected comment(s)?`)) return;
    await Promise.all(ids.map((id) => adminFetch(`/api/admin/comments/${id}`, { method: "DELETE" })));
    await load();
  }

  function toggleAllOnPage(check: boolean) {
    const next = new Set(selected);
    pageRows.forEach((r) => (check ? next.add(r._id) : next.delete(r._id)));
    setSelected(next);
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 12 }}>Comments Moderation</h2>

      {/* Controls row */}
      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div className="seg">
          <button
            className={`seg-btn ${tab === "all" ? "active" : ""}`}
            onClick={() => {
              setTab("all");
              setPage(1);
            }}
          >
            All ({rows.length})
          </button>
          <button
            className={`seg-btn ${tab === "pending" ? "active" : ""}`}
            onClick={() => {
              setTab("pending");
              setPage(1);
            }}
          >
            Pending ({rows.filter((r) => !r.approved).length})
          </button>
          <button
            className={`seg-btn ${tab === "approved" ? "active" : ""}`}
            onClick={() => {
              setTab("approved");
              setPage(1);
            }}
          >
            Approved ({rows.filter((r) => r.approved).length})
          </button>
        </div>

        <input
          className="tf-input"
          placeholder="Search name, email, post, text…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ minWidth: 260, flex: "0 0 280px" }}
        />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="secondary" disabled={!selected.size} onClick={bulkApprove}>
            Approve selected
          </button>
          <button className="danger" disabled={!selected.size} onClick={bulkDelete}>
            Delete selected
          </button>
          <button onClick={load}>Refresh</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16, padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : (
          <table className="table-flat">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r._id))}
                    onChange={(e) => toggleAllOnPage(e.target.checked)}
                  />
                </th>
                <th>Post</th>
                <th>Author</th>
                <th>Email</th>
                <th>Comment</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 160, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(c._id)}
                      onChange={() => toggleRow(c._id)}
                      aria-label="select row"
                    />
                  </td>

                  <td>
                    <div className="cell-post">
                      <div className="post-title">{c.post?.title || "—"}</div>
                      {c.post?.slug ? (
                        <a
                          href={`/blog/${c.post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="post-link"
                          title="Open post in new tab"
                        >
                          /blog/{c.post.slug}
                        </a>
                      ) : null}
                      <div className="post-date">{fmtDate(c.createdAt)}</div>
                    </div>
                  </td>

                  <td>{c.name || "—"}</td>
                  <td>
                    <a href={`mailto:${c.email}`} className="muted link">
                      {c.email}
                    </a>
                  </td>

                  <td>
                    <ExpandableText text={c.message} max={160} />
                  </td>

                  <td>
                    {c.approved ? (
                      <span className="badge ok">Approved</span>
                    ) : (
                      <span className="badge warn">Pending</span>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {!c.approved && (
                      <button className="small" onClick={() => approveOne(c._id)} style={{ marginRight: 8 }}>
                        Approve
                      </button>
                    )}
                    <button className="small danger" onClick={() => deleteOne(c._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!pageRows.length && (
                <tr>
                  <td colSpan={7} style={{ padding: 16 }}>
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pager">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ‹ Prev
          </button>
          <div className="pages">
            Page {page} / {totalPages}
          </div>
          <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next ›
          </button>
        </div>
      )}

      {/* Tiny styles to match your admin look without new CSS files */}
      <style>{`
        .seg { display:flex; gap:6px; }
        .seg-btn{ padding:6px 10px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; }
        .seg-btn.active{ background:#111; color:#fff; border-color:#111; }

        .table-flat{ width:100%; border-collapse:separate; border-spacing:0; }
        .table-flat thead th{ text-align:left; font-weight:700; padding:12px 14px; border-bottom:1px solid #eee; background:#fafafa;}
        .table-flat tbody td{ padding:14px; border-bottom:1px solid #f2f2f2; vertical-align:top; }
        .cell-post .post-title{ font-weight:600; }
        .cell-post .post-link{ font-size:12px; color:#6b7280; display:inline-block; margin-top:2px; }
        .cell-post .post-date{ font-size:12px; color:#9ca3af; margin-top:2px; }

        .badge{ padding:4px 8px; border-radius:999px; font-size:12px; font-weight:600; display:inline-block; }
        .badge.ok{ background:#e9f9ee; color:#126b2e; }
        .badge.warn{ background:#fff7e6; color:#8a5a00; }

        .muted{ color:#6b7280; }
        .small{ padding:6px 10px; border-radius:8px; }
        .secondary{ background:#fff; border:1px solid #e5e7eb; }
        .danger{ background:#111; color:#fff; }
        .pager{ display:flex; align-items:center; gap:12px; justify-content:flex-end; margin-top:14px; }
        .pages{ color:#6b7280; }
      `}</style>
    </div>
  );
}

/** Truncates long comment text with a toggle to expand/collapse */
function ExpandableText({ text, max = 160 }: { text: string; max?: number }) {
  const [open, setOpen] = useState(false);
  const t = text || "";
  if (t.length <= max) return <span>{t}</span>;
  return (
    <div>
      <span>{open ? t : t.slice(0, max) + "…"}</span>{" "}
      <button className="small secondary" onClick={() => setOpen((v) => !v)}>
        {open ? "Collapse" : "Read more"}
      </button>
    </div>
  );
}
