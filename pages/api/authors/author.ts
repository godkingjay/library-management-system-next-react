import authorDb from "@/server/mongo/authorDb";
import { Author } from "@/utils/models/author";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointAuthorParameters {
	name: string;
	biography: string;
	birthdate: Date | string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authorsCollection } = await authorDb();

		const {
			name: rawName,
			biography: rawBiography,
			birthdate,
		}: APIEndpointAuthorParameters = req.body || req.query;

		const name = rawName.trim();
		const biography = rawBiography.trim();

		if (!authorsCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to author database",
				},
			});
		}

		const requestedAt = new Date();

		switch (req.method) {
			case "POST": {
				if (!name || !biography) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Parameters",
							message: "Name, biography and birthdate are required",
						},
					});
				}

				const newAuthor: Author = {
					name: name,
					biography: biography,
					birthdate: birthdate,
					updatedAt: requestedAt.toISOString(),
					createdAt: requestedAt.toISOString(),
				};

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
