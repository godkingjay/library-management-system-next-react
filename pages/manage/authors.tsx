import Pagination from "@/components/Table/Pagination";
import { Author } from "@/utils/models/author";
import { apiConfig } from "@/utils/site";
import {
	TableContainer,
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Box,
	Button,
	Stack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	FormControl,
	FormLabel,
	Input,
	Flex,
	Textarea,
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Text,
	Icon,
	Highlight,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { APIEndpointAuthorsParameters } from "../api/authors";
import useUser from "@/hooks/useUser";
import { AiOutlinePlus } from "react-icons/ai";
import { APIEndpointAuthorParameters } from "../api/authors/author";
import AuthorItem from "@/components/Table/Author/AuthorItem";
import { FiLoader } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import Head from "next/head";
import SearchBar from "@/components/Input/SearchBar";
import { HiOutlineRefresh } from "react-icons/hi";

type ManageAuthorsPageProps = {};

export type AuthorsModalTypes = "" | "add" | "edit" | "delete";

const ManageAuthorsPage: React.FC<ManageAuthorsPageProps> = () => {
	const { loadingUser } = useAuth();
	const { usersStateValue } = useUser();

	const toast = useToast();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [tableData, setTableData] = useState<Author[]>([]);

	const [fetchingData, setFetchingData] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [searchText, setSearchText] = useState("");

	const [searchResultDetails, setSearchResultDetails] = useState({
		text: "",
		total: 0,
	});

	const [authorsModalOpen, setAuthorsModalOpen] =
		useState<AuthorsModalTypes>("");

	const defaultAuthorForm = {
		name: "",
		biography: "",
		birthdate: "",
	};
	const [authorForm, setAuthorForm] =
		useState<Pick<Author, "name" | "biography" | "birthdate">>(
			defaultAuthorForm
		);

	const [deleteForm, setDeleteForm] = useState<Author | null>(null);

	const defaultEditAuthorForm = {
		id: "",
		name: "",
		biography: "",
		birthdate: "",
	};
	const [editForm, setEditForm] = useState<
		Pick<Author, "id" | "name" | "biography" | "birthdate">
	>(defaultEditAuthorForm);
	const [editUpdateForm, setEditUpdateForm] = useState<
		Pick<Author, "id" | "name" | "biography" | "birthdate">
	>(defaultEditAuthorForm);

	const authorsMounted = useRef(false);
	const deleteRef = useRef(null);

	const handleAuthorsModalOpen = (type: AuthorsModalTypes) => {
		setAuthorsModalOpen(type);
	};

	const handleDeleteAuthorModalOpen = (author: Author) => {
		handleAuthorsModalOpen("delete");
		setDeleteForm(author);
	};

	const handleEditAuthorModalOpen = (author: Author) => {
		handleAuthorsModalOpen("edit");
		setEditForm({
			id: author.id,
			name: author.name,
			biography: author.biography,
			birthdate: author.birthdate,
		});
		setEditUpdateForm({
			id: author.id,
			name: author.name,
			biography: author.biography,
			birthdate: author.birthdate,
		});
	};

	const handleCreateAuthor = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!submitting) {
				setSubmitting(true);

				const { statusCode } = await axios
					.post(apiConfig.apiEndpoint + "/authors/author", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						name: authorForm.name.trim(),
						biography: authorForm.biography?.trim(),
						birthdate: authorForm.birthdate && new Date(authorForm.birthdate),
					} as APIEndpointAuthorParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Create Author Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Create Author Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 201) {
					toast({
						title: "Author Created",
						description: `Author ${authorForm.name} has been created.`,
						status: "success",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					await fetchAuthors(cPage);
					setAuthorForm(defaultAuthorForm);
					handleAuthorsModalOpen("");
				}

				setSubmitting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Create Author Failed:\n${error}`);
			setSubmitting(false);
		}
	};

	const handleUpdateAuthor = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!updating) {
				setUpdating(true);

				const { statusCode } = await axios
					.put(apiConfig.apiEndpoint + "/authors/author", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						authorId: editUpdateForm.id,
						name: editUpdateForm.name.trim(),
						biography: editUpdateForm.biography?.trim(),
						birthdate:
							editUpdateForm.birthdate && new Date(editUpdateForm.birthdate),
					} as APIEndpointAuthorParameters)
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Update Author Failed",
								description: errorData.error.message,
								status: "error",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Update Author Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Author Updated",
						description: `Author ${editUpdateForm.name} has been updated.`,
						status: "success",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					await fetchAuthors(cPage);
					setEditForm(defaultEditAuthorForm);
					setEditUpdateForm(defaultEditAuthorForm);
					handleAuthorsModalOpen("");
				}

				setUpdating(false);
			}
		} catch (error: any) {
			console.error(`=>API: Update Author Failed:\n${error}`);
			setUpdating(false);
		}
	};

	const fetchAuthors = async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					authors,
					totalPages,
					totalCount,
				}: {
					authors: Author[];
					totalPages: number;
					totalCount: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/authors/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							name: searchText,
							page: page,
							limit: itemsPerPage,
						} as APIEndpointAuthorsParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Fetch Authors Failed:\n${error.response.data.error.message}`
						);
					});

				setTableData(authors);
				setTPages(totalPages > 0 ? totalPages : 1);

				setSearchResultDetails({
					text: searchText,
					total: totalCount,
				});

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>API: Fetch Authors Failed:\n${error}`);
			setFetchingData(false);
		}
	};

	const deleteAuthor = async (author: Author) => {
		try {
			if (!deleting) {
				setDeleting(true);

				const { statusCode } = await axios
					.delete(apiConfig.apiEndpoint + "/authors/author", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							authorId: author.id,
						} as APIEndpointAuthorParameters,
					})
					.then((response) => response.data)
					.catch((error) => {
						const errorData = error.response.data;

						if (errorData.error.message) {
							toast({
								title: "Delete Author Failed",
								description: errorData.error.message,
								status: "error",
								colorScheme: "red",
								duration: 5000,
								isClosable: true,
								position: "top",
							});
						}

						throw new Error(
							`=>API: Delete Author Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 200) {
					toast({
						title: "Author Deleted",
						description: `Author ${author.name} has been deleted.`,
						status: "success",
						colorScheme: "red",
						duration: 5000,
						isClosable: true,
						position: "top",
					});

					await fetchAuthors(cPage);
					setDeleteForm(null);
					handleAuthorsModalOpen("");
				}

				setDeleting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Delete Author Failed:\n${error}`);
			setDeleting(false);
		}
	};

	const handleAuthorsRefresh = async () => {
		try {
			if (!fetchingData) {
				await fetchAuthors(cPage);
			}
		} catch (error: any) {
			console.error(`=>API: Search Authors fetchAuthors Failed:\n${error}`);
		}
	};

	const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!fetchingData) {
				setCPage(1);
				await fetchAuthors(1);
			}
		} catch (error: any) {
			console.error(`=>API: Search Authors Failed:\n${error}`);
		}
	};

	const handlePageChange = async (page: number) => {
		setCPage(page);
		await fetchAuthors(page);
	};

	const handleAuthorFormChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;

		setAuthorForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleUpdateAuthorFormChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;

		setEditUpdateForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSearchChange = (text: string) => {
		if (!fetchingData) {
			setSearchText(text);
		}
	};

	useEffect(() => {
		if (
			!authorsMounted.current &&
			!fetchingData &&
			usersStateValue.currentUser?.auth
		) {
			authorsMounted.current = true;

			fetchAuthors(cPage);
		}
	}, [authorsMounted.current]);

	// console.log({
	// 	loadingUser,
	// 	authorsMounted: authorsMounted.current,
	// 	fetchingData,
	// 	usersStateValue,
	// });

	return (
		<>
			<Head>
				<title>Manage Authors | LibMS</title>
			</Head>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				className="sm:px-4 sm:py-8"
			>
				<Box
					maxWidth="5xl"
					width="100%"
					bg="white"
					p={4}
					className="
            border border-transparent
            flex flex-col gap-y-4
            sm:shadow-lg
            sm:border-gray-200
            sm:rounded-2xl
          "
				>
					<Flex className="flex flex-col">
						<Text
							fontSize={"2xl"}
							fontWeight={"bold"}
							className="text-gray-700"
						>
							Authors
						</Text>
						<ManageBreadcrumb />
					</Flex>

					<form
						onSubmit={(event) => !fetchingData && handleSearch(event)}
						className="flex flex-row gap-x-2 items-center"
					>
						<Flex
							direction={"column"}
							flex={1}
						>
							<SearchBar
								placeholder={"Search Author..."}
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
								<span>Showing {tableData.length.toString()} out of </span>
								<span>{searchResultDetails.total.toString()} results for </span>
								<span>{`"${searchResultDetails.text}"`}</span>
							</p>
						</div>
						<Box className="w-full md:w-auto flex flex-row justify-end items-center gap-2">
							<Button
								leftIcon={<HiOutlineRefresh />}
								colorScheme="messenger"
								variant="outline"
								onClick={() => !fetchingData && handleAuthorsRefresh()}
								isLoading={fetchingData}
							>
								Refresh
							</Button>
							<Button
								leftIcon={<AiOutlinePlus />}
								colorScheme="whatsapp"
								variant="solid"
								onClick={() => handleAuthorsModalOpen("add")}
							>
								Add Author
							</Button>
						</Box>
					</Flex>
					<TableContainer>
						<Table
							className="overflow-x-scroll"
							// variant={"striped"}
							// colorScheme="gray"
						>
							<Thead>
								<Tr>
									<Th textAlign={"center"}>#</Th>
									<Th>Name</Th>
									<Th>Biography</Th>
									<Th textAlign={"center"}>Birthdate</Th>
									<Th textAlign={"center"}>Updated At</Th>
									<Th textAlign={"center"}>Created At</Th>
									<Th textAlign={"center"}>Action</Th>
								</Tr>
							</Thead>
							<Tbody>
								{fetchingData ||
								!authorsMounted.current ||
								loadingUser ||
								!usersStateValue.currentUser?.auth ? (
									<>
										<Tr>
											<Td
												colSpan={7}
												textAlign={"center"}
												className="text-gray-500 font-bold"
											>
												<Flex className="justify-center flex flex-row items-center gap-x-4">
													<Icon
														as={FiLoader}
														className="h-12 w-12 animate-spin"
													/>
													<Text>Loading Authors...</Text>
												</Flex>
											</Td>
										</Tr>
									</>
								) : (
									<>
										{tableData.length > 0 ? (
											<>
												{tableData.map((item, index) => (
													<>
														<React.Fragment key={item.id}>
															<AuthorItem
																index={index + 1 + itemsPerPage * (cPage - 1)}
																author={item}
																onEdit={handleEditAuthorModalOpen}
																onDelete={handleDeleteAuthorModalOpen}
															/>
														</React.Fragment>
													</>
												))}
											</>
										) : (
											<>
												<Tr>
													<Td
														colSpan={7}
														textAlign={"center"}
														className="text-lg text-gray-500 font-bold"
													>
														No Author Data
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
				</Box>
			</Box>

			{/* 
				
				Add Author Modal

			*/}
			<Modal
				isOpen={authorsModalOpen === "add"}
				onClose={() => handleAuthorsModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Author</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form onSubmit={(event) => !submitting && handleCreateAuthor(event)}>
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
											!submitting && handleAuthorFormChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Biography</FormLabel>
									<Textarea
										name="biography"
										placeholder="Biography[Optional]"
										maxLength={4000}
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										onChange={(event) =>
											!submitting && handleAuthorFormChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Birthdate</FormLabel>
									<Input
										type="date"
										name="birthdate"
										disabled={submitting}
										isDisabled={submitting}
										_disabled={{
											filter: "grayscale(100%)",
										}}
										onChange={(event) =>
											!submitting && handleAuthorFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={submitting || !authorForm.name}
									loadingText="Adding Author"
									isLoading={submitting}
									isDisabled={submitting || !authorForm.name}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Add Author
								</Button>
							</Flex>
						</form>
					</ModalBody>
					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>

			{/**
			 *
			 * Delete Modal
			 *
			 */}
			<AlertDialog
				isOpen={authorsModalOpen === "delete"}
				leastDestructiveRef={deleteRef}
				onClose={() => handleAuthorsModalOpen("")}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Delete Author
						</AlertDialogHeader>

						<AlertDialogBody>
							<Text>Are you sure you want to delete this author?</Text>
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
									<Text fontSize={"sm"}>{deleteForm?.name}</Text>
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
										Biography:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteForm?.biography?.length && deleteForm
											? deleteForm.biography.length > 256
												? deleteForm.biography.slice(0, 256) + "..."
												: deleteForm.biography
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
										Birthdate:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteForm?.birthdate
											? typeof deleteForm?.birthdate === "string"
												? moment(deleteForm?.birthdate).format("DD/MM/YYYY")
												: moment(
														new Date(deleteForm?.birthdate).toISOString()
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
										Updated At:
									</Text>
									<Text
										fontSize={"sm"}
										overflowWrap={"break-word"}
										whiteSpace={"pre-wrap"}
										isTruncated
									>
										{deleteForm?.updatedAt
											? typeof deleteForm?.updatedAt === "string"
												? moment(deleteForm?.updatedAt).format("DD/MM/YYYY")
												: moment(
														new Date(deleteForm?.updatedAt).toISOString()
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
										{deleteForm?.createdAt
											? typeof deleteForm?.createdAt === "string"
												? moment(deleteForm?.createdAt).format("DD/MM/YYYY")
												: moment(
														new Date(deleteForm?.createdAt).toISOString()
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
								onClick={() => handleAuthorsModalOpen("")}
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
									deleteForm && !deleting && deleteAuthor(deleteForm)
								}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/**
			 *
			 * Edit Modal
			 *
			 */}
			<Modal
				isOpen={authorsModalOpen === "edit"}
				onClose={() => handleAuthorsModalOpen("")}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Update Author</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
							onSubmit={(event) =>
								updating ||
								(editForm?.name === editUpdateForm?.name &&
									editForm?.biography === editUpdateForm?.biography &&
									editForm?.birthdate === editUpdateForm?.birthdate)
									? event.preventDefault()
									: handleUpdateAuthor(event)
							}
						>
							<Flex
								direction={"column"}
								gap={4}
							>
								<FormControl>
									<FormLabel>Name</FormLabel>
									<Input
										type="text"
										name="name"
										placeholder={editForm?.name}
										maxLength={256}
										disabled={updating}
										isDisabled={updating}
										value={editUpdateForm?.name}
										onChange={(event) =>
											!updating && handleUpdateAuthorFormChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Biography</FormLabel>
									<Textarea
										name="biography"
										placeholder={editForm?.biography || "Biography[Optional]"}
										maxLength={4000}
										disabled={updating}
										isDisabled={updating}
										value={editUpdateForm?.biography}
										onChange={(event) =>
											!updating && handleUpdateAuthorFormChange(event)
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Birthdate</FormLabel>
									<Input
										type="date"
										name="birthdate"
										disabled={updating}
										isDisabled={updating}
										value={
											editUpdateForm?.birthdate
												? typeof editUpdateForm?.birthdate === "string"
													? moment(editUpdateForm?.birthdate).format(
															"YYYY-MM-DD"
													  )
													: moment(
															new Date(editUpdateForm?.birthdate).toISOString()
													  ).format("YYYY-MM-DD")
												: ""
										}
										onChange={(event) =>
											!updating && handleUpdateAuthorFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={
										updating ||
										(editForm?.name === editUpdateForm?.name &&
											editForm?.biography === editUpdateForm?.biography &&
											editForm?.birthdate === editUpdateForm?.birthdate)
									}
									loadingText="Updating Author"
									isLoading={updating}
									isDisabled={
										updating ||
										(editForm?.name === editUpdateForm?.name &&
											editForm?.biography === editUpdateForm?.biography &&
											editForm?.birthdate === editUpdateForm?.birthdate)
									}
									_disabled={{
										filter: "grayscale(100%)",
									}}
								>
									Update Author
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

export default ManageAuthorsPage;
