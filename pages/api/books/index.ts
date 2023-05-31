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
	search?: string;
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
			search = undefined,
			fromTitle = undefined,
			page: rawPage = 1,
			limit: rawLimit = 10,
		}: APIEndpointBooksParameters = req.body || req.query;

		const page: APIEndpointBooksParameters["page"] =
			typeof rawPage === "number"
				? rawPage
				: typeof rawPage === "string"
				? parseInt(rawPage)
				: 1;

		const limit: APIEndpointBooksParameters["limit"] =
			typeof rawLimit === "number"
				? rawLimit
				: typeof rawLimit === "string"
				? parseInt(rawLimit)
				: 10;

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

				if (search) {
					countQuery = {
						$or: [
							{
								title: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								author: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								ISBN: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								categories: {
									$in: [search.toLowerCase()],
								},
							},
						],
					};
					query = {
						$or: [
							{
								title: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								author: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								ISBN: {
									$regex: new RegExp(search, "i"),
								},
							},
							{
								categories: {
									$in: [search.toLowerCase()],
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
								search: {
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

				const skip = (page - 1) * limit;

				const collationOptions: CollationOptions = {
					locale: "en",
					numericOrdering: true,
				};

				const booksData = await booksCollection
					.find({
						...query,
					})
					.sort({
						title: 1,
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
					totalPages: Math.ceil(totalCount / limit),
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
