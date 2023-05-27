import React, { useEffect, useRef, useState } from "react";
import SearchBar from "@/components/Input/SearchBar";
import {
	Box,
	Button,
	Collapse,
	Flex,
	Grid,
	Select,
	Stack,
	Text,
	Icon,
	useToast,
	Modal,
	ModalOverlay,
	FormControl,
	FormLabel,
	Input,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
} from "@chakra-ui/react";
import Head from "next/head";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import { BookCategory } from "@/utils/models/book";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import { APIEndpointBooksCategoriesParameters } from "../api/books/categories";
import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import Pagination from "@/components/Table/Pagination";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineRefresh } from "react-icons/hi";

type ManageCategoriesPageProps = {};

export type CategoriesModalTypes = "" | "add" | "edit" | "delete";

const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [categoriesData, setCategoriesData] = useState<BookCategory[]>([]);

	const [fetchingData, setFetchingData] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	// const [searchText, setSearchText] = useState("");
	const [categoryAlphabet, setCategoryAlphabet] = useState("All");

	const categoriesMounted = useRef(false);
	const deleteRef = useRef(null);

	const [categoriesModalOpen, setCategoriesModalOpen] =
		useState<CategoriesModalTypes>("");

	const alphabet = [
		"All",
		...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
	];

	const defaultNewCategoryForm = {
		name: "",
		description: "",
	};
	const [newCategoryForm, setNewCategoryForm] = useState<
		Pick<BookCategory, "name" | "description">
	>(defaultNewCategoryForm);

	const defaultEditCategoryForm = {
		id: "",
		userId: "",
		bookId: "",
		name: "",
		description: "",
		updatedAt: "",
		createdAt: "",
	};
	const [editCategoryForm, setEditCategoryForm] = useState<
		Partial<BookCategory>
	>(defaultEditCategoryForm);
	const [editUpdateCategoryForm, setEditUpdateCategoryForm] = useState<
		Partial<BookCategory>
	>(defaultEditCategoryForm);

	const defaultDeleteCategoryForm = {
		id: "",
		userId: "",
		bookId: "",
		name: "",
		description: "",
		updatedAt: "",
		createdAt: "",
	};
	const [deleteCategoryForm, setDeleteCategoryForm] = useState<
		Partial<BookCategory>
	>(defaultDeleteCategoryForm);

	const handleCategoriesModalOpen = (type: CategoriesModalTypes) => {
		setCategoriesModalOpen(type);
	};

	const handleDeleteCategoryModalOpen = (category: BookCategory) => {
		handleCategoriesModalOpen("delete");
		setDeleteCategoryForm(category);
	};

	const handleEditCategoryModalOpen = (category: BookCategory) => {
		handleCategoriesModalOpen("edit");
		setEditCategoryForm(category);
		setDeleteCategoryForm(category);
	};

	const fetchCategories = async (alphabet: string) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					categories,
					totalPages,
					totalCount,
				}: {
					categories: BookCategory[];
					totalPages: number;
					totalCount: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/books/categories/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							alphabet: alphabet === "All" ? "" : alphabet,
							page: cPage,
							limit: itemsPerPage,
						} as APIEndpointBooksCategoriesParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Search Categories fetchCategories Failed:\n${error}`
						);
					});

				setCategoriesData(categories);
				setTPages(totalPages > 0 ? totalPages : 1);

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(
				`=>API: Search Categories fetchCategories Failed:\n${error}`
			);
			setFetchingData(false);
		}
	};

	const handleCategoriesRefresh = async () => {
		try {
			if (!fetchingData) {
				await fetchCategories(categoryAlphabet);
			}
		} catch (error: any) {
			console.error(
				`=>API: Search Categories fetchCategories Failed:\n${error}`
			);
		}
	};

	// const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
	// 	event.preventDefault();

	// 	try {
	// 		if (!fetchingData) {
	// 			setCPage(1);
	// 		}
	// 	} catch (error: any) {
	// 		console.error(
	// 			`=>API: Search Categories fetchCategories Failed:\n${error}`
	// 		);
	// 	}
	// };

	// const handleSearchChange = (text: string) => {
	// 	if (!fetchingData) {
	// 		setSearchText(text);
	// 	}
	// };

	const handleSelectChange = async (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		if (!fetchingData) {
			setCategoryAlphabet(event.target.value);

			await fetchCategories(event.target.value);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchCategories(categoryAlphabet);
	};

	const handleCategoriesFormChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;

		switch (categoriesModalOpen) {
			case "add": {
				setNewCategoryForm((prevForm) => ({
					...prevForm,
					[name]: value,
				}));

				break;
			}

			case "edit": {
				setEditUpdateCategoryForm((prevForm) => ({
					...prevForm,
					[name]: value,
				}));

				break;
			}

			default: {
				break;
			}
		}
	};

	useEffect(() => {
		if (
			!categoriesMounted.current &&
			usersStateValue.currentUser?.auth &&
			!fetchingData &&
			!loadingUser
		) {
			categoriesMounted.current = true;
			fetchCategories("All");
		}
	}, [loadingUser, categoriesMounted.current]);

	return (
		<>
			<Head>
				<title>Manage Categories | LibMS</title>
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
							Categories
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
						<Flex className="flex-col gap-y-4"></Flex>
					</Flex>
					<Flex className="flex flex-col gap-y-4 shadow-page-box-1 bg-white rounded-lg p-4">
						{/* <form
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
						</form> */}

						<Select
							onChange={(event) => handleSelectChange(event)}
							value={categoryAlphabet}
							title="Category"
							aria-label="Category"
							name="category"
						>
							{alphabet.map((letter) => (
								<option
									key={letter}
									value={letter}
								>
									{letter}
								</option>
							))}
						</Select>
						<Flex
							direction="row"
							justifyContent={"end"}
							gap={2}
							className="items-center"
						>
							{/* <div
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
							</div> */}
							<Button
								leftIcon={<HiOutlineRefresh />}
								colorScheme="messenger"
								variant="outline"
								onClick={() => !fetchingData && handleCategoriesRefresh()}
								isLoading={fetchingData}
							>
								Refresh
							</Button>
							<Button
								leftIcon={<AiOutlinePlus />}
								colorScheme="whatsapp"
								variant="solid"
								onClick={() => handleCategoriesModalOpen("add")}
							>
								Add Book
							</Button>
						</Flex>
					</Flex>

					<Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{categoriesData.length > 0 ? (
							<>
								{categoriesData.map((category, index) => (
									<React.Fragment key={category.id}>
										<Box
											title={category.name}
											className="flex flex-col gap-y-4  p-4 shadow-page-box-1 rounded-lg bg-white border border-transparent group hover:border-blue-500 relative"
										>
											<Box className="flex flex-col">
												<Text className="group-hover:bg-blue-500 font-bold bg-slate-700 text-white px-2 py-1 absolute top-0 left-0 text-2xs -translate-x-1 -translate-y-2 rounded-full">
													{index + 1 + itemsPerPage * (cPage - 1)}
												</Text>
												<Text className="first-letter:font-serif first-letter:underline text-gray-700 font-semibold group-hover:text-blue-500 group-hover:underline flex-1 text-xl truncate">
													{category.name
														.split("-")
														.map((word) => {
															return (
																word.charAt(0).toUpperCase() + word.slice(1)
															);
														})
														.join(" ")}
												</Text>
												<Text className="text-xs text-gray-500">
													{category.name}
												</Text>
											</Box>
											<Box className="flex flex-col items-end mt-auto">
												<Stack
													display={"flex"}
													direction="row"
													align="center"
													alignItems={"center"}
													justifyContent={"center"}
												>
													<Button
														display={"flex"}
														flexDirection={"column"}
														alignItems={"center"}
														justifyContent={"center"}
														colorScheme="blue"
														variant="solid"
														size={"sm"}
														padding={1}
														onClick={() =>
															!updating && handleEditCategoryModalOpen(category)
														}
													>
														<Icon as={FiEdit} />
													</Button>
													<Button
														display={"flex"}
														flexDirection={"column"}
														alignItems={"center"}
														justifyContent={"center"}
														colorScheme="red"
														variant="solid"
														size={"sm"}
														padding={1}
														onClick={() =>
															!deleting &&
															handleDeleteCategoryModalOpen(category)
														}
													>
														<Icon as={MdOutlineDeleteOutline} />
													</Button>
												</Stack>
											</Box>
										</Box>
									</React.Fragment>
								))}
							</>
						) : (
							<>
								<Text className="p-2 text-xl font-semibold text-center text-gray-500 col-span-full">
									No Categories Found
								</Text>
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

			{/* 
				
				Add Category Modal

			*/}
			<Modal
				isOpen={categoriesModalOpen === "add"}
				onClose={() => handleCategoriesModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Category</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
						// onSubmit={(event) => !submitting && handleCreateAuthor(event)}
						>
							<Flex
								direction={"column"}
								gap={4}
							>
								<FormControl isRequired>
									<FormLabel>Name</FormLabel>
									<Input
										type="text"
										name="name"
										placeholder="Name"
										maxLength={256}
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										onChange={(event) =>
											!submitting && handleCategoriesFormChange(event)
										}
									/>
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
										onChange={(event) =>
											!submitting && handleCategoriesFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={submitting || !newCategoryForm.name}
									loadingText="Adding Author"
									isLoading={submitting}
									isDisabled={submitting || !newCategoryForm.name}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Add Category
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

export default ManageCategoriesPage;
