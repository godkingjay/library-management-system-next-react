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

	console.log({ loadingUser });

	return (
		<>
			<div className="relative min-h-full w-full max-w-full m-0 p-0 flex flex-col">
				<NavigationBar />
				<>{children}</>
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
