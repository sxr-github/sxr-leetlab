import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [show, setShow] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await login(form); navigate("/"); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <section className="auth-layout"><div className="auth-copy"><Code2 size={44} /><h1>Practice with purpose.</h1><p>Build consistency, solve real problems, and keep every submission in one focused workspace.</p></div><form className="auth-card" onSubmit={submit}><div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to SXR LEETLAB</h2></div>{error && <p className="alert">{error}</p>}<label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<div className="password-field"><input type={show ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><button className="primary" disabled={busy}>{busy && <LoaderCircle className="spin" size={18} />} Sign in</button><p className="muted">New here? <Link to="/signup">Create an account</Link></p></form></section>;
}
