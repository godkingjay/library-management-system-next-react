import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { UserState, setUsersState } from "@/redux/slice/usersSlice";

const useUser = () => {
	const dispatch = useAppDispatch();
	const usersStateValue = useAppSelector((state) => state.users);

	const usersStateValueMemo = useMemo(() => usersStateValue, [usersStateValue]);

	const setUsersStateValue = useCallback(
		(userState: UserState) => {
			dispatch(setUsersState(userState));
		},
		[dispatch]
	);

	return {
		usersStateValue: usersStateValueMemo,
		setUsersStateValue,
	};
};

export default useUser;
