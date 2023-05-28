import { Box, Input, Icon, FormControl } from "@chakra-ui/react";
import { BiSearchAlt } from "react-icons/bi";

interface MainSearchBarProps {
	value?: string;
	placeholder?: string;
	onSearch: (query: string) => void;
}

const MainSearchBar: React.FC<MainSearchBarProps> = ({
	value,
	placeholder = "Search...",
	onSearch,
}) => {
	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		onSearch(query);
	};

	return (
		<FormControl className="flex flex-row bg-white rounded-full pl-4 pr-2 py-2 gap-x-4 items-center shadow-xl">
			<Box className="h-8 w-8 p-1 text-gray-700">
				<Icon
					as={BiSearchAlt}
					className="!h-full !w-full"
				/>
			</Box>
			<Input
				type="text"
				placeholder={placeholder}
				onChange={handleSearch}
				variant={"unstyled"}
				className="text-gray-700"
				value={value}
			/>
		</FormControl>
	);
};

export default MainSearchBar;
