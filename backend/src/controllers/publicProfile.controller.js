import { db } from "../libs/db.js";

const publicUser = { id: true, name: true, username: true, image: true, createdAt: true };

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);
const streakFor = (dates) => {
  const solvedDays = new Set(dates.map(dayKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (solvedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

const badgesFor = (solved, hard, streak) => [
  solved >= 10 && { id: "ten-solved", label: "Solved 10 problems", detail: "Ten problems conquered" },
  hard >= 5 && { id: "hard-five", label: "Hard problem solver", detail: "Five hard problems solved" },
  streak >= 7 && { id: "week-streak", label: "7-day streak", detail: "Solved on seven consecutive days" },
].filter(Boolean);

export const getPublicProfile = async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { username: req.params.username.toLowerCase() }, select: publicUser });
    if (!user) return res.status(404).json({ error: "Coder not found" });
    const [solvedRows, submissions, recentSubmissions] = await Promise.all([
      db.problemSolved.findMany({ where: { userId: user.id }, include: { problem: { select: { difficulty: true } } }, orderBy: { createdAt: "asc" } }),
      db.submission.count({ where: { userId: user.id } }),
      db.submission.findMany({ where: { userId: user.id }, include: { problem: { select: { id: true, title: true, difficulty: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    const byDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
    solvedRows.forEach((item) => { byDifficulty[item.problem.difficulty] += 1; });
    const streak = streakFor(solvedRows.map((item) => item.createdAt));
    return res.status(200).json({
      success: true,
      profile: {
        user,
        solved: solvedRows.length,
        submissions,
        byDifficulty,
        recentSubmissions,
        badges: badgesFor(solvedRows.length, byDifficulty.HARD, streak),
        currentStreak: streak,
      },
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return res.status(500).json({ error: "Failed to load public profile" });
  }
};

export const getSolveHeatmap = async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { username: req.params.username.toLowerCase() }, select: { id: true } });
    if (!user) return res.status(404).json({ error: "Coder not found" });
    const solved = await db.problemSolved.findMany({ where: { userId: user.id }, select: { createdAt: true } });
    const counts = solved.reduce((days, item) => {
      const day = dayKey(item.createdAt);
      days[day] = (days[day] || 0) + 1;
      return days;
    }, {});
    return res.status(200).json({ success: true, days: counts });
  } catch (error) {
    console.error("Heatmap error:", error);
    return res.status(500).json({ error: "Failed to load solve heatmap" });
  }
};
