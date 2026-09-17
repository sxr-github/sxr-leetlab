import { db } from "../libs/db.js";

const playlistWithProblems = { problems: { include: { problem: true }, orderBy: { createdAt: "desc" } } };

export const createPlayList = async (req, res) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim() || null;
  if (!name) return res.status(400).json({ error: "A playlist name is required" });
  try {
    const playlist = await db.playlist.create({ data: { name, description, userId: req.user.id } });
    return res.status(201).json({ success: true, message: "Playlist created successfully", playlist });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "You already have a playlist with that name" });
    console.error("Error creating playlist:", error);
    return res.status(500).json({ error: "Failed to create playlist" });
  }
};

export const getPlayAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({ where: { userId: req.user.id }, include: playlistWithProblems, orderBy: { updatedAt: "desc" } });
    return res.status(200).json({ success: true, playlists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

export const getPlayListDetails = async (req, res) => {
  try {
    const playlist = await db.playlist.findFirst({ where: { id: req.params.playlistId, userId: req.user.id }, include: playlistWithProblems });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const problemIds = [...new Set(req.body.problemIds || [])];
  if (!Array.isArray(req.body.problemIds) || !problemIds.length) return res.status(400).json({ error: "Provide at least one problem id" });
  try {
    const playlist = await db.playlist.findFirst({ where: { id: playlistId, userId: req.user.id } });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    const existing = await db.problem.count({ where: { id: { in: problemIds } } });
    if (existing !== problemIds.length) return res.status(404).json({ error: "One or more problems were not found" });
    const result = await db.problemInPlaylist.createMany({ data: problemIds.map((problemId) => ({ playListId: playlistId, problemId })), skipDuplicates: true });
    return res.status(201).json({ success: true, message: "Problems added successfully", added: result.count });
  } catch (error) {
    console.error("Error adding playlist problems:", error);
    return res.status(500).json({ error: "Failed to add problems to playlist" });
  }
};

export const deletePlayList = async (req, res) => {
  try {
    const result = await db.playlist.deleteMany({ where: { id: req.params.playlistId, userId: req.user.id } });
    if (!result.count) return res.status(404).json({ error: "Playlist not found" });
    return res.status(200).json({ success: true, message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return res.status(500).json({ error: "Failed to delete playlist" });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const problemIds = [...new Set(req.body.problemIds || [])];
  if (!Array.isArray(req.body.problemIds) || !problemIds.length) return res.status(400).json({ error: "Provide at least one problem id" });
  try {
    const playlist = await db.playlist.findFirst({ where: { id: req.params.playlistId, userId: req.user.id } });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    const result = await db.problemInPlaylist.deleteMany({ where: { playListId: playlist.id, problemId: { in: problemIds } } });
    return res.status(200).json({ success: true, message: "Problems removed successfully", removed: result.count });
  } catch (error) {
    console.error("Error removing playlist problems:", error);
    return res.status(500).json({ error: "Failed to remove problems from playlist" });
  }
};
