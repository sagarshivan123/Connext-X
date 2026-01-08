// // src/socket/socket.js
// import { io } from "socket.io-client";
// import { setOnlineUsers } from "../store/slices/socketSlice";
// import { addIncomingMessage } from "../store/slices/chatSlice";
// import { store } from "../store/store";

// let socket = null;

// export const connectSocket = (userId) => {
//   if (!socket) {
//     socket = io("http://localhost:4000", { withCredentials: true });

//     socket.on("connect", () => {
//       console.log("Socket connected:", socket.id);
//       if (userId) {
//         socket.emit("join", userId);
//       }
//     });

//     socket.on("onlineUsers", (users) => {
//       store.dispatch(setOnlineUsers(users));
//     });


//     socket.off("receivePrivateMessage");
//     socket.on("receivePrivateMessage", (msg) => {
//       console.log("📩 New Private Message:", msg);

//       const state = store.getState();
//       const { selectedChat, chatType } = state.chat;
//       const currentUserId = state.auth.user?._id;

//       // Ignore if no active chat
//       if (!selectedChat || !chatType) return;

//       // Group message should not come here, but just in case
//       if (!msg.groupId && !msg.group && chatType === "private") {
//         const otherUser =
//           msg.sender === currentUserId ? msg.receiver : msg.sender;

//         // Only push if this message belongs to currently open private chat
//         if (
//           otherUser?.toString() === selectedChat?.toString()
//         ) {
//           store.dispatch(addIncomingMessage(msg));
//         }
//       }
//     });

//     // // GROUP MESSAGES (optional, if you use group chat)
//     socket.off("receiveGroupMessage");
//     socket.on("receiveGroupMessage", (msg) => {
//       console.log("👥 New Group Message:", msg);
//       const state = store.getState();
//       const { selectedChat, chatType } = state.chat;

//       if (
//         chatType === "group" &&
//         msg.group?.toString() === selectedChat?.toString()
//       ) {
//         store.dispatch(addIncomingMessage(msg));
//       }
//     });


//     socket.on("disconnect", () => {
//       console.log("Socket disconnected");
//     });
//   } 
//   return socket;
// };

// export const getSocket = () => socket;

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

import { io } from "socket.io-client";
import { setOnlineUsers } from "../store/slices/socketSlice";
import { addIncomingMessage } from "../store/slices/chatSlice";
import { store } from "../store/store";

let socket = null;

// Use environment variable for backend URL
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const connectSocket = (userId) => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback to polling for mobile
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // Increase timeout for slow mobile networks
      autoConnect: true
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (userId) {
        socket.emit("join", userId);
        console.log("👤 Joined with userId:", userId);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.log("Retrying connection...");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after maximum attempts");
    });

    socket.on("onlineUsers", (users) => {
      console.log("👥 Online users updated:", users?.length || 0);
      store.dispatch(setOnlineUsers(users));
    });

    // Remove old listeners to prevent duplicates
    socket.off("receivePrivateMessage");
    socket.on("receivePrivateMessage", (msg) => {
      console.log("📩 New Private Message:", msg);

      const state = store.getState();
      const { selectedChat, chatType } = state.chat;
      const currentUserId = state.auth.user?._id;

      // Ignore if no active chat
      if (!selectedChat || !chatType) {
        console.log("⚠️ No active chat, message ignored");
        return;
      }

      // Only handle private messages here
      if (!msg.groupId && !msg.group && chatType === "private") {
        // Extract sender/receiver IDs (handle both object and string)
        const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
        const receiverId = typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;
        
        const otherUser = String(senderId) === String(currentUserId) 
          ? receiverId 
          : senderId;

        // Only push if this message belongs to currently open private chat
        if (String(otherUser) === String(selectedChat)) {
          console.log("✅ Private message dispatched to store");
          store.dispatch(addIncomingMessage(msg));
        } else {
          console.log("⚠️ Message from different chat, ignored");
        }
      }
    });

    // Group messages
    socket.off("receiveGroupMessage");
    socket.on("receiveGroupMessage", (msg) => {
      console.log("👥 New Group Message:", msg);
      
      const state = store.getState();
      const { selectedChat, chatType } = state.chat;

      if (!selectedChat || chatType !== "group") {
        console.log("⚠️ Not in group chat, message ignored");
        return;
      }

      // Extract group ID (handle both object and string)
      const messageGroupId = typeof msg.group === "object" 
        ? msg.group._id 
        : msg.group;

      if (String(messageGroupId) === String(selectedChat)) {
        console.log("✅ Group message dispatched to store");
        store.dispatch(addIncomingMessage(msg));
      } else {
        console.log("⚠️ Message from different group, ignored");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, need to reconnect manually
        socket.connect();
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  }
  
  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Socket not connected");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};