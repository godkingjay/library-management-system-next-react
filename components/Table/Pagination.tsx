import React from "react";
import { Box, Button, ButtonGroup, Text } from "@chakra-ui/react";

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

		pages.push(
			<>
				<Button
					size={"sm"}
					variant={currentPage === 1 ? "solid" : "outline"}
					colorScheme={currentPage === 1 ? "blue" : "gray"}
					onClick={() => handlePageChange(1)}
				>
					{1}
				</Button>
			</>
		);

		if (currentPage > 1 || currentPage < totalPages) {
			if (currentPage - 1 > 1) {
				if (currentPage - 2 > 1) {
					pages.push(
						<>
							<Text>...</Text>
						</>
					);
				}

				pages.push(
					<>
						<Button
							size={"sm"}
							variant={currentPage === currentPage - 1 ? "solid" : "outline"}
							colorScheme={currentPage === currentPage - 1 ? "blue" : "gray"}
							onClick={() => handlePageChange(currentPage - 1)}
						>
							{currentPage - 1}
						</Button>
					</>
				);
			}

			if (currentPage > 1 && currentPage < totalPages) {
				pages.push(
					<>
						<Button
							size={"sm"}
							variant={"solid"}
							colorScheme={"blue"}
							onClick={() => handlePageChange(currentPage)}
						>
							{currentPage}
						</Button>
					</>
				);
			}

			if (currentPage + 1 < totalPages) {
				pages.push(
					<>
						<Button
							size={"sm"}
							variant={currentPage === currentPage + 1 ? "solid" : "outline"}
							colorScheme={currentPage === currentPage + 1 ? "blue" : "gray"}
							onClick={() => handlePageChange(currentPage + 1)}
						>
							{currentPage + 1}
						</Button>
					</>
				);

				if (currentPage + 2 < totalPages) {
					pages.push(
						<>
							<Text>...</Text>
						</>
					);
				}
			}
		}

		if (totalPages > 1) {
			pages.push(
				<>
					<Button
						size={"sm"}
						variant={currentPage === totalPages ? "solid" : "outline"}
						colorScheme={currentPage === totalPages ? "blue" : "gray"}
						onClick={() => handlePageChange(totalPages)}
					>
						{totalPages}
					</Button>
				</>
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
