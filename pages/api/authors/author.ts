import { ObjectId } from "mongodb";
import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Author } from "@/utils/models/author";
import { SiteUser } from "@/utils/models/user";
import { NextApiRequest, NextApiResponse } from "next";
import bookDb from "@/server/mongo/bookDb";
import { Book } from "@/utils/models/book";

export interface APIEndpointAuthorParameters {
	apiKey: string;
	authorId?: string;
	name: string;
	biography: string;
	birthdate?: Date | string;
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
			authorId: rawAuthorId = "",
			name: rawName = "",
			biography: rawBiography = "",
			birthdate = undefined,
		}: APIEndpointAuthorParameters = req.body || req.query;

		const name = rawName.trim();
		const biography = rawBiography.trim();
		const authorId = rawAuthorId.trim();

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
				if (!userData.roles.includes("admin")) {
					return res.status(401).json({
						statusCode: 401,
						error: {
							type: "Unauthorized",
							message: "User is not authorized to create a new author",
						},
					});
				}

				if (!name) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Parameters",
							message: "Name is required",
						},
					});
				}

				const existingAuthor = (await authorsCollection.findOne({
					name,
				})) as unknown as Author;

				if (existingAuthor) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Author Already Exists",
							message: "An author with the same name already exists",
						},
					});
				}

				const authorId = new ObjectId();

				const newAuthor: Author = {
					_id: authorId,
					id: authorId.toHexString(),
					name: name,
					biography: biography,
					birthdate: birthdate,
					updatedAt: requestedAt.toISOString(),
					createdAt: requestedAt.toISOString(),
				};

				const newAuthorData = await authorsCollection.findOneAndUpdate(
					{
						name,
					},
					{
						$set: newAuthor,
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(201).json({
					statusCode: 201,
					success: {
						type: "Author Created",
						message: "Author was created successfully",
					},
					author: newAuthorData.value,
				});

				break;
			}

			case "PUT": {
				if (!userData.roles.includes("admin")) {
					return res.status(401).json({
						statusCode: 401,
						error: {
							type: "Unauthorized",
							message: "User is not authorized to create a new author",
						},
					});
				}

				if (!authorId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Parameters",
							message: "Author ID is required",
						},
					});
				}

				const existingAuthor = (await authorsCollection.findOne({
					name,
				})) as unknown as Author;

				if (existingAuthor) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Author Already Exists",
							message: "An author with the same name already exists",
						},
					});
				}

				let updatedAuthor: Partial<Author> = {
					updatedAt: requestedAt.toISOString(),
				};

				if (name) {
					updatedAuthor.name = name;
				}

				if (biography) {
					updatedAuthor.biography = biography;
				}

				if (birthdate) {
					updatedAuthor.birthdate = birthdate;
				}

				const oldAuthorData = (await authorsCollection.findOne({
					id: authorId,
				})) as unknown as Author;

				const updatedAuthorData = await authorsCollection.findOneAndUpdate(
					{
						id: authorId,
					},
					{
						$set: updatedAuthor,
					},
					{
						returnDocument: "after",
					}
				);

				if (name) {
					await booksCollection.updateMany(
						{
							author: oldAuthorData.name,
						},
						{
							$set: {
								author: name,
							},
						}
					);
				}

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Author Updated",
						message: "Author was updated successfully",
					},
					updatedAuthor: updatedAuthorData.value,
				});

				break;
			}

			case "DELETE": {
				if (!userData.roles.includes("admin")) {
					return res.status(401).json({
						statusCode: 401,
						error: {
							type: "Unauthorized",
							message: "User is not authorized to create a new author",
						},
					});
				}

				if (!authorId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Parameters",
							message: "Author ID is required",
						},
					});
				}

				const existingAuthor = (await authorsCollection.findOne({
					id: authorId,
				})) as unknown as Author;

				if (!existingAuthor) {
					return res.status(200).json({
						statusCode: 200,
						success: {
							type: "Author Does Not Exist",
							message: "An author with that name does not exist",
							isDeleted: true,
						},
					});
				}

				const deletedAuthorData = await authorsCollection.findOneAndDelete({
					id: authorId,
				});

				const authorBooks = (await booksCollection
					.find({
						author: existingAuthor.name,
					})
					.toArray()) as Book[];

				await Promise.all(
					authorBooks.map(async (book) => {
						await bookBorrowsCollection.deleteMany({
							bookId: book.id,
						});

						await booksCollection.deleteOne({
							id: book.id,
						});
					})
				);

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Author Deleted",
						message: "Author was deleted successfully",
						isDeleted: true,
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
				type: "Server Error",
				...error,
			},
		});
	}
}
