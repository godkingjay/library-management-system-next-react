import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
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
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Highlight,
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
import { FiEdit, FiLoader } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineRefresh } from "react-icons/hi";
import { APIEndpointBooksCategoryParameters } from "../api/books/categories/category";
import moment from "moment";
import SearchBar from "@/components/Input/SearchBar";

type ManageCategoriesPageProps = {};

export type CategoriesModalTypes = "" | "add" | "edit" | "delete";

const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(12);
	const [categoriesData, setCategoriesData] = useState<BookCategory[]>([]);

	const [fetchingData, setFetchingData] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [searchText, setSearchText] = useState("");
	const [searchResultDetails, setSearchResultDetails] = useState({
		text: "",
		total: 0,
	});

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
		setEditUpdateCategoryForm(category);
	};

	const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
		try {
			event.preventDefault();

			if (!submitting) {
				setSubmitting(true);

				const { statusCode } = await axios
					.post(apiConfig.apiEndpoint + "/books/categories/category", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						name: newCategoryForm.name,
						description: newCategoryForm.description,
					} as APIEndpointBooksCategoryParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Category Creation Failed.",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(`=>API: Creating category Failed:\n${error}`);
					});

				if (statusCode === 201) {
					toast({
						title: "Category Created.",
						description: "Category has been created successfully.",
						status: "success",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
					setCategoriesModalOpen("");
					setNewCategoryForm(defaultNewCategoryForm);
					await fetchCategories(categoryAlphabet, cPage);
				}

				setSubmitting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Creating category Failed:\n${error}`);
			setSubmitting(false);
		}
	};

	const updateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!updating) {
				setUpdating(true);

				const { statusCode } = await axios
					.put(apiConfig.apiEndpoint + "/books/categories/category", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						categoryId: editUpdateCategoryForm.id,
						name: editUpdateCategoryForm.name,
						description: editUpdateCategoryForm.description,
					} as APIEndpointBooksCategoryParameters)
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(`=>API: Updating category Failed:\n${error}`);
					});

				if (statusCode === 200) {
					toast({
						title: "Category Updated.",
						description: "Category has been updated successfully.",
						status: "success",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
					setCategoriesModalOpen("");
					setEditCategoryForm(defaultEditCategoryForm);
					setEditUpdateCategoryForm(defaultEditCategoryForm);
					await fetchCategories(categoryAlphabet, cPage);
				}

				setUpdating(false);
			}
		} catch (error: any) {
			console.error(`=>API: Updating category Failed:\n${error}`);
			setUpdating(false);
		}
	};

	const fetchCategories = async (alphabet: string, page: number) => {
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
							search: searchText,
							alphabet: alphabet === "All" ? "" : alphabet,
							page: page || cPage,
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

				setSearchResultDetails({
					text: searchText,
					total: totalCount,
				});

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(
				`=>API: Search Categories fetchCategories Failed:\n${error}`
			);
			setFetchingData(false);
		}
	};

	const deleteCategory = async (category: BookCategory) => {
		try {
			if (!deleting) {
				setDeleting(true);

				const { statusCode } = await axios
					.delete(apiConfig.apiEndpoint + "/books/categories/category", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							categoryId: category.id,
						} as APIEndpointBooksCategoryParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Category Deletion Failed.",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(`=>API: Deleting category Failed:\n${error}`);
					});

				if (statusCode === 200) {
					await fetchCategories(categoryAlphabet, cPage);

					toast({
						title: "Category Deleted.",
						description: "Category has been deleted successfully.",
						status: "success",
						colorScheme: "red",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					handleCategoriesModalOpen("");
				}

				setDeleting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Deleting category Failed:\n${error}`);
			setDeleting(false);
		}
	};

	const handleCategoriesRefresh = async () => {
		try {
			if (!fetchingData) {
				await fetchCategories(categoryAlphabet, cPage);
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
			setCPage(1);
			await fetchCategories(event.target.value, 1);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchCategories(categoryAlphabet, page);
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

	const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!fetchingData) {
				setCPage(1);
				await fetchCategories(categoryAlphabet, 1);
			}
		} catch (error: any) {
			console.error(
				`=>API: Search Categories fetchCategories Failed:\n${error}`
			);
		}
	};

	const handleSearchChange = (text: string) => {
		if (!fetchingData) {
			setSearchText(text);
		}
	};

	useEffect(() => {
		if (
			!categoriesMounted.current &&
			!fetchingData &&
			usersStateValue.currentUser?.auth
		) {
			categoriesMounted.current = true;
			fetchCategories(categoryAlphabet, cPage);
		}
	}, [categoriesMounted.current]);

	// console.log({
	// 	loadingUser,
	// 	categoriesMounted: categoriesMounted.current,
	// 	fetchingData,
	// 	usersStateValue,
	// });

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
						<form
							onSubmit={(event) => !fetchingData && handleSearch(event)}
							className="flex flex-row gap-x-2 items-center"
						>
							<Flex
								direction={"column"}
								flex={1}
							>
								<SearchBar
									placeholder={"Search Categories..."}
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
									<span>Showing {categoriesData.length.toString()} out of </span>
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
									Add Category
								</Button>
							</Box>
						</Flex>
					</Flex>

					<Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{!fetchingData ||
						categoriesMounted.current ||
						!loadingUser ||
						usersStateValue.currentUser?.auth ? (
							<>
								{categoriesData.length > 0 ? (
									<>
										{categoriesData.map((category, index) => (
											<React.Fragment key={category.id}>
												<Box
													title={category.name}
													className="flex flex-col gap-y-4  p-4 shadow-page-box-1 rounded-lg bg-white border border-transparent group hover:border-blue-500 relative"
												>
													<Box className="flex flex-col">
														<Text className="duration-200 group-hover:scale-125 group-hover:bg-blue-500 font-bold bg-slate-400 text-white px-2 py-1 absolute top-0 left-0 text-2xs -translate-x-1 -translate-y-2 rounded-full">
															{index + 1 + itemsPerPage * (cPage - 1)}
														</Text>
														<Text className="first-letter:font-serif first-letter:underline text-gray-700 font-semibold group-hover:text-blue-500 group-hover:underline flex-1 text-xl truncate">
															<Highlight
																query={[searchResultDetails.text]}
																styles={{
																	bg: "teal.100",
																}}
															>
																{
																	category.name
																		.split("-")
																		.map((word) => {
																			return (
																				word.charAt(0).toUpperCase() +
																				word.slice(1)
																			);
																		})
																		.join(" ")
																		.toString() as string
																}
															</Highlight>
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
																	!updating &&
																	handleEditCategoryModalOpen(category)
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
										<Text>Loading Categories...</Text>
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
						<form onSubmit={(event) => !submitting && createCategory(event)}>
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

			{/* 
				
				Edit Category Modal

			*/}
			<Modal
				isOpen={categoriesModalOpen === "edit"}
				onClose={() => handleCategoriesModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Edit Category</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form onSubmit={(event) => !updating && updateCategory(event)}>
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
										disabled={updating}
										isDisabled={updating}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										value={editUpdateCategoryForm.name}
										onChange={(event) =>
											!updating && handleCategoriesFormChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Description</FormLabel>
									<Textarea
										name="description"
										placeholder="Description[Optional]"
										maxLength={4000}
										disabled={updating}
										isDisabled={updating}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										value={editUpdateCategoryForm.description}
										onChange={(event) =>
											!updating && handleCategoriesFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={updating || !editUpdateCategoryForm?.name}
									loadingText="Adding Author"
									isLoading={updating}
									isDisabled={updating || !editUpdateCategoryForm?.name}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Update Category
								</Button>
							</Flex>
						</form>
					</ModalBody>
					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>

			{/**
			 *
			 * Delete Category Modal
			 *
			 */}
			<AlertDialog
				isOpen={categoriesModalOpen === "delete"}
				leastDestructiveRef={deleteRef}
				onClose={() => handleCategoriesModalOpen("")}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Delete Category
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>Are you sure you want to delete this category?</Text>
							<Flex
								borderWidth={1}
								marginTop={4}
								borderColor={"red"}
								rounded={"lg"}
								padding={4}
								display={"flex"}
								flexDirection={"column"}
								gap={4}
							>
								<Flex
									direction={"column"}
									fontSize={"xs"}
									textColor={"red.500"}
								>
									<Text
										textTransform={"uppercase"}
										fontWeight={"bold"}
									>
										Name:
									</Text>
									<Text fontSize={"sm"}>{deleteCategoryForm?.name}</Text>
								</Flex>
								<Flex
									direction={"column"}
									fontSize={"xs"}
									textColor={"red.500"}
								>
									<Text
										textTransform={"uppercase"}
										fontWeight={"bold"}
									>
										Description:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteCategoryForm?.description?.length &&
										deleteCategoryForm
											? deleteCategoryForm.description.length > 256
												? deleteCategoryForm.description.slice(0, 256) + "..."
												: deleteCategoryForm.description
											: "---"}
									</Text>
								</Flex>
								<Flex
									direction={"column"}
									fontSize={"xs"}
									textColor={"red.500"}
								>
									<Text
										textTransform={"uppercase"}
										fontWeight={"bold"}
									>
										Updated At:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteCategoryForm?.updatedAt
											? typeof deleteCategoryForm?.updatedAt === "string"
												? moment(deleteCategoryForm?.updatedAt).format(
														"DD/MM/YYYY"
												  )
												: moment(
														new Date(deleteCategoryForm?.updatedAt).toISOString()
												  ).format("DD/MM/YYYY")
											: "---"}
									</Text>
								</Flex>
								<Flex
									direction={"column"}
									fontSize={"xs"}
									textColor={"red.500"}
								>
									<Text
										textTransform={"uppercase"}
										fontWeight={"bold"}
									>
										Created At:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteCategoryForm?.createdAt
											? typeof deleteCategoryForm?.createdAt === "string"
												? moment(deleteCategoryForm?.createdAt).format(
														"DD/MM/YYYY"
												  )
												: moment(
														new Date(deleteCategoryForm?.createdAt).toISOString()
												  ).format("DD/MM/YYYY")
											: "---"}
									</Text>
								</Flex>
							</Flex>
						</AlertDialogBody>

						<AlertDialogFooter className="flex flex-row gap-x-2">
							<Button
								disabled={deleting}
								isDisabled={deleting}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								ref={deleteRef}
								onClick={() => handleCategoriesModalOpen("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								disabled={deleting}
								isDisabled={deleting}
								_disabled={{
									filter: "grayscale(100%)",
								}}
								isLoading={deleting}
								loadingText="Deleting"
								onClick={() =>
									deleteCategoryForm &&
									!deleting &&
									deleteCategory(deleteCategoryForm as BookCategory)
								}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};

export default ManageCategoriesPage;
