import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";

const store = configureStore({
	reducer: {
		currentUser: userReducer,
	},
});

export default store;
