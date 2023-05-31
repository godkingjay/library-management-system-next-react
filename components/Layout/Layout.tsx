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
	const { loadingUser, userMounted } = useAuth();

	const { usersStateValue } = useUser();

	const pageMounted = useRef(false);

	const router = useRouter();
	const { pathname } = router;
	const directories = pathname.split("/");

	useEffect(() => {
		if (
			(!userMounted && !loadingUser) ||
			(userMounted &&
				!usersStateValue.currentUser?.user?.roles.includes("admin"))
		) {
			router.push("/");
		}
	}, [
		router.pathname,
		userMounted,
		loadingUser,
		usersStateValue.currentUser?.user?.roles.includes("admin"),
	]);

	return (
		<>
			<div className="relative min-h-screen bg-gray-100 w-full max-w-full m-0 p-0 flex flex-col">
				<>
					{userMounted && (
						<>
							{usersStateValue.currentUser && (
								<>
									{((router.pathname.split("/")[1] === "manage" &&
										usersStateValue.currentUser.user?.roles.includes("admin")) ||
										router.pathname.split("/")[1] !== "manage") && (
										<>
											<NavigationBar />
											<>{children}</>
										</>
									)}
								</>
							)}
						</>
					)}
				</>
				<>
					{!loadingUser && !userMounted && (
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
