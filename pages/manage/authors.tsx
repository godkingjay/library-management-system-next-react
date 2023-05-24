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
	Icon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Flex,
	Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { APIEndpointAuthorsParameters } from "../api/authors";
import useUser from "@/hooks/useUser";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { APIEndpointAuthorParameters } from "../api/authors/author";
import AuthorItem from "@/components/Table/Author/AuthorItem";

type ManageAuthorsPageProps = {};

export type AuthorsModalTypes = "" | "add" | "edit";

const ManageAuthorsPage: React.FC<ManageAuthorsPageProps> = () => {
	const { usersStateValue } = useUser();

	const [cPage, setCPage] = useState(1);
	const [tPages, setTPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [tableData, setTableData] = useState<Author[]>([]);
	const [fetchingData, setFetchingData] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [authorsModalOpen, setAuthorsModalOpen] =
		useState<AuthorsModalTypes>("");

	const [authorForm, setAuthorForm] = useState<
		Pick<Author, "name" | "biography" | "birthdate">
	>({
		name: "",
		biography: "",
		birthdate: "",
	});

	const authorsMounted = useRef(false);

	const handleAuthorsModalOpen = (type: AuthorsModalTypes) => {
		setAuthorsModalOpen(type);
	};

	const handleCreateAuthor = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!submitting) {
				setSubmitting(true);

				const { statusCode } = await axios
					.post(apiConfig.apiEndpoint + "/authors/author", {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						name: authorForm.name,
						biography: authorForm.biography,
						birthdate: authorForm.birthdate,
					} as APIEndpointAuthorParameters)
					.then((response) => response.data)
					.catch((error) => {
						throw new Error(
							`=>API: Create Author Failed:\n${error.response.data.error.message}`
						);
					});

				if (statusCode === 201) {
					await fetchAuthors(cPage);
				}

				setSubmitting(false);
			}
		} catch (error: any) {
			console.error(`=>API: Create Author Failed:\n${error}`);
			setSubmitting(false);
		}
	};

	const fetchAuthors = async (page: number) => {
		try {
			if (!fetchingData) {
				setFetchingData(true);

				const {
					authors,
					totalPages,
				}: {
					authors: Author[];
					currentPage: number;
					totalPages: number;
				} = await axios
					.get(apiConfig.apiEndpoint + "/authors/", {
						params: {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							page: page,
							limit: itemsPerPage,
						} as APIEndpointAuthorsParameters,
					})
					.then((response) => response.data);

				if (authors.length) {
					setTableData(authors);
					setTPages(totalPages);
				}

				setFetchingData(false);
			}
		} catch (error: any) {
			console.error(`=>API: Fetch Authors Failed:\n${error}`);
			setFetchingData(false);
		}
	};

	const deleteAuthor = async (author: Author) => {
		try {
		} catch (error: any) {
			console.error(`=>API: Delete Author Failed:\n${error}`);
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

		if (name === "birthdate") {
			setAuthorForm((prev) => ({
				...prev,
				[name]: new Date(value).toISOString(),
			}));
		} else {
			setAuthorForm((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	useEffect(() => {
		if (!authorsMounted.current && usersStateValue.currentUser?.auth) {
			authorsMounted.current = true;

			fetchAuthors(cPage);
		}
	}, [authorsMounted]);

	return (
		<>
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
					<Stack
						direction="row"
						justifyContent={"end"}
					>
						<Button
							leftIcon={<AiOutlinePlus />}
							colorScheme="whatsapp"
							variant="solid"
							onClick={() => handleAuthorsModalOpen("add")}
						>
							Add Author
						</Button>
					</Stack>
					<TableContainer>
						<Table
							className="overflow-x-scroll"
							variant={"striped"}
							colorScheme="gray"
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
								{tableData.map((item, index) => (
									<>
										<React.Fragment key={item._id.toString()}>
											<AuthorItem
												index={index + 1 + itemsPerPage * (cPage - 1)}
												author={item}
											/>
										</React.Fragment>
									</>
								))}
								{tableData.length === 0 && (
									<>
										<Tr>
											<Td
												colSpan={6}
												textAlign={"center"}
												className="text-lg text-gray-500 font-bold"
											>
												No Author Data
											</Td>
										</Tr>
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
				
				Sign Up Modal

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
										onChange={(event) =>
											!submitting && handleAuthorFormChange(event)
										}
									/>
								</FormControl>
								<div className="h-[1px] bg-gray-200 my-1"></div>
								<Button
									type="submit"
									colorScheme="whatsapp"
									disabled={submitting}
									loadingText="Adding Author"
									isLoading={submitting}
								>
									Add Author
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
