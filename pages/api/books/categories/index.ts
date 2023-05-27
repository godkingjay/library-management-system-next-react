import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import bookDb from "@/server/mongo/bookDb";
import { UserAuth } from "@/utils/models/auth";
import { CollationOptions } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksCategoriesParameters {
	apiKey: string;
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
			alphabet = undefined,
			fromCategory = undefined,
			page = 1,
			limit = 10,
		}: APIEndpointBooksCategoriesParameters = req.body || req.query;

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

				if (alphabet) {
					countQuery.name = {
						$regex: `^${alphabet}`,
						$options: "i",
					};
					query.name = {
						$regex: `^${alphabet}`,
						$options: "i",
					};
				}

				if (fromCategory) {
					query.name = {
						...query.name,
						$lt: fromCategory,
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

				const bookCategoriesData = await bookCategoriesCollection
					.find(query)

					.sort({
						name: 1,
					})
					.collation(collationOptions)
					.skip(skip)
					.limit(itemsPerPage)
					.toArray();

				const bookCategoriesCount =
					await bookCategoriesCollection.countDocuments(countQuery);

				return res.status(200).json({
					statusCode: 200,
					categories: bookCategoriesData,
					page,
					totalPages: Math.ceil(bookCategoriesCount / itemsPerPage),
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
