import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Author } from "@/utils/models/author";
import { Book, BookBorrow, BookInfo } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBorrowsParameters {
	apiKey: string;
	userId?: string;
	search?: string;
	borrowStatus?: BookBorrow["borrowStatus"];
	page?: number;
	limit: number;
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
			userId = undefined,
			search = undefined,
			borrowStatus = "borrowed",
			page: rawPage = 1,
			limit: rawLimit = 10,
		}: APIEndpointBorrowsParameters = req.body || req.query;

		const page = typeof rawPage === "number" ? rawPage : parseInt(rawPage);
		const limit = typeof rawLimit === "number" ? rawLimit : parseInt(rawLimit);

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

		if (!booksCollection || !bookBorrowsCollection) {
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
				if (!borrowStatus) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Borrow Status",
							message: "Please enter Borrow Status",
						},
					});
				}

				if (
					borrowStatus !== "pending" &&
					borrowStatus !== "borrowed" &&
					borrowStatus !== "returned"
				) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Borrow Status",
							message: "Invalid Borrow Status",
						},
					});
				}

				let query: any = {
					borrowStatus,
				};

				let countQuery: any = {
					borrowStatus,
				};

				if (userId) {
					query.userId = userId;
					countQuery.userId = userId;
				}

				if (search) {
					query.note = {
						$regex: new RegExp(search, "i"),
					};
					countQuery.note = {
						$regex: new RegExp(search, "i"),
					};
				}

				const skip = (page - 1) * limit;

				let sort: Partial<Record<keyof BookBorrow, number>> = {};

				switch (borrowStatus) {
					case "pending": {
						sort = {
							requestedAt: -1,
						};

						break;
					}

					case "borrowed": {
						sort = {
							borrowedAt: -1,
						};

						break;
					}

					case "returned": {
						sort = {
							returnedAt: -1,
						};

						break;
					}

					default: {
						sort = {
							createdAt: -1,
						};

						break;
					}
				}

				const bookBorrowsData = await bookBorrowsCollection
					.find(query)
					.sort(sort as any)
					.skip(skip)
					.limit(limit)
					.toArray();

				const totalCount = await bookBorrowsCollection.countDocuments(
					countQuery
				);

				const borrowInfo: BookInfo[] = await Promise.all(
					bookBorrowsData.map(async (bookBorrow) => {
						const bookData = (await booksCollection.findOne({
							id: bookBorrow.bookId,
						})) as unknown as Book;

						const bookBorrowData = bookBorrow as unknown as BookBorrow;

						const authorData = (await authorsCollection.findOne({
							name: bookData.author,
						})) as unknown as Author;

						const userData = (await usersCollection.findOne({
							id: bookBorrowData.userId,
						})) as unknown as SiteUser;

						return {
							book: bookData,
							borrow: bookBorrowData,
							author: authorData,
							borrower: userData,
						} as BookInfo;
					})
				);

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Borrows Data",
						message: "Fetching borrow book information successful",
					},
					borrows: borrowInfo,
					page: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount: totalCount,
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
				message: error.message || "Internal Server Error",
			},
		});
	}
}
