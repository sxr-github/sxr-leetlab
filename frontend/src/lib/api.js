const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || "Something went wrong");
  return data;
}
