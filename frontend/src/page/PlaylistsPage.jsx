import { useEffect, useState } from "react";
import { FolderPlus, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]); const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [error, setError] = useState("");
  const load = () => api("/playlist").then(({ playlists: items }) => setPlaylists(items)).catch((err) => setError(err.message));
  useEffect(load, []);
  const create = async (event) => { event.preventDefault(); setError(""); try { await api("/playlist/create-playlist", { method: "POST", body: JSON.stringify({ name, description }) }); setName(""); setDescription(""); load(); } catch (err) { setError(err.message); } };
  const remove = async (id) => { if (!window.confirm("Delete this playlist?")) return; try { await api(`/playlist/${id}`, { method: "DELETE" }); load(); } catch (err) { setError(err.message); } };
  return <AppShell><div className="section-heading"><div><span className="eyebrow">YOUR COLLECTIONS</span><h1>Playlists</h1><p>Organize problems into focused study sets.</p></div></div><form className="playlist-form" onSubmit={create}><FolderPlus size={21} /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Playlist name" /><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" /><button className="primary compact">Create playlist</button></form>{error && <p className="alert">{error}</p>}<div className="playlist-grid">{playlists.map((playlist) => <article className="playlist-card" key={playlist.id}><div><h2>{playlist.name}</h2><p>{playlist.description || "No description"}</p></div><strong>{playlist.problems.length} problems</strong><button className="icon-button danger" onClick={() => remove(playlist.id)} title="Delete playlist"><Trash2 size={18} /></button></article>)}{!playlists.length && <p className="empty">Create a playlist to start building a study plan.</p>}</div></AppShell>;
}
