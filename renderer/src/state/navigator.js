import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSidebarToggled: true,
    currentPage: "home",
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
        setCurrentPage: (state, action) => {
            const previousPage = state.currentPage;
            state.currentPage = action.payload;

            // Only auto-expand when transitioning from home to workspace
            if (previousPage === "home" && action.payload === "workspace") {
                state.isSidebarToggled = false;
            } else if (action.payload === "home") {
                state.isSidebarToggled = true;
            }
        },
    },
});

export const { toggleSidebar, setSidebarToggled, setCurrentPage } =
    navigatorSlice.actions;

export default navigatorSlice.reducer;
