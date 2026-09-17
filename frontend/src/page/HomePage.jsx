import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, CircleAlert } from "lucide-react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";

const difficultyClass = (difficulty) => `pill ${difficulty.toLowerCase()}`;
export default function HomePage() {
  const [problems, setProblems] = useState([]); const [solved, setSolved] = useState([]); const [query, setQuery] = useState(""); const [difficulty, setDifficulty] = useState("ALL"); const [error, setError] = useState("");
  useEffect(() => { Promise.all([api("/problems/get-all-problem"), api("/problems/get-solved-problems")]).then(([all, progress]) => { setProblems(all.problem || []); setSolved((progress.problems || []).map((p) => p.id)); }).catch((err) => setError(err.message)); }, []);
  const visible = useMemo(() => problems.filter((problem) => (difficulty === "ALL" || problem.difficulty === difficulty) && `${problem.title} ${problem.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [problems, difficulty, query]);
  return <AppShell><div className="hero"><div><span className="eyebrow">CODING PRACTICE</span><h1>Make progress, one problem at a time.</h1><p>{solved.length} of {problems.length} problems solved</p></div><div className="progress"><span style={{ width: `${problems.length ? (solved.length / problems.length) * 100 : 0}%` }} /></div></div>{error ? <p className="alert"><CircleAlert size={18} /> {error}</p> : <><div className="toolbar"><div className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems or tags" /></div><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="ALL">All difficulties</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div><div className="problem-list">{visible.map((problem, index) => <Link key={problem.id} className="problem-row" to={`/problems/${problem.id}`}><span className={solved.includes(problem.id) ? "check solved" : "check"}>{solved.includes(problem.id) ? "✓" : index + 1}</span><strong>{problem.title}</strong><span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span><span className="tags">{problem.tags.map((tag) => <i key={tag}>{tag}</i>)}</span></Link>)}{!visible.length && <p className="empty">No problems match those filters.</p>}</div></>}</AppShell>;
}
