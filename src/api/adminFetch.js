export async function adminFetch(path, { method="GET", headers={}, body } = {}) {
    const token = localStorage.getItem("admin_token");
    const finalHeaders = new Headers(headers);
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${import.meta.env.VITE_API_BASE}${path}`, { method, headers: finalHeaders, body });
    if (!res.ok) throw new Error((await res.json().catch(()=>({})))?.message || `HTTP ${res.status}`);
    return res.json();
  }
  