import { ObjectId } from "mongodb";

export interface Author {
	_id?: ObjectId;
	name: string;
	biography?: string;
	birthDate?: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
}
