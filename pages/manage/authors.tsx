import Pagination from "@/components/Table/Pagination";
import { Author } from "@/utils/models/author";
import { apiConfig } from "@/utils/site";
import {
	TableContainer,
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Box,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { APIEndpointAuthorsParameters } from "../api/authors";
import useUser from "@/hooks/useUser";

type ManageAuthorsPageProps = {};

const ManageAuthorsPage: React.FC<ManageAuthorsPageProps> = () => {
	const { usersStateValue } = useUser();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [tableData, setTableData] = useState<Author[]>([]);
	const [fetchingData, setFetchingData] = useState(false);

	const itemsPerPage = 10;

	const offset = (cPage - 1) * itemsPerPage;
	const currentPageData = tableData.slice(offset, offset + itemsPerPage);

	const fetchAuthors = useCallback(async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					authors,
					totalPages,
				}: {
					authors: Author[];
					currentPage: number;
					totalPages: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/authors/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							page: page,
							fromName:
								tableData.length > 0
									? tableData[tableData.length - 1].name
									: undefined,
							limit: itemsPerPage,
						} as APIEndpointAuthorsParameters,
					})
					.then((response) => response.data);

				if (authors.length) {
					setTableData(authors);
					setTPages(totalPages);
				}

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>API: Fetch Authors Failed:\n${error}`);
			setFetchingData(false);
		}
	}, []);

	const handlePageChange = useCallback(async (page: number) => {
		setCPage(page);
		await fetchAuthors(page);
	}, []);

	useEffect(() => {
		fetchAuthors(cPage);
	}, []);

	return (
		<>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				className="sm:px-4 sm:py-8"
			>
				<Box
					maxWidth="5xl"
					width="100%"
					bg="white"
					p={4}
					className="
            border border-transparent
            flex flex-col gap-y-4
            sm:shadow-lg
            sm:border-gray-200
            sm:rounded-2xl
          "
				>
					<TableContainer>
						<Table className="overflow-x-scroll">
							<Thead>
								<Tr>
									<Th>Name</Th>
									<Th>Biography</Th>
									<Th>Birthdate</Th>
									<Th>Updated At</Th>
									<Th>Created At</Th>
									<Th>Action</Th>
								</Tr>
							</Thead>
							<Tbody>
								{currentPageData.map((item, index) => (
									<Tr key={index}>
										<Td className="text-sm">{item.name}</Td>
										<Td className="text-sm">{item.biography}</Td>
										<Td className="text-sm">
											{item.birthdate
												? typeof item.birthdate === "string"
													? moment(item.birthdate).format("DD/MM/YYYY")
													: moment(
															new Date(item.birthdate).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td className="text-sm">
											{item.updatedAt
												? typeof item.updatedAt === "string"
													? moment(item.updatedAt).format("DD/MM/YYYY")
													: moment(
															new Date(item.updatedAt).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td className="text-sm">
											{item.createdAt
												? typeof item.createdAt === "string"
													? moment(item.createdAt).format("DD/MM/YYYY")
													: moment(
															new Date(item.createdAt).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td className="text-sm">Action</Td>
									</Tr>
								))}
								{currentPageData.length === 0 && (
									<>
										<Tr>
											<Td
												colSpan={6}
												textAlign={"center"}
												className="text-lg text-gray-500 font-bold"
											>
												No Author Data
											</Td>
										</Tr>
									</>
								)}
							</Tbody>
						</Table>
					</TableContainer>
					<div className="w-full flex flex-col items-center">
						<Pagination
							currentPage={cPage}
							totalPages={tPages > 1 ? tPages : 1}
							onPageChange={handlePageChange}
						/>
					</div>
				</Box>
			</Box>
		</>
	);
};

export default ManageAuthorsPage;
