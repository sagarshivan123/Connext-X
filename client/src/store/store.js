// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import groupReducer from "./slices/groupSlice";
import socketReducer from "./slices/socketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    group: groupReducer,
    socket: socketReducer,
  },
});
