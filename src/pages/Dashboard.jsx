import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";
import { api } from "../api/client";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    comments: 0,
    pendingComments: 0,
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // Pull lists in parallel; fall back gracefully if comments endpoint
        // isn’t present yet.
        const [blogsRes, catsRes, commentsRes] = await Promise.allSettled([
          api.get("/api/blogs"),
          api.get("/api/categories"),
          api.get("/api/comments"),
        ]);

        const posts =
          blogsRes.status === "fulfilled" ? blogsRes.value.data.length : 0;
        const categories =
          catsRes.status === "fulfilled" ? catsRes.value.data.length : 0;

        let comments = 0;
        let pendingComments = 0;
        if (commentsRes.status === "fulfilled") {
          const all = Array.isArray(commentsRes.value.data)
            ? commentsRes.value.data
            : [];
          comments = all.length;
          pendingComments = all.filter((c) => !c.approved).length;
        }

        if (!cancelled) {
          setStats({ posts, categories, comments, pendingComments });
          setErr("");
        }
      } catch (e) {
        if (!cancelled) setErr("Failed to load stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Topbar />
      <div className="page">
        <div className="dash-header">
          <h2>Dashboard</h2>
          <p className="muted">Welcome, admin.</p>
        </div>

        {err ? <div className="alert error">{err}</div> : null}

        <div className="stat-grid">
          <Link to="/blogs" className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Posts</span>
              <span className="stat-icon">📝</span>
            </div>
            <div className="stat-value">
              {loading ? "…" : stats.posts.toLocaleString()}
            </div>
            <div className="stat-link">Manage Blogs →</div>
          </Link>

          <Link to="/categories" className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Categories</span>
              <span className="stat-icon">🗂️</span>
            </div>
            <div className="stat-value">
              {loading ? "…" : stats.categories.toLocaleString()}
            </div>
            <div className="stat-link">Manage Categories →</div>
          </Link>

          <Link to="/comments" className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Comments</span>
              <span className="stat-icon">💬</span>
            </div>
            <div className="stat-value">
              {loading ? "…" : stats.comments.toLocaleString()}
            </div>
            <div className="stat-link">View Comments →</div>
          </Link>

          <Link to="/comments?status=pending" className="stat-card warning">
            <div className="stat-top">
              <span className="stat-label">Pending Approval</span>
              <span className="stat-icon">⏳</span>
            </div>
            <div className="stat-value">
              {loading ? "…" : stats.pendingComments.toLocaleString()}
            </div>
            <div className="stat-link">Review Pending →</div>
          </Link>
        </div>

        <div className="quick-actions">
          <Link to="/categories" className="btn">
            Manage Categories
          </Link>
          <Link to="/blogs" className="btn">
            Manage Blogs
          </Link>
          <Link to="/blogs/create" className="btn primary">
            + Create Blog
          </Link>
        </div>
      </div>

      {/* Inline styles to keep this copy-pasteable */}
      <style>{`
        .page { padding: 24px; }
        .dash-header h2 { margin: 0 0 4px; }
        .muted { color: #6b7280; margin: 0 0 16px; }

        .alert.error {
          background:#fee2e2;
          color:#991b1b;
          border:1px solid #fecaca;
          padding:10px 12px;
          border-radius:8px;
          margin-bottom:16px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr; }
        }

        .stat-card {
          display: block;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: #fff;
          text-decoration: none;
          color: inherit;
          transition: box-shadow .2s ease, transform .08s ease;
        }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.06); transform: translateY(-1px); }
        .stat-card.warning { border-color:#fde68a; background:#fffbeb; }
        .stat-top { display:flex; align-items:center; justify-content:space-between; }
        .stat-label { font-size: 14px; color:#6b7280; }
        .stat-icon { font-size: 18px; }
        .stat-value { font-size: 34px; font-weight: 700; margin: 8px 0 6px; }
        .stat-link { font-size: 13px; color:#2563eb; }

        .quick-actions { display:flex; gap:12px; margin-top: 8px; }
        .btn {
          display:inline-flex; align-items:center; justify-content:center;
          padding:10px 14px; border-radius:10px; border:1px solid #e5e7eb;
          background:#fff; color:#111827; text-decoration:none; font-weight:600;
        }
        .btn:hover { background:#f9fafb; }
        .btn.primary { background:#111; color:#fff; border-color:#111; }
        .btn.primary:hover { opacity:.92; }
      `}</style>
    </>
  );
}
