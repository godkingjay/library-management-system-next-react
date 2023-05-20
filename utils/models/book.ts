import { ObjectId } from "mongodb";

interface Book {
	_id: ObjectId;
	title: string;
	authorId: string;
	category: string;
	ISBN?: string;
	publicationDate?: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
}
