import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Author } from "@/utils/models/author";
import { Book, BookCategory } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { ISBNRegex } from "@/utils/regex";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { ImageOrVideoType } from "@/hooks/useInput";
import { File as FormidableFile } from "formidable";
import { parseFormAsync } from "@/middleware/formidableMiddleware";

const uploadDir = path.join(
	process.cwd(),
	"public",
	"assets",
	"images",
	"books"
);

export const config = {
	api: {
		bodyParser: false,
	},
};

export interface APIEndpointBookParameters {
	apiKey: string;
	author?: string;
	bookId?: string;
	title?: string;
	description?: string;
	categories?: string[];
	amount?: number;
	available?: number;
	borrows?: number;
	borrowedTimes?: number;
	ISBN?: string;
	publicationDate?: Date | string;
	image?: ImageOrVideoType;
	imageFile?: File | FormidableFile | null;
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

		const { fields, files } = await parseFormAsync(req);

		const {
			apiKey,
			author = undefined,
			bookId = undefined,
			title = undefined,
			description = "",
			categories: rawCategories = [],
			amount: rawAmount = undefined,
			available: rawAvailable = undefined,
			borrows: rawBorrows = undefined,
			borrowedTimes: rawBorrowedTimes = undefined,
			ISBN = "",
			publicationDate: rawPublicationDate = undefined,
			image: rawImage = undefined,
		}: APIEndpointBookParameters = req.method === "POST" || req.method === "PUT"
			? (fields as any)
			: req.body || req.query;

		const imageFile = (files["imageFile"] as FormidableFile) || undefined;

		const amount: APIEndpointBookParameters["amount"] =
			typeof rawAmount === "string" ? parseInt(rawAmount) : rawAmount;

		const available: APIEndpointBookParameters["available"] =
			typeof rawAvailable === "string" ? parseInt(rawAvailable) : rawAvailable;

		const borrows: APIEndpointBookParameters["borrows"] =
			typeof rawBorrows === "string" ? parseInt(rawBorrows) : rawBorrows;

		const borrowedTimes: APIEndpointBookParameters["borrowedTimes"] =
			typeof rawBorrowedTimes === "string"
				? parseInt(rawBorrowedTimes)
				: rawBorrowedTimes;

		const categories: APIEndpointBookParameters["categories"] =
			typeof rawCategories === "string"
				? JSON.parse(rawCategories)
				: rawCategories;

		const publicationDate: APIEndpointBookParameters["publicationDate"] =
			typeof rawPublicationDate === "string"
				? new Date(rawPublicationDate)
				: rawPublicationDate;

		const image: APIEndpointBookParameters["image"] =
			typeof rawImage === "string" ? JSON.parse(rawImage) : rawImage;

		// return res.status(400).json({
		// 	data: {
		// 		apiKey,
		// 		author,
		// 		bookId,
		// 		title,
		// 		description,
		// 		categories,
		// 		amount,
		// 		available,
		// 		borrows,
		// 		borrowedTimes,
		// 		ISBN,
		// 		rawPublicationDate,
		// 		image,
		// 		imageFile,
		// 	},
		// });

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
					ISBN,
				})) as unknown as Book;

				if (existingBook) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Book Already Exists",
							message: "A book with the same ISBN already exists",
						},
					});
				}

				if (!categories?.length) {
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
					name: author,
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

				let newBook: Book = {
					_id: bookId,
					id: bookId.toHexString(),
					title,
					description,
					author: authorData.name,
					categories: categories || [],
					amount: amount || 0,
					available: available || 0,
					borrows: borrows || 0,
					borrowedTimes: borrowedTimes || 0,
					ISBN,
					publicationDate,
					updatedAt: requestedAt.toISOString(),
					createdAt: requestedAt.toISOString(),
				};

				if (image && imageFile) {
					const fileName = `${bookId.toHexString()}-${Date.now().toString()}-${
						image.name
					}`;
					const filePath = path.join(uploadDir, fileName);
					const fileUrl = `/assets/images/books/${fileName}`;

					fs.mkdirSync(uploadDir, { recursive: true });
					fs.renameSync(imageFile.filepath, filePath);

					newBook.cover = {
						bookId: bookId.toHexString(),
						fileName,
						filePath,
						fileUrl,
						height: image.height,
						width: image.width,
						fileType: image.type,
						fileSize: image.size,
						fileExtension: image.name.split(".").pop() || "",
						createdAt: requestedAt.toISOString(),
					};
				}

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

				newBook.categories.map(async (category) => {
					const existingCategory = (await bookCategoriesCollection.findOne({
						name: category,
					})) as unknown as BookCategory;

					let newCategory: Partial<BookCategory> = {
						updatedAt: requestedAt.toISOString(),
					};

					if (!existingCategory) {
						const categoryId = new ObjectId();

						newCategory = {
							...newCategory,
							_id: categoryId,
							id: categoryId.toHexString(),
							name: category,
							description: "",
							createdAt: requestedAt.toISOString(),
						};
					}

					await bookCategoriesCollection.findOneAndUpdate(
						{
							name: category,
						},
						{
							$set: newCategory,
						},
						{
							upsert: true,
						}
					);
				});

				return res.status(201).json({
					statusCode: 201,
					book: bookData.value,
				});

				break;
			}

			case "PUT": {
				if (!bookId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book ID",
							message: "Please enter book ID",
						},
					});
				}

				// return res.status(400).json({
				// 	data: {
				// 		apiKey,
				// 		author,
				// 		bookId,
				// 		title,
				// 		description,
				// 		categories,
				// 		amount,
				// 		available,
				// 		borrows,
				// 		borrowedTimes,
				// 		ISBN,
				// 		rawPublicationDate,
				// 		image,
				// 		imageFile,
				// 	},
				// });

				const existingBook = (await booksCollection.findOne({
					id: bookId,
				})) as unknown as Book;

				if (!existingBook) {
					return res.status(404).json({
						statusCode: 404,
						error: {
							type: "Book Not Found",
							message: "Book not found",
						},
					});
				}

				let updatedBook: Partial<Book> = {
					updatedAt: requestedAt.toISOString(),
				};

				if (title) {
					updatedBook.title = title;
				}

				if (description) {
					updatedBook.description = description;
				}

				if (amount !== undefined) {
					updatedBook.amount = amount;
				}

				if (available !== undefined) {
					updatedBook.available = available;
				}

				if (borrows !== undefined) {
					updatedBook.borrows = borrows;
				}

				if (borrowedTimes !== undefined) {
					updatedBook.borrowedTimes = borrowedTimes;
				}

				if (ISBN) {
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

					updatedBook.ISBN = bookISBN;
				}

				if (publicationDate) {
					updatedBook.publicationDate = publicationDate;
				}

				if (image) {
					const fileName = `${existingBook.id}-${Date.now().toString()}-${
						image.name
					}`;
					const filePath = path.join(uploadDir, fileName);
					const fileUrl = `/assets/images/books/${fileName}`;

					fs.mkdirSync(uploadDir, { recursive: true });
					fs.renameSync(imageFile.filepath, filePath);

					updatedBook.cover = {
						bookId: existingBook.id,
						fileName,
						filePath,
						fileUrl,
						height: image.height,
						width: image.width,
						fileType: image.type,
						fileSize: image.size,
						fileExtension: image.name.split(".").pop() || "",
						createdAt: requestedAt.toISOString(),
					};

					if (existingBook.cover) {
						const existingCoverPath = existingBook.cover.filePath;

						if (fs.existsSync(existingCoverPath)) {
							fs.unlinkSync(existingCoverPath);
						}
					}
				}

				if (categories?.length) {
					updatedBook.categories = categories;

					categories.map(async (category) => {
						const existingCategory = (await bookCategoriesCollection.findOne({
							name: category,
						})) as unknown as BookCategory;

						let newCategory: Partial<BookCategory> = {
							updatedAt: requestedAt.toISOString(),
						};

						if (!existingCategory) {
							const categoryId = new ObjectId();

							newCategory = {
								...newCategory,
								_id: categoryId,
								id: categoryId.toHexString(),
								name: category,
								description: "",
								createdAt: requestedAt.toISOString(),
							};
						}

						await bookCategoriesCollection.findOneAndUpdate(
							{
								name: category,
							},
							{
								$set: newCategory,
							},
							{
								upsert: true,
							}
						);
					});
				}

				const bookData = await booksCollection.findOneAndUpdate(
					{
						id: bookId,
					},
					{
						$set: updatedBook,
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Book Updated",
						message: "Book updated successfully",
					},
					book: bookData.value,
				});

				break;
			}

			case "DELETE": {
				if (!bookId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book ID",
							message: "Please enter book ID",
						},
					});
				}

				const existingBook = (await booksCollection.findOne({
					id: bookId,
				})) as unknown as Book;

				if (!existingBook) {
					return res.status(404).json({
						statusCode: 404,
						error: {
							type: "Book Not Found",
							message: "Book not found",
						},
						isDeleted: false,
					});
				}

				const deletedBookState = await booksCollection.deleteOne({
					id: bookId,
				});

				if (existingBook.cover) {
					const existingCoverPath = existingBook.cover.filePath;

					if (fs.existsSync(existingCoverPath)) {
						fs.unlinkSync(existingCoverPath);
					}
				}

				if (deletedBookState.acknowledged) {
					await bookBorrowsCollection.deleteMany({
						bookId: existingBook.id,
					});
				}

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Books Deleted",
						message: "Books deleted successfully",
					},
					isDeleted: deletedBookState.acknowledged,
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
