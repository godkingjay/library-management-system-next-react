import { ObjectId } from "mongodb";

export interface SiteUser {
	_id?: ObjectId;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	birthDate?: Date | string;
	roles: ("admin" | "user")[];
	updatedAt: Date | string;
	createdAt: Date | string;
}
