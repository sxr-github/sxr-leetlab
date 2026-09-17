import { db } from "../libs/db.js";

const publicUser = { id: true, name: true, username: true, image: true };
const roomInclude = {
  creator: { select: publicUser },
  problem: { select: { id: true, title: true, difficulty: true } },
  members: { include: { user: { select: publicUser } }, orderBy: { joinedAt: "asc" } },
};

const hasMembership = (roomId, userId) => db.roomMember.findUnique({ where: { roomId_userId: { roomId, userId } }, select: { id: true } });

export const getRooms = async (req, res) => {
  try {
    const rooms = await db.room.findMany({ where: { members: { some: { userId: req.user.id } } }, include: roomInclude, orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("Room list error:", error);
    return res.status(500).json({ error: "Failed to load rooms" });
  }
};

export const createRoom = async (req, res) => {
  const name = req.body?.name?.trim();
  const description = req.body?.description?.trim() || null;
  const problemId = req.body?.problemId || null;
  if (!name || name.length > 100 || (description && description.length > 500)) return res.status(400).json({ error: "Provide a room name up to 100 characters and an optional description up to 500 characters." });
  try {
    if (problemId) {
      const problem = await db.problem.findUnique({ where: { id: problemId }, select: { id: true } });
      if (!problem) return res.status(404).json({ error: "Problem not found" });
    }
    const room = await db.room.create({
      data: { name, description, problemId, createdBy: req.user.id, members: { create: { userId: req.user.id } } },
      include: roomInclude,
    });
    return res.status(201).json({ success: true, room });
  } catch (error) {
    console.error("Room creation error:", error);
    return res.status(500).json({ error: "Failed to create room" });
  }
};

export const getRoom = async (req, res) => {
  try {
    if (!await hasMembership(req.params.id, req.user.id)) return res.status(403).json({ error: "Join this room before viewing it" });
    const room = await db.room.findUnique({ where: { id: req.params.id }, include: roomInclude });
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("Room fetch error:", error);
    return res.status(500).json({ error: "Failed to load room" });
  }
};

export const inviteToRoom = async (req, res) => {
  const { userId, username } = req.body || {};
  if (!userId && !username) return res.status(400).json({ error: "Provide a friend user id or username" });
  try {
    const room = await db.room.findUnique({ where: { id: req.params.id }, select: { id: true, createdBy: true } });
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (room.createdBy !== req.user.id) return res.status(403).json({ error: "Only the room creator can invite friends" });
    const target = await db.user.findFirst({ where: userId ? { id: userId } : { username: String(username).toLowerCase() }, select: publicUser });
    if (!target) return res.status(404).json({ error: "Coder not found" });
    const friendship = await db.friendship.findFirst({ where: { status: "ACCEPTED", OR: [{ requesterId: req.user.id, addresseeId: target.id }, { requesterId: target.id, addresseeId: req.user.id }] }, select: { id: true } });
    if (!friendship) return res.status(403).json({ error: "You can invite accepted friends only" });
    await db.roomMember.create({ data: { roomId: room.id, userId: target.id } });
    return res.status(201).json({ success: true, member: target });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "This coder is already in the room" });
    console.error("Room invitation error:", error);
    return res.status(500).json({ error: "Failed to invite friend" });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const result = await db.roomMember.deleteMany({ where: { roomId: req.params.id, userId: req.user.id } });
    if (!result.count) return res.status(404).json({ error: "Room membership not found" });
    return res.status(200).json({ success: true, message: "You left the room" });
  } catch (error) {
    console.error("Leave room error:", error);
    return res.status(500).json({ error: "Failed to leave room" });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    if (!await hasMembership(req.params.id, req.user.id)) return res.status(403).json({ error: "Join this room before viewing messages" });
    const messages = await db.roomMessage.findMany({ where: { roomId: req.params.id }, include: { user: { select: publicUser } }, orderBy: { createdAt: "asc" }, take: 200 });
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Room messages error:", error);
    return res.status(500).json({ error: "Failed to load room messages" });
  }
};
