import { configureStore } from "@reduxjs/toolkit";
import { loginSlice } from "./slices/loginSlice";
import { usersSlice } from "./slices/usersSlice";
import { visitorSlice } from "./slices/visitorSlice";

const store = configureStore({
    reducer: {
        loginReducer: loginSlice.reducer,
        userReducer: usersSlice.reducer,
        visitorReducer: visitorSlice.reducer,
    },
});

export default store;
