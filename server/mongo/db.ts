import clientPromise from "../mongodb";

export default async function mongoDb() {
	const client = await clientPromise;
	const libraryDb = await client.db("library-db");

	const clientCloseConnection = async () => {
		await client.close();
	};

	return {
		client,
		libraryDb,
		clientCloseConnection,
	};
}
