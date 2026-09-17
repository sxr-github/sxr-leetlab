import { useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

export default function LeaderboardPage() {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api("/leaderboard/monthly").then(setData).catch((err) => setError(err.message)); }, []);
  if (error) return <AppShell><p className="alert">{error}</p></AppShell>;
  if (!data) return <div className="centered">Loading leaderboard…</div>;
  return <AppShell><div className="section-heading leaderboard-heading"><div><span className="eyebrow">MONTHLY RANKINGS</span><h1><Trophy size={31} /> {data.month} leaderboard</h1><p>Easy problems earn 1 point, medium 3, and hard 5.</p></div></div><div className="leaderboard-table"><div className="leaderboard-row table-head"><span>Rank</span><span>Coder</span><span>Solved</span><span>Score</span></div>{data.leaderboard.map((entry) => <div className="leaderboard-row" key={entry.user.id}><span className={entry.rank <= 3 ? "rank top-rank" : "rank"}>{entry.rank === 1 ? <Crown size={19} /> : entry.rank <= 3 ? <Medal size={18} /> : `#${entry.rank}`}</span><strong>{entry.user.name || "Anonymous coder"}</strong><span>{entry.solved}</span><strong>{entry.score} pts</strong></div>)}{!data.leaderboard.length && <p className="empty">No solved problems this month yet. Be the first on the board.</p>}</div></AppShell>;
}
