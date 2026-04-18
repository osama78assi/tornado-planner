import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentWorkspace: null,
};

const workspacesSlice = createSlice({
    name: "workspaces",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
        },
    },
});

export const { setCurrentWorkspace } = workspacesSlice.actions;

export default workspacesSlice.reducer;
