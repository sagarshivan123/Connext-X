import {createSlice} from '@reduxjs/toolkit'; 
import api from '../api.js';

const authSlice = createSlice({
name:'auth',
initialState:{
    user:null,
    allUsers: [],
   message:null,
   loading: false,
    error:null,
    isAuthenticated:false,
},
reducers:{
  registerRequest(state){
    state.loading=true;
    state.error=null;
  },
  registerSuccess(state, action) {
    state.loading = false;
    state.user = action.payload.user;
    state.message = action.payload.message;
    state.isAuthenticated = true;
  },
  
  registerFailed(state,action){
    state.loading=false;
    state.error=action.payload;
},
loginRequest(state){
    state.loading=true;
    state.error=null;
    state.message=null;
},
loginSuccess(state,action){
    state.loading=false;
    state.user=action.payload;
    state.isAuthenticated=true;
    
},
loginFailed(state,action){
    state.loading=false;
    state.error=action.payload;
},
logoutRequest(state){
    state.loading=true;
    state.error=null;
},
logoutSuccess(state,action){
    state.loading=false;
    state.user=null;
    state.isAuthenticated=false;
    state.message=action.payload;
},
logoutFailed(state,action){
    state.loading=false;
    state.error=action.payload;
},

getUserRequest(state){
    state.loading=true;
    state.error=null;
},
getUserSuccess(state, action) {
    state.loading = false;
    state.user = action.payload;
    state.isAuthenticated = true;
  },
  getUserFailed(state) {
    state.loading = false;
    state.user = null;
    state.isAuthenticated = false;
  },
  addFriendSuccess(state, action) {
    state.message = "Friend added";
  },
  addFriendFailed(state, action) {
    state.error = action.payload;
  },
  getAllUsersSuccess(state, action) {
    state.allUsers = action.payload;
    state.error = null;
  },

  getAllUsersFailed(state, action) {
    state.error = action.payload;
  },
  
  resetAuthSlice(state) {
    state.error = null;
    state.message = null;
  },
}
});
export const register=(data)=>async(dispatch)=>{
dispatch(authSlice.actions.registerRequest());
try{
    const response=await api.post('/auth/register',data,{
        headers: {
            "Content-Type": "multipart/form-data",
          },
    });
    dispatch(authSlice.actions.registerSuccess(response.data));
}catch(error){
    dispatch(
        authSlice.actions.registerFailed(
          error.response?.data?.message || "Registration failed"
        )
      );
}
}
export const login=(data)=>async(dispatch)=>{
dispatch(authSlice.actions.loginRequest());
try{
    const response=await api.post('/auth/login',data, { withCredentials: true });
    dispatch(authSlice.actions.loginSuccess(response.data.user));
}catch(error){
    dispatch(authSlice.actions.loginFailed(error.response.data.message));
}
}
export const logout=()=>async(dispatch)=>{
dispatch(authSlice.actions.logoutRequest());
try{
    const response=await api.post('/auth/logout');
    dispatch(authSlice.actions.logoutSuccess(response.data.message));
}catch(error){
    dispatch(authSlice.actions.logoutFailed(error.response.data.message));
}}

export const getUser=()=>async(dispatch)=>{
dispatch(authSlice.actions.getUserRequest());
try{
    const response=await api.get('/auth/me');
    dispatch(authSlice.actions.getUserSuccess(response.data.user));
}
catch(error){
    dispatch(authSlice.actions.getUserFailed());
}
}

export const addFriend=(data)=>async(dispatch)=>{
    try{
        const response=await api.post('/auth/add-friend',data);
        dispatch(authSlice.actions.addFriendSuccess(response.data.friend));
        dispatch(getUser()); 
    }catch(error){
        // Handle error if needed
        dispatch(authSlice.actions.addFriendFailed(error.response.data.message));
    }
}
  
export const getAllUsers = () => async (dispatch) => {
    try {
      const { data } = await api.get("/auth/all");
      dispatch(getAllUsersSuccess(data));
    } catch (err) {
      dispatch(
        getAllUsersFailed(err.response?.data?.message || "Failed to load users")
      );
    }
  };
  
  
export const {resetAuthSlice}=authSlice.actions;
export const {
    getAllUsersSuccess,
    getAllUsersFailed,
  } = authSlice.actions;
  
export default authSlice.reducer;