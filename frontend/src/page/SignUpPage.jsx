import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await login(form, true); navigate("/"); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <section className="auth-layout"><div className="auth-copy"><Code2 size={44} /><h1>Start solving today.</h1><p>Your personal coding gym for deliberate practice and measurable progress.</p></div><form className="auth-card" onSubmit={submit}><div><span className="eyebrow">CREATE ACCOUNT</span><h2>Join SXR LEETLAB</h2></div>{error && <p className="alert">{error}</p>}<label>Name<input required minLength="3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label><button className="primary" disabled={busy}>{busy && <LoaderCircle className="spin" size={18} />} Create account</button><p className="muted">Already a member? <Link to="/login">Sign in</Link></p></form></section>;
}
