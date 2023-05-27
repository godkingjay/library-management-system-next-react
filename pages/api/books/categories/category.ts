import authDb from "@/server/mongo/authDb";
import bookDb from "@/server/mongo/bookDb";
import userDb from "@/server/mongo/userDb";
import { UserAuth } from "@/utils/models/auth";
import { BookCategory } from "@/utils/models/book";
import { SiteUser } from "@/utils/models/user";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksCategoryParameters {
	apiKey: string;
	categoryId?: string;
	name?: string;
	description?: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const { booksCollection, bookCategoriesCollection } = await bookDb();

		const {
			apiKey,
			categoryId = undefined,
			name: rawName = undefined,
			description: rawDescription = undefined,
		}: APIEndpointBooksCategoryParameters = req.body || req.query;

		const name: APIEndpointBooksCategoryParameters["name"] =
			typeof rawName === "string"
				? rawName
						.toLowerCase()
						.replace(/[^\w.,_\-\/\s]/g, "")
						.replace(/[^a-zA-Z0-9]+/g, "-")
						.replace(/-+/g, "-")
						.replace(/(^-|-$)/g, "")
						.trim()
				: undefined;

		const description: APIEndpointBooksCategoryParameters["description"] =
			typeof rawDescription === "string" ? rawDescription.trim() : undefined;

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

		if (!booksCollection || !bookCategoriesCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to book category database",
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
							message: "You are not authorized to create a book category",
						},
					});
				}

				if (!name) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Category Name",
							message: "Please enter category name",
						},
					});
				}

				const existingCategory = (await bookCategoriesCollection.findOne({
					name,
				})) as unknown as BookCategory;

				if (existingCategory) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Category Already Exists",
							message: "Category already exists",
						},
					});
				}

				const categoryId = new ObjectId();

				const newCategory: BookCategory = {
					_id: categoryId,
					id: categoryId.toHexString(),
					name,
					description,
					updatedAt: requestedAt.toISOString(),
					createdAt: requestedAt.toISOString(),
				};

				const newCategoryData = await bookCategoriesCollection.findOneAndUpdate(
					{
						name,
					},
					{
						$set: newCategory,
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(201).json({
					statusCode: 201,
					success: {
						type: "Category Created",
						message: "Category created successfully",
					},
					category: newCategoryData.value,
				});

				break;
			}

			case "PUT": {
				if (!userData.roles.includes("admin")) {
					return res.status(401).json({
						statusCode: 401,
						error: {
							type: "Unauthorized",
							message: "You are not authorized to update categories",
						},
					});
				}

				if (!categoryId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Category ID",
							message: "Please enter category ID",
						},
					});
				}

				const existingCategory = (await bookCategoriesCollection.findOne({
					id: categoryId,
				})) as unknown as BookCategory;

				if (!existingCategory) {
					return res.status(404).json({
						statusCode: 404,
						error: {
							type: "Category Not Found",
							message: "Category not found",
						},
					});
				}

				let updatedCategory: Partial<BookCategory> = {};

				if (name) {
					updatedCategory.name = name;
				}

				if (description) {
					updatedCategory.description = description;
				}

				updatedCategory.updatedAt = requestedAt.toISOString();

				const updatedCategoryData =
					await bookCategoriesCollection.findOneAndUpdate(
						{
							id: categoryId,
						},
						{
							$set: updatedCategory,
						},
						{
							returnDocument: "after",
						}
					);

				if (updatedCategoryData.ok && updatedCategory.name) {
					await booksCollection.updateMany(
						{
							categories: {
								$in: [existingCategory.name],
							},
						},
						{
							$set: {
								"categories.$": updatedCategory.name,
							},
						}
					);
				}

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Category Updated",
						message: "Category updated successfully",
					},
					category: updatedCategoryData.value,
				});

				break;
			}

			case "DELETE": {
				if (!userData.roles.includes("admin")) {
					return res.status(401).json({
						statusCode: 401,
						error: {
							type: "Unauthorized",
							message: "You are not authorized to delete categories",
						},
					});
				}

				if (!categoryId) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Category ID",
							message: "Please enter category ID",
						},
					});
				}

				const existingCategory = (await bookCategoriesCollection.findOne({
					id: categoryId,
				})) as unknown as BookCategory;

				if (!existingCategory) {
					return res.status(404).json({
						statusCode: 404,
						error: {
							type: "Category Not Found",
							message: "Category not found",
						},
					});
				}

				const deletedCategory = await bookCategoriesCollection.deleteOne({
					id: categoryId,
				});

				if (deletedCategory.acknowledged) {
					await booksCollection.updateMany(
						{
							categories: {
								$in: [existingCategory.name],
							},
						},
						{
							$pull: {
								categories: existingCategory.name,
							} as any,
						}
					);
				}

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "Category Deleted",
						message: "Category deleted successfully",
					},
					isDeleted: deletedCategory.acknowledged,
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
