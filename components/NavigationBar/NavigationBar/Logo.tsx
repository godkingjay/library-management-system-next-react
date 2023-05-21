import Link from "next/link";
import React from "react";
import { IoLibrary } from "react-icons/io5";

type LogoProps = {};

const Logo: React.FC<LogoProps> = () => {
	return (
		<>
			<Link
				href="/"
				className="flex flex-row gap-x-2 items-center group"
			>
				<div
					className="
              border border-blue-500 p-2 aspect-square w-9 h-9 rounded-lg text-blue-500
              group-hover:border-blue-600 group-hover:text-blue-600
            "
				>
					<IoLibrary className="w-full h-full" />
				</div>
				<div className="flex flex-col gap-y-0">
					<p
						className="
                  font-bold text-xl leading-none text-blue-500
                  group-hover:text-blue-600
                "
					>
						LIB
					</p>
					<div
						className="
                h-1 w-full bg-blue-400 rounded-full
                group-hover:bg-blue-500
              "
					></div>
					<div
						className="
                h-1 w-full bg-blue-300 rounded-full
                group-hover:bg-blue-400
              "
					></div>
					<div
						className="
                h-1 w-full bg-blue-200 rounded-full
                group-hover:bg-blue-300
              "
					></div>
				</div>
			</Link>
		</>
	);
};

export default Logo;
