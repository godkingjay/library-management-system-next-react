import { Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoRemoveCircleOutline } from "react-icons/io5";

type CategoryTagsListProps = {
	itemName: string;
	items: string[];
	maxItems?: number;
};

const CategoryTagsList: React.FC<CategoryTagsListProps> = ({
	itemName,
	items,
	maxItems = 5,
}) => {
	const hiddenCount = items.length - maxItems;
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);

	const handleTooltipToggle = (state: boolean) => {
		setIsTooltipOpen((prev) => state);
	};

	return (
		<div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-2 rounded-full py-2">
			{items.slice(0, maxItems).map((item, index) => (
				<div
					key={index}
					title={item}
					className="h-6 flex text-sm px-2 py-0.5 rounded-full items-center space-x-2 duration-200 bg-blue-100 hover:text-blue-700 hover:bg-blue-200"
				>
					<span className="text-2xs px-1 truncate text-blue-500">
						{item
							.split("-")
							.map((word) => {
								return word.charAt(0).toUpperCase() + word.slice(1);
							})
							.join(" ")}
					</span>
				</div>
			))}
			{hiddenCount > 0 && (
				<div
					className="relative"
					onMouseEnter={() => handleTooltipToggle(true)}
					onMouseLeave={() => handleTooltipToggle(false)}
					onClick={() => handleTooltipToggle(!isTooltipOpen)}
					onFocus={() => handleTooltipToggle(true)}
					onBlur={() => handleTooltipToggle(false)}
				>
					<Tooltip
						label={`${items
							.slice(maxItems, 20)
							.map((item) => item)
							.join(", ")
							.concat(items.length > 20 ? "..." : "")}`}
						isOpen={isTooltipOpen}
						placement="top"
					>
						<div
							className="w-6 h-6 flex flex-col items-center justify-center text-gray-500 p-1 cursor-pointer bg-blue-100 rounded-full hover:text-blue-500 focus:text-blue-500"
							title={`${hiddenCount} more ${itemName}`}
						>
							<span className="text-2xs text-blue-500">{`+${hiddenCount}`}</span>
						</div>
					</Tooltip>
					{/* {isTooltipOpen && (
						<div className="z-[220] group absolute bottom-[100%] right-0 overflow-hidden py-2 bg-slate-700 rounded-lg shadow-md">
							{items.slice(maxItems, 20).map((item, index) => (
								<div
									key={index}
									title={item}
									className="h-5 flex text-sm items-center space-x-2 px-2 duration-200 hover:bg-blue-500"
									onClick={(event) => event.stopPropagation()}
								>
									<span className="text-2xs px-1 truncate text-white">
										{item.length > 64 ? `${item.slice(0, 64)}...` : item}
									</span>
								</div>
							))}
							{items.length - 20 > 20 && (
								<div className="h-5 flex text-sm items-center space-x-2">
									<span className="text-2xs px-1 truncate text-white">
										{items.length - 20} More
									</span>
								</div>
							)}
						</div>
					)} */}
				</div>
			)}
		</div>
	);
};

export default CategoryTagsList;
