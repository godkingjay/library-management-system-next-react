import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import useUser from "./useUser";

const useAuth = () => {
	const { usersStateValue } = useUser();

	const [user, setUser] = useState(null);
	const [loadingUser, setLoadingUser] = useState(true);
	const [error, setError] = useState<any>(null);

	const [loadingSession, setLoadingSession] = useState(false);

	const { user: userMemo, setUser: setUserMemo } = useMemo(
		() => ({ user, setUser }),
		[user, setUser]
	);

	const { loadingUser: loadingUserMemo, setLoadingUser: setLoadingUserMemo } =
		useMemo(
			() => ({ loadingUser, setLoadingUser }),
			[loadingUser, setLoadingUser]
		);

	const { error: errorMemo, setError: setErrorMemo } = useMemo(
		() => ({ error, setError }),
		[error, setError]
	);

	const getSession = useCallback(async (sessionToken: string) => {
		try {
			if (!userMemo && !loadingSession) {
				setLoadingUserMemo(true);
				setLoadingSession(true);

				const data = await axios
					.post(apiConfig.apiEndpoint + "/auth/signin", {
						sessionToken,
					})
					.then((response) => response.data);

				setUserMemo(data.user);

				setLoadingSession(false);
				setLoadingUserMemo(false);
			}
		} catch (error) {
			setErrorMemo(error);
		}
	}, []);

	const signInWithPassword = useCallback(
		async (emailOrUsername: string, password: string) => {
			try {
				if (!userMemo && !loadingSession) {
					setLoadingUserMemo(true);
					setLoadingSession(true);

					const { user } = await axios
						.post(apiConfig.apiEndpoint + "/auth/signin", {
							emailOrUsername,
							password,
						})
						.then((response) => response.data);

					if (user) {
						setUserMemo(user);
						localStorage.setItem("sessionToken", user.session.token);
					}

					setLoadingSession(false);
					setLoadingUserMemo(false);
				}
			} catch (error) {
				setErrorMemo(error);
			}
		},
		[]
	);

	useEffect(() => {
		const sessionToken = localStorage.getItem("sessionToken");

		if (sessionToken) {
			getSession(sessionToken);
		}
	}, []);

	return {
		user: userMemo,
		loadingUser: loadingUserMemo,
		error: errorMemo,
		signInWithPassword,
	};
};

export default useAuth;
