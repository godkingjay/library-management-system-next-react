import mongoDb from "./db";

export default async function userDb() {
	const { libraryDb } = await mongoDb();

	const usersCollection = await libraryDb.collection("users");

	return {
		usersCollection,
	};
}
