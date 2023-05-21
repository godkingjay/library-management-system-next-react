import Pagination from "@/components/Table/Pagination";
import { Author } from "@/utils/models/author";
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
import moment from "moment";
import React, { useState } from "react";

type ManageAuthorsPageProps = {};

const ManageAuthorsPage: React.FC<ManageAuthorsPageProps> = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [tableData, setTableData] = useState<Author[]>([]);

	// const tableData = [
	// 	{
	// 		name: "Author 1",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 2",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 3",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 4",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 5",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 6",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 7",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 8",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 9",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 10",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 11",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 12",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 13",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 14",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 15",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 16",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 17",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 18",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// 	{
	// 		name: "Author 19",
	// 		biography: "Biography 2",
	// 		birthdate: "02/02/2000",
	// 		updatedAt: "03/02/2022",
	// 		createdAt: "02/02/2022",
	// 	},
	// 	{
	// 		name: "Author 20",
	// 		biography: "Biography 1",
	// 		birthdate: "01/01/2000",
	// 		updatedAt: "02/01/2022",
	// 		createdAt: "01/01/2022",
	// 	},
	// ];

	const itemsPerPage = 5;
	const pageCount = Math.ceil(tableData.length / itemsPerPage);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const offset = (currentPage - 1) * itemsPerPage;
	const currentPageData = tableData.slice(offset, offset + itemsPerPage);

	console.log({
		currentPage,
		offset,
	});

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
					p={8}
					className="
            border border-transparent
            sm:shadow-lg
            sm:border-gray-200
            sm:rounded-3xl
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
										<Td>{item.name}</Td>
										<Td>{item.biography}</Td>
										<Td>
											{item.birthdate
												? typeof item.birthdate === "string"
													? moment(item.birthdate).format("DD/MM/YYYY")
													: moment(
															new Date(item.birthdate).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td>
											{item.updatedAt
												? typeof item.updatedAt === "string"
													? moment(item.updatedAt).format("DD/MM/YYYY")
													: moment(
															new Date(item.updatedAt).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td>
											{item.createdAt
												? typeof item.createdAt === "string"
													? moment(item.createdAt).format("DD/MM/YYYY")
													: moment(
															new Date(item.createdAt).toISOString()
													  ).format("DD/MM/YYYY")
												: "---"}
										</Td>
										<Td>Action</Td>
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
					<div className="w-full mt-4 flex flex-col items-center">
						<Pagination
							currentPage={currentPage}
							totalPages={pageCount}
							onPageChange={handlePageChange}
						/>
					</div>
				</Box>
			</Box>
		</>
	);
};

export default ManageAuthorsPage;
