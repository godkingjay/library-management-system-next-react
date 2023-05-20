import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SiteUser } from "@/utils/models/user";

export interface UserData {
	user: SiteUser | null;
}

export interface UserState {
	currentUser: UserData | null;
	users: UserData[];
}

const initialState: UserState = {
	currentUser: null,
	users: [],
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser: (state, action: PayloadAction<UserData>) => {
			state.currentUser = action.payload;
		},
		clearCurrentUser: (state) => {
			state.currentUser = null;
		},
		setUsers: (state, action: PayloadAction<UserData[]>) => {
			state.users = action.payload;
		},
		clearUsers: (state) => {
			state.users = [];
		},
	},
});

export const { setCurrentUser, clearCurrentUser, setUsers, clearUsers } =
	userSlice.actions;

const usersReducer = userSlice.reducer;

export default usersReducer;
