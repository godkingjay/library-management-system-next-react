import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import SearchBar from "@/components/Input/Searchbar";
import useAuth from "@/hooks/useAuth";
import { ImageOrVideoType } from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { Book } from "@/utils/models/book";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import Head from "next/head";
import React, { useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

type ManageBooksPageProps = {};

export type BooksModalTypes = "" | "add" | "edit" | "delete";

const ManageBooksPage: React.FC<ManageBooksPageProps> = () => {
	const [searchText, setSearchText] = useState("");

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

	const [booksModalOpen, setBooksModalOpen] = useState<BooksModalTypes>("");

	const [bookForm, setBookForm] = useState<
		Pick<
			Book,
			| "title"
			| "description"
			| "amount"
			| "ISBN"
			| "available"
			| "authorId"
			| "borrowedTimes"
			| "publicationDate"
			| "categories"
		> & {
			cover: ImageOrVideoType | null;
		}
	>({
		title: "",
		description: "",
		amount: 0,
		ISBN: "",
		available: 0,
		authorId: "",
		borrowedTimes: 0,
		publicationDate: "",
		categories: [],
		cover: null,
	});

	const booksMounted = useRef(false);

	const searchTextChangeHandler = (book: string) => {
		setSearchText(book);
	};

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
						<SearchBar onSearch={searchTextChangeHandler} />
						<Flex
							direction="row"
							justifyContent={"end"}
						>
							<Button
								leftIcon={<AiOutlinePlus />}
								colorScheme="whatsapp"
								variant="solid"
								// onClick={() => handleAuthorsModalOpen("add")}
							>
								Add Book
							</Button>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</>
	);
};

export default ManageBooksPage;
