import fs from "fs";
import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
	api: {
		bodyParser: false,
	},
};

const uploadDir = path.join(process.cwd(), "/assets", "/images", "/books");

const readFile = async (
	req: NextApiRequest,
	saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
	const options: formidable.Options = {};

	if (saveLocally) {
		options.uploadDir = uploadDir;
		options.keepExtensions = true;
		options.filename = (name, ext, path, form) => {
			return name;
		};
	}

	const form = formidable(options);

	return new Promise(async (resolve, reject) => {
		form.parse(req, async (err, fields, files) => {
			if (err) reject(err);
			resolve({ fields, files });
		});
	});
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		await readFile(req, true).catch((err) => {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Unknown Error",
					message: err.message,
					...err,
				},
			});
		});
		res.json({ done: "ok" });
	} catch (error: any) {
		return res.status(500).json({
			statusCode: 500,
			error: {
				type: "Internal Server Error",
				message: error.message,
				...error,
			},
		});
	}
}
