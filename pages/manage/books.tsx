import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import SearchBar from "@/components/Input/Searchbar";
import useAuth from "@/hooks/useAuth";
import { ImageOrVideoType } from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { Book } from "@/utils/models/book";
import { apiConfig } from "@/utils/site";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { APIEndpointBooksParameters } from "../api/books";
import Pagination from "@/components/Table/Pagination";

type ManageBooksPageProps = {};

export type BooksModalTypes = "" | "add" | "edit" | "delete";

const ManageBooksPage: React.FC<ManageBooksPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [booksData, setBooksData] = useState<Book[]>([]);

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
			cover: ImageOrVideoType | null;
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
		cover: null,
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

	const handleDeleteBookModalOpen = (book: Book) => {
		handleBooksModalOpen("delete");
		setDeleteBookForm(book);
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

	const fetchBooks = async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					books,
					totalPages,
					totalCount,
				}: {
					books: Book[];
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

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchBooks(page);
	};

	const searchTextChangeHandler = (book: string) => {
		setSearchText(book);
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
	}, []);

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
						<SearchBar
							placeholder="Search Book..."
							onSearch={searchTextChangeHandler}
						/>
						<Flex
							direction="row"
							justifyContent={"end"}
						>
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
		</>
	);
};

export default ManageBooksPage;
