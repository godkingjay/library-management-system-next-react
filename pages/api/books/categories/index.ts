import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import { UserAuth } from "@/utils/models/auth";
import { CollationOptions } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksCategoriesParameters {
	apiKey: string;
	search?: string;
	alphabet?: string;
	fromCategory?: string;
	page?: number;
	limit?: number;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { authorsCollection } = await authorDb();

		const { bookCategoriesCollection } = await bookDb();

		const {
			apiKey,
			search = undefined,
			alphabet = undefined,
			fromCategory = undefined,
			page: rawPage = 1,
			limit: rawLimit = 10,
		}: APIEndpointBooksCategoriesParameters = req.body || req.query;

		const page: APIEndpointBooksCategoriesParameters["page"] =
			typeof rawPage === "number"
				? rawPage
				: typeof rawPage === "string"
				? parseInt(rawPage)
				: 1;

		const limit: APIEndpointBooksCategoriesParameters["limit"] =
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

		const requestedAt = new Date();

		switch (req.method) {
			case "GET": {
				let query: any = {};
				let countQuery: any = {};

				if (search && alphabet) {
					countQuery.name = {
						$regex: new RegExp(`^(?=^${alphabet}.*)(?=.*${search}.*).*$`, "i"),
					};
					query.name = {
						$regex: new RegExp(`^(?=^${alphabet}.*)(?=.*${search}.*).*$`, "i"),
					};
				} else if (alphabet) {
					countQuery.name = {
						$regex: new RegExp(`^${alphabet}.*$`, "i"),
					};
					query.name = {
						$regex: new RegExp(`^${alphabet}.*$`, "i"),
					};
				} else if (search) {
					countQuery.name = {
						$regex: new RegExp(`^.*${search}.*$`, "i"),
					};
					query.name = {
						$regex: new RegExp(`^.*${search}.*$`, "i"),
					};
				}

				if (fromCategory) {
					query.name = {
						...query.name,
						$lt: fromCategory,
					};
				}

				const skip = (page - 1) * limit;

				const collationOptions: CollationOptions = {
					locale: "en",
					numericOrdering: true,
				};

				const bookCategoriesData = await bookCategoriesCollection
					.find(query)

					.sort({
						name: 1,
					})
					.collation(collationOptions)
					.skip(skip)
					.limit(limit)
					.toArray();

				const bookCategoriesCount =
					await bookCategoriesCollection.countDocuments(countQuery);

				return res.status(200).json({
					statusCode: 200,
					categories: bookCategoriesData,
					page,
					totalPages: Math.ceil(bookCategoriesCount / limit),
					totalCount: bookCategoriesCount,
				});
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
