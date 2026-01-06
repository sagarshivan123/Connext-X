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
  
  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket(user._id);

    return () => {
      disconnectSocket();
    };
  }, [user]);


  return (
    <div className="h-screen flex bg-slate-900 text-white">
      {/* Sidebar: visible on mobile only when no chat is selected, always visible on md+ */}
      <div className={`${selectedChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 border-r border-slate-800`}>
        <Sidebar />
      </div>

      {/* Right pane: hidden on mobile until a chat is selected; on md+ always visible */}
      <div className={`${selectedChat ? 'flex' : 'hidden'} md:flex flex-1`}>
        {selectedChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-400 text-lg">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
