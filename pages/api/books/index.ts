import authDb from "@/server/mongo/authDb";
import bookDb from "@/server/mongo/bookDb";
import { UserAuth } from "@/utils/models/auth";
import { CollationOptions } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksParameters {
	apiKey: string;
	title?: string;
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

		const { booksCollection } = await bookDb();

		const {
			apiKey,
			title = undefined,
			fromTitle = undefined,
			page = 1,
			limit = 10,
		}: APIEndpointBooksParameters = req.body || req.query;

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

		const requestedAt = new Date();

		switch (req.method) {
			case "GET": {
				let query: any = {};
				let countQuery: any = {};

				if (title) {
					countQuery.title = {
						$regex: new RegExp(title, "i"),
					};
					query.title = {
						$regex: new RegExp(title, "i"),
					};
				}

				if (fromTitle) {
					query.title = {
						...query.title,
						$lt: fromTitle,
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

				const authorsData = await booksCollection
					.find({
						...query,
					})
					.sort({
						name: 1,
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

				return res.status(200).json({
					statusCode: 200,
					authors: authorsData,
					page: page,
					totalPages: Math.ceil(totalCount / itemsPerPage),
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
