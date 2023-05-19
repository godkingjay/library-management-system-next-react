import { hashPassword } from "@/server/bcrypt";
import { EmailRegex, PasswordRegex } from "./../../../utils/regex";
import authDb from "@/server/mongo/authDb";
import { NextApiRequest, NextApiResponse } from "next";

export interface APIEndpointSignUpParameters {
	email: string;
	password: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { email, password }: APIEndpointSignUpParameters = req.body;

		if (!authCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to authentication database",
				},
			});
		}

		switch (req.method) {
			case "POST": {
				if (!email || !password) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Missing Parameters",
							message: "Email and password are required",
						},
					});
				}

				if (!EmailRegex.test(email)) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Email",
							message: "Email is invalid",
						},
					});
				}

				if (!PasswordRegex.test(password)) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Password",
							message: "Password is invalid",
						},
					});
				}

				const existingUser = await authCollection.findOne({
					email,
				});

				if (existingUser) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "User Already Exists",
							message: "User with this email already exists",
						},
					});
				}

				const newUser = await authCollection.findOneAndUpdate(
					{
						email,
					},
					{
						email,
						password: await hashPassword(password),
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				return res.status(201).json({
					statusCode: 201,
					success: {
						type: "User Created",
						message: "User was created successfully",
					},
					user: newUser,
				});

				break;
			}

			default: {
				return res.status(405).json({
					statusCode: 405,
					error: {
						type: "Method Not Allowed",
						message: "Only POST requests are allowed",
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
