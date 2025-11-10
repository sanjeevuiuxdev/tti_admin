import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { adminFetch } from "../api/adminFetch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Topbar from "../components/Topbar";
import { SECTION_OPTIONS } from "../constants/sections";

export default function BlogCreate() {
  const [cats, setCats] = useState([]);
  const [title, setTitle] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [metaTitle, setMT] = useState("");
  const [metaDescription, setMD] = useState("");
  const [contentHtml, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api.get("/api/categories").then(({ data }) => setCats(data));
  }, []);

  const quillRef = useRef(null);
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"]
      ],
      handlers: {
        image: async function () {
          const input = document.createElement("input");
          input.type = "file"; input.accept = "image/*";
          input.onchange = async () => {
            const f = input.files?.[0]; if (!f) return;
            const form = new FormData();
            form.append("image", f);
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/uploads/image`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: form
            });
            const { url } = await res.json();
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", url);
          };
          input.click();
        }
      }
    }
  };

  async function submit(e) {
    e.preventDefault();

    if (!title || !postedBy || !categoryId || !file || !contentHtml)
      return alert("Fill all required fields");

    setSaving(true);

    const form = new FormData();
    form.append("title", title);
    form.append("postedBy", postedBy);
    form.append("categoryId", categoryId);
    form.append("metaTitle", metaTitle);
    form.append("metaDescription", metaDescription);
    form.append("contentHtml", contentHtml);
    form.append("published", "true");
    form.append("mainImage", file);

    // ✅ new field: add the selected homepage tags (array)
    // e.g. ["latest_posts", "highlights"]
    form.append("sections", JSON.stringify(sections));

    await adminFetch("/api/blogs", { method: "POST", body: form });

    window.location.href = "/blogs";
  }


  return (
    <>
      <Topbar />
      <div className="page">
        <h2>Create Blog</h2>
        <form onSubmit={submit} className="card">
          <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Posted by *" value={postedBy} onChange={e => setPostedBy(e.target.value)} />
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Select category *</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <label>Main Image *</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          <label>Content (rich text) *</label>
          <ReactQuill ref={quillRef} value={contentHtml} onChange={setContent} modules={modules} />

          <label className="field-label">Homepage Sections</label>
          <select
            multiple
            value={sections}
            onChange={(e) =>
              setSections(Array.from(e.target.selectedOptions, o => o.value))
            }
            className="tf-input"
            style={{ height: 120 }}
          >
            {SECTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <small className="text-body-2">Hold Cmd/Ctrl to multi-select.</small>


          <input placeholder="Meta Title" value={metaTitle} onChange={e => setMT(e.target.value)} />
          <input placeholder="Meta Description" value={metaDescription} onChange={e => setMD(e.target.value)} />
          <button disabled={saving} style={{ background: "#111", color: "#fff" }}>{saving ? "Saving..." : "Create"}</button>
        </form>
      </div>
    </>
  );
}
