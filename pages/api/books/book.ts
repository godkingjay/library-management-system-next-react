import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Author } from "@/utils/models/author";
import { Book } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { ISBNRegex } from "@/utils/regex";
import { ObjectId } from "mongodb";
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

		const { authorsCollection } = await authorDb();

		const { booksCollection, bookCategoriesCollection, bookLoansCollection } =
			await bookDb();

		const {
			apiKey,
			authorId = undefined,
			bookId = undefined,
			title = undefined,
			categories: rawCategories = [],
			amount = 0,
			available = 0,
			borrowed = 0,
			borrowedTimes = 0,
			ISBN = undefined,
			publicationDate: rawPublicationDate = undefined,
		}: APIEndpointBookParameters = req.body || req.query;

		const categories =
			typeof rawCategories === "string"
				? JSON.parse(rawCategories)
				: rawCategories;

		const publicationDate =
			typeof rawPublicationDate === "string"
				? new Date(rawPublicationDate)
				: rawPublicationDate;

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
			case "POST": {
				if (!title) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book Title",
							message: "Please enter book title",
						},
					});
				}

				const existingBook = (await booksCollection.findOne({
					title,
					authorId,
				})) as unknown as Book;

				if (existingBook) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Book Already Exists",
							message: "A book with the same title already exists",
						},
					});
				}

				if (!categories.length) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book Categories",
							message: "Please enter book categories",
						},
					});
				}

				if (!ISBN) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book ISBN",
							message: "Please enter book ISBN",
						},
					});
				}

				if (!ISBNRegex.test(ISBN)) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Book ISBN",
							message: "Please enter valid book ISBN",
						},
					});
				}

				let bookISBN: string = ISBN.replace(/[- ]/g, "");

				if (bookISBN.length !== 10 && bookISBN.length !== 13) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Book ISBN",
							message: "Please enter valid book ISBN",
						},
					});
				}

				const authorData = (await authorsCollection.findOne({
					id: authorId,
				})) as unknown as Author;

				if (!authorData) {
					return res.status(404).json({
						statusCode: 404,
						error: {
							type: "Author Not Found",
							message: "Author not found",
						},
					});
				}

				const bookId = new ObjectId();

				const newBook: Book = {
					_id: bookId,
					id: bookId.toHexString(),
					title,
					authorId: authorData.id,
					categories,
					amount,
					available,
					borrowed,
					borrowedTimes,
					ISBN,
					publicationDate,
					updatedAt: requestedAt,
					createdAt: requestedAt,
				};

				const bookData = await booksCollection.findOneAndUpdate(
					{
						id: bookId.toHexString(),
					},
					{
						$set: newBook,
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(200).json({
					statusCode: 200,
					book: bookData.value,
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
