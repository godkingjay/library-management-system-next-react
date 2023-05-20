import { ObjectId } from "mongodb";

export interface Book {
	_id: ObjectId;
	title: string;
	authorId: string;
	category: string;
	amount: number;
	available: number;
	borrowed: number;
	borrowedTimes: number;
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

export interface BookLoan {
	_id: ObjectId;
	userId: string;
	bookId: string;
	loanStatus: "borrowed" | "pending" | "returned";
	borrowedAt: Date | string;
	dueAt: Date | string;
}
