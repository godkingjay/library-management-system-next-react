import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Author } from "@/utils/models/author";
import { Book, BookBorrow, BookInfo } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { CollationOptions } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksParameters {
	apiKey: string;
	title?: string;
	fromTitle?: string;
	page?: number;
	limit?: number;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const { authorsCollection } = await authorDb();

		const { booksCollection, bookBorrowsCollection } = await bookDb();

		const {
			apiKey,
			title = undefined,
			fromTitle = undefined,
			page = 1,
			limit = 10,
		}: APIEndpointBooksParameters = req.body || req.query;

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

		if (!authorsCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to author database",
				},
			});
		}

		if (!booksCollection) {
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
			username: userAuthData.username,
			email: userAuthData.email,
		})) as unknown as SiteUser;

		if (!userData) {
			return res.status(400).json({
				statusCode: 400,
				error: {
					type: "Invalid User Data",
					message: "Invalid User Data",
				},
			});
		}

		const requestedAt = new Date();

		switch (req.method) {
			case "GET": {
				let query: any = {};
				let countQuery: any = {};

				if (title) {
					countQuery = {
						$or: [
							{
								title: {
									$regex: new RegExp(title, "i"),
								},
							},
							{
								author: {
									$regex: new RegExp(title, "i"),
								},
							},
							{
								categories: {
									$in: [title],
								},
							},
						],
					};
					query = {
						$or: [
							{
								title: {
									$regex: new RegExp(title, "i"),
								},
							},
							{
								author: {
									$regex: new RegExp(title, "i"),
								},
							},
							{
								categories: {
									$in: [title],
								},
							},
						],
					};
				}

				if (fromTitle) {
					query = {
						...query,
						$or: [
							{
								title: {
									...query.$or[0].title,
									$lt: fromTitle,
								},
							},
							{
								author: {
									...query.$or[1].author,
									$lt: fromTitle,
								},
							},
							{
								categories: {
									...query.$or[2].categories,
								},
							},
						],
					};
				}

				const pageNumber =
					typeof page === "number"
						? page
						: typeof page === "string"
						? parseInt(page)
						: 1;

				const itemsPerPage =
					typeof limit === "number"
						? limit
						: typeof limit === "string"
						? parseInt(limit)
						: 10;

				const skip = (pageNumber - 1) * itemsPerPage;

				const collationOptions: CollationOptions = {
					locale: "en",
					numericOrdering: true,
				};

				const booksData = await booksCollection
					.find({
						...query,
					})
					.sort({
						name: 1,
					})
					.collation(collationOptions)
					.skip(skip)
					.limit(
						typeof limit === "number"
							? limit
							: typeof limit === "string"
							? parseInt(limit)
							: 10
					)
					.toArray();

				const totalCount = await booksCollection.countDocuments(countQuery);

				const booksInfo: BookInfo[] = await Promise.all(
					booksData.map(async (book) => {
						const bookDoc = book as unknown as Book;

						const authorData = (await authorsCollection.findOne({
							name: bookDoc.author,
						})) as unknown as Author;

						const borrowData = await bookBorrowsCollection
							.find({ userId: userData.id, bookId: bookDoc.id })
							.sort({ createdAt: -1 })
							.limit(1)
							.toArray();

						return {
							book: bookDoc,
							author: authorData,
							borrow: borrowData[0] ? borrowData[0] : null,
						} as BookInfo;
					})
				);

				return res.status(200).json({
					statusCode: 200,
					books: booksInfo,
					page: page,
					totalPages: Math.ceil(totalCount / itemsPerPage),
					totalCount,
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
				type: "Server Error",
				...error,
			},
		});
	}
}
