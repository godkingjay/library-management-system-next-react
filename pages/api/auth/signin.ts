import { comparePasswords } from "@/server/bcrypt";
import authDb from "@/server/mongo/authDb";
import { EmailRegex, PasswordRegex } from "@/utils/regex";
import { NextApiRequest, NextApiResponse } from "next";
import JWT from "jsonwebtoken";
import { getTimeDifference } from "@/utils/functions/date";
import { UserAuth } from "@/utils/models/auth";
import { jwtConfig } from "@/utils/site";
import { SiteUser } from "@/utils/models/user";
import userDb from "@/server/mongo/userDb";

export interface APIEndpointSignInParameters {
	email: string;
	username: string;
	password: string;
	sessionToken: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const { authCollection } = await authDb();

		const { usersCollection } = await userDb();

		const {
			email,
			username,
			password,
			sessionToken,
		}: APIEndpointSignInParameters = req.body;

		if (!authCollection) {
			return res.status(500).json({
				statusCode: 500,
				error: {
					type: "Database Connection Error",
					message: "Could not connect to authentication database",
				},
			});
		}

		const requestDate = new Date();

		switch (req.method) {
			case "POST": {
				if (sessionToken) {
					const previousSession = (await authCollection.findOne({
						"session.token": sessionToken,
					})) as unknown as UserAuth;

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
						requestDate.toISOString(),
						previousSession.session!.expiresAt
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

					const updatedUserAuth = {
						lastSignIn: requestDate.toISOString(),
						updatedAt: requestDate.toISOString(),
						"session.expiresAt": new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000
						).toISOString(),
						"session.updatedAt": requestDate.toISOString(),
					};

					const {
						ok,
						value: { password: excludedPassword, ...userSessionData },
					}: {
						ok: 0 | 1;
						value: any;
					} = await authCollection.findOneAndUpdate(
						{
							"session.token": sessionToken,
						},
						{
							$set: updatedUserAuth,
						},
						{
							returnDocument: "after",
						}
					);

					const userData = (await usersCollection.findOne({
						email: userSessionData.email,
					})) as unknown as SiteUser;

					return res.status(200).json({
						statusCode: 200,
						success: {
							status: ok ? 1 : 0,
							type: "User Signed In",
							message: "Successfully signed in",
						},
						userAuth: userSessionData,
						user: userData,
					});
				} else {
					if ((!email && !username) || !password) {
						return res.status(400).json({
							statusCode: 400,
							error: {
								type: "Missing Parameters",
								message: "Email and password are required",
							},
						});
					}

					if (!EmailRegex.test(email) && email) {
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

					const userAuth = (await authCollection.findOne({
						$or: [
							{
								email,
							},
							{
								username,
							},
						],
					})) as unknown as UserAuth;

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

					const updatedUserAuth = {
						lastSignIn: requestDate.toISOString(),
						updatedAt: requestDate.toISOString(),
						"session.token":
							userAuth.session?.token &&
							getTimeDifference(
								requestDate.toISOString(),
								userAuth.session.expiresAt
							) > 0
								? userAuth.session.token
								: JWT.sign(
										{
											userId: userAuth._id.toHexString(),
										},
										jwtConfig.secretKey,
										{
											expiresIn: "30d",
										}
								  ),
						"session.updatedAt": requestDate.toISOString(),
						"session.expiresAt": new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000
						).toISOString(),
						"session.createdAt":
							userAuth.session?.expiresAt &&
							getTimeDifference(
								requestDate.toISOString(),
								userAuth.session.expiresAt
							) > 0
								? userAuth.session.createdAt
								: requestDate.toISOString(),
					};

					const userData = (await usersCollection.findOne({
						$or: [
							{
								email,
							},
							{
								username,
							},
						],
					})) as unknown as SiteUser;

					const {
						ok,
						value: { password: excludedPassword, ...userSessionData },
					}: {
						ok: 0 | 1;
						value: any;
					} = await authCollection.findOneAndUpdate(
						{
							$or: [
								{
									email,
								},
								{
									username,
								},
							],
						},
						{
							$set: updatedUserAuth,
						},
						{
							returnDocument: "after",
						}
					);

					return res.status(200).json({
						statusCode: 200,
						success: {
							status: ok ? 1 : 0,
							type: "User Signed In",
							message: "Successfully signed in",
						},
						userAuth: userSessionData,
						user: userData,
					});
				}

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
