// import { useDispatch, useSelector } from "react-redux";
// import { setSelectedChat } from "../store/slices/chatSlice";
// import { getMyGroups, createGroup } from "../store/slices/groupSlice";
// import { logout } from "../store/slices/authSlice";
// import { useEffect, useState } from "react";
// import { getSocket } from "../socket/socket";
// import { addFriend } from "../store/slices/authSlice";
// import { getUser } from "../store/slices/authSlice";
// import { getPrivateMessages, getGroupMessages } from "../store/slices/chatSlice";
// import { useRef } from "react";
// import api from "../store/api"; 
// export default function Sidebar() {
//   const dispatch = useDispatch();

//   const { user } = useSelector((state) => state.auth);
//   const { groups } = useSelector((state) => state.group);
//   const { onlineUsers } = useSelector((state) => state.socket);
//   const { selectedChat, chatType } = useSelector((state) => state.chat);

//   const [showMenu, setShowMenu] = useState(false);
//   const [showAddFriendModal, setShowAddFriendModal] = useState(false);
//   const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
//   const [friendEmail, setFriendEmail] = useState("");
//   const [groupName, setGroupName] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const avatarInputRef = useRef(null);


  

//   useEffect(() => {
//     dispatch(getMyGroups());
//   }, [dispatch]);

//   const choosePrivateChat = (otherUserId) => {
//     dispatch(
//       setSelectedChat({
//         id: otherUserId,
//         type: "private",
//       })
//     );
//     dispatch(
//       getPrivateMessages({
//         user1: user._id,
//         user2: otherUserId,
//       })
//     );
//   };

//   const chooseGroupChat = (groupId) => {
//     const socket = getSocket();
//     if (socket) socket.emit("joinGroup", groupId);

//     dispatch(
//       setSelectedChat({
//         id: groupId,
//         type: "group",
//       })
//     );
//     dispatch(getGroupMessages(groupId));
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//   };

//   const handleAddFriend = async () => {
//     if (!friendEmail.trim()) return;

//     await dispatch(addFriend({ email: friendEmail }));
//     await dispatch(getUser());

//     setFriendEmail("");
//     setShowAddFriendModal(false);
//   };

//   const handleCreateGroup = async () => {
//     if (!groupName.trim()) return;

//     await dispatch(createGroup({ name: groupName }));
//     await dispatch(getMyGroups());

//     setGroupName("");
//     setShowCreateGroupModal(false);
//   };
  
//   const handleProfileImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const formData = new FormData();
//     formData.append("profilePic", file);
  
//     try {
//       await api.put("/upload/update-avatar", formData);
//       await dispatch(getUser()); // refresh user data
//     } catch (err) {
//       console.error("Avatar upload failed", err);
//       alert("Failed to update profile picture");
//     }
//   };
  

//   const isOnline = (userId) => onlineUsers?.includes(userId);
//   const isSelected = (id, type) => selectedChat?.id === id && chatType === type;

//   // Filter friends based on search
//   const filteredFriends = user?.friends?.filter(friend =>
//     friend.name.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   // Filter groups based on search
//   const filteredGroups = groups?.filter(group =>
//     group.name.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   const AddFriendModal = showAddFriendModal && (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999] animate-fadeIn">
//       <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl w-96 shadow-2xl border border-slate-600/50 animate-slideUp">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
//               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-bold text-white">Add Friend</h3>
//           </div>
//           <button
//             onClick={() => setShowAddFriendModal(false)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Friend's Email</label>
//           <input
//             type="email"
//             placeholder="Enter friend's email address"
//             value={friendEmail}
//             onChange={(e) => setFriendEmail(e.target.value)}
//             className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
//           />
//         </div>

//         <div className="flex gap-3">
//           <button
//             className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
//             onClick={() => setShowAddFriendModal(false)}
//           >
//             Cancel
//           </button>
//           <button
//             className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-green-500/25"
//             onClick={handleAddFriend}
//           >
//             Add Friend
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const CreateGroupModal = showCreateGroupModal && (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999] animate-fadeIn">
//       <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl w-96 shadow-2xl border border-slate-600/50 animate-slideUp">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
//               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-bold text-white">Create Group</h3>
//           </div>
//           <button
//             onClick={() => setShowCreateGroupModal(false)}
//             className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
//           <input
//             type="text"
//             placeholder="Enter group name"
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
//           />
//         </div>

//         <div className="flex gap-3">
//           <button
//             className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
//             onClick={() => setShowCreateGroupModal(false)}
//           >
//             Cancel
//           </button>
//           <button
//             className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-blue-500/25"
//             onClick={handleCreateGroup}
//           >
//             Create Group
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {AddFriendModal}
//       {CreateGroupModal}
     


//       <aside className="w-80 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-600/50 flex flex-col shadow-xl">
        
//         {/* User Profile Header */}
//         <div className="p-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border-b border-slate-600/50">
//         <input
//   type="file"
//   accept="image/*"
//   ref={avatarInputRef}
//   hidden
//   onChange={handleProfileImageUpload}
// />
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="relative">
//               <img
//   src={
//     user?.profilePic
//       ? user.profilePic.startsWith("http") 
//         ? user.profilePic 
//         : `http://localhost:4000${user.profilePic}` // Ensure this matches your backend URL
//       : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
//   }
//   className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-lg object-cover"
//   alt="Profile"
// />

//                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
//               </div>
//               <div className="flex-1">
//                 <p className="text-white font-bold text-lg">{user?.name}</p>
//                 <p className="text-gray-300 text-sm truncate max-w-32">{user?.email}</p>
//               </div>
//             </div>

//             {/* Menu Button */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-all duration-200"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//                 </svg>
//               </button>

//               {showMenu && (
//                 <div className="absolute right-0 mt-2 bg-slate-700/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-600/50 w-48 overflow-hidden animate-slideDown">
//                   <button
//   className="w-full text-left px-4 py-3 text-white hover:bg-slate-600/50 transition-colors flex items-center gap-3"
//   onClick={() => {
//     setShowMenu(false);
//     avatarInputRef.current.click();
//   }}
// >
//   <svg
//     className="w-4 h-4 text-blue-400"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M3 16l4-4a3 3 0 014 0l6 6M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8"
//     />
//   </svg>
//   Change Profile Picture
//                   </button>

//                   <button
//                     className="w-full text-left px-4 py-3 text-white hover:bg-slate-600/50 transition-colors flex items-center gap-3"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       e.stopPropagation();
//                       console.log("Add Friend clicked");
//                       setShowMenu(false);
//                       setShowAddFriendModal(true);
//                     }}
//                   >
                    
//                     <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Add Friend
//                   </button>

//                   <button
//                     className="w-full text-left px-4 py-3 text-white hover:bg-slate-600/50 transition-colors flex items-center gap-3"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       e.stopPropagation();
//                       console.log("Create Group clicked");
//                       setShowMenu(false);
//                       setShowCreateGroupModal(true);
//                     }}
//                   >
//                     <svg
//   className="w-4 h-4 text-blue-400"
//   fill="none"
//   stroke="currentColor"
//   viewBox="0 0 24 24"
// >
//   <path
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     strokeWidth={2}
//     d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z"
//   />
// </svg>

//                     Create Group
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="p-4">
//           <div className="relative">
//             <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text"
//               placeholder="Search chats..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
//             />
//           </div>
//         </div>

//         {/* Chat List */}
//         <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          
//           {/* Groups Section */}
//           {filteredGroups.length > 0 && (
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Groups</h2>
//                 <div className="h-px bg-slate-600/50 flex-1"></div>
//               </div>
              
//               <div className="space-y-2">
//                 {filteredGroups.map((group) => (
//                   <div
//                     key={group._id}
//                     onClick={() => chooseGroupChat(group._id)}
//                     className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
//                       isSelected(group._id, 'group') 
//                         ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/20 border border-blue-500/30' 
//                         : 'hover:scale-[1.02]'
//                     }`}
//                   >
//                     <div className="relative">
//                     <div className="relative">
//   <img
//     src={
//       group?.groupPic 
//         ? (group.groupPic.startsWith("http") 
//             ? group.groupPic 
//             : `http://localhost:4000${group.groupPic}`)
//         : `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=6366f1&color=fff`
//     }
//     className="w-12 h-12 rounded-xl border-2 border-slate-600 shadow-lg object-cover"
//     alt={group.name}
//     onError={(e) => {
//       e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=6366f1&color=fff`;
//     }}
//   />
//   <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-slate-800"></div>
// </div>
//                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-slate-800"></div>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="text-white font-medium truncate">{group.name}</p>
//                       <p className="text-gray-400 text-sm">
//                         {group.members?.length || 0} members
//                       </p>
//                     </div>

//                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
//                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Friends Section */}
//           {filteredFriends.length > 0 && (
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                 </svg>
//                 <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Friends</h2>
//                 <div className="h-px bg-slate-600/50 flex-1"></div>
//               </div>
              
//               <div className="space-y-2">
//                 {filteredFriends.map((friend) => (
//                   <div
//                     key={friend._id}
//                     onClick={() => choosePrivateChat(friend._id)}
//                     className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
//                       isSelected(friend._id, 'private') 
//                         ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30' 
//                         : 'hover:scale-[1.02]'
//                     }`}
//                   >
//                     <div className="relative">
// <img
//   src={
//     friend?.profilePic // <--- Changed to friend
//       ? friend.profilePic.startsWith("http")
//         ? friend.profilePic
//         : `http://localhost:4000${friend.profilePic}`
//       : `https://ui-avatars.com/api/?name=${friend?.name}` // <--- Changed to friend
//   }
//   className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-lg object-cover"
//   alt={friend?.name}
// />


//                       <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
//                         isOnline(friend._id) ? 'bg-green-500' : 'bg-gray-500'
//                       }`}></div>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="text-white font-medium truncate">{friend.name}</p>
//                       <p className={`text-sm flex items-center gap-1 ${
//                         isOnline(friend._id) ? 'text-green-400' : 'text-gray-400'
//                       }`}>
//                         {/* <div className={`w-2 h-2 rounded-full ${
//                           isOnline(friend._id) ? 'bg-green-400' : 'bg-gray-400'}`}> </div> */}
//                         {isOnline(friend._id) ? 'Online' : 'Offline'}
//                       </p>
//                     </div>

//                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
//                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Empty State */}
//           {filteredFriends.length === 0 && filteredGroups.length === 0 && (
//             <div className="text-center py-8">
//               <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//               <p className="text-gray-400 font-medium">No chats found</p>
//               <p className="text-gray-500 text-sm mt-1">Try adding friends or creating groups</p>
//             </div>
//           )}
//         </div>

//         {/* Logout Button */}
//         <div className="p-4 border-t border-slate-600/50 bg-slate-800/50">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 group"
//           >
//             <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//             Logout
//           </button>
//         </div>

//       </aside>
//     </>
//   );
// }

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