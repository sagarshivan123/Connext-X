// src/pages/ChatPage.jsx
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { getPrivateMessages, getGroupMessages } from "../store/slices/chatSlice";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { selectedChat, chatType } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Load Messages when chat selection changes
  useEffect(() => {
    if (selectedChat && chatType && user?._id) {
      if (chatType === "private") {
        dispatch(getPrivateMessages({ user1: user._id, user2: selectedChat }));
      } else {
        dispatch(getGroupMessages(selectedChat));
      }
    }
  }, [selectedChat, chatType, user?._id, dispatch]);

  // Socket Connection Management
  useEffect(() => {
    if (!user?._id) return;
    connectSocket(user._id);
    return () => disconnectSocket();
  }, [user?._id]);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-900 text-white">
      
      {/* SIDEBAR CONTAINER 
          Mobile: Full width (w-full) if NO chat is selected. Hidden if chat is selected.
          Desktop: Fixed width (md:w-80), always visible.
      */}
      <div className={`${selectedChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 border-r border-slate-800 h-full`}>
        <Sidebar />
      </div>

      {/* CHAT WINDOW CONTAINER 
          Mobile: Full width (w-full) if a chat IS selected. Hidden if no chat is selected.
          Desktop: Takes remaining space (flex-1), always visible.
      */}
      <div className={`${selectedChat ? 'flex' : 'hidden'} md:flex flex-1 h-full`}>
        {selectedChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-900/50">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-400">Select a conversation</h3>
            <p className="text-slate-500 text-sm mt-2">Choose a friend or group to start chatting</p>
          </div>
        )}
      </div>
      
    </div>
  );
}