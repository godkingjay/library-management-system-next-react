import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { SiteUser } from "@/utils/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointCountParams {
	apiKey: string;
	userId?: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const { authorsCollection } = await authorDb();

		const { booksCollection, bookCategoriesCollection, bookBorrowsCollection } =
			await bookDb();

		const { apiKey, userId = undefined }: APIEndpointCountParams =
			req.body || req.query;

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

		if (!usersCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to user database",
				},
			});
		}

		if (!authorsCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to author database",
				},
			});
		}

		if (
			!booksCollection ||
			!bookCategoriesCollection ||
			!bookBorrowsCollection
		) {
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
			case "GET": {
				const booksCount = await booksCollection.countDocuments();
				const authorsCount = await authorsCollection.countDocuments();

				let query: any = {};

				if (userId) {
					query.userId = userId;
				}

				const bookCategoriesCount =
					await bookCategoriesCollection.countDocuments();
				const bookBorrowsBorrowsCount =
					await bookBorrowsCollection.countDocuments({
						borrowStatus: "borrowed",
						...query,
					});

				const bookBorrowsPendingCount =
					await bookBorrowsCollection.countDocuments({
						borrowStatus: "pending",
						...query,
					});

				const bookBorrowsReturnsCount =
					await bookBorrowsCollection.countDocuments({
						borrowStatus: "returned",
						...query,
					});

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Count",
						message: "Database data counted successfully",
					},
					count: {
						books: booksCount,
						authors: authorsCount,
						categories: bookCategoriesCount,
						borrows: {
							borrowed: bookBorrowsBorrowsCount,
							pending: bookBorrowsPendingCount,
							returned: bookBorrowsReturnsCount,
						},
					},
				});

				break;
			}

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
				type: "Internal Server Error",
				message: error.message,
				...error,
			},
		});
	}
}
