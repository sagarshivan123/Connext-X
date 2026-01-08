// src/socket/socket.js
import { io } from "socket.io-client";
import { setOnlineUsers } from "../store/slices/socketSlice";
import { addIncomingMessage } from "../store/slices/chatSlice";
import { store } from "../store/store";

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:4000", { withCredentials: true });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("onlineUsers", (users) => {
      store.dispatch(setOnlineUsers(users));
    });


    socket.off("receivePrivateMessage");
    socket.on("receivePrivateMessage", (msg) => {
      console.log("📩 New Private Message:", msg);

      const state = store.getState();
      const { selectedChat, chatType } = state.chat;
      const currentUserId = state.auth.user?._id;

      // Ignore if no active chat
      if (!selectedChat || !chatType) return;

      // Group message should not come here, but just in case
      if (!msg.groupId && !msg.group && chatType === "private") {
        const otherUser =
          msg.sender === currentUserId ? msg.receiver : msg.sender;

        // Only push if this message belongs to currently open private chat
        if (
          otherUser?.toString() === selectedChat?.toString()
        ) {
          store.dispatch(addIncomingMessage(msg));
        }
      }
    });

    // // GROUP MESSAGES (optional, if you use group chat)
    socket.off("receiveGroupMessage");
    socket.on("receiveGroupMessage", (msg) => {
      console.log("👥 New Group Message:", msg);
      const state = store.getState();
      const { selectedChat, chatType } = state.chat;

      if (
        chatType === "group" &&
        msg.group?.toString() === selectedChat?.toString()
      ) {
        store.dispatch(addIncomingMessage(msg));
      }
    });


    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  } 
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
