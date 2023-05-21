import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import useUser from "./useUser";
import { APIEndpointSignUpParameters } from "@/pages/api/auth/signup";
import { EmailRegex, PasswordRegex } from "@/utils/regex";
import { SiteUser } from "@/utils/models/user";
import { APIEndpointSignInParameters } from "@/pages/api/auth/signin";
import { UserAuth } from "@/utils/models/auth";

const useAuth = () => {
	const { usersStateValue, setUsersStateValue } = useUser();

	const [loadingUser, setLoadingUser] = useState(true);
	const [error, setError] = useState<any>(null);

	const [loadingSession, setLoadingSession] = useState(false);

	const { loadingUser: loadingUserMemo, setLoadingUser: setLoadingUserMemo } =
		useMemo(
			() => ({ loadingUser, setLoadingUser }),
			[loadingUser, setLoadingUser]
		);

	const { error: errorMemo, setError: setErrorMemo } = useMemo(
		() => ({ error, setError }),
		[error, setError]
	);

	const getSession = useCallback(
		async ({
			sessionToken,
		}: Pick<APIEndpointSignInParameters, "sessionToken">) => {
			try {
				if (!usersStateValue.currentUser?.user && !loadingSession) {
					setLoadingUserMemo(true);
					setLoadingSession(true);

					if (!sessionToken) {
						localStorage.removeItem("sessionToken");
						throw new Error("=>Parameter Error: Session token is required");
					}

					const { user, userAuth } = await axios
						.post(apiConfig.apiEndpoint + "/auth/signin", {
							sessionToken,
						} as Pick<APIEndpointSignInParameters, "sessionToken">)
						.then((response) => response.data)
						.catch((error) => {
							throw new Error(
								`=>API: Sign In Failed:\n${error.response.data.error.message}`
							);
						});

					if (user) {
						setUsersStateValue({
							...usersStateValue,
							currentUser: {
								...usersStateValue.currentUser,
								user,
							},
						});

						localStorage.setItem("sessionToken", userAuth.session.token);
					}

					setLoadingSession(false);
					setLoadingUserMemo(false);
				}
			} catch (error) {
				console.log(`=>Mongo: Get Session Failed:\n${error}`);
				setErrorMemo(error);
				setLoadingSession(false);
				setLoadingUserMemo(false);
			}
		},
		[]
	);

	const signUp = useCallback(
		async ({
			email,
			password,
		}: Pick<APIEndpointSignUpParameters, "email" | "password">) => {
			try {
				if (!usersStateValue.currentUser?.user && !loadingSession) {
					setLoadingUserMemo(true);
					setLoadingSession(true);

					if (!email || !password) {
						throw new Error(
							"=>Parameter Error: Email and password are required"
						);
					}

					if (!EmailRegex.test(email)) {
						throw new Error("=>Parameter Error: Email is invalid");
					}

					if (!PasswordRegex.test(password)) {
						throw new Error("=>Parameter Error: Password is invalid");
					}

					const { user, userAuth }: { user: SiteUser; userAuth: UserAuth } =
						await axios
							.post(apiConfig.apiEndpoint + "/auth/signup", {
								email,
								password,
							} as Pick<APIEndpointSignUpParameters, "email" | "password">)
							.then((response) => response.data)
							.catch((error) => {
								throw new Error(
									`=>API: Sign Up Failed:\n${error.response.data.error.message}`
								);
							});

					if (user) {
						setUsersStateValue({
							...usersStateValue,
							currentUser: {
								...usersStateValue.currentUser,
								user,
							},
						});

						localStorage.setItem("sessionToken", userAuth.session!.token);
					} else {
						throw new Error("=>API: Sign Up Failed: User is undefined");
					}

					setLoadingSession(false);
					setLoadingUserMemo(false);
				}
			} catch (error: any) {
				console.log(`=>Mongo: Sign Up Failed:\n${error}`);
				setErrorMemo(error);
				setLoadingSession(false);
				setLoadingUserMemo(false);
			}
		},
		[]
	);

	const signInWithPassword = useCallback(
		async ({
			email,
			username,
			password,
		}: Pick<APIEndpointSignInParameters, "email" | "username" | "password">) => {
			try {
				if (!usersStateValue.currentUser?.user && !loadingSession) {
					setLoadingUserMemo(true);
					setLoadingSession(true);

					if ((!email && !username) || !password) {
						throw new Error(
							"=>Parameter Error: Email or username and password are required"
						);
					}

					if (!EmailRegex.test(email) && email) {
						throw new Error("=>Parameter Error: Email is invalid");
					} else if (!username && username) {
						throw new Error("=>Parameter Error: Username is required");
					}

					if (!PasswordRegex.test(password)) {
						throw new Error("=>Parameter Error: Password is invalid");
					}

					const { user, userAuth } = await axios
						.post(apiConfig.apiEndpoint + "/auth/signin", {
							email,
							username,
							password,
						} as Pick<APIEndpointSignInParameters, "email" | "username" | "password">)
						.then((response) => response.data)
						.catch((error) => {
							throw new Error(
								`=>API: Sign In Failed:\n${error.response.data.error.message}`
							);
						});

					if (user) {
						setUsersStateValue({
							...usersStateValue,
							currentUser: {
								...usersStateValue.currentUser,
								user,
							},
						});

						localStorage.setItem("sessionToken", userAuth.session.token);
					}

					setLoadingSession(false);
					setLoadingUserMemo(false);
				}
			} catch (error: any) {
				console.log(`=>Mongo: Sign In Failed:\n${error.message}`);
				setErrorMemo(error);
				setLoadingSession(false);
				setLoadingUserMemo(false);
			}
		},
		[]
	);

	useEffect(() => {
		const sessionToken = localStorage.getItem("sessionToken");

		if (sessionToken) {
			getSession({
				sessionToken,
			});
		} else {
			setLoadingUserMemo(false);
		}
	}, []);

	return {
		loadingUser: loadingUserMemo,
		error: errorMemo,
		signInWithPassword,
		signUp,
	};
};

export default useAuth;
