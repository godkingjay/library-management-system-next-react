import mongoDb from "./db";

export default async function bookDb() {
	const { libraryDb } = await mongoDb();

	const booksCollection = await libraryDb.collection("books");
	const bookCategoriesCollection = await libraryDb.collection("book-categories");
	const bookLoansCollection = await libraryDb.collection("book-loans");

	return {
		booksCollection,
		bookCategoriesCollection,
		bookLoansCollection,
	};
}
