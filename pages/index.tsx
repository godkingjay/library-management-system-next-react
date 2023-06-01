import React from "react";
import MainSearchBar from "@/components/Input/MainSearchBar";
import useUser from "@/hooks/useUser";
import { BookBorrow, BookInfo } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import {
	Box,
	Button,
	Divider,
	Flex,
	Grid,
	Icon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Tooltip,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { APIEndpointBooksParameters } from "./api/books";
import { BsCheck2All } from "react-icons/bs";
import useAuth from "@/hooks/useAuth";
import Pagination from "@/components/Table/Pagination";
import { FiLoader } from "react-icons/fi";
import BookCard from "@/components/Book/BookCard";
import Image from "next/image";
import { MdBrokenImage } from "react-icons/md";
import CategoryTagsList from "@/components/Category/CategoryTagsList";
import { FaHandHolding } from "react-icons/fa";
import { HiOutlineClock } from "react-icons/hi";
import { AiOutlineCheck } from "react-icons/ai";
import { APIEndpointBorrowParameters } from "./api/books/borrows/borrow";
import moment from "moment";
import { IoBookSharp } from "react-icons/io5";
import { ImBooks } from "react-icons/im";
import { SiBookstack } from "react-icons/si";
import useBook from "@/hooks/useBook";

export type BookCardModalType = "" | "view";

const IndexPage = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();
	const { getBooks, sendCancelBorrow } = useBook();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(12);
	const [booksData, setBooksData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState<boolean>(false);
	const [borrowing, setBorrowing] = useState<boolean>(false);

	const [searchText, setSearchText] = useState<string>("");
	const [searchResultDetails, setSearchResultDetails] = useState({
		text: "",
		total: 0,
	});

	const [viewBook, setViewBook] = useState<BookInfo | null>(null);

	const booksMounted = useRef(false);
	const [bookCardModalOpen, setBookCardModalOpen] =
		useState<BookCardModalType>("");

	const handleBookCardModalOpen = (type: BookCardModalType) => {
		setBookCardModalOpen(type);
	};

	const handleViewBook = (bookData: BookInfo) => {
		setBookCardModalOpen("view");
		setViewBook(bookData);
	};

	const fetchBooks = async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const booksDetails = await getBooks({
					search: searchText,
					page: page,
					limit: itemsPerPage,
				}).catch((error) => {
					throw new Error(
						`=>Hook: Fetch Books Failed(2/2):\n${error.response.data.error.message}`
					);
				});

				if (booksDetails) {
					setBooksData(booksDetails.books);
					setTPages(booksDetails.totalPages > 0 ? booksDetails.totalPages : 1);

					setSearchResultDetails({
						text: searchText,
						total: booksDetails.totalCount,
					});
				}

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>Hook: Fetch Books Failed(1/2):\n${error}`);
			setFetchingData(false);
		}
	};

	const borrowBook = async (
		borrowType: APIEndpointBorrowParameters["borrowType"] = "request"
	) => {
		try {
			if (!borrowing) {
				setBorrowing(true);

				if (viewBook) {
					await sendCancelBorrow({
						bookId: viewBook.book.id,
						borrowStatus: viewBook.borrow?.borrowStatus,
						borrowId: viewBook.borrow?.id,
						borrowType: borrowType,
					});

					await fetchBooks(cPage);
					handleBookCardModalOpen("");
					setViewBook(null);
				}

				setBorrowing(false);
			}
		} catch (error: any) {
			console.error(`=>API: Borrow Function Book Failed:\n${error}`);
			setBorrowing(false);
		}
	};

	const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!fetchingData) {
				setCPage(1);
				await fetchBooks(1);
			}
		} catch (error: any) {
			console.error(`=>API: Search Books fetchBooks Failed:\n${error}`);
		}
	};

	const handleSearchChange = (query: string) => {
		if (!fetchingData) {
			setSearchText(query);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchBooks(page);
	};

	useEffect(() => {
		if (
			!booksMounted.current &&
			!fetchingData &&
			usersStateValue.currentUser?.auth
		) {
			booksMounted.current = true;

			fetchBooks(1);
		}
	}, [booksMounted.current]);

	// console.log({
	// 	loadingUser,
	// 	booksMounted: booksMounted.current,
	// 	fetchingData,
	// 	usersStateValue,
	// });

	const renderBorrowButton = (
		borrowStatus: BookBorrow["borrowStatus"] | undefined
	) => {
		switch (borrowStatus) {
			case "borrowed": {
				return (
					<>
						<Button
							leftIcon={<BsCheck2All />}
							colorScheme="whatsapp"
							variant={"outline"}
							className="flex flex-row items-center gap-x-1"
							borderRadius={"full"}
						>
							Borrowed
						</Button>
					</>
				);

				break;
			}

			case "pending": {
				return (
					<>
						<Button
							leftIcon={<HiOutlineClock />}
							colorScheme="messenger"
							variant={"outline"}
							className="flex flex-row items-center gap-x-1"
							borderRadius={"full"}
							isLoading={borrowing}
							onClick={() => borrowBook("request")}
						>
							Pending
						</Button>
					</>
				);

				break;
			}

			default: {
				return (
					<>
						<Button
							leftIcon={<FaHandHolding />}
							colorScheme="messenger"
							className="flex flex-row items-center gap-x-1"
							borderRadius={"full"}
							loadingText="Borrowing"
							isLoading={borrowing}
							onClick={() => borrowBook("request")}
						>
							Borrow
						</Button>
					</>
				);

				break;
			}
		}
	};

	return (
		<>
			<Head>
				<title>Home | LibMS</title>
			</Head>
			<>
				<Box
					display="flex"
					flexDirection={"column"}
				>
					<Box className="min-h-[256px] max-h-96 bg-blue-500 flex flex-col items-center shadow-lg">
						<Box
							maxWidth={"5xl"}
							className="flex-1 w-full h-full flex flex-col items-center justify-center p-8"
						>
							<form
								onSubmit={(event) => !fetchingData && handleSearch(event)}
								className="w-full flex flex-row gap-x-4 items-center max-w-2xl px-4"
							>
								<Box className="flex-1">
									<MainSearchBar
										value={searchText}
										placeholder={
											"Search book title, author, category, genre, ISBN..."
										}
										onSearch={handleSearchChange}
									/>
								</Box>
							</form>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection={"column"}
						justifyContent="center"
						alignItems="center"
						className="p-4 md:p-8"
						gap={4}
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
									Books
								</Text>
								<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
							</Flex>
							<Grid className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
								{fetchingData ||
								!booksMounted.current ||
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
												<Text>Loading Books...</Text>
											</Flex>
										</Box>
									</>
								) : (
									<>
										{booksData.length > 0 ? (
											<>
												{booksData.map((bookData, index) => (
													<>
														<React.Fragment key={bookData.book.id}>
															<BookCard
																bookData={bookData}
																onViewBook={handleViewBook}
															/>
														</React.Fragment>
													</>
												))}
											</>
										) : (
											<>
												<Text className="p-2 text-xl font-semibold text-center text-gray-500 col-span-full">
													No Books Found
												</Text>
											</>
										)}
									</>
								)}
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
				</Box>

				{/**
				 *
				 * Book View Modal
				 *
				 */}
				<Modal
					isOpen={bookCardModalOpen === "view"}
					onClose={() => handleBookCardModalOpen("")}
					size={"3xl"}
				>
					<ModalOverlay />
					<ModalContent borderRadius={"2xl"}>
						<ModalHeader isTruncated>{viewBook?.book.title}</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<Flex className="flex flex-col gap-y-4">
								<Flex className="flex flex-col sm:flex-row gap-8">
									<Box className="sm:flex-1">
										<Box
											className="flex flex-col aspect-[2/3] w-full bg-gray-200 items justify-center relative rounded-lg overflow-hidden shadow-lg group/image"
											_focusWithin={{
												ring: 4,
												ringColor: "cyan.200",
											}}
										>
											{viewBook?.book.cover ? (
												<>
													<a
														href={viewBook.book.cover.fileUrl}
														target="_blank"
														title="View Full Image"
													>
														<Image
															src={viewBook?.book.cover.fileUrl}
															alt={viewBook?.book.title}
															sizes="full"
															fill
															loading="lazy"
															className="w-full bg-center object-cover duration-200 group-hover/image:scale-110 group-focus-within/image:scale-110"
														/>
													</a>
												</>
											) : (
												<>
													<Box className="flex flex-col h-full w-full p-4 bg-gradient-to-t from-slate-700 to-slate-600 items-center justify-center text-white">
														<Box className="h-12 w-12">
															<Icon
																as={MdBrokenImage}
																height={"full"}
																width={"full"}
															/>
														</Box>
														<Text className="text-center text-xs font-mono">
															No cover image available
														</Text>
													</Box>
												</>
											)}
										</Box>
									</Box>
									<Box className="sm:flex-1 flex flex-col">
										<Box className="flex flex-col gap-y-1">
											<Text className="font-bold text-gray-700 text-2xl">
												{viewBook?.book.title}
											</Text>
											<Text className="text-gray-500">
												by {viewBook?.author.name}
											</Text>
											<Text className="text-gray-500 font-bold text-sm">
												ISBN: {viewBook?.book.ISBN}
											</Text>
											<>
												{viewBook?.book.publicationDate && (
													<>
														<Text className="text-xs text-gray-500">
															Published on{" "}
															{moment(viewBook?.book.publicationDate).format(
																"MMMM DD, YYYY"
															)}
														</Text>
													</>
												)}
											</>
											<Divider />
										</Box>
										<>
											{viewBook?.book.categories && (
												<>
													<Box className="flex flex-col mt-2 relative">
														{/* <Box className="absolute top-0 left-0 h-full w-1 bg-blue-500" /> */}
														<Text className="font-semibold text-gray-700">
															Categories
														</Text>
														<CategoryTagsList
															itemName="Categories"
															items={viewBook?.book.categories}
															maxItems={5}
														/>
													</Box>
												</>
											)}
										</>
										<Box className="flex flex-col gap-y-4">
											<Box className="flex flex-col mt-4">
												<>
													{viewBook && (
														<>
															{renderBorrowButton(
																viewBook?.borrow?.borrowStatus
															)}
														</>
													)}
												</>
											</Box>
											<>
												{viewBook?.borrow &&
													viewBook.borrow.borrowStatus !== "returned" && (
														<>
															<Box className="pt-4 pl-2 relative">
																<Box className="p-4 pt-6 border border-blue-500 bg-blue-100 rounded-lg">
																	<Text className="absolute text-white top-0 left-0 text-sm px-4 py-1 font-bold bg-blue-700 rounded-full">
																		Due Date
																	</Text>
																	<Text className="text-xs whitespace-pre-wrap break-words text-blue-700">
																		{viewBook.borrow.dueAt
																			? moment(viewBook.borrow.dueAt).format(
																					"MMMM DD, YYYY"
																			  )
																			: "No due date available"}
																	</Text>
																</Box>
															</Box>
														</>
													)}
											</>
											<>
												{viewBook?.borrow &&
													viewBook.borrow.borrowStatus !== "returned" && (
														<>
															<Box className="pt-4 pl-2 relative">
																<Box className="p-4 pt-6 border border-pink-500 bg-pink-100 rounded-lg">
																	<Text className="absolute text-white top-0 left-0 text-sm px-4 py-1 font-bold bg-pink-700 rounded-full">
																		Note
																	</Text>
																	<Text className="text-xs whitespace-pre-wrap break-words text-pink-700">
																		{viewBook.borrow.note
																			? viewBook.borrow.note
																			: "No note available"}
																	</Text>
																</Box>
															</Box>
														</>
													)}
											</>
											<Grid className="grid-cols-2 xs:grid-cols-4 items-center justify-center gap-1 flex-wrap">
												<Tooltip
													placement="top"
													label={`Total Amount: ${viewBook?.book.amount}`}
													fontSize={"md"}
													hasArrow
												>
													<Box className="flex-1 border border-gray-300 bg-gray-100 rounded-full px-3 py-1 flex flex-row items-center gap-x-2 font-semibold sm:opacity-50 duration-200 group hover:opacity-100">
														<Icon
															as={IoBookSharp}
															height={4}
															width={4}
															className="!text-gray-500"
														/>
														<Text className="flex-1 text-gray-700">
															{viewBook?.book.amount}
														</Text>
													</Box>
												</Tooltip>
												<Tooltip
													placement="top"
													label={`Available: ${viewBook?.book.available}`}
													fontSize={"md"}
													hasArrow
												>
													<Box className="flex-1 border border-purple-300 bg-purple-100 rounded-full px-3 py-1 flex flex-row items-center gap-x-2 font-semibold sm:opacity-50 duration-200 group hover:opacity-100">
														<Icon
															as={ImBooks}
															height={4}
															width={4}
															className="!text-purple-500"
														/>
														<Text className="text-purple-700">
															{viewBook?.book.available}
														</Text>
													</Box>
												</Tooltip>
												<Tooltip
													placement="top"
													label={`Borrowed: ${viewBook?.book.borrows}`}
													fontSize={"md"}
													hasArrow
												>
													<Box className="flex-1 border border-cyan-300 bg-cyan-100 rounded-full px-3 py-1 flex flex-row items-center gap-x-2 font-semibold sm:opacity-50 duration-200 group hover:opacity-100">
														<Icon
															as={FaHandHolding}
															height={4}
															width={4}
															className="!text-cyan-500"
														/>
														<Text className="text-cyan-700">
															{viewBook?.book.borrows}
														</Text>
													</Box>
												</Tooltip>
												<Tooltip
													placement="top"
													label={`Borrowed Times: ${viewBook?.book.borrowedTimes}`}
													fontSize={"md"}
													hasArrow
												>
													<Box className="flex-1 border border-green-300 bg-green-100 rounded-full px-3 py-1 flex flex-row items-center gap-x-2 font-semibold sm:opacity-50 duration-200 group hover:opacity-100">
														<Icon
															as={SiBookstack}
															height={4}
															width={4}
															className="!text-green-500"
														/>
														<Text className="text-green-700">
															{viewBook?.book.borrowedTimes}
														</Text>
													</Box>
												</Tooltip>
											</Grid>
											<Divider />
										</Box>
									</Box>
								</Flex>
								<Box className="py-2 px-4 bg-gray-50 rounded-lg">
									<Text className="text-lg font-bold text-gray-700 whitespace-pre-wrap break-words">
										Description
									</Text>
									<Text className="text-sm text-gray-500">
										{viewBook?.book.description
											? viewBook?.book.description
											: "No description available"}
									</Text>
								</Box>
							</Flex>
						</ModalBody>
						<ModalFooter></ModalFooter>
					</ModalContent>
				</Modal>
			</>
		</>
	);
};

export default IndexPage;
