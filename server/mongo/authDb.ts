import mongoDb from "./db";

export default async function authDb() {
	const { libraryDb } = await mongoDb();

	const authCollection = await libraryDb.collection("auth");

	return {
		authCollection,
	};
}
