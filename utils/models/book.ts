import { ObjectId } from "mongodb";

export interface Book {
	_id: ObjectId;
	id: string;
	title: string;
	authorId: string;
	categories: string[];
	cover?: BookImage;
	amount: number;
	available: number;
	borrowed: number;
	borrowedTimes: number;
	ISBN?: string;
	publicationDate?: Date | string;
	updatedAt: Date | string;
	createdAt: Date | string;
}

export interface BookImage {
	bookId: string;
	height: number;
	width: number;
	filePath: string;
	fileName: string;
	fileType: string;
	fileUrl: string;
	fileExtension?: string;
	fileSize: number;
	createdAt: Date | string;
}

export interface BookCategory {
	_id: ObjectId;
	id: string;
	name: string;
	description?: string;
	updatedAt: Date | string;
	createdAt: Date | string;
}

export interface BorrowedBook {
	_id: ObjectId;
	id: string;
	userId: string;
	bookId: string;
	borrowStatus: "borrowed" | "pending" | "returned";
	borrowedAt: Date | string;
	dueAt: Date | string;
}
