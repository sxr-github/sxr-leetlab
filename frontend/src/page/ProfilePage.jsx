import { useEffect, useState } from "react";
import { Award, CheckCircle2, Code2, Trophy } from "lucide-react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api("/auth/profile").then(({ profile: data }) => setProfile(data)).catch((err) => setError(err.message)); }, []);
  if (error) return <AppShell><p className="alert">{error}</p></AppShell>;
  if (!profile) return <div className="centered">Loading your progress…</div>;
  const stats = [["Solved", profile.solved, CheckCircle2], ["Submissions", profile.submissions, Code2], ["Accepted", profile.accepted, Award]];
  return <AppShell><div className="section-heading"><span className="eyebrow">YOUR PROGRESS</span><h1>{profile.user.name || "Coder"}'s profile</h1><p>Track every step of your practice journey.</p></div><div className="stat-grid">{stats.map((stat) => { const [label, value, Icon] = stat; return <article className="stat-card" key={label}><Icon size={21} /><strong>{value}</strong><span>{label}</span></article>; })}</div><section className="profile-section"><h2>Problems solved by difficulty</h2><div className="difficulty-stats">{Object.entries(profile.byDifficulty).map(([difficulty, value]) => <div key={difficulty}><span className={`pill ${difficulty.toLowerCase()}`}>{difficulty}</span><strong>{value}</strong></div>)}</div></section><section className="profile-section"><h2>Recent submissions</h2>{profile.recentSubmissions.length ? <div className="submission-list">{profile.recentSubmissions.map((submission) => <div key={submission.id}><div><strong>{submission.problem.title}</strong><span>{submission.language} · {new Date(submission.createdAt).toLocaleDateString()}</span></div><span className={submission.status === "Accepted" ? "status accepted-label" : "status rejected-label"}>{submission.status}</span></div>)}</div> : <p className="empty">Your submissions will appear here after you solve a problem.</p>}</section><p className="profile-footnote"><Trophy size={16} /> Solve problems this month to climb the leaderboard.</p></AppShell>;
}
