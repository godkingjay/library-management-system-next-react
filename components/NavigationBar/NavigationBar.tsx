import React from "react";
import Logo from "./NavigationBar/Logo";
import UserMenu from "./NavigationBar/UserMenu";

type NavigationBarProps = {};

const NavigationBar: React.FC<NavigationBarProps> = () => {
	return (
		<>
			<div className="z-[1] flex flex-row w-full sticky top-0 h-[56px] bg-white p-2 items-center justify-center border-b border-gray-200">
				<div className="w-full h-full flex-1 flex flex-row items-center gap-x-4">
					<div className="mr-auto">
						<Logo />
					</div>
					{/* <div className="flex-1 flex flex-row h-full items-center limit-width">
						navigation
					</div> */}
					<div className="ml-auto">
						<UserMenu />
					</div>
				</div>
			</div>
		</>
	);
};

export default NavigationBar;
