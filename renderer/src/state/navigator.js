import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSidebarToggled: true,
    defaultLayout: ["home", "settings"],
    renderWorkspaceSelector: ["plans"],
};

const navigatorSlice = createSlice({
    name: "navigator",
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarToggled = !state.isSidebarToggled;
        },
        setSidebarToggled: (state, action) => {
            state.isSidebarToggled = action.payload;
        },
    },
});

export const { toggleSidebar, setSidebarToggled } = navigatorSlice.actions;

export default navigatorSlice.reducer;
