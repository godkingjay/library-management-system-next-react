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

		const { bookCategoriesCollection } = await bookDb();

		const {
			apiKey,
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

		if (!bookCategoriesCollection) {
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
