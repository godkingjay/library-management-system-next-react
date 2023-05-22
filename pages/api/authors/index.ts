import authDb from "@/server/mongo/authDb";
import authorDb from "@/server/mongo/authorDb";
import { UserAuth } from "@/utils/models/auth";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointAuthorsParameters {
	apiKey: string;
	name?: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { authorsCollection } = await authorDb();

		const { apiKey, name = undefined }: APIEndpointAuthorsParameters =
			req.body || req.query;

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

		const requestedAt = new Date();

		switch (req.method) {
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
