import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { adminFetch } from "../api/adminFetch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Topbar from "../components/Topbar";
import { SECTION_OPTIONS } from "../constants/sections";

type BlogForm = {
  title: string;
  postedBy: string;
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml: string;
  published: boolean;
};

export default function BlogEdit() {
  const { id } = useParams();
  const [cats, setCats] = useState<any[]>([]);
  const [blog, setBlog] = useState<BlogForm | null>(null);
  const [sections, setSections] = useState<string[]>([]);     // ✅ single source for sections
  const [saving, setSaving] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      // categories
      const { data: catsData } = await api.get("/api/categories");
      setCats(catsData);

      // load blog by id
      const { data: blogs } = await api.get("/api/blogs");
      const found = blogs.find((b: any) => b._id === id);
      if (!found) {
        alert("Blog not found");
        window.location.href = "/blogs";
        return;
      }

      setBlog({
        title:         found.title,
        postedBy:      found.postedBy,
        categoryId:    found.category?._id || found.category,
        metaTitle:     found.metaTitle || "",
        metaDescription: found.metaDescription || "",
        contentHtml:   found.contentHtml || "",
        published:     !!found.published,
      });

      // ✅ preload sections (array) for the dropdown
      setSections(Array.isArray(found.sections) ? found.sections : []);
    })();
  }, [id]);

  const quillRef = useRef<any>(null);
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: async function () {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const f = input.files?.[0];
            if (!f) return;
            const form = new FormData();
            form.append("image", f);
            const token = localStorage.getItem("admin_token");
            const res = await fetch(
              `${import.meta.env.VITE_API_BASE}/api/uploads/image`,
              {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: form,
              }
            );
            const { url } = await res.json();
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", url);
          };
          input.click();
        },
      },
    },
  };

  if (!blog) return (<><Topbar /><div className="page">Loading...</div></>);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData();
    form.append("title", blog.title);
    form.append("postedBy", blog.postedBy);
    form.append("categoryId", blog.categoryId);
    form.append("metaTitle", blog.metaTitle || "");
    form.append("metaDescription", blog.metaDescription || "");
    form.append("contentHtml", blog.contentHtml || "");
    form.append("published", String(blog.published));

    // ✅ send the currently selected section(s)
    form.append("sections", JSON.stringify(sections));  // single or empty

    if (newFile) form.append("mainImage", newFile);

    await adminFetch(`/api/blogs/${id}`, { method: "PUT", body: form });
    window.location.href = "/blogs";
  }

  return (
    <>
      <Topbar />
      <div className="page">
        <h2>Edit Blog</h2>
        <form onSubmit={submit} className="card">
          <input
            placeholder="Title *"
            value={blog.title}
            onChange={(e) => setBlog((s) => ({ ...s!, title: e.target.value }))}
          />
          <input
            placeholder="Posted by *"
            value={blog.postedBy}
            onChange={(e) => setBlog((s) => ({ ...s!, postedBy: e.target.value }))}
          />
          <select
            value={blog.categoryId}
            onChange={(e) => setBlog((s) => ({ ...s!, categoryId: e.target.value }))}
          >
            <option value="">Select category *</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Replace Main Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
          />

          <label>Content (rich text) *</label>
          <ReactQuill
            ref={quillRef}
            value={blog.contentHtml}
            onChange={(v) => setBlog((s) => ({ ...s!, contentHtml: v }))}
            modules={modules}
          />

          {/* ✅ single dropdown, same as Create */}
          <label className="field-label">Homepage Section</label>
          <select
            value={sections[0] || ""}
            onChange={(e) =>
              setSections(e.target.value ? [e.target.value] : [])
            }
            className="tf-input"
          >
            <option value="">Choose homepage section</option>
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <small className="text-body-2">Hold Cmd/Ctrl to multi-select (not used here).</small>

          <input
            placeholder="Meta Title"
            value={blog.metaTitle}
            onChange={(e) => setBlog((s) => ({ ...s!, metaTitle: e.target.value }))}
          />
          <input
            placeholder="Meta Description"
            value={blog.metaDescription}
            onChange={(e) =>
              setBlog((s) => ({ ...s!, metaDescription: e.target.value }))
            }
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={blog.published}
              onChange={(e) =>
                setBlog((s) => ({ ...s!, published: e.target.checked }))
              }
            />
            Published
          </label>

          <button disabled={saving} style={{ background: "#111", color: "#fff" }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </>
  );
}
