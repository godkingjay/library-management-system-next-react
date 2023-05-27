import React from "react";
import MainSearchBar from "@/components/Input/MainSearchBar";
import useUser from "@/hooks/useUser";
import { BookInfo } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import {
	Box,
	Button,
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
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { APIEndpointBooksParameters } from "./api/books";
import { BsSearch } from "react-icons/bs";
import useAuth from "@/hooks/useAuth";
import Pagination from "@/components/Table/Pagination";
import { FiLoader } from "react-icons/fi";
import BookCard from "@/components/Book/BookCard";

export type BookCardModalType = "" | "view";

const IndexPage = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [booksData, setBooksData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState<boolean>(false);

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

				const {
					books,
					totalPages,
					totalCount,
				}: {
					books: BookInfo[];
					totalPages: number;
					totalCount: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/books/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							title: searchText,
							page: page,
							limit: itemsPerPage,
						} as APIEndpointBooksParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Fetch Books Failed:\n${error.response.data.error.message}`
						);
					});

				setBooksData(books);
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
			usersStateValue.currentUser?.auth &&
			!loadingUser
		) {
			booksMounted.current = true;

			fetchBooks(1);
		}
	}, [booksMounted, loadingUser]);

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
										placeholder={"Search Books..."}
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
							<Grid className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{!fetchingData ||
								booksMounted.current ||
								!loadingUser ||
								usersStateValue.currentUser?.auth ? (
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
												<Text>Loading Books...</Text>
											</Flex>
										</Box>
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
					size={"5xl"}
				>
					<ModalOverlay />
					<ModalContent borderRadius={"2xl"}>
						<ModalHeader>Book</ModalHeader>
						<ModalCloseButton />
						<ModalBody></ModalBody>
						<ModalFooter></ModalFooter>
					</ModalContent>
				</Modal>
			</>
		</>
	);
};

export default IndexPage;
