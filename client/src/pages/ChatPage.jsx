// src/pages/ChatPage.jsx
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import { connectSocket, disconnectSocket } from "../socket/socket";

import {
  addIncomingMessage,
  getPrivateMessages,
  getGroupMessages,
} from "../store/slices/chatSlice";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { selectedChat, chatType } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // ========================
  // LOAD MESSAGES ON CHAT CHANGE
  // ========================
  useEffect(() => {
    if (selectedChat && chatType) {
      if (chatType === "private") {
        dispatch(getPrivateMessages({ user1: user._id, user2: selectedChat }));
      } else {
        dispatch(getGroupMessages(selectedChat));
      }
    }
  }, [selectedChat, chatType]);
  


  // ========================
  // SOCKET CONNECTION + LISTENERS
  // ========================
  // useEffect(() => {
  //   if (!user?._id) return;

  //   // Connect socket with userId
  //   const socket = connectSocket(user._id);

  //   // PRIVATE MESSAGE
  //   socket.on("receivePrivateMessage", (msg) => {
  //     dispatch(addIncomingMessage(msg));
  //   });

  //   // GROUP MESSAGE
  //   socket.on("receiveGroupMessage", (msg) => {
  //     dispatch(addIncomingMessage(msg));
  //   });

  //   // ONLINE USERS
  //   socket.on("onlineUsers", (online) => {
  //     console.log("Online users:", online);
  //   });

  //   // TYPING EVENTS
  //   socket.on("typing", (senderId) => {
  //     console.log(senderId, "typing...");
  //   });

  //   socket.on("stopTyping", (senderId) => {
  //     console.log(senderId, "stopped typing");
  //   });

  //   return () => {
  //     socket.off("receivePrivateMessage");
  //     socket.off("receiveGroupMessage");
  //     socket.off("onlineUsers");
  //     socket.off("typing");
  //     socket.off("stopTyping");
  //     disconnectSocket();
  //   };
  // }, [user, dispatch]);
  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket(user._id);

    return () => {
      disconnectSocket();
    };
  }, [user]);


  return (
    <div className="h-screen flex bg-slate-900 text-white">
      <Sidebar />

      {selectedChat ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
