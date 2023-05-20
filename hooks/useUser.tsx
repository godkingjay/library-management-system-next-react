import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { UserData, setCurrentUser, setUsers } from "@/redux/slice/usersSlice";

const useUser = () => {
	const dispatch = useAppDispatch();
	const usersStateValue = useAppSelector((state) => state.users);

	const usersStateValueMemo = useMemo(() => usersStateValue, [usersStateValue]);

	const setCurrentUserMemo = useCallback(
		(user: UserData) => {
			dispatch(setCurrentUser(user));
		},
		[dispatch]
	);

	const setUsersMemo = useCallback(
		(users: UserData[]) => {
			dispatch(setUsers(users));
		},
		[dispatch]
	);

	return {
		usersStateValue: usersStateValueMemo,
		setCurrentUser: setCurrentUserMemo,
		setUsers: setUsersMemo,
	};
};

export default useUser;
