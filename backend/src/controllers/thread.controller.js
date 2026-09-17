import { db } from "../libs/db.js";

const author = { id: true, name: true, username: true, image: true };
const threadInclude = { user: { select: author }, comments: { include: { user: { select: author } }, orderBy: { createdAt: "asc" } } };

export const getThreads = async (req, res) => {
  try {
    const threads = await db.thread.findMany({ where: { problemId: req.params.problemId }, include: threadInclude, orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, threads });
  } catch (error) {
    console.error("Thread fetch error:", error);
    return res.status(500).json({ error: "Failed to load threads" });
  }
};

export const createThread = async (req, res) => {
  const title = req.body?.title?.trim();
  const content = req.body?.content?.trim();
  if (!title || !content || title.length > 160 || content.length > 5_000) return res.status(400).json({ error: "Provide a title up to 160 characters and content up to 5,000 characters." });
  try {
    const problem = await db.problem.findUnique({ where: { id: req.params.problemId }, select: { id: true } });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    const thread = await db.thread.create({ data: { problemId: problem.id, userId: req.user.id, title, content }, include: threadInclude });
    return res.status(201).json({ success: true, thread });
  } catch (error) {
    console.error("Thread creation error:", error);
    return res.status(500).json({ error: "Failed to create thread" });
  }
};

export const createComment = async (req, res) => {
  const content = req.body?.content?.trim();
  if (!content || content.length > 3_000) return res.status(400).json({ error: "Provide a reply up to 3,000 characters." });
  try {
    const thread = await db.thread.findUnique({ where: { id: req.params.threadId }, select: { id: true } });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    const comment = await db.comment.create({ data: { threadId: thread.id, userId: req.user.id, content }, include: { user: { select: author } } });
    return res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Comment creation error:", error);
    return res.status(500).json({ error: "Failed to post reply" });
  }
};
