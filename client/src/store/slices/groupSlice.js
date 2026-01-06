// src/store/slices/groupSlice.js
import { createSlice } from "@reduxjs/toolkit";
import api from "../api.js";

const groupSlice = createSlice({
  name: "group",
  initialState: {
    groups: [],
    loading: false,
    error: null,
    activeGroup: null, 
  },

  reducers: {
    setActiveGroup(state, action) {
      state.activeGroup = action.payload; // groupId
    },
    createGroupRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createGroupSuccess(state, action) {
      state.loading = false;
      state.groups.push(action.payload);
    },
    createGroupFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addMemberRequest(state) {
      state.loading = true;
      state.error = null;
    },
    addMemberSuccess(state, action) {
      state.loading = false;

      const updatedGroup = action.payload;
      state.groups = state.groups.map((g) =>
        g._id === updatedGroup._id ? updatedGroup : g
      );
    },
    addMemberFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    removeMemberRequest(state) {
      state.loading = true;
      state.error = null;
    },
    removeMemberSuccess(state, action) {
      state.loading = false;

      const updatedGroup = action.payload;
      state.groups = state.groups.map((g) =>
        g._id === updatedGroup._id ? updatedGroup : g
      );
    },
    removeMemberFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    getMyGroupsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getMyGroupsSuccess(state, action) {
      state.loading = false;
      state.groups = action.payload;
    },
    getMyGroupsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// CREATE GROUP
export const createGroup = ({ name, members }) => async (dispatch) => {
  dispatch(groupSlice.actions.createGroupRequest());
  try {
    const { data } = await api.post(
      "/groups/create",
      { name, members },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch(groupSlice.actions.createGroupSuccess(data.group));
  } catch (error) {
    dispatch(
      groupSlice.actions.createGroupFailed(
        error.response?.data?.message || error.message
      )
    );
  }
};

// ADD MEMBER
export const addMember = ({ groupId, userId }) => async (dispatch) => {
  dispatch(groupSlice.actions.addMemberRequest());
  try {
    const { data } = await api.put(
      `/groups/add-member/${groupId}`,
      { userId },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch(groupSlice.actions.addMemberSuccess(data.group));
  } catch (error) {
    dispatch(
      groupSlice.actions.addMemberFailed(
        error.response?.data?.message || error.message
      )
    );
  }
};


export const removeMember = ({ groupId, userId }) => async (dispatch) => {
  dispatch(groupSlice.actions.removeMemberRequest());
  try {
    const { data } = await api.post(
      `/groups/remove/${groupId}`,
      { userId },
      { headers: { "Content-Type": "application/json" } }
    );

    dispatch(groupSlice.actions.removeMemberSuccess(data.group));
  } catch (error) {
    dispatch(
      groupSlice.actions.removeMemberFailed(
        error.response?.data?.message || error.message
      )
    );
  }
};


export const getMyGroups = () => async (dispatch) => {
  dispatch(groupSlice.actions.getMyGroupsRequest());
  try {
    const { data } = await api.get("/groups/my-groups");
    dispatch(groupSlice.actions.getMyGroupsSuccess(data));
  } catch (error) {
    dispatch(
      groupSlice.actions.getMyGroupsFailed(
        error.response?.data?.message || error.message
      )
    );
  }
};

export const { setActiveGroup } = groupSlice.actions;
export default groupSlice.reducer;
