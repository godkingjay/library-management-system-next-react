import { ObjectId } from "mongodb";

export interface Author {
	_id: ObjectId;
	id: string;
	name: string;
	biography?: string;
	birthdate?: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
}
