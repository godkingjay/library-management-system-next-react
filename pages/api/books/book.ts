import bookDb from "@/server/mongo/bookDb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBookParameters {
	text: string;
	string: string;
	categories: string[];
	amount: number;
	available: number;
	borrowed: number;
	ISBN: string;
	publicationDate: Date | string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { booksCollection, bookCategoriesCollection, bookLoansCollection } =
			await bookDb();
	} catch (error: any) {
		return res.status(500).json({
			statusCode: 500,
			error: {
				type: "Server Error",
				...error,
			},
		});
	}
}
