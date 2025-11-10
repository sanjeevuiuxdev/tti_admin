import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";
import { api } from "../api/client";
import { adminFetch } from "../api/adminFetch";
import { SECTION_OPTIONS } from "../constants/sections";

// Map machine values -> human labels, e.g. "editors_pick" → "Editor Pick's"
const SECTION_LABELS = SECTION_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, /** @type {Record<string,string>} */ ({}));

const PER_PAGE = 50;

export default function Blogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/blogs");
        if (!cancel) {
          setRows(Array.isArray(data) ? data : []);
          setErr("");
        }
      } catch (e) {
        if (!cancel) setErr("Failed to load blogs.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, totalPages);

  const visible = useMemo(() => {
    const start = (current - 1) * PER_PAGE;
    return rows.slice(start, start + PER_PAGE);
  }, [rows, current]);

  async function onDelete(id) {
    if (!confirm("Delete this blog?")) return;
    await adminFetch(`/api/blogs/${id}`, { method: "DELETE" });
    setRows((r) => r.filter((x) => x._id !== id));
  }

  return (
    <>
      <Topbar />
      <div className="page">
        <div className="list-header">
          <h2>Blogs</h2>
          <Link className="btn primary" to="/blogs/create">+ New</Link>
        </div>

        {err ? <div className="alert error">{err}</div> : null}

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "48%" }}>Title</th>
                <th style={{ width: "14%" }}>Category</th>
                <th style={{ width: "10%" }}>Published</th>
                <th style={{ width: "18%" }}>Sections</th>
                <th style={{ width: "10%" }} className="ta-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Loading…
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((b) => (
                  <tr key={b._id}>
                    <td className="ellipsis">
                      <Link to={`/blogs/${b._id}/edit`} className="row-title">
                        {b.title}
                      </Link>
                    </td>
                    <td>{b.category?.name || "-"}</td>
                    <td>{b.published ? "Yes" : "No"}</td>
                    <td>
                      <div className="chips">
                        {(b.sections || []).length ? (
                          b.sections.map((s) => (
                            <span key={s} className="chip">
                              {SECTION_LABELS[s] || s}
                            </span>
                          ))
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="ta-right">
                      <Link to={`/blogs/${b._id}/edit`} className="btn xs">
                        Edit
                      </Link>
                      <button className="btn xs danger" onClick={() => onDelete(b._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (client-side, 50 per page) */}
        {rows.length > PER_PAGE && (
          <div className="pagination">
            <button
              className="pg-btn"
              disabled={current === 1}
              onClick={() => setPage(1)}
              aria-label="First"
            >
              «
            </button>
            <button
              className="pg-btn"
              disabled={current === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous"
            >
              ‹
            </button>
            <span className="pg-info">
              Page {current} of {totalPages}
            </span>
            <button
              className="pg-btn"
              disabled={current === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next"
            >
              ›
            </button>
            <button
              className="pg-btn"
              disabled={current === totalPages}
              onClick={() => setPage(totalPages)}
              aria-label="Last"
            >
              »
            </button>
          </div>
        )}
      </div>

      {/* Minimal styles for chips/table/pagination */}
      <style>{`
        .list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .btn { padding:8px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; text-decoration:none; color:#111; font-weight:600; }
        .btn.primary { background:#111; color:#fff; border-color:#111; }
        .btn.xs { padding:6px 8px; margin-left:6px; }
        .btn.danger { background:#fee2e2; border-color:#fecaca; color:#991b1b; }
        .alert.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:8px; margin:8px 0; }

        .table-wrap { overflow:auto; background:#fff; border:1px solid #e5e7eb; border-radius:12px; }
        .tbl { width:100%; border-collapse:collapse; }
        .tbl th, .tbl td { padding:12px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .tbl th { background:#fafafa; text-align:left; font-weight:700; }
        .row-title { color:#111827; text-decoration:none; }
        .row-title:hover { text-decoration:underline; }
        .ellipsis { max-width: 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .muted { color:#6b7280; }
        .ta-right { text-align:right; }

        .chips { display:flex; flex-wrap:wrap; gap:6px; }
        .chip { padding:3px 8px; font-size:12px; border-radius:999px; background:#eef2ff; color:#3730a3; border:1px solid #e0e7ff; line-height:1.6; }

        .pagination { display:flex; align-items:center; gap:8px; margin-top:12px; }
        .pg-btn { padding:6px 10px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
        .pg-btn[disabled] { opacity:.5; cursor:not-allowed; }
        .pg-info { color:#6b7280; padding:0 6px; }
      `}</style>
    </>
  );
}
