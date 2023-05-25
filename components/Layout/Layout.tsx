import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import React from "react";
import AuthPageComponent from "../Pages/AuthPageComponent";
import NavigationBar from "../NavigationBar/NavigationBar";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { loadingUser } = useAuth();

	const { usersStateValue } = useUser();

	return (
		<>
			<div className="relative min-h-screen bg-gray-50 w-full max-w-full m-0 p-0 flex flex-col">
				{usersStateValue.currentUser && (
					<>
						<NavigationBar />
						<>{children}</>
					</>
				)}
				{!usersStateValue.currentUser && !loadingUser && (
					<>
						<AuthPageComponent />
					</>
				)}
			</div>
		</>
	);
};

export default Layout;
