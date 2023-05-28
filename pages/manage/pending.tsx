import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
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
import { APIEndpointBorrowsParameters } from "../api/books/borrows";
import Pagination from "@/components/Table/Pagination";
import { FiLoader } from "react-icons/fi";
import BorrowCard from "@/components/Borrow/BorrowCard";
import { APIEndpointBorrowParameters } from "../api/books/borrows/borrow";
import moment from "moment";

type ManagePendingPageProps = {};

export type ManagePendingModalTypes = "" | "accept" | "reject" | "note";

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

	const [managePendingModalOpen, setManagePendingModalOpen] =
		useState<ManagePendingModalTypes>("");

	const [updateBorrow, setUpdateBorrow] = useState<BookInfo | null>(null);

	const [note, setNote] = useState<Pick<BookBorrow, "note" | "dueAt">>({
		note: "",
		dueAt: "",
	});

	const bookBorrowsMounted = useRef(false);
	const updateRef = useRef(null);
	const deleteRef = useRef(null);

	const handleManagePendingModalOpen = (type: ManagePendingModalTypes) => {
		setManagePendingModalOpen(type);
	};

	const handleNoteModalOpen = (borrowData: BookInfo) => {
		handleManagePendingModalOpen("note");

		setUpdateBorrow(borrowData);
		setNote({
			note: borrowData.borrow?.note || "",
			dueAt: borrowData.borrow?.dueAt || "",
		});
	};

	const handleAcceptRejectBorrowModal = (
		borrowData: BookInfo,
		borrowType: APIEndpointBorrowParameters["borrowType"]
	) => {
		switch (borrowType) {
			case "request": {
				handleManagePendingModalOpen("reject");
				setUpdateBorrow(borrowData);

				break;
			}

			case "accept": {
				handleManagePendingModalOpen("accept");
				setUpdateBorrow(borrowData);

				break;
			}

			default: {
				break;
			}
		}
	};

	const addNote = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!updatingBorrow) {
				setUpdatingBorrow(true);

				if (!updateBorrow) {
					toast({
						title: "Error",
						description: "An error occurred while adding the note.",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}

				const {
					statusCode,
				}: {
					statusCode: number;
				} = await axios
					.put(apiConfig.apiEndpoint + "/books/borrows/borrow", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						bookId: updateBorrow?.book?.id,
						borrowType: "request",
						note: note.note,
						dueAt:
							typeof note.dueAt === "string" ? new Date(note.dueAt) : note.dueAt,
					} as APIEndpointBorrowParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Note Addition Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Add Note API Call Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Note Added",
						description: "The note has been added.",
						status: "success",
						colorScheme: "green",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleManagePendingModalOpen("");
					setUpdatingBorrow(false);
					await fetchBookBorrows(cPage);
				}

				setUpdatingBorrow(false);
			}
		} catch (error: any) {
			console.log(`=>API: Add Note Failed:\n${error}`);
			setUpdatingBorrow(false);
		}
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

	const acceptBorrow = async () => {
		try {
			if (!updatingBorrow) {
				setUpdatingBorrow(true);

				if (!updateBorrow) {
					toast({
						title: "Error",
						description: "An error occurred while accepting the borrow.",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}

				const {
					statusCode,
				}: {
					statusCode: number;
				} = await axios
					.put(apiConfig.apiEndpoint + "/books/borrows/borrow", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						bookId: updateBorrow?.book?.id,
						borrowType: "accept",
					} as APIEndpointBorrowParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Borrow Acceptance Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Accept Borrow API Call Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Borrow Accepted",
						description: "The borrow has been accepted.",
						status: "success",
						colorScheme: "green",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleManagePendingModalOpen("");
					setUpdatingBorrow(false);
					await fetchBookBorrows(cPage);
				}

				setUpdatingBorrow(false);
			}
		} catch (error: any) {
			console.error(`=>API: Accept Borrow Failed:\n${error}`);
			setUpdatingBorrow(false);
		}
	};

	const rejectBorrow = async () => {
		try {
			if (!updatingBorrow) {
				setUpdatingBorrow(true);

				if (!updateBorrow) {
					toast({
						title: "Error",
						description: "An error occurred while rejecting the borrow.",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}

				const {
					statusCode,
				}: {
					statusCode: number;
				} = await axios
					.delete(apiConfig.apiEndpoint + "/books/borrows/borrow", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							borrowId: updateBorrow?.borrow?.id,
						} as APIEndpointBorrowParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Borrow Rejection Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Reject Borrow API Call Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Borrow Rejected",
						description: "The borrow has been rejected.",
						status: "success",
						colorScheme: "red",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleManagePendingModalOpen("");
					setUpdatingBorrow(false);
					await fetchBookBorrows(cPage);
				}

				setUpdatingBorrow(false);
			}
		} catch (error: any) {
			console.error(`=>API: Reject Borrow Failed:\n${error}`);
			setUpdatingBorrow(false);
		}
	};

	const handleUpdateNoteChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;

		setNote((prev) => ({
			...prev,
			[name]: value,
		}));
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
											<Text>Loading Borrows...</Text>
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
															onAcceptRejectBorrow={
																handleAcceptRejectBorrowModal
															}
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

			{/**
			 *
			 * Add Note Modal
			 *
			 */}
			<Modal
				isOpen={managePendingModalOpen === "note"}
				onClose={() => handleManagePendingModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Note</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
							onSubmit={(event) =>
								updatingBorrow ||
								(updateBorrow?.borrow?.note === note.note &&
									updateBorrow?.borrow?.dueAt === note.dueAt)
									? event.preventDefault()
									: addNote(event)
							}
						>
							<Flex
								direction={"column"}
								gap={4}
							>
								<FormControl>
									<FormLabel>Note</FormLabel>
									<Textarea
										name="note"
										placeholder={updateBorrow?.borrow?.note || "Note[Optional]"}
										maxLength={4000}
										disabled={updatingBorrow}
										isDisabled={updatingBorrow}
										value={note.note}
										onChange={(event) =>
											!updatingBorrow && handleUpdateNoteChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Due Date</FormLabel>
									<Input
										type="date"
										name="dueAt"
										disabled={updatingBorrow}
										isDisabled={updatingBorrow}
										value={
											note.dueAt
												? typeof note.dueAt === "string"
													? moment(note.dueAt).format("YYYY-MM-DD")
													: moment(new Date(note.dueAt).toISOString()).format(
															"YYYY-MM-DD"
													  )
												: ""
										}
										onChange={(event) =>
											!updatingBorrow && handleUpdateNoteChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={
										updatingBorrow ||
										(updateBorrow?.borrow?.note === note.note &&
											updateBorrow?.borrow?.dueAt === note.dueAt)
									}
									loadingText="Updating Borrow"
									isLoading={updatingBorrow}
									isDisabled={
										updatingBorrow ||
										(updateBorrow?.borrow?.note === note.note &&
											updateBorrow?.borrow?.dueAt === note.dueAt)
									}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Add Note
								</Button>
							</Flex>
						</form>
					</ModalBody>
					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>

			{/**
			 *
			 * Accept Borrow Modal
			 *
			 */}
			<AlertDialog
				isOpen={managePendingModalOpen === "accept"}
				leastDestructiveRef={updateRef}
				onClose={() => handleManagePendingModalOpen("")}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Accept Borrow
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>Are you sure you want to accept this request?</Text>
						</AlertDialogBody>

						<AlertDialogFooter className="flex flex-row gap-x-2">
							<Button
								disabled={updatingBorrow}
								isDisabled={updatingBorrow}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								ref={updateRef}
								onClick={() => handleManagePendingModalOpen("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="whatsapp"
								disabled={updatingBorrow}
								isDisabled={updatingBorrow}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								isLoading={updatingBorrow}
								loadingText="Accepting"
								onClick={() => updateBorrow && !updatingBorrow && acceptBorrow()}
							>
								Accept
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/**
			 *
			 * Reject Borrow Modal
			 *
			 */}
			<AlertDialog
				isOpen={managePendingModalOpen === "reject"}
				leastDestructiveRef={deleteRef}
				onClose={() => handleManagePendingModalOpen("")}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Reject Borrow
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>Are you sure you want to reject this request?</Text>
						</AlertDialogBody>

						<AlertDialogFooter className="flex flex-row gap-x-2">
							<Button
								disabled={updatingBorrow}
								isDisabled={updatingBorrow}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								ref={deleteRef}
								onClick={() => handleManagePendingModalOpen("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								disabled={updatingBorrow}
								isDisabled={updatingBorrow}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								isLoading={updatingBorrow}
								loadingText="Deleting"
								onClick={() => updateBorrow && !updatingBorrow && rejectBorrow()}
							>
								Reject
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};

export default ManagePendingPage;
