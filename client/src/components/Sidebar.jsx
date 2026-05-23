import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setSelectedChat, getPrivateMessages, getGroupMessages } from "../store/slices/chatSlice";
import { getMyGroups, createGroup } from "../store/slices/groupSlice";
import { logout, addFriend, getUser, getAllUsers } from "../store/slices/authSlice";
import { getSocket } from "../socket/socket";
import api from "../store/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { user, allUsers } = useSelector((s) => s.auth);
  const { groups } = useSelector((s) => s.group);
  const { onlineUsers } = useSelector((s) => s.socket);
  const { selectedChat, chatType } = useSelector((s) => s.chat);

  const [ui, setUi] = useState({ menu: false, addFriend: false, createGroup: false });
  const [friendEmail, setFriendEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const avatarInputRef = useRef(null);

  useEffect(() => {
    dispatch(getMyGroups());
    dispatch(getAllUsers());
  }, [dispatch]);

  const choosePrivateChat = (id) => {
    dispatch(setSelectedChat({ id, type: "private" }));
    dispatch(getPrivateMessages({ user1: user._id, user2: id }));
  };

  const chooseGroupChat = (id) => {
    getSocket()?.emit("joinGroup", id);
    dispatch(setSelectedChat({ id, type: "group" }));
    dispatch(getGroupMessages(id));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      await api.put("/upload/update-avatar", formData);
      dispatch(getUser());
    } catch {
      alert("Failed to update profile picture");
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;
    await dispatch(addFriend({ email: friendEmail }));
    dispatch(getUser());
    setFriendEmail("");
    setUi({ ...ui, addFriend: false });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    await dispatch(createGroup({ name: groupName }));
    dispatch(getMyGroups());
    setGroupName("");
    setUi({ ...ui, createGroup: false });
  };

  const getAvatar = (item, isGroup = false) => {
    const pic = isGroup ? item?.groupPic : item?.profilePic;
    if (pic) return pic.startsWith("http") ? pic : `${BASE_URL}${pic}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.name || "U")}&background=${isGroup ? "6366f1" : "475569"}&color=fff`;
  };

  const filteredGroups = groups?.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const filteredUsers =
    allUsers?.filter(
      (u) => u._id !== user?._id && u.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <aside className="w-[280px] h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <input type="file" ref={avatarInputRef} hidden onChange={handleProfileImageUpload} accept="image/*" />

      {/* Profile Header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={getAvatar(user)}
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
              alt="Me"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
          </div>

          {/* Name + email */}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate leading-tight">{user?.name}</p>
            <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0 ml-2">
          <button
            onClick={() => setUi({ ...ui, menu: !ui.menu })}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-lg"
          >
            ⋮
          </button>
          {ui.menu && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 text-[13px]"
                onClick={() => {
                  setUi({ ...ui, menu: false });
                  avatarInputRef.current.click();
                }}
              >
                Change avatar
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 text-[13px]"
                onClick={() => setUi({ ...ui, createGroup: true, menu: false })}
              >
                Create group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[13px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
        {/* Groups */}
        {filteredGroups.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
              Groups
            </p>
            {filteredGroups.map((g) => (
              <button
                key={g._id}
                onClick={() => chooseGroupChat(g._id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                  ${selectedChat === g._id && chatType === "group"
                    ? "bg-slate-800 border-r-2 border-blue-500"
                    : "hover:bg-slate-800/60"
                  }`}
              >
                <img
                  src={getAvatar(g, true)}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  alt={g.name}
                />
                <div className="min-w-0">
                  <p className="text-slate-200 text-[13px] font-medium truncate">{g.name}</p>
                  <p className="text-slate-500 text-[11px]">{g.members?.length} members</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Users */}
        {filteredUsers.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
              Users
            </p>
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => choosePrivateChat(u._id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                  ${selectedChat === u._id && chatType === "private"
                    ? "bg-slate-800 border-r-2 border-blue-500"
                    : "hover:bg-slate-800/60"
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatar(u)}
                    className="w-9 h-9 rounded-full object-cover"
                    alt={u.name}
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900
                      ${onlineUsers?.includes(u._id) ? "bg-green-500" : "bg-slate-600"}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-[13px] font-medium truncate">{u.name}</p>
                  <p className={`text-[11px] ${onlineUsers?.includes(u._id) ? "text-green-500" : "text-slate-500"}`}>
                    {onlineUsers?.includes(u._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-slate-800">
        <button
          onClick={() => dispatch(logout())}
          className="w-full py-2 rounded-xl text-[13px] font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
        >
          Logout
        </button>
      </div>

      {/* Modals */}
      {(ui.addFriend || ui.createGroup) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">
              {ui.addFriend ? "Add friend" : "Create group"}
            </h3>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm mb-4 outline-none focus:border-blue-500 transition-colors"
              placeholder={ui.addFriend ? "Friend's email" : "Group name"}
              value={ui.addFriend ? friendEmail : groupName}
              onChange={(e) =>
                ui.addFriend ? setFriendEmail(e.target.value) : setGroupName(e.target.value)
              }
            />
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 text-slate-400 text-sm rounded-xl hover:bg-slate-800 transition-colors"
                onClick={() => setUi({ ...ui, addFriend: false, createGroup: false })}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                onClick={ui.addFriend ? handleAddFriend : handleCreateGroup}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}