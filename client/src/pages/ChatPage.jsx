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
  // useEffect(() => {
  //   if (selectedChat && chatType && user?._id) {
  //     if (chatType === "private") {
  //       dispatch(getPrivateMessages({ user1: user._id, user2: selectedChat }));
  //     } else {
  //       dispatch(getGroupMessages(selectedChat));
  //     }
  //   }
  // }, [selectedChat, chatType, user?._id, dispatch]);

  // Socket Connection Management
  useEffect(() => {
    if (!user?._id) return;
    connectSocket(user._id);
    return () => disconnectSocket();
  }, [user?._id]);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-900 text-white">
      <div className={`${selectedChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 border-r border-slate-800 h-full`}>
        <Sidebar />
      </div>
      <div className={`${selectedChat ? 'flex' : 'hidden'} md:flex flex-1 h-full`}>
        {selectedChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-900/50">
          
            <h3 className="text-xl font-semibold text-slate-400">Select a conversation</h3>
            <p className="text-slate-500 text-sm mt-2">Choose a friend or group to start chatting</p>
          </div>
        )}
      </div>
      
    </div>
  );
}