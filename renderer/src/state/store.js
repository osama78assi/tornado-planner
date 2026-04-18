import { configureStore } from "@reduxjs/toolkit";
import navigatorReducer from "./navigator";
import workspacesReducer from "./workspaces";

export const store = configureStore({
    reducer: {
        navigator: navigatorReducer,
        workspaces: workspacesReducer,
    },
    devTools: false,
});

export default store;
