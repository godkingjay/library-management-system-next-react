import React from "react";
import Logo from "./NavigationBar/Logo";

type NavigationBarProps = {};

const NavigationBar: React.FC<NavigationBarProps> = () => {
	return (
		<>
			<div className="flex flex-row w-full sticky top-0 h-[56px] bg-white p-2 items-center justify-center border-b border-gray-200">
				<div className="w-full h-full flex-1 flex flex-row limit-width gap-x-4">
					<Logo />
				</div>
			</div>
		</>
	);
};

export default NavigationBar;
