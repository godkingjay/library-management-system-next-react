import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import SearchBar from "@/components/Input/SearchBar";
import useAuth from "@/hooks/useAuth";
import { ImageOrVideoType } from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { Book, BookInfo } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Grid,
	GridItem,
	Icon,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	NumberInput,
	NumberInputField,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Textarea,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineBook, AiOutlinePlus } from "react-icons/ai";
import { APIEndpointBooksParameters } from "../api/books";
import Pagination from "@/components/Table/Pagination";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import moment from "moment";
import BookItem from "@/components/Table/Book/BookItem";
import { APIEndpointBookParameters } from "../api/books/book";
import { ISBNRegex } from "@/utils/regex";

type ManageBooksPageProps = {};

export type BooksModalTypes = "" | "add" | "edit" | "delete";

const ManageBooksPage: React.FC<ManageBooksPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [booksData, setBooksData] = useState<BookInfo[]>([]);

	const [fetchingData, setFetchingData] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [searchText, setSearchText] = useState("");
	const [searchResultDetails, setSearchResultDetails] = useState({
		text: "",
		total: 0,
	});

	const [booksModalOpen, setBooksModalOpen] = useState<BooksModalTypes>("");

	const [bookForm, setBookForm] = useState<
		Pick<
			Book,
			| "authorId"
			| "title"
			| "description"
			| "ISBN"
			| "amount"
			| "available"
			| "borrows"
			| "borrowedTimes"
			| "publicationDate"
			| "categories"
		> & {
			image: ImageOrVideoType | null;
		}
	>({
		authorId: "",
		title: "",
		description: "",
		ISBN: "",
		available: 0,
		amount: 0,
		borrows: 0,
		borrowedTimes: 0,
		publicationDate: "",
		categories: [],
		image: null,
	});

	const [deleteBookForm, setDeleteBookForm] = useState<Book | null>(null);

	const [editBookForm, setEditBookForm] = useState<Pick<
		Book,
		| "id"
		| "authorId"
		| "title"
		| "description"
		| "ISBN"
		| "amount"
		| "available"
		| "borrows"
		| "borrowedTimes"
		| "publicationDate"
		| "categories"
		| "cover"
	> | null>(null);

	const [editUpdateBookForm, setEditUpdateBookForm] = useState<Pick<
		Book,
		| "id"
		| "authorId"
		| "title"
		| "description"
		| "ISBN"
		| "amount"
		| "available"
		| "borrows"
		| "borrowedTimes"
		| "publicationDate"
		| "categories"
		| "cover"
	> | null>(null);

	const booksMounted = useRef(false);

	const handleBooksModalOpen = (type: BooksModalTypes) => {
		setBooksModalOpen(type);
	};

	const handleEditBookModalOpen = (book: Book) => {
		handleBooksModalOpen("edit");
		setEditBookForm({
			id: book.id,
			authorId: book.authorId,
			title: book.title,
			description: book.description,
			ISBN: book.ISBN,
			amount: book.amount,
			available: book.available,
			borrows: book.borrows,
			borrowedTimes: book.borrowedTimes,
			publicationDate: book.publicationDate,
			categories: book.categories,
			cover: book.cover,
		});
		setEditUpdateBookForm({
			id: book.id,
			authorId: book.authorId,
			title: book.title,
			description: book.description,
			ISBN: book.ISBN,
			amount: book.amount,
			available: book.available,
			borrows: book.borrows,
			borrowedTimes: book.borrowedTimes,
			publicationDate: book.publicationDate,
			categories: book.categories,
			cover: book.cover,
		});
	};

	const handleDeleteBookModalOpen = (book: Book) => {
		handleBooksModalOpen("delete");
		setDeleteBookForm(book);
	};

	const handleCreateBook = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!submitting) {
				setSubmitting(true);

				const { statusCode } = await axios
					.post(apiConfig.apiEndpoint + "/books/book", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						authorId: bookForm.authorId,
						title: bookForm.title,
						description: bookForm.description,
						ISBN: bookForm.ISBN,
						amount: bookForm.amount,
						available: bookForm.available,
						borrows: bookForm.borrows,
						borrowedTimes: bookForm.borrowedTimes,
						publicationDate: bookForm.publicationDate,
						categories: bookForm.categories,
						image: bookForm.image,
					} as APIEndpointBookParameters)
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Create Book Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 201) {
					await fetchBooks(cPage);
					handleBooksModalOpen("");
				}

				setSubmitting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Create Book Failed:\n${error}`);
			setSubmitting(false);
		}
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
			console.error(`=>API: Search BooksfetchBooks Failed:\n${error}`);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchBooks(page);
	};

	const handleBookFormChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;

		if (name === "publicationDate") {
			setBookForm((prev) => ({
				...prev,
				[name]: new Date(value).toISOString(),
			}));
		} else {
			setBookForm((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSearchChange = (text: string) => {
		if (!fetchingData) {
			setSearchText(text);
		}
	};

	useEffect(() => {
		if (
			!booksMounted.current &&
			usersStateValue.currentUser?.auth &&
			!fetchingData &&
			!loadingUser
		) {
			booksMounted.current = true;

			fetchBooks(cPage);
		}
	}, [loadingUser]);

	console.log(booksData);

	return (
		<>
			<Head>
				<title>Manage Books | LibMS</title>
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
							Books
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2	"></div>
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
						</form>
						<Flex
							direction="row"
							justifyContent={"end"}
							gap={2}
							className="items-center"
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
									<span>Showing {booksData.length.toString()} out of </span>
									<span>
										{searchResultDetails.total.toString()} results for{" "}
									</span>
									<span>"{searchResultDetails.text}"</span>
								</p>
							</div>
							<Button
								leftIcon={<AiOutlinePlus />}
								colorScheme="whatsapp"
								variant="solid"
								onClick={() => handleBooksModalOpen("add")}
							>
								Add Book
							</Button>
						</Flex>

						{/**
						 *
						 * Books
						 *
						 */}
						<Flex className="flex-col gap-y-2">
							<TableContainer>
								<Table
									className="overflow-x-scroll"
									// variant={"striped"}
									// colorScheme="gray"
								>
									<Thead>
										<Tr>
											<Th textAlign={"center"}>#</Th>
											<Th>Cover</Th>
											<Th>Title</Th>
											<Th>Description</Th>
											<Th textAlign={"center"}>Author</Th>
											<Th textAlign={"center"}>ISBN</Th>
											<Th textAlign={"center"}>Categories</Th>
											<Th textAlign={"center"}>Amount</Th>
											<Th textAlign={"center"}>Available</Th>
											<Th textAlign={"center"}>Borrows</Th>
											<Th textAlign={"center"}>Borrowed Times</Th>
											<Th textAlign={"center"}>Published At</Th>
											<Th textAlign={"center"}>Updated At</Th>
											<Th textAlign={"center"}>Added At</Th>
											<Th textAlign={"center"}>Action</Th>
										</Tr>
									</Thead>
									<Tbody>
										{fetchingData ||
										!booksMounted.current ||
										loadingUser ||
										!usersStateValue.currentUser?.auth ? (
											<>
												<Tr>
													<Td
														colSpan={15}
														textAlign={"center"}
														className="text-gray-500 font-bold"
													>
														<Flex className="justify-center flex flex-row items-center gap-x-4">
															<Icon
																as={FiLoader}
																className="h-12 w-12 animate-spin"
															/>
															<Text>Loading Books...</Text>
														</Flex>
													</Td>
												</Tr>
											</>
										) : (
											<>
												{booksData.length > 0 ? (
													<>
														{booksData.map((item, index) => (
															<>
																<React.Fragment key={item.book.id}>
																	<BookItem
																		index={
																			index + 1 + itemsPerPage * (cPage - 1)
																		}
																		bookInfo={item}
																		onEdit={() =>
																			!updating && handleEditBookModalOpen
																		}
																		onDelete={() =>
																			!updating && handleDeleteBookModalOpen
																		}
																	/>
																</React.Fragment>
															</>
														))}
													</>
												) : (
													<>
														<Tr>
															<Td
																colSpan={15}
																textAlign={"center"}
																className="text-lg text-gray-500 font-bold"
															>
																No Book Data
															</Td>
														</Tr>
													</>
												)}
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
						</Flex>
					</Flex>
				</Box>
			</Box>

			{/* 
				
				Add Author Modal

			*/}
			<Modal
				isOpen={booksModalOpen === "add"}
				onClose={() => handleBooksModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Author</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form onSubmit={(event) => !submitting && handleCreateBook(event)}>
							<Flex
								direction={"column"}
								gap={4}
							>
								<FormControl isRequired>
									<FormLabel>Title</FormLabel>
									<Input
										type="text"
										name="title"
										placeholder="Title"
										maxLength={256}
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										value={bookForm.title}
										onChange={(event) =>
											!submitting && handleBookFormChange(event)
										}
									/>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>ISBN</FormLabel>
									<NumberInput
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										clampValueOnBlur={false}
									>
										<NumberInputField
											name="ISBN"
											placeholder="ISBN(10-13)"
											minLength={10}
											maxLength={13}
											disabled={submitting}
											_disabled={{
												filter: "grayscale(100%)",
											}}
											value={bookForm.ISBN}
											onChange={(value) =>
												!submitting && handleBookFormChange(value)
											}
											className="
												data-[error=true]:text-red-500
												data-[error=true]:border-red-500
											"
											data-error={
												bookForm.ISBN && !ISBNRegex.test(bookForm.ISBN!)
											}
										/>
									</NumberInput>
								</FormControl>
								<FormControl>
									<FormLabel>Description</FormLabel>
									<Textarea
										name="description"
										placeholder="Description[Optional]"
										maxLength={4000}
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										value={bookForm.description}
										onChange={(event) =>
											!submitting && handleBookFormChange(event)
										}
									/>
								</FormControl>
								<FormControl isRequired>
									<FormLabel>Publication Date</FormLabel>
									<Input
										type="date"
										name="publicationDate"
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										onChange={(event) =>
											!submitting && handleBookFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={
										submitting ||
										!bookForm.title ||
										!bookForm.authorId ||
										!bookForm.ISBN ||
										!bookForm.publicationDate
									}
									loadingText="Adding Book"
									isLoading={submitting}
									isDisabled={
										submitting ||
										!bookForm.title ||
										!bookForm.authorId ||
										!bookForm.ISBN ||
										!bookForm.publicationDate
									}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Add Book
								</Button>
							</Flex>
						</form>
					</ModalBody>
					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ManageBooksPage;
