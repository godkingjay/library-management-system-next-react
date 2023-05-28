import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { BookInfo } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import { Box, Flex, Grid, Icon, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { APIEndpointBorrowsParameters } from "../api/books/borrows";
import Pagination from "@/components/Table/Pagination";
import { FiLoader } from "react-icons/fi";

type ManagePendingPageProps = {};

const ManagePendingPage: React.FC<ManagePendingPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [bookBorrowsData, setBookBorrowsData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState<boolean>(false);
	const [updatingBorrow, setUpdatingBorrow] = useState<boolean>(false);

	const bookBorrowsMounted = useRef(false);

	const fetchBookBorrows = async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					borrows,
					totalPages,
					totalCount,
				}: {
					borrows: BookInfo[];
					totalPages: number;
					totalCount: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/books/borrows/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							borrowStatus: "pending",
							page: page,
							limit: itemsPerPage,
						} as APIEndpointBorrowsParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Fetch Books API Call Failed:\n${error.response.data.error.message}`
						);
					});

				setBookBorrowsData(borrows);
				setTPages(totalPages > 0 ? totalPages : 1);

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>API: Fetch Books Failed:\n${error}`);
			setFetchingData(false);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchBookBorrows(page);
	};

	useEffect(() => {
		if (!loadingUser && !bookBorrowsMounted.current) {
			bookBorrowsMounted.current = true;

			fetchBookBorrows(1);
		}
	}, [bookBorrowsMounted.current, loadingUser]);

	return (
		<>
			<Head>
				<title>Manage Pending | LibMS</title>
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
							Pending
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
					</Flex>
					<Grid className="grid-cols-2 gap-4">
						<>
							{!fetchingData ||
							bookBorrowsMounted.current ||
							!loadingUser ||
							usersStateValue.currentUser?.auth ? (
								<>
									{bookBorrowsData.length > 0 ? (
										<>
											{bookBorrowsData.map((bookBorrow) => (
												<>
													<React.Fragment
														key={bookBorrow.borrow?.id}
													></React.Fragment>
												</>
											))}
										</>
									) : (
										<>
											<Text className="p-2 text-xl font-semibold text-center text-gray-500 col-span-full">
												No Pending Borrows Found
											</Text>
										</>
									)}
								</>
							) : (
								<>
									<Box
										textAlign={"center"}
										className="text-gray-500 font-bold col-span-full p-2"
									>
										<Flex className="justify-center flex flex-row items-center gap-x-4">
											<Icon
												as={FiLoader}
												className="h-12 w-12 animate-spin"
											/>
											<Text>Loading Borrows...</Text>
										</Flex>
									</Box>
								</>
							)}
						</>
					</Grid>
					<Flex
						direction={"row"}
						className="items-center justify-center"
					>
						<div className="flex flex-col items-center p-2 shadow-page-box-1 bg-white rounded-lg">
							<Pagination
								currentPage={cPage}
								totalPages={tPages > 1 ? tPages : 1}
								onPageChange={handlePageChange}
							/>
						</div>
					</Flex>
				</Box>
			</Box>
		</>
	);
};

export default ManagePendingPage;
