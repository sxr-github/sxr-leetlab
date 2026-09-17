import { db } from "../libs/db.js";

const publicUser = { id: true, name: true, email: true, image: true };

export const searchUsers = async (req, res) => {
  const query = req.query.q?.trim();
  if (!query || query.length < 2) return res.status(200).json({ success: true, users: [] });
  try {
    const users = await db.user.findMany({
      where: { id: { not: req.user.id }, OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] },
      select: publicUser,
      take: 12,
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("User search error:", error);
    return res.status(500).json({ error: "Could not search for coders" });
  }
};

export const sendFriendRequest = async (req, res) => {
  const addresseeId = req.params.userId;
  if (addresseeId === req.user.id) return res.status(400).json({ error: "You cannot add yourself" });
  try {
    const target = await db.user.findUnique({ where: { id: addresseeId }, select: { id: true } });
    if (!target) return res.status(404).json({ error: "Coder not found" });
    const reverse = await db.friendship.findUnique({ where: { requesterId_addresseeId: { requesterId: addresseeId, addresseeId: req.user.id } } });
    if (reverse?.status === "PENDING") return res.status(409).json({ error: "This coder already sent you a request—accept it from your incoming requests." });
    if (reverse?.status === "ACCEPTED") return res.status(409).json({ error: "You are already friends" });
    const friendship = await db.friendship.create({ data: { requesterId: req.user.id, addresseeId } });
    return res.status(201).json({ success: true, friendship });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "Friend request already sent" });
    console.error("Friend request error:", error);
    return res.status(500).json({ error: "Could not send friend request" });
  }
};

export const getSocialOverview = async (req, res) => {
  try {
    const [incoming, outgoing, friendships] = await Promise.all([
      db.friendship.findMany({ where: { addresseeId: req.user.id, status: "PENDING" }, include: { requester: { select: publicUser } }, orderBy: { createdAt: "desc" } }),
      db.friendship.findMany({ where: { requesterId: req.user.id, status: "PENDING" }, include: { addressee: { select: publicUser } }, orderBy: { createdAt: "desc" } }),
      db.friendship.findMany({ where: { status: "ACCEPTED", OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] }, include: { requester: { select: publicUser }, addressee: { select: publicUser } }, orderBy: { updatedAt: "desc" } }),
    ]);
    const friends = friendships.map((friendship) => ({ id: friendship.id, user: friendship.requesterId === req.user.id ? friendship.addressee : friendship.requester }));
    return res.status(200).json({ success: true, incoming, outgoing, friends });
  } catch (error) {
    console.error("Social overview error:", error);
    return res.status(500).json({ error: "Could not load friends" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const result = await db.friendship.updateMany({ where: { id: req.params.requestId, addresseeId: req.user.id, status: "PENDING" }, data: { status: "ACCEPTED" } });
    if (!result.count) return res.status(404).json({ error: "Friend request not found" });
    return res.status(200).json({ success: true, message: "You are now friends" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    return res.status(500).json({ error: "Could not accept friend request" });
  }
};

export const removeFriendship = async (req, res) => {
  try {
    const result = await db.friendship.deleteMany({ where: { id: req.params.requestId, OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] } });
    if (!result.count) return res.status(404).json({ error: "Friend request not found" });
    return res.status(200).json({ success: true, message: "Friend request removed" });
  } catch (error) {
    console.error("Remove friendship error:", error);
    return res.status(500).json({ error: "Could not remove friend request" });
  }
};

export const getFriendActivity = async (req, res) => {
  try {
    const relations = await db.friendship.findMany({ where: { status: "ACCEPTED", OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] }, select: { requesterId: true, addresseeId: true } });
    const friendIds = relations.map((item) => item.requesterId === req.user.id ? item.addresseeId : item.requesterId);
    if (!friendIds.length) return res.status(200).json({ success: true, activity: [] });
    const activity = await db.submission.findMany({ where: { userId: { in: friendIds } }, include: { user: { select: publicUser }, problem: { select: { title: true, difficulty: true } } }, orderBy: { createdAt: "desc" }, take: 20 });
    return res.status(200).json({ success: true, activity });
  } catch (error) {
    console.error("Friend activity error:", error);
    return res.status(500).json({ error: "Could not load friend activity" });
  }
};
