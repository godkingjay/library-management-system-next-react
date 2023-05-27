import React, { useState } from "react";
import SearchBar from "@/components/Input/SearchBar";
import { Box, Button, Flex, Select, Text } from "@chakra-ui/react";
import Head from "next/head";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";

type ManageCategoriesPageProps = {};

const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = () => {
	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [fetchingData, setFetchingData] = useState(false);

	const [searchText, setSearchText] = useState("");
	const [categoryAlphabet, setCategoryAlphabet] = useState("All");

	const alphabet = [
		"All",
		...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
	];

	// const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
	// 	event.preventDefault();

	// 	try {
	// 		if (!fetchingData) {
	// 			setCPage(1);
	// 		}
	// 	} catch (error: any) {
	// 		console.error(
	// 			`=>API: Search Categories fetchCategories Failed:\n${error}`
	// 		);
	// 	}
	// };

	// const handleSearchChange = (text: string) => {
	// 	if (!fetchingData) {
	// 		setSearchText(text);
	// 	}
	// };

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (!fetchingData) {
			setCategoryAlphabet(event.target.value);
		}
	};

	return (
		<>
			<Head>
				<title>Manage Categories | LibMS</title>
			</Head>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				className="p-4"
			>
				<Box
					maxWidth="5xl"
					width="100%"
					className="
            border border-transparent
            flex flex-col gap-y-4
          "
				>
					<Flex className="flex flex-col">
						<Text
							fontSize={"2xl"}
							fontWeight={"bold"}
							className="text-gray-700"
						>
							Categories
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
						<Flex className="flex-col gap-y-4"></Flex>
					</Flex>
					<Flex className="flex flex-col gap-y-4 shadow-page-box-1 bg-white rounded-lg p-4">
						{/* <form
							onSubmit={(event) => !fetchingData && handleSearch(event)}
							className="flex flex-row gap-x-2 items-center"
						>
							<Flex
								direction={"column"}
								flex={1}
							>
								<SearchBar
									placeholder={"Search Book..."}
									onSearch={handleSearchChange}
								/>
							</Flex>
							<Button
								type="submit"
								colorScheme="linkedin"
							>
								Search
							</Button>
						</form> */}
						<Select
							onChange={(event) => handleSelectChange(event)}
							value={categoryAlphabet}
							title="Category"
							aria-label="Category"
							name="category"
						>
							{alphabet.map((letter) => (
								<option
									key={letter}
									value={letter}
								>
									{letter}
								</option>
							))}
						</Select>
					</Flex>
				</Box>
			</Box>
		</>
	);
};

export default ManageCategoriesPage;
