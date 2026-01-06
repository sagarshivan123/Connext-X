
// import { useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { sendMessage } from "../store/slices/chatSlice";
// import { getSocket } from "../socket/socket";

// export default function MessageInput() {
//   const [text, setText] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const fileInputRef = useRef(null);
//   const dispatch = useDispatch();

//   const { user } = useSelector((state) => state.auth);
//   const { selectedChat, chatType } = useSelector((state) => state.chat);

//   const handleSend = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;

//     const socket = getSocket();
//     if (socket) {
//       if (chatType === "private") {
//         socket.emit("privateMessage", {
//           sender: user._id,
//           receiver: selectedChat,
//           message: text,
//         });
//       } else {
//         socket.emit("groupMessage", {
//           senderId: user._id,
//           groupId: selectedChat,
//           message: text,
//         });
//       }
//     }

//     setText("");
//     setIsTyping(false);
//   };

//   const handleInputChange = (e) => {
//     setText(e.target.value);
    
//     // Auto-resize textarea
//     const textarea = e.target;
//     textarea.style.height = 'auto';
//     textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    
//     // Typing indicator logic
//     if (!isTyping) {
//       setIsTyping(true);
//       const socket = getSocket();
//       if (socket) {
//         socket.emit("typing", { 
//           chatId: selectedChat, 
//           chatType, 
//           userId: user._id 
//         });
//       }
//     }

//     // Clear typing after 1 second of no typing
//     setTimeout(() => {
//       setIsTyping(false);
//       const socket = getSocket();
//       if (socket) {
//         socket.emit("stopTyping", { 
//           chatId: selectedChat, 
//           chatType, 
//           userId: user._id 
//         });
//       }
//     }, 1000);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend(e);
//     }
//   };

//   const handleEmojiClick = (emoji) => {
//     setText(prev => prev + emoji);
//     setShowEmojiPicker(false);
//   };

//   const handleFileClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const formData = new FormData();
//     formData.append("file", file);
  
//     const res = await fetch("http://localhost:4000/api/upload", {
//       method: "POST",
//       body: formData,
//     });
  
//     const data = await res.json();
  
//     const socket = getSocket();
//     socket.emit("privateMessage", {
//       sender: user._id,
//       receiver: selectedChat,
//       mediaUrl: data.url,
//       mediaType: data.type,
//     });
//   };
  

//   const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥'];

//   return (
//     <div className="relative">
//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <div className="absolute bottom-full left-4 mb-2 bg-slate-700/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-slate-600/50 animate-slideUp z-50">
//           <div className="grid grid-cols-5 gap-2">
//             {commonEmojis.map((emoji, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleEmojiClick(emoji)}
//                 className="text-2xl p-2 hover:bg-slate-600/50 rounded-lg transition-all duration-200 hover:scale-110"
//               >
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Main Input Container */}
//       <div className="p-4 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-md border-t border-slate-600/50">
//         <form onSubmit={handleSend} className="flex items-center gap-3">
//           {/* File Upload Hidden Input */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             onChange={handleFileChange}
//             className="hidden"
//             accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
//           />

//           {/* Left Action Buttons */}
//           <div className="flex gap-2 flex-shrink-0">
//             {/* Attachment Button */}
//             <button
//               type="button"
//               onClick={handleFileClick}
//               className="p-3 text-gray-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-full transition-all duration-200 group"
//               title="Attach file"
//             >
//               <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
//               </svg>
//             </button>

//             {/* Emoji Button */}
//             <button
//               type="button"
//               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//               className={`p-3 rounded-full transition-all duration-200 group ${
//                 showEmojiPicker 
//                   ? 'text-yellow-400 bg-slate-700/50' 
//                   : 'text-gray-400 hover:text-yellow-400 hover:bg-slate-700/50'
//               }`}
//               title="Add emoji"
//             >
//               <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </button>
//           </div>

//           {/* Message Input Container */}
//           <div className="flex-1 relative">
//             <textarea
//               value={text}
//               onChange={handleInputChange}
//               onKeyPress={handleKeyPress}
//               placeholder="Type a message..."
//               rows={1}
//               className="w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm text-white placeholder-gray-400 rounded-2xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none max-h-32 overflow-y-auto"
//               style={{
//                 minHeight: '48px',
//                 lineHeight: '1.5',
//                 scrollbarWidth: 'thin',
//                 scrollbarColor: 'rgb(71 85 105) transparent'
//               }}
//             />
            
//             {/* Character Counter */}
//             {text.length > 0 && (
//               <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-slate-800/50 px-2 py-1 rounded-full">
//                 {text.length}
//               </div>
//             )}
//           </div>

//           {/* Send Button */}
//           <div className="flex-shrink-0">
//             <button
//               type="submit"
//               disabled={!text.trim()}
//               className={`p-3 rounded-full transition-all duration-200 transform ${
//                 text.trim()
//                   ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
//                   : 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
//               }`}
//               title={text.trim() ? "Send message" : "Type a message to send"}
//             >
//               {text.trim() ? (
//                 <svg className="w-5 h-5 transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </form>

//       </div>

//     </div>
//   );
// }

import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

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

    const res = await fetch("http://localhost:4000/api/upload", {
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
