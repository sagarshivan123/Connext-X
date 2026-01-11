
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

const BASE_URL = import.meta.env.VITE_API_URL||'http://localhost:4000';
export default function MessageInput() {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user } = useSelector((s) => s.auth);
  const { selectedChat, chatType } = useSelector((s) => s.chat);

  const socketEmit = (event, payload) => {
    const socket = getSocket();
    socket && socket.emit(event, payload);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socketEmit(
      chatType === "private" ? "privateMessage" : "groupMessage",
      chatType === "private"
        ? { sender: user._id, receiver: selectedChat, message: text }
        : { sender: user._id, groupId: selectedChat, message: text }
    );

    setText("");
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    // auto resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";

    if (!isTyping) {
      setIsTyping(true);
      socketEmit("typing", { chatId: selectedChat, chatType, userId: user._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketEmit("stopTyping", {
        chatId: selectedChat,
        chatType,
        userId: user._id,
      });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    socketEmit(
      chatType === "private" ? "privateMessage" : "groupMessage",
      chatType === "private"
        ? {
            sender: user._id,
            receiver: selectedChat,
            mediaUrl: data.url,
            mediaType: data.type,
          }
        : {
            sender: user._id,
            groupId: selectedChat,
            mediaUrl: data.url,
            mediaType: data.type,
          }
    );    
  };

  const emojis = ["😊", "😂", "❤️", "👍", "👎", "😢", "😮", "😡", "🎉", "🔥"];

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 bg-slate-700/95 p-4 rounded-2xl z-50">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((e, i) => (
              <button
                key={i}
                onClick={() => {
                  setText((t) => t + e);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl p-2 hover:bg-slate-600/50 rounded-lg"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-900 border-t border-slate-600/50">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />

          <button type="button" onClick={() => fileInputRef.current.click()}>
            📎
          </button>

          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊
          </button>

          <textarea
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none p-3 rounded-xl bg-slate-700 text-white"
          />

          <button type="submit" disabled={!text.trim()}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
