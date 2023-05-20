import { ObjectId } from "mongodb";

export interface SiteUser {
	_id: ObjectId;
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	roles: ("admin" | "user")[];
	updatedAt: Date | string;
	createdAt: Date | string;
}
