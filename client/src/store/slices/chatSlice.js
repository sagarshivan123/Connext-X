import { createSlice } from "@reduxjs/toolkit";
import api from "../api.js";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    loading: false,
    error: null,
    selectedChat: null,  // stores userId OR groupId
    chatType: null,      // 'private' | 'group'
  },
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload.id;   // FIXED
      state.chatType = action.payload.type;     // FIXED
      state.messages = [];                      // reset messages
    },

    addIncomingMessage: (state, action) => {
      const incoming = action.payload;
      const incomingId = incoming._id || incoming.tempId;
    
      // If no id, just push (fallback)
      if (!incomingId) {
        state.messages.push(incoming);
        return;
      }
    
      // Check if this message already exists
      const exists = state.messages.some(
        (m) => (m._id || m.tempId) === incomingId
      );
    
      if (!exists) {
        state.messages.push(incoming);
      }
    },
    

    sendMessageRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action) => {
      state.loading = false;
      state.messages.push(action.payload);
    },
    sendMessageFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getPrivateMessagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getPrivateMessagesSuccess: (state, action) => {
      const incoming = action.payload;
  // remove duplicates using _id
  const unique = [];
  const seen = new Set();
  for (const msg of incoming) {
    if (!seen.has(msg._id)) {
      unique.push(msg);
      seen.add(msg._id);
    }
  }
  state.messages = unique;
    },
    getPrivateMessagesFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getGroupMessagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getGroupMessagesSuccess: (state, action) => {
      state.loading = false;
      const msgs = action.payload || [];
      const unique = [];
      const seen = new Set();

      for (const m of msgs) {
        if (!m?._id) {
          unique.push(m);
          continue;
        }
        if (!seen.has(m._id)) {
          seen.add(m._id);
          unique.push(m);
        }
      }

      state.messages = unique;
    },
    getGroupMessagesFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Thunks ================================

export const sendMessage = (messageData) => async (dispatch) => {
  dispatch(chatSlice.actions.sendMessageRequest());
  try {
    await api.post("/messages/send", messageData);
    // dispatch(chatSlice.actions.sendMessageSuccess(res.data));
  } catch (err) {
    dispatch(chatSlice.actions.sendMessageFailed(err.message));
  }
};

export const getPrivateMessages = ({ user1, user2 }) => async (dispatch) => {
  dispatch(chatSlice.actions.getPrivateMessagesRequest());
  try {
    const res = await api.get(`/messages/private/${user1}/${user2}`);
    // console.log("API RESPONSE:", res.data);  
    dispatch(chatSlice.actions.getPrivateMessagesSuccess(res.data));
  } catch (err) {
    dispatch(chatSlice.actions.getPrivateMessagesFailed(err.message));
  }
};

export const getGroupMessages = (groupId) => async (dispatch) => {
  dispatch(chatSlice.actions.getGroupMessagesRequest());
  try {
    const res = await api.get(`/messages/group/${groupId}`);
    dispatch(chatSlice.actions.getGroupMessagesSuccess(res.data));
  } catch (err) {
    dispatch(chatSlice.actions.getGroupMessagesFailed(err.message));
  }
};

export const { setSelectedChat, addIncomingMessage } = chatSlice.actions;
export default chatSlice.reducer;
