import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import React, { useEffect, useRef, useState } from "react";
import AuthPageComponent from "../Pages/AuthPageComponent";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useRouter } from "next/router";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { loadingUser } = useAuth();

	const { usersStateValue } = useUser();

	const userMounted = useRef(false);

	const router = useRouter();
	const { pathname } = router;
	const directories = pathname.split("/");

	useEffect(() => {
		if (
			!loadingUser &&
			usersStateValue.currentUser?.auth &&
			!userMounted.current
		) {
			if (
				!usersStateValue.currentUser.user?.roles.includes("admin") &&
				directories[1] === "manage"
			) {
				userMounted.current = true;

				router.push("/");
			}
		}
	}, [loadingUser, usersStateValue, userMounted.current]);

	return (
		<>
			<div className="relative min-h-screen bg-gray-100 w-full max-w-full m-0 p-0 flex flex-col">
				<>
					{!loadingUser && usersStateValue.currentUser?.auth && (
						<>
							{usersStateValue.currentUser && (
								<>
									<NavigationBar />
									<>{children}</>
								</>
							)}
						</>
					)}
				</>
				<>
					{!usersStateValue.currentUser && !loadingUser && (
						<>
							<AuthPageComponent />
						</>
					)}
				</>
			</div>
		</>
	);
};

export default Layout;
