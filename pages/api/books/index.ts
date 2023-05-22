import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointBooksParameters {
	apiKey: string;
	name?: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
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
