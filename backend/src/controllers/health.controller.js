import { db } from "../libs/db.js";

export const healthCheck = async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    return res.status(200).json({ success: true, status: "healthy", database: "connected" });
  } catch (error) {
    return res.status(503).json({ success: false, status: "unhealthy", database: "unavailable" });
  }
};
