import mongoDb from "./db";

export default async function bookDb() {
	const { libraryDb } = await mongoDb();

	const booksCollection = await libraryDb.collection("books");
	const bookCategoriesCollection = await libraryDb.collection("book-categories");
	const bookBorrowsCollection = await libraryDb.collection("book-borrows");

	return {
		booksCollection,
		bookCategoriesCollection,
		bookBorrowsCollection,
	};
}
