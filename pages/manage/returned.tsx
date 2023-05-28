import BorrowCard from "@/components/Borrow/BorrowCard";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import Pagination from "@/components/Table/Pagination";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { BookBorrow, BookInfo } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Grid,
	Icon,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Textarea,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { APIEndpointBorrowsParameters } from "../api/books/borrows";

type ManageReturnedPageProps = {};

export type ManageReturnedModalTypes = "" | "remove" | "note";

const ManageReturnedPage: React.FC<ManageReturnedPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [bookBorrowsData, setBookBorrowsData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState<boolean>(false);
	const [updatingBorrow, setUpdatingBorrow] = useState<boolean>(false);

	const [manageReturnedModalOpen, setManageReturnedModalOpen] =
		useState<ManageReturnedModalTypes>("");

	const [updateBorrow, setUpdateBorrow] = useState<BookInfo | null>(null);

	const [note, setNote] = useState<Pick<BookBorrow, "note" | "dueAt">>({
		note: "",
		dueAt: "",
	});

	const bookBorrowsMounted = useRef(false);
	const updateRef = useRef(null);

	const handleManageReturnedModalOpen = (type: ManageReturnedModalTypes) => {
		setManageReturnedModalOpen(type);
	};

	const handleNoteModalOpen = (borrowData: BookInfo) => {
		handleManageReturnedModalOpen("note");

		setUpdateBorrow(borrowData);
		setNote({
			note: borrowData.borrow?.note || "",
			dueAt: borrowData.borrow?.dueAt || "",
		});
	};

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
							borrowStatus: "returned",
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
				<title>Manage Returned | LibMS</title>
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
					<Grid className="grid-cols-1 sm2:grid-cols-2 gap-4">
						<>
							{fetchingData ||
							!bookBorrowsMounted.current ||
							loadingUser ||
							!usersStateValue.currentUser?.auth ? (
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
											<Text>Loading Returns...</Text>
										</Flex>
									</Box>
								</>
							) : (
								<>
									{bookBorrowsData.length > 0 ? (
										<>
											{bookBorrowsData.map((bookBorrow) => (
												<>
													<React.Fragment key={bookBorrow.borrow?.id}>
														<BorrowCard
															borrowData={bookBorrow}
															onNote={handleNoteModalOpen}
														/>
													</React.Fragment>
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

export default ManageReturnedPage;
