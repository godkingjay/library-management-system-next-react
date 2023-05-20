import { ObjectId } from "mongodb";

export interface Book {
	_id: ObjectId;
	title: string;
	authorId: string;
	category: string;
	ISBN?: string;
	publicationDate?: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
}

export interface BookCategory {
	_id: ObjectId;
	name: string;
	description?: string;
	updatedAt: Date | string;
	createdAt: Date | string;
}
