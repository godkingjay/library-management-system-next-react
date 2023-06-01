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
	Highlight,
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
import { APIEndpointBorrowParameters } from "../api/books/borrows/borrow";
import moment from "moment";
import SearchBar from "@/components/Input/SearchBar";
import { HiOutlineRefresh } from "react-icons/hi";

type ManageBorrowsPageProps = {};

export type ManageBorrowModalTypes = "" | "return" | "note";

const ManageBorrowsPage: React.FC<ManageBorrowsPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [bookBorrowsData, setBookBorrowsData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState<boolean>(false);
	const [updatingBorrow, setUpdatingBorrow] = useState<boolean>(false);

	const [searchText, setSearchText] = useState("");
	const [searchResultDetails, setSearchResultDetails] = useState({
		text: "",
		total: 0,
	});

	const [manageBorrowModalOpen, setManageBorrowModalOpen] =
		useState<ManageBorrowModalTypes>("");

	const [updateBorrow, setUpdateBorrow] = useState<BookInfo | null>(null);

	const [note, setNote] = useState<Pick<BookBorrow, "note" | "dueAt">>({
		note: "",
		dueAt: "",
	});

	const bookBorrowsMounted = useRef(false);
	const updateRef = useRef(null);

	const handleManageBorrowModalOpen = (type: ManageBorrowModalTypes) => {
		setManageBorrowModalOpen(type);
	};

	const handleNoteModalOpen = (borrowData: BookInfo) => {
		handleManageBorrowModalOpen("note");

		setUpdateBorrow(borrowData);
		setNote({
			note: borrowData.borrow?.note || "",
			dueAt: borrowData.borrow?.dueAt || "",
		});
	};

	const handleReturnModalOpen = (borrowData: BookInfo) => {
		handleManageBorrowModalOpen("return");

		setUpdateBorrow(borrowData);
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
						borrowId: updateBorrow?.borrow?.id,
						borrowType: "accept",
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
						description: "The note has been added successfully.",
						status: "success",
						colorScheme: "green",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleManageBorrowModalOpen("");
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
							search: searchText,
							borrowStatus: "borrowed",
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
				setSearchResultDetails({
					text: searchText,
					total: totalCount,
				});

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>API: Fetch Books Failed:\n${error}`);
			setFetchingData(false);
		}
	};

	const returnBorrow = async () => {
		try {
			if (!updatingBorrow) {
				setUpdatingBorrow(true);

				if (!updateBorrow) {
					toast({
						title: "Error",
						description: "An error occurred while returning the borrowed book.",
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
						// bookId: updateBorrow?.book?.id,
						borrowId: updateBorrow?.borrow?.id,
						borrowType: "return",
					} as APIEndpointBorrowParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Return Borrowed Book Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Return Borrowed Book API Call Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Book Returned",
						description: `The book ${updateBorrow?.book.title} has been returned.`,
						status: "success",
						colorScheme: "green",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleManageBorrowModalOpen("");
					setUpdatingBorrow(false);
					await fetchBookBorrows(cPage);
				}

				setUpdatingBorrow(false);
			}
		} catch (error: any) {
			console.log(`=>API: Return Borrowed Book Failed:\n${error}`);
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

	const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!fetchingData) {
				setCPage(1);
				await fetchBookBorrows(1);
			}
		} catch (error: any) {
			console.error(`=>API: Search Books Failed:\n${error}`);
		}
	};

	const handleSearchChange = (text: string) => {
		if (!fetchingData) {
			setSearchText(text);
		}
	};

	const handleRefresh = async () => {
		try {
			if (!fetchingData) {
				await fetchBookBorrows(cPage);
			}
		} catch (error: any) {
			console.error(`=>API: Refresh Books Failed:\n${error}`);
		}
	};

	useEffect(() => {
		if (
			!fetchingData &&
			!bookBorrowsMounted.current &&
			usersStateValue.currentUser?.auth
		) {
			bookBorrowsMounted.current = true;

			fetchBookBorrows(1);
		}
	}, [bookBorrowsMounted.current]);

	// console.log({
	// 	loadingUser,
	// 	bookBorrowsMounted: bookBorrowsMounted.current,
	// 	fetchingData,
	// 	usersStateValue,
	// });

	return (
		<>
			<Head>
				<title>Manage Borrows | LibMS</title>
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
							Borrows
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
					</Flex>
					<Flex className="flex flex-col gap-y-4 shadow-page-box-1 bg-white rounded-lg p-4">
						<form
							onSubmit={(event) => !fetchingData && handleSearch(event)}
							className="flex flex-row gap-x-2 items-center"
						>
							<Flex
								direction={"column"}
								flex={1}
							>
								<SearchBar
									placeholder={"Search Borrows..."}
									onSearch={handleSearchChange}
								/>
							</Flex>
							<Button
								type="submit"
								colorScheme="linkedin"
							>
								Search
							</Button>
						</form>
						<Flex
							justifyContent={"end"}
							gap={2}
							className="items-center flex-col-reverse md:flex-row"
						>
							<div
								className="
								flex-1 flex-col
								hidden
								data-[search=true]:flex
							"
								data-search={searchResultDetails.text.trim().length > 0}
							>
								<p className="w-full text-sm max-w-full inline text-gray-500 truncate break-words whitespace-pre-wrap">
									<span>
										Showing {bookBorrowsData.length.toString()} out of{" "}
									</span>
									<span>
										{searchResultDetails.total.toString()} results for{" "}
									</span>
									<span>{`"${searchResultDetails.text}"`}</span>
								</p>
							</div>
							<Box className="w-full md:w-auto flex flex-row justify-end items-center gap-2">
								<Button
									leftIcon={<HiOutlineRefresh />}
									colorScheme="messenger"
									variant="outline"
									onClick={() => !fetchingData && handleRefresh()}
									isLoading={fetchingData}
								>
									Refresh
								</Button>
							</Box>
						</Flex>
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
															onReturn={handleReturnModalOpen}
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
				isOpen={manageBorrowModalOpen === "note"}
				onClose={() => handleManageBorrowModalOpen("")}
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
			 * Return Borrow Modal
			 *
			 */}
			<AlertDialog
				isOpen={manageBorrowModalOpen === "return"}
				leastDestructiveRef={updateRef}
				onClose={() => handleManageBorrowModalOpen("")}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Return Borrow
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>
								<Highlight
									query={`"${updateBorrow?.book.title}"`}
									styles={{
										color: "green",
										fontWeight: "semibold",
										fontStyle: "italic",
									}}
								>
									{`Is the book "${updateBorrow?.book.title}" already returned to the library?`}
								</Highlight>
							</Text>
						</AlertDialogBody>

						<AlertDialogFooter className="flex flex-row gap-x-2">
							<Button
								disabled={updatingBorrow}
								isDisabled={updatingBorrow}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								ref={updateRef}
								onClick={() => handleManageBorrowModalOpen("")}
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
								loadingText="Returning"
								onClick={() => updateBorrow && !updatingBorrow && returnBorrow()}
							>
								Returned
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};

export default ManageBorrowsPage;
