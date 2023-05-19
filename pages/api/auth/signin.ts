import { comparePasswords } from "@/server/bcrypt";
import authDb from "@/server/mongo/authDb";
import { EmailRegex, PasswordRegex } from "@/utils/regex";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { getTimeDifference } from "@/utils/functions/date";

export interface APIEndpointSignInParameters {
	email: string;
	password: string;
	sessionToken: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();
		const { email, password, sessionToken }: APIEndpointSignInParameters =
			req.body;

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
				if (sessionToken) {
					const previousSession: any = await authCollection.findOne({
						"session.token": sessionToken,
					});

					if (!previousSession) {
						return res.status(400).json({
							statusCode: 400,
							error: {
								type: "Invalid Session",
								message: "Session is invalid",
							},
						});
					}

					const timeDifference = getTimeDifference(
						previousSession.session.expiresAt,
						new Date()
					);

					if (timeDifference <= 0) {
						return res.status(400).json({
							statusCode: 400,
							error: {
								type: "Invalid Session",
								message: "Session expired",
							},
						});
					}

					const {
						ok,
						value: { password: excludedPassword, ...userSession },
					}: {
						ok: 0 | 1;
						value: any;
					} = await authCollection.findOneAndUpdate(
						{
							"session.token": sessionToken,
						},
						{
							$set: {
								lastSignIn: new Date().toISOString(),
								"session.expiresAt": new Date(
									Date.now() + 30 * 24 * 60 * 60 * 1000
								).toISOString(),
							},
						},
						{
							returnDocument: "after",
						}
					);

					return res.status(200).json({
						statusCode: 200,
						success: {
							type: "User Signed In",
							message: "Successfully signed in",
						},
						user: userSession,
					});
				}

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

				const userAuth = await authCollection.findOne({
					email,
				});

				if (!userAuth) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Credentials",
							message: "Email or password is incorrect",
						},
					});
				}

				const isPasswordValid = await comparePasswords(
					password,
					userAuth.password
				);

				if (!isPasswordValid) {
					return res.status(400).json({
						statusCode: 400,
						error: {
							type: "Invalid Credentials",
							message: "Email or password is incorrect",
						},
					});
				}

				const token = jwt.sign(
					{
						userId: userAuth._id.toHexString(),
					},
					"secretKey",
					{
						expiresIn: "30d",
					}
				);

				const {
					ok,
					value: { password: excludedPassword, ...newUserAuth },
				}: {
					ok: 0 | 1;
					value: any;
				} = await authCollection.findOneAndUpdate(
					{
						email,
					},
					{
						$set: {
							lastSignIn: new Date().toISOString(),
							session: {
								token,
								expiresAt: new Date(
									Date.now() + 30 * 24 * 60 * 60 * 1000
								).toISOString(),
							},
						},
					},
					{
						returnDocument: "after",
					}
				);

				return res.status(200).json({
					statusCode: 200,
					success: {
						type: "User Signed In",
						message: "Successfully signed in",
					},
					user: newUserAuth,
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
