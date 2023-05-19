import mongoDb from "@/server/mongo/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { client, libraryDb } = await mongoDb();

		res.status(200).json({ statusCode: 200, message: "Connected to DB" });
	} catch (error: any) {
		res.status(500).json({ statusCode: 500, message: error });
	}
}
