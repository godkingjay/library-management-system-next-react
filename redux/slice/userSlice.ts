import { UserAuth } from "@/utils/models/auth";
import { SiteUser } from "@/utils/models/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
	// userAuth: UserAuth | null;
	user: SiteUser | null;
}

const initialState: UserState = {
	// userAuth: null,
	user: null,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		// setUserAuth: (state, action: PayloadAction<UserAuth>) => {
		// 	state.userAuth = action.payload;
		// },
		// clearUserAuth: (state) => {
		// 	state.userAuth = null;
		// },
		setSiteUser: (state, action: PayloadAction<SiteUser>) => {
			state.user = action.payload;
		},
		clearSiteUser: (state) => {
			state.user = null;
		},
	},
});

export const {
	// setUserAuth,
	// clearUserAuth,
	setSiteUser,
	clearSiteUser,
} = userSlice.actions;

const userReducer = userSlice.reducer;

export default userReducer;
