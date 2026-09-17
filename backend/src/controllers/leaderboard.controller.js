import { db } from "../libs/db.js";

const points = { EASY: 1, MEDIUM: 3, HARD: 5 };

export const getMonthlyLeaderboard = async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  try {
    const solved = await db.problemSolved.findMany({
      where: { createdAt: { gte: monthStart } },
      include: { user: { select: { id: true, name: true, image: true } }, problem: { select: { difficulty: true } } },
    });
    const rows = new Map();
    for (const item of solved) {
      const row = rows.get(item.userId) || { user: item.user, solved: 0, score: 0, easy: 0, medium: 0, hard: 0 };
      row.solved += 1;
      row.score += points[item.problem.difficulty] || 0;
      row[item.problem.difficulty.toLowerCase()] += 1;
      rows.set(item.userId, row);
    }
    const leaderboard = [...rows.values()].sort((a, b) => b.score - a.score || b.solved - a.solved).map((row, index) => ({ ...row, rank: index + 1 }));
    return res.status(200).json({ success: true, month: now.toLocaleString("en", { month: "long", year: "numeric" }), leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Failed to load leaderboard" });
  }
};
