import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";


const app = express();
dotenv.config();
connectDB();
const server = http.createServer(app);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());


import User from "./models/userModel.js";
import Group from "./models/groupModel.js";
import Message from "./models/messageModel.js";

import authRouter from "./routes/authRouter.js";
import messageRouter from "./routes/messageRouter.js";
import groupRouter from "./routes/groupRouter.js";
import uploadRouter from "./routes/uploadRouter.js";

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads"));

app.use("/api/upload", uploadRouter);



export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});
const onlineUsers = new Map(); // ✅ GLOBAL

io.on("connection", (socket) => {
  console.log("✅ user connected", socket.id);

  // JOIN (private chat)
  socket.on("join", (userId) => {
    socket.join(userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("onlineUsers", [...onlineUsers.keys()]);
  });
  

  // TYPING
  socket.on("typing", ({ chatId, chatType, userId }) => {
    if (chatType === "private") {
      io.to(chatId).emit("typing", userId);
    } else {
      io.to(chatId).emit("typing", userId);
    }
  });
  
  socket.on("stopTyping", ({ chatId, chatType, userId }) => {
    if (chatType === "private") {
      io.to(chatId).emit("stopTyping", userId);
    } else {
      io.to(chatId).emit("stopTyping", userId);
    }
  });
  

  // ✅ PRIVATE MESSAGE (FIXED)
  socket.on("privateMessage", async ({ sender, receiver, message, mediaUrl, mediaType }) => {
    const newMsg = await Message.create({
      sender,
      receiver,
      message: message || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
    });
  
    socket.emit("receivePrivateMessage", newMsg);
    io.to(receiver).emit("receivePrivateMessage", newMsg);
  });
  

  // GROUP
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  socket.on("groupMessage", async ({ sender, groupId, message, mediaUrl, mediaType }) => {
    if (!sender || !groupId) {
      console.error("❌ Invalid group message payload", { sender, groupId });
      return;
    }
  
    const saved = await Message.create({
      sender,           // ✅ correct
      group: groupId,   // ✅ correct (schema field)
      message: message || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
    });
  
    io.to(groupId.toString()).emit("receiveGroupMessage", saved);
  });
  

  // DISCONNECT (ONLY ONE)
  socket.on("disconnect", () => {
    for (let [userId, sockets] of onlineUsers.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit("onlineUsers", [...onlineUsers.keys()]);
    console.log("❌ user disconnected", socket.id);
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});