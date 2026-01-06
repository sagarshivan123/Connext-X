import { useDispatch, useSelector } from "react-redux";
import MessageInput from "./MessageInput";
import { getPrivateMessages, getGroupMessages, clearActiveChat } from "../store/slices/chatSlice";
import { useEffect, useState, useRef } from "react";
import { getSocket } from "../socket/socket";
import { addMember, removeMember } from "../store/slices/groupSlice";
import api from "../store/api";
import { getMyGroups } from "../store/slices/groupSlice";

export default function ChatWindow() {
  const { messages, selectedChat, chatType } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { groups } = useSelector((state) => state.group);
  
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const groupImageInputRef = useRef(null);
  const activeFriend = user?.friends?.find((f) => f._id === selectedChat);
  const activeGroup = groups?.find(
    (g) => String(g._id) === String(selectedChat)
  );  
  const safeMessages = Array.isArray(messages) ? messages : [];

  const adminId =
  typeof activeGroup?.admin === "object"
    ? activeGroup.admin._id
    : activeGroup?.admin;

  // Check if current user is group admin
  const isGroupAdmin =
  chatType === "group" &&
  activeGroup?.creator &&
  user?._id &&
  String(
    typeof activeGroup.creator === "object"
      ? activeGroup.creator._id
      : activeGroup.creator
  ) === String(user._id);

console.log("ADMIN ID:", adminId);
// console.log("USER ID:", user._id);
console.log("IS ADMIN:", isGroupAdmin);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedChat || !chatType || !user?._id) return;

    if (chatType === "private") {
      dispatch(
        getPrivateMessages({
          user1: user._id,
          user2: selectedChat,
        })
      );
    } else {
      dispatch(getGroupMessages(selectedChat));
    }
  }, [selectedChat, chatType, dispatch, user?._id]);

  useEffect(() => {
    if (chatType === "group" && selectedChat) {
      const socket = getSocket();
      if (socket) {
        socket.emit("joinGroup", selectedChat);
      }
    }
  }, [chatType, selectedChat]);


  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;

    try {
      const res = await api.post("/auth/find-user", { email: memberEmail });
      const userId = res.data.user._id;

      await dispatch(addMember({ groupId: selectedChat, userId }));
      await dispatch(getMyGroups());
      await dispatch(getGroupMessages(selectedChat));
      setMemberEmail("");
      setShowAddMemberModal(false);
    } catch (err) {
      console.error(err);
      alert("Error adding member. Please try again.");
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMemberToRemove) return;

    try {
      await dispatch(removeMember({ 
        groupId: selectedChat, 
        userId: selectedMemberToRemove._id 
      }));
      await dispatch(getMyGroups());
      await dispatch(getGroupMessages(selectedChat));
      setSelectedMemberToRemove(null);
      setShowRemoveMemberModal(false);
      setShowMemberListModal(false);
    } catch (err) {
      console.error(err);
      alert("Error removing member. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mediaType) => {
    switch (mediaType) {
      case 'document':
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
    }
  };

  const renderMessageContent = (msg, isMyMessage) => {
    const baseClasses = "rounded-xl overflow-hidden";
    
    // Text-only message
    if (msg.message && !msg.mediaUrl) {
      return (
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {msg.message}
        </p>
      );
    }

    // If there's a mediaUrl, determine the type
    if (msg.mediaUrl) {
      const fileExtension = msg.mediaUrl.toLowerCase();
      
      // Image files
      if (msg.mediaType === "image" || fileExtension.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
        return (
          <div className={baseClasses}>
            {msg.message && (
              <p className="text-sm leading-relaxed mb-2 break-words">{msg.message}</p>
            )}
            <div className="relative group cursor-pointer" onClick={() => setFullScreenImage(`http://localhost:4000${msg.mediaUrl}`)}>
              <img
                src={`http://localhost:4000${msg.mediaUrl}`}
                alt="shared image"
                className="max-w-[280px] max-h-[300px] object-cover rounded-lg hover:opacity-95 transition-opacity"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 bg-red-100 rounded-lg flex-col items-center justify-center text-red-500">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Image failed to load</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-black/50 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Video files
      if (msg.mediaType === "video" || fileExtension.match(/\.(mp4|avi|mkv|mov|wmv|webm|flv|m4v)$/)) {
        return (
          <div className={baseClasses}>
            {msg.message && (
              <p className="text-sm leading-relaxed mb-2 break-words">{msg.message}</p>
            )}
            <video
              src={`http://localhost:4000${msg.mediaUrl}`}
              controls
              className="max-w-[280px] max-h-[300px] rounded-lg bg-black"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            >
              Your browser does not support the video tag.
            </video>
            <div className="hidden bg-red-100 rounded-lg p-4 flex-col items-center justify-center text-red-500">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Video failed to load</span>
            </div>
          </div>
        );
      }

      // Audio files
      if (msg.mediaType === "audio" || fileExtension.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/)) {
        return (
          <div className={`${baseClasses} p-4 ${isMyMessage ? 'bg-blue-600/20' : 'bg-slate-600/50'}`}>
            {msg.message && (
              <p className="text-sm leading-relaxed mb-3 break-words">{msg.message}</p>
            )}
            <div className="flex items-center gap-3">
              {getFileIcon('audio')}
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {msg.fileName || 'Audio File'}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(msg.fileSize)}
                </p>
              </div>
            </div>
            <audio
              src={`http://localhost:4000${msg.mediaUrl}`}
              controls
              className="w-full mt-3 h-8"
              style={{ height: '32px' }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      }

      // All other files (documents, PDFs, etc.)
      return (
        <div className={`${baseClasses} p-4 ${isMyMessage ? 'bg-blue-600/20' : 'bg-slate-600/50'} border ${isMyMessage ? 'border-blue-400/30' : 'border-slate-500/50'} min-w-[250px]`}>
          {msg.message && (
            <p className="text-sm leading-relaxed mb-3 break-words">{msg.message}</p>
          )}
          <div className="flex items-center gap-3">
            {getFileIcon(msg.mediaType || 'document')}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {msg.fileName || msg.mediaUrl?.split('/').pop() || 'Document'}
              </p>
              {msg.fileSize && (
                <p className="text-xs text-gray-400">
                  {formatFileSize(msg.fileSize)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Click to download
              </p>
            </div>
            <a
              href={`http://localhost:4000${msg.mediaUrl}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isMyMessage 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-500 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download
            </a>
          </div>
        </div>
      );
    }

    // Fallback for messages with only text
    return (
      <p className="text-sm leading-relaxed break-words">
        {msg.message || "Unsupported message type"}
      </p>
    );
  };

  const AddMemberModal = showAddMemberModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl w-96 shadow-2xl border border-slate-600/50 animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Add Member</h3>
          </div>
          <button
            onClick={() => setShowAddMemberModal(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Member Email</label>
          <input
            type="email"
            placeholder="Enter user email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
            onClick={() => setShowAddMemberModal(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-blue-500/25"
            onClick={handleAddMember}
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );

  const MemberListModal = showMemberListModal && activeGroup && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl w-96 shadow-2xl border border-slate-600/50 animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg
  className="w-5 h-5"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5m10 0v-2m0 2H7m5-6a4 4 0 100-8 4 4 0 000 8z"
  />
</svg>

            </div>
            <h3 className="text-xl font-bold text-white">
              Members ({activeGroup.members?.length || 0})
            </h3>
          </div>
          <button
            onClick={() => setShowMemberListModal(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-3">
          {activeGroup.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600/30">
              <img
                src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`}
                alt={member.name}
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{member.name}</p>
                  {member._id === activeGroup.creator && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-semibold rounded-full text-white">
                      Admin
                    </span>
                  )}
                  {member._id === user._id && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                      You
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{member.email}</p>
              </div>
              
              {isGroupAdmin && member._id !== user._id && member._id !== activeGroup.creator && (
                <button
                  onClick={() => {
                    setSelectedMemberToRemove(member);
                    setShowRemoveMemberModal(true);
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  title={`Remove ${member.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {!isGroupAdmin && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Only group admins can remove members
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const RemoveMemberModal = showRemoveMemberModal && selectedMemberToRemove && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl w-96 shadow-2xl border border-slate-600/50 animate-slideUp">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Remove Member</h3>
            <p className="text-gray-400 text-sm">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
          <p className="text-white mb-2">Are you sure you want to remove:</p>
          <div className="flex items-center gap-3">
            <img
              src={selectedMemberToRemove.avatar || `https://ui-avatars.com/api/?name=${selectedMemberToRemove.name}`}
              alt={selectedMemberToRemove.name}
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
            <div>
              <p className="text-white font-medium">{selectedMemberToRemove.name}</p>
              <p className="text-gray-400 text-sm">{selectedMemberToRemove.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
            onClick={() => {
              setShowRemoveMemberModal(false);
              setSelectedMemberToRemove(null);
            }}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-red-500/25"
            onClick={handleRemoveMember}
          >
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );

  const fileInputRef = useRef(null);

  const handleGroupImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append("groupPic", file);
    formData.append("groupId", selectedChat);

    try {
      // Assuming your API has a route for this
      await api.put("/upload/update-group-pic", formData);
      await dispatch(getMyGroups()); // Refresh group list to show new image
      setShowMenu(false);
    } catch (err) {
      console.error("Group image upload failed", err);
      alert("Failed to update group image");
    }
  };

  
  return (
    <>
      {AddMemberModal}
      {MemberListModal}
      {RemoveMemberModal}
      
      {/* Full Screen Image Modal */}
      {/* {fullScreenImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[70] animate-fadeIn" onClick={() => setFullScreenImage(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )} */}

<input
        type="file"
        accept="image/*"
        ref={groupImageInputRef}
        hidden
        onChange={handleGroupImageUpload}
      />
      
      <div className="flex flex-col flex-1 bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Enhanced Header */}
        <div className="p-4 bg-slate-800/90 backdrop-blur-md border-b border-slate-600/50 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile Back button */}
              <button
                type="button"
                className="md:hidden p-2 -ml-2 mr-1 rounded-full hover:bg-slate-700 text-gray-300"
                aria-label="Back to chats"
                onClick={() => dispatch(clearActiveChat())}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Profile Picture */}
              <div className="relative group cursor-pointer">
{/* Profile Picture in Header */}
        <img
        src={
        chatType === "private"
        ? activeFriend?.profilePic // Use profilePic specifically
        ? activeFriend.profilePic.startsWith("http")
          ? activeFriend.profilePic
          : `http://localhost:4000${activeFriend.profilePic}`
        : `https://ui-avatars.com/api/?name=${activeFriend?.name}`
        : activeGroup?.groupPic // CHANGED from groupImage to groupPic
        ? (activeGroup.groupPic.startsWith("http") ? activeGroup.groupPic : `http://localhost:4000${activeGroup.groupPic}`)
        : `https://ui-avatars.com/api/?name=${activeGroup?.name}&background=0f172a&color=fff`
  }
  alt="avatar"
  className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-lg object-cover"
/>
{chatType === "group" && isGroupAdmin && (
                  <button 
                    onClick={() => groupImageInputRef.current.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
</div>
              {/* Name and Status */}
              <div>
                <h2 className="text-lg font-bold text-white">
                  {chatType === "private"
                    ? activeFriend?.name || "Private Chat"
                    : activeGroup?.name || "Group Chat"}
                </h2>
                {chatType === "group" && (
                  <p className="text-sm text-gray-400">
                    {activeGroup?.members?.length || 0} members
                    {isGroupAdmin && <span className="ml-2 text-yellow-400">• Admin</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Menu Button for Groups */}
            {chatType === "group" &&activeGroup && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-xl shadow-xl border border-slate-600 overflow-hidden animate-slideDown">
                    {(
                      <button
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-600 transition-colors flex items-center gap-3 border-b border-slate-600/50"
                        onClick={() => {
                          setShowMenu(false);
                          groupImageInputRef.current.click();
                        }}
                      >
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change Group Photo
                      </button>
                    )}
                    {(
                      <button
                        className="w-full text-left px-4 py-3 text-white hover:bg-slate-600 transition-colors flex items-center gap-3"
                        onClick={() => {
                          setShowMenu(false);
                          setShowAddMemberModal(true);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Member
                      </button>
                    )}
                    <button
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-600 transition-colors flex items-center gap-3"
                      onClick={() => {
                        setShowMenu(false);
                        setShowMemberListModal(true);
                      }}
                    >
                     <svg
  className="w-5 h-5"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5m10 0v-2m0 2H7m5-6a4 4 0 100-8 4 4 0 000 8z"
  />
</svg>

                      View Members
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-slate-900/50">
          {safeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg font-medium">No messages yet</p>
              <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            <>
              {safeMessages.map((msg, index) => {
                const senderId =
  typeof msg.sender === "object"
    ? msg.sender._id
    : msg.sender;

const isMyMessage = String(senderId) === String(user._id);

                const showAvatar = !isMyMessage && (index === 0 || safeMessages[index - 1]?.sender !== msg.sender);
                
                return (
                  <div
                    key={msg._id || msg.tempId}
                    className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'} animate-messageSlide`}
                  >
                    {/* Avatar for received messages */}
                    {!isMyMessage && (
                      <div className={`w-8 h-8 ${showAvatar ? '' : 'invisible'}`}>
                        {showAvatar && (
                          <img
                            src={`https://ui-avatars.com/api/?name=User`}
                            alt="user"
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
  className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
    isMyMessage
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
      : 'bg-slate-700 text-white rounded-bl-md border border-slate-600'
  }`}
>
  {/* Replace this entire section with the renderMessageContent function call */}
  {renderMessageContent(msg, isMyMessage)}
  
  <p className={`text-xs mt-2 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
    {formatTime(msg.timestamp || msg.createdAt)}
  </p>
</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <MessageInput />
      </div>

    </>
  );
}


