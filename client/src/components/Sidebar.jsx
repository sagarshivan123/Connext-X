
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setSelectedChat, getPrivateMessages, getGroupMessages } from "../store/slices/chatSlice";
import { getMyGroups, createGroup } from "../store/slices/groupSlice";
import { logout, addFriend, getUser } from "../store/slices/authSlice";
import { getSocket } from "../socket/socket";
import api from "../store/api";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
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
  }, [dispatch]);

  // --- Handlers ---
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
    } catch (err) { alert("Failed to update profile picture"); }
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

  // --- Helpers ---
  const getAvatar = (item, isGroup = false) => {
    const pic = isGroup ? item?.groupPic : item?.profilePic;
    if (pic) return pic.startsWith("http") ? pic : `http://localhost:4000${pic}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.name || "U")}&background=${isGroup ? '6366f1' : '475569'}&color=fff`;
  };

  const filteredFriends = user?.friends?.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const filteredGroups = groups?.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <aside className="w-80 h-full bg-slate-900 border-r border-slate-700 flex flex-col shadow-xl">
      <input type="file" ref={avatarInputRef} hidden onChange={handleProfileImageUpload} accept="image/*" />

      {/* Profile Header */}
      <div className="p-6 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={getAvatar(user)} className="w-12 h-12 rounded-full border-2 border-slate-600 object-cover" alt="Me" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-bold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setUi({ ...ui, menu: !ui.menu })} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">⋮</button>
            {ui.menu && (
              <div className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-48 z-50 overflow-hidden">
                <button className="w-full text-left p-3 text-white hover:bg-slate-700 text-sm" onClick={() => { setUi({ ...ui, menu: false }); avatarInputRef.current.click(); }}>Change Avatar</button>
                <button className="w-full text-left p-3 text-white hover:bg-slate-700 text-sm" onClick={() => setUi({ ...ui, addFriend: true, menu: false })}>Add Friend</button>
                <button className="w-full text-left p-3 text-white hover:bg-slate-700 text-sm" onClick={() => setUi({ ...ui, createGroup: true, menu: false })}>Create Group</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <input type="text" placeholder="Search chats..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500" />
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Groups */}
        {filteredGroups.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Groups</p>
            {filteredGroups.map(g => (
              <div key={g._id} onClick={() => chooseGroupChat(g._id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-800 ${selectedChat?.id === g._id ? 'bg-slate-800 border border-blue-500/30' : ''}`}>
                <img src={getAvatar(g, true)} className="w-10 h-10 rounded-lg object-cover" alt={g.name} />
                <p className="text-white text-sm font-medium truncate">{g.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Friends */}
        {filteredFriends.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Friends</p>
            {filteredFriends.map(f => (
              <div key={f._id} onClick={() => choosePrivateChat(f._id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-800 ${selectedChat?.id === f._id ? 'bg-slate-800 border border-green-500/30' : ''}`}>
                <div className="relative">
                  <img src={getAvatar(f)} className="w-10 h-10 rounded-full object-cover" alt={f.name} />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${onlineUsers?.includes(f._id) ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                </div>
                <p className="text-white text-sm font-medium truncate">{f.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <button onClick={() => dispatch(logout())} className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-sm font-bold transition-all">Logout</button>
      </div>

      {/* Modals */}
      {(ui.addFriend || ui.createGroup) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{ui.addFriend ? 'Add Friend' : 'Create Group'}</h3>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white mb-4 outline-none" 
              placeholder={ui.addFriend ? "Friend's Email" : "Group Name"} 
              value={ui.addFriend ? friendEmail : groupName} 
              onChange={e => ui.addFriend ? setFriendEmail(e.target.value) : setGroupName(e.target.value)} 
            />
            <div className="flex gap-3">
              <button className="flex-1 text-slate-400 py-2" onClick={() => setUi({ ...ui, addFriend: false, createGroup: false })}>Cancel</button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold" onClick={ui.addFriend ? handleAddFriend : handleCreateGroup}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}