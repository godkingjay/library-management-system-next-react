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

	const itemsPerPage = 5;
	const pageCount = Math.ceil(tableData.length / itemsPerPage);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const offset = (currentPage - 1) * itemsPerPage;
	const currentPageData = tableData.slice(offset, offset + itemsPerPage);

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
					<div className="w-full flex flex-col items-center">
						<Pagination
							currentPage={currentPage}
							totalPages={pageCount > 1 ? pageCount : 1}
							onPageChange={handlePageChange}
						/>
					</div>
				</Box>
			</Box>
		</>
	);
};

export default ManageAuthorsPage;
