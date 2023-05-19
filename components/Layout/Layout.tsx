import React from "react";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return <>{children}</>;
};

export default Layout;
