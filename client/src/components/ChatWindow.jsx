
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef, useMemo } from "react";
import { getPrivateMessages, getGroupMessages, clearActiveChat } from "../store/slices/chatSlice";
import { addMember, removeMember, getMyGroups } from "../store/slices/groupSlice";
import { getSocket } from "../socket/socket";
import MessageInput from "./MessageInput";
import api from "../store/api";

const BASE_URL = import.meta.env.VITE_API_URL||'http://localhost:4000';

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { messages, selectedChat, chatType } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { groups } = useSelector((state) => state.group);
  
  const messagesEndRef = useRef(null);
  const groupImageInputRef = useRef(null);

  const [ui, setUi] = useState({ menu: false, addModal: false, listModal: false });
  const [memberEmail, setMemberEmail] = useState("");

  const activeFriend = user?.friends?.find((f) => f._id === selectedChat);
  const activeGroup = groups?.find((g) => String(g._id) === String(selectedChat));

  const isGroupAdmin = useMemo(() => {
    if (chatType !== "group" || !activeGroup || !user?._id) return false;
    const creatorId = activeGroup.creator?._id || activeGroup.creator;
    const adminId = activeGroup.admin?._id || activeGroup.admin;
    return String(user._id) === String(creatorId) || String(user._id) === String(adminId);
  }, [activeGroup, user, chatType]);

  const handleGroupPicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("groupPic", file);
    formData.append("groupId", selectedChat);
    try {
      await api.put("/upload/update-group-pic", formData);
      dispatch(getMyGroups());
    } catch (err) { alert("Failed to update image"); }
  };

  const handleMemberAction = async (type, userId) => {
    try {
      if (type === 'add') {
        const res = await api.post("/auth/find-user", { email: memberEmail });
        await dispatch(addMember({ groupId: selectedChat, userId: res.data.user._id }));
        setMemberEmail("");
      } else {
        if (!window.confirm("Remove this member?")) return;
        await dispatch(removeMember({ groupId: selectedChat, userId }));
      }
      dispatch(getMyGroups());
      dispatch(getGroupMessages(selectedChat));
      setUi({ ...ui, addModal: false });
    } catch (err) { alert("Action failed"); }
  };

  useEffect(() => {
    if (!selectedChat || !user?._id) return;
    chatType === "private" 
      ? dispatch(getPrivateMessages({ user1: user._id, user2: selectedChat }))
      : dispatch(getGroupMessages(selectedChat));
    if (chatType === "group") getSocket()?.emit("joinGroup", selectedChat);
  }, [selectedChat, chatType, dispatch, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const avatarSrc = chatType === "private"
    ? (activeFriend?.profilePic ? `
      ${BASE_URL}${activeFriend.profilePic}` : `https://ui-avatars.com/api/?name=${activeFriend?.name}`)
    : (activeGroup?.groupPic ? `${BASE_URL}${activeGroup.groupPic}` : `https://ui-avatars.com/api/?name=${activeGroup?.name}`);

  return (
    <div className="flex flex-col flex-1 bg-slate-900 text-white h-full">
      <input type="file" ref={groupImageInputRef} hidden onChange={handleGroupPicChange} accept="image/*" />

      {/* Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          {/* Back Button for Mobile */}
          <button 
            onClick={() => dispatch(clearActiveChat())}
            className="md:hidden p-2 -ml-2 hover:bg-slate-700 rounded-full text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative group">
            <img src={avatarSrc} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" alt="avatar" />
            {isGroupAdmin && (
              <button onClick={() => groupImageInputRef.current.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">📷</button>
            )}
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-none">
              {chatType === "private" ? activeFriend?.name : activeGroup?.name}
            </h2>
            {chatType === "group" && <p className="text-[10px] md:text-xs text-slate-400">{activeGroup?.members?.length} members</p>}
          </div>
        </div>
        
        {chatType === "group" && (
          <div className="relative">
            <button onClick={() => setUi({ ...ui, menu: !ui.menu })} className="p-2 hover:bg-slate-700 rounded-full">⋮</button>
            {ui.menu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                <button className="w-full text-left p-3 hover:bg-slate-700 text-sm" onClick={() => setUi({...ui, addModal: true, menu: false})}>Add Member</button>
                <button className="w-full text-left p-3 hover:bg-slate-700 text-sm" onClick={() => setUi({...ui, listModal: true, menu: false})}>Manage Members</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg, i) => {
          const isMe = String(msg.sender?._id || msg.sender) === String(user._id);
          const mediaUrl = msg.mediaUrl ? `${BASE_URL}${msg.mediaUrl}` : null;
          return (
            <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}>

{/* Sender name for group chat */}
{chatType === "group" && !isMe && (
  <p className="text-xs font-semibold text-blue-400 mb-1">
    {msg.sender?.name || "Unknown"}
  </p>
)}

{msg.message && (
  <p className="text-sm leading-relaxed">{msg.message}</p>
)}

{mediaUrl && (
  <div className="mt-2 overflow-hidden rounded-lg">
    {msg.mediaType === "video" ? (
      <video controls className="max-h-60 w-full bg-black">
        <source src={mediaUrl} />
      </video>
    ) : (
      <img
        src={mediaUrl}
        alt="Shared"
        className="max-h-60 w-full object-cover cursor-pointer"
        onClick={() => window.open(mediaUrl, '_blank')}
      />
    )}
  </div>
)}

<div className="text-[10px] mt-1 opacity-50 text-right">
  {new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}
</div>
</div>

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <MessageInput />

      {/* Modals (Simplified Add/List) */}
      {ui.addModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
            <h3 className="font-bold mb-4">Add Member</h3>
            <input className="w-full p-2 bg-slate-900 rounded border border-slate-700 mb-4 outline-none text-sm" placeholder="User Email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
            <div className="flex gap-2">
              <button className="flex-1 text-slate-400 text-sm" onClick={() => setUi({...ui, addModal: false})}>Cancel</button>
              <button className="flex-1 bg-blue-600 py-2 rounded-lg text-sm font-bold" onClick={() => handleMemberAction('add')}>Add</button>
            </div>
          </div>
        </div>
      )}

      {ui.listModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Group Members</h3>
              <button className="text-slate-400" onClick={() => setUi({...ui, listModal: false})}>✕</button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {activeGroup?.members?.map(m => (
                <div key={m._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-8 h-8 rounded-full" alt="" />
                    <span className="text-sm truncate max-w-[120px]">{m.name}</span>
                  </div>
                  {isGroupAdmin && m._id !== user._id && (
                    <button onClick={() => handleMemberAction('remove', m._id)} className="text-red-500 text-xs font-bold hover:bg-red-500/10 p-2 rounded-lg">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}