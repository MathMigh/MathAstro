export const API_BASE = (() => {
  if (typeof window !== "undefined") {
    // Client-side: Usamos caminho relativo para a própria Vercel ou Localhost
    return "/api";
  } else {
    // Server-side: Vercel injeta a URL do servidor. Caso não exista, assume dev local.
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api` 
      : "http://localhost:3000/api";
  }
})();

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API fetch error ${res.status}: ${text}`);
  }
  return res.json();
}
