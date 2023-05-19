import React, { useCallback, useEffect, useMemo, useState } from "react";

const useAuth = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	const { user: userMemo, setUser: setUserMemo } = useMemo(
		() => ({ user, setUser }),
		[user, setUser]
	);

	const { loading: loadingMemo, setLoading: setLoadingMemo } = useMemo(
		() => ({ loading, setLoading }),
		[loading, setLoading]
	);

	const { error: errorMemo, setError: setErrorMemo } = useMemo(
		() => ({ error, setError }),
		[error, setError]
	);

	const signInWithPassword = useCallback(
		async (emailOrUsername: string, password: string) => {
			try {
				if (!userMemo) {
					setLoadingMemo(true);
				}
			} catch (error) {
				setErrorMemo(error);
			}
		},
		[]
	);

	useEffect(() => {}, []);

	return {
		user: userMemo,
		loading: loadingMemo,
		error: errorMemo,
	};
};

export default useAuth;
