import { ObjectId } from "mongodb";
import { Author } from "./author";
import { SiteUser } from "./user";

export interface BookInfo {
	book: Book;
	author: Author;
	borrow: BookBorrow | null;
	borrower: SiteUser | null;
}

export interface Book {
	_id: ObjectId;
	id: string;
	title: string;
	description?: string;
	author: string;
	categories: string[];
	cover?: BookImage;
	amount: number;
	available: number;
	borrows: number;
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

export interface BookBorrow {
	_id: ObjectId;
	id: string;
	userId: string;
	bookId: string;
	note?: string;
	borrowStatus: "borrowed" | "pending" | "returned";
	borrowedAt: Date | string;
	requestedAt: Date | string;
	returnedAt: Date | string;
	createdAt: Date | string;
	dueAt: Date | string;
}
