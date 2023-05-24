import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SiteUser } from "@/utils/models/user";
import { UserAuth } from "@/utils/models/auth";

export interface UserData {
	user: SiteUser | null;
	auth: UserAuth | null;
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
		setUsersState: (state, action: PayloadAction<UserState>) => {
			state.currentUser = action.payload.currentUser;
			state.users = action.payload.users;
		},
		clearUsersState: (state) => {
			state.currentUser = null;
			state.users = [];
		},
	},
});

export const { setUsersState, clearUsersState } = userSlice.actions;

const usersReducer = userSlice.reducer;

export default usersReducer;
