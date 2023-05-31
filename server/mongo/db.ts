import clientPromise from "../mongodb";

export default async function mongoDb() {
	const client = await clientPromise;
	const libraryDb = await client.db(
		process.env.NEXT_PUBLIC_MONGODB_NAME as string
	);
	const session = client.startSession();

	const clientCloseConnection = async () => {
		await client.close();
	};

	// const startTransaction = async () => {
	// 	await session.startTransaction();
	// };

	// const commitTransaction = async () => {
	// 	await session.commitTransaction();
	// };

	// const abortTransaction = async () => {
	// 	await session.abortTransaction();
	// };

	// const endSession = async () => {
	// 	await session.endSession();
	// };

	return {
		client,
		libraryDb,
		clientCloseConnection,
		session,
	};
}
