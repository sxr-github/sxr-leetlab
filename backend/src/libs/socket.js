import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { db } from "./db.js";

const parseCookies = (header = "") => Object.fromEntries(header.split(";").flatMap((part) => {
  const index = part.indexOf("=");
  return index > 0 ? [[part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))]] : [];
}));

export const attachSocketServer = (server, origins) => {
  const io = new Server(server, { cors: { origin: [...origins], credentials: true } });

  io.use(async (socket, next) => {
    try {
      const token = parseCookies(socket.handshake.headers.cookie).jwt;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, username: true } });
      if (!user) return next(new Error("User not found"));
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const canAccess = (roomId) => db.roomMember.findUnique({ where: { roomId_userId: { roomId, userId: socket.data.user.id } }, select: { id: true } });

    socket.on("join-room", async ({ roomId } = {}, acknowledge) => {
      if (typeof roomId !== "string" || !await canAccess(roomId)) return acknowledge?.({ ok: false, error: "Room access denied" });
      socket.join(roomId);
      return acknowledge?.({ ok: true });
    });

    socket.on("leave-room", ({ roomId } = {}) => {
      if (typeof roomId === "string") socket.leave(roomId);
    });

    socket.on("send-message", async ({ roomId, content } = {}, acknowledge) => {
      const text = typeof content === "string" ? content.trim() : "";
      if (typeof roomId !== "string" || !text || text.length > 2_000) return acknowledge?.({ ok: false, error: "Provide a message up to 2,000 characters" });
      if (!await canAccess(roomId)) return acknowledge?.({ ok: false, error: "Room access denied" });
      try {
        const message = await db.roomMessage.create({ data: { roomId, userId: socket.data.user.id, content: text } });
        const payload = { id: message.id, roomId, userId: socket.data.user.id, userName: socket.data.user.name || socket.data.user.username, content: message.content, createdAt: message.createdAt };
        io.to(roomId).emit("new-message", payload);
        return acknowledge?.({ ok: true });
      } catch (error) {
        console.error("Socket message error:", error);
        return acknowledge?.({ ok: false, error: "Could not send message" });
      }
    });
  });

  return io;
};
