import authDb from "@/server/mongo/authDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { SiteUser } from "@/utils/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBookParameters {
	apiKey: string;
	authorId?: string;
	bookId?: string;
	title?: string;
	categories?: string[];
	amount?: number;
	available?: number;
	borrowed?: number;
	borrowedTimes?: number;
	ISBN?: string;
	publicationDate?: Date | string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const { booksCollection, bookCategoriesCollection, bookLoansCollection } =
			await bookDb();

		const {
			apiKey,
			authorId = undefined,
			bookId = undefined,
			title = undefined,
			categories = undefined,
			amount = 0,
			available = 0,
			borrowed = 0,
			borrowedTimes = 0,
			ISBN = undefined,
			publicationDate = undefined,
		}: APIEndpointBookParameters = req.body || req.query;

		if (!apiKey) {
			return res.status(400).json({
				statusCode: 400,
				error: {
					type: "Missing API Key",
					message: "Please enter API Key",
				},
			});
		}

		if (!authCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to authentication database",
				},
			});
		}

		if (!booksCollection || !bookCategoriesCollection || !bookLoansCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to book database",
				},
			});
		}

		const userAuthData = (await authCollection.findOne({
			"keys.key": apiKey,
		})) as unknown as UserAuth;

		if (!userAuthData) {
			return res.status(400).json({
				statusCode: 400,
				error: {
					type: "Invalid API Key",
					message: "Invalid API Key",
				},
			});
		}

		const userData = (await usersCollection.findOne({
			email: userAuthData.email,
			username: userAuthData.username,
		})) as unknown as SiteUser;

		if (!userData) {
			return res.status(400).json({
				statusCode: 400,
				error: {
					type: "Invalid User",
					message: "Invalid API Key",
				},
			});
		}

		const requestedAt = new Date();

		switch (req.method) {
			default: {
				return res.status(405).json({
					statusCode: 405,
					error: {
						type: "Method Not Allowed",
						message: "Method Not Allowed",
					},
				});

				break;
			}
		}
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
