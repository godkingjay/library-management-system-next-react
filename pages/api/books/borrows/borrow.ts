import authDb from "@/server/mongo/authDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { Book, BookBorrow } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBorrowParameters {
	apiKey: string;
	borrowId?: string;
	bookId?: string;
	note?: string;
	dueAt?: Date | string;
	borrowType?: "request" | "accept" | "return";
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const { booksCollection, bookBorrowsCollection } = await bookDb();

		const {
			apiKey,
			borrowId = undefined,
			bookId = undefined,
			note: rawNote = "",
			dueAt = "",
			borrowType = "request",
		}: APIEndpointBorrowParameters = req.body || req.query;

		const note =
			typeof rawNote === "string" ? rawNote.trim() : rawNote || undefined;

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
					type: "Server Error",
					message: "Authentication database not found",
				},
			});
		}

		if (!usersCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Server Error",
					message: "User database not found",
				},
			});
		}

		if (!booksCollection || !bookBorrowsCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Server Error",
					message: "Book database not found",
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
				if (!bookId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book ID",
							message: "Please enter Book ID",
						},
					});
				}

				if (borrowType !== "request") {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Borrow Status",
							message: "Invalid Borrow Status",
						},
					});
				}

				const existingBorrow = (await bookBorrowsCollection
					.find({
						userId: userData.id,
						bookId: bookId,
						$or: [
							{
								borrowStatus: "pending",
							},
							{
								borrowStatus: "borrowed",
							},
						],
					})
					.sort({
						createdAt: -1,
					})
					.limit(1)
					.toArray()) as BookBorrow[];

				if (existingBorrow.length > 0) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Existing Borrow",
							message: "Existing Borrow",
						},
					});
				}

				const bookData = (await booksCollection.findOne({
					id: bookId,
				})) as unknown as Book;

				if (bookData.available <= 0) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Book Unavailable",
							message: "Book Unavailable",
						},
					});
				}

				const borrowId = new ObjectId();

				const newBookBorrow: Partial<BookBorrow> = {
					_id: borrowId,
					id: borrowId.toHexString(),
					userId: userData.id,
					bookId: bookId,
					note: note,
					borrowStatus: "pending",
					requestedAt: requestedAt.toISOString(),
					createdAt: requestedAt.toISOString(),
				};

				const borrowData = await bookBorrowsCollection.findOneAndUpdate(
					{
						bookId: bookId,
						userId: userData.id,
						borrowStatus: "pending",
					},
					{
						$set: newBookBorrow,
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(201).json({
					statusCode: 201,
					success: {
						type: "Book Borrow",
						message: "Book Borrow request sent successfully",
					},
					borrow: borrowData.value,
				});

				break;
			}

			case "PUT": {
				if (!borrowId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Borrow ID",
							message: "Please enter Borrow ID",
						},
					});
				}

				// if (!bookId) {
				// 	return res.status(400).json({
				// 		statusCode: 400,
				// 		error: {
				// 			type: "Missing Book ID",
				// 			message: "Please enter Book ID",
				// 		},
				// 	});
				// }

				if (
					borrowType !== "accept" &&
					borrowType !== "return" &&
					borrowType !== "request"
				) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Borrow Status",
							message: "Invalid Borrow Status",
						},
					});
				}

				// const existingBorrow = (await bookBorrowsCollection.findOne({
				// 	// id: borrowId,
				// 	bookId: bookId,
				// 	userId: userData.id,
				// 	$or: [
				// 		{
				// 			borrowStatus: "pending",
				// 		},
				// 		{
				// 			borrowStatus: "borrowed",
				// 		},
				// 	],
				// })) as unknown as BookBorrow;

				// let query: any = {
				// 	bookId: bookId,
				// 	userId: userData.id,
				// };

				// if (borrowType === "accept") {
				// 	query = {
				// 		...query,
				// 		borrowStatus: "pending",
				// 	};
				// } else if (borrowType === "return") {
				// 	query = {
				// 		...query,
				// 		borrowStatus: "borrowed",
				// 	};
				// }

				const existingBorrow = (await bookBorrowsCollection
					.find({
						id: borrowId,
					})
					.sort({
						createdAt: -1,
					})
					.limit(1)
					.toArray()) as BookBorrow[];

				if (!existingBorrow) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "No Borrow",
							message: "No Borrow",
						},
					});
				}

				if (!existingBorrow || existingBorrow.length === 0) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "No Borrow",
							message: "No Borrow",
						},
						borrowType,
					});
				}

				const bookData = (await booksCollection.findOne({
					id: existingBorrow[0].bookId,
				})) as unknown as Book;

				if (!bookData) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "No Book",
							message: "No Book",
						},
					});
				}

				// if (
				// 	existingBorrow[0].borrowStatus === "borrowed" &&
				// 	borrowType === "accept"
				// ) {
				// 	return res.status(400).json({
				// 		statusCode: 400,
				// 		error: {
				// 			type: "Book Already Borrowed",
				// 			message: "Book Already Borrowed",
				// 		},
				// 	});
				// }

				if (
					existingBorrow[0].borrowStatus === "pending" &&
					borrowType === "return"
				) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Book Not Borrowed",
							message: "Book Not Borrowed",
						},
					});
				}

				// if (existingBorrow[0].borrowStatus === "returned") {
				// 	return res.status(400).json({
				// 		statusCode: 400,
				// 		error: {
				// 			type: "Book Already Returned",
				// 			message: "Book Already Returned",
				// 		},
				// 	});
				// }

				const updatedBookBorrow: Partial<BookBorrow> = {};

				if (note) {
					updatedBookBorrow.note = note;
				}

				if (dueAt) {
					updatedBookBorrow.dueAt = dueAt;
				}

				if (
					borrowType === "accept" &&
					existingBorrow[0].borrowStatus === "pending"
				) {
					if (bookData.available <= 0) {
						return res.status(400).json({
							statusCode: 400,
							error: {
								type: "Book Not Available",
								message: "Book Not Available",
							},
						});
					}

					updatedBookBorrow.borrowStatus = "borrowed";
					updatedBookBorrow.borrowedAt = requestedAt.toISOString();

					await booksCollection.updateOne(
						{
							id: existingBorrow[0].bookId,
						},
						{
							$inc: {
								available: -1,
								borrows: 1,
								borrowedTimes: 1,
							},
						}
					);
				}

				if (
					borrowType === "return" &&
					existingBorrow[0].borrowStatus === "borrowed"
				) {
					await booksCollection.updateOne(
						{
							id: existingBorrow[0].bookId,
						},
						{
							$inc: {
								available: 1,
								borrows: -1,
							},
						}
					);

					updatedBookBorrow.borrowStatus = "returned";
					updatedBookBorrow.returnedAt = requestedAt.toISOString();
				}

				const borrowData = await bookBorrowsCollection.findOneAndUpdate(
					{
						// id: existingBorrow.id,
						id: existingBorrow[0].id,
						// bookId: bookId,
						// userId: userData.id,
						// $or: [
						// 	{
						// 		borrowStatus: "pending",
						// 	},
						// 	{
						// 		borrowStatus: "borrowed",
						// 	},
						// ],
					},
					{
						$set: {
							...updatedBookBorrow,
						},
					},
					{
						returnDocument: "after",
					}
				);

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Book Borrow",
						message: "Book Borrow updated successfully",
					},
					borrow: borrowData.value,
				});

				break;
			}

			case "GET": {
				if (!bookId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Book ID",
							message: "Please enter Book ID",
						},
					});
				}

				const existingBookBorrow = (await bookBorrowsCollection
					.find({
						bookId: bookId,
						userId: userData.id,
					})
					.sort({
						createdAt: -1,
					})
					.limit(1)
					.toArray()) as BookBorrow[];

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Book Borrow",
						message: "Book Borrow fetched successfully",
					},
				});

				break;
			}

			case "DELETE": {
				if (!borrowId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Borrow ID",
							message: "Please enter Borrow ID",
						},
					});
				}

				const existingBorrow = (await bookBorrowsCollection.findOne({
					id: borrowId,
				})) as unknown as BookBorrow;

				if (!existingBorrow) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "No Borrow",
							message: "No Borrow",
						},
					});
				}

				if (existingBorrow.borrowStatus === "borrowed") {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Book Not Returned",
							message: "Book Not Returned",
						},
					});
				}

				const deletedBorrow = await bookBorrowsCollection.findOneAndDelete({
					id: borrowId,
				});

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Book Borrow",
						message: "Book Borrow deleted successfully",
					},
					isDeleted: deletedBorrow.ok === 1 ? true : false,
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
