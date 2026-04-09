import { configureStore } from "@reduxjs/toolkit";
import navigatorReducer from "./navigator";

export const store = configureStore({
    reducer: {
        navigator: navigatorReducer,
    },
    devTools: false,
});

export default store;
