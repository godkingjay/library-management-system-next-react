import mongoDb from "./db";

export default async function userDb() {
	const { libraryDb } = await mongoDb();

	const userCollection = await libraryDb.collection("users");

	return {
		userCollection,
	};
}
