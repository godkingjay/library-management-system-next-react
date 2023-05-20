import { ObjectId } from "mongodb";

export interface UserAuth {
	_id: ObjectId;
	username: string;
	email: string;
	password: string;
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
