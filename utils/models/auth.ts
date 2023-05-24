import { ObjectId } from "mongodb";

export interface UserAuth {
	_id: ObjectId;
	id: string;
	username: string;
	email: string;
	password: string;
	keys: UserAPIKey[];
	lastSignIn: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
	session?: {
		token: string;
		expiresAt: Date | string;
		updatedAt: Date | string;
		createdAt: Date | string;
	};
}

export interface UserAPIKey {
	key: string;
	createdAt: Date | string;
}
