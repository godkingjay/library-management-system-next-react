import React from "react";
import { Box, Button, ButtonGroup } from "@chakra-ui/react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const handlePageChange = (page: number) => {
		onPageChange(page);
	};

	const renderPages = () => {
		const pages = [];
		for (let i = 1; i <= totalPages; i++) {
			pages.push(
				<Button
					key={i}
					size={"sm"}
					variant={currentPage === i ? "solid" : "outline"}
					colorScheme={currentPage === i ? "blue" : "gray"}
					onClick={() => handlePageChange(i)}
				>
					{i}
				</Button>
			);
		}
		return pages;
	};

	return (
		<Box>
			<ButtonGroup
				spacing={2}
				className="flex flex-row items-center flex-wrap justify-center gap-y-2"
			>
				<Button
					size={"sm"}
					disabled={currentPage === 1}
					onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
				>
					Previous
				</Button>
				{renderPages()}
				<Button
					size={"sm"}
					disabled={currentPage === totalPages}
					onClick={() =>
						currentPage < totalPages && handlePageChange(currentPage + 1)
					}
				>
					Next
				</Button>
			</ButtonGroup>
		</Box>
	);
};

export default Pagination;
