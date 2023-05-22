import mongoDb from "./db";

export default async function authorDb() {
	const { libraryDb } = await mongoDb();

	const authorsCollection = await libraryDb.collection("authors");

	return {
		authorsCollection,
	};
}
