import {
	Box,
	Input,
	InputGroup,
	InputLeftElement,
	IconButton,
	Icon,
} from "@chakra-ui/react";
import { BiSearchAlt } from "react-icons/bi";

interface SearchBarProps {
	onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		onSearch(query);
	};

	return (
		<Box>
			<InputGroup>
				<InputLeftElement
					pointerEvents="none"
					className="text-gray-500"
				>
					<Icon as={BiSearchAlt} />
				</InputLeftElement>
				<Input
					type="text"
					placeholder="Search Book..."
					onChange={handleSearch}
				/>
				{/* Add a button or submit functionality if needed */}
			</InputGroup>
		</Box>
	);
};

export default SearchBar;
