import { ObjectId } from "mongodb";

import JWT from "jsonwebtoken";

import { hashPassword } from "@/server/bcrypt";
import { EmailRegex, PasswordRegex } from "./../../../utils/regex";
import authDb from "@/server/mongo/authDb";
import { NextApiRequest, NextApiResponse } from "next";
import { UserAuth } from "@/utils/models/auth";
import { SiteUser } from "@/utils/models/user";
import userDb from "@/server/mongo/userDb";
import { jwtConfig } from "@/utils/site";

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

		const { usersCollection } = await userDb();

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

		const requestDate = new Date();

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

				const authId = new ObjectId();

				const newUserAuth: UserAuth = {
					_id: authId,
					id: authId.toHexString(),
					username: email.split("@")[0],
					email,
					password: await hashPassword(password),
					keys: [
						{
							key: await hashPassword(email.concat(password)),
							createdAt: requestDate.toISOString(),
						},
					],
					lastSignIn: requestDate.toISOString(),
					updatedAt: requestDate.toISOString(),
					createdAt: requestDate.toISOString(),
				};

				const userId = new ObjectId();

				const newUser: SiteUser = {
					_id: userId,
					id: userId.toHexString(),
					username: email.split("@")[0],
					email,
					roles: ["user"],
					updatedAt: requestDate.toISOString(),
					createdAt: requestDate.toISOString(),
				};

				const {
					ok,
					value: { password: excludedPassword, ...newUserAuthData },
				}: {
					ok: 0 | 1;
					value: any;
				} = await authCollection.findOneAndUpdate(
					{
						email,
					},
					{
						$set: {
							...newUserAuth,
							"session.token": JWT.sign(
								{
									userId: new ObjectId().toHexString(),
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
							"session.createdAt": requestDate.toISOString(),
						},
					},
					{
						upsert: true,
						returnDocument: "after",
					}
				);

				const newUserData = await usersCollection.findOneAndUpdate(
					{
						email,
					},
					{
						$set: newUser,
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
					userAuth: newUserAuthData,
					user: newUserData.value,
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
