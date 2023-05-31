import { APIEndpointBooksParameters } from "@/pages/api/books";
import React, { useCallback } from "react";
import useUser from "./useUser";
import { BookBorrow, BookInfo } from "@/utils/models/book";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import { APIEndpointBorrowParameters } from "@/pages/api/books/borrows/borrow";
import { useToast } from "@chakra-ui/react";

const useBook = () => {
	const { usersStateValue } = useUser();

	const toast = useToast();

	const getBooks = useCallback(
		async ({
			search,
			page,
			fromTitle,
			limit,
		}: Partial<APIEndpointBooksParameters>) => {
			try {
				if (usersStateValue.currentUser) {
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
								search: search,
								page: page,
								fromTitle: fromTitle,
								limit: limit,
							} as APIEndpointBooksParameters,
						})
						.then((response) => response.data)
						.catch((error) => {
							throw error;
						});

					return {
						books,
						totalPages,
						totalCount,
					};
				}
			} catch (error: any) {
				throw error;
			}
		},
		[usersStateValue.currentUser]
	);

	const sendCancelBorrow = useCallback(
		async ({
			bookId,
			borrowId,
			borrowType,
			borrowStatus,
		}: Partial<APIEndpointBorrowParameters> & {
			borrowStatus?: BookBorrow["borrowStatus"];
		}) => {
			try {
				if (
					(borrowType === "request" && borrowStatus === "pending") ||
					(borrowType === "return" && borrowStatus === "returned")
				) {
					await axios
						.delete(apiConfig.apiEndpoint + "/books/borrows/borrow", {
							params: {
								apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
								borrowId: borrowId,
							} as APIEndpointBorrowParameters,
						})
						.catch((error) => {
							const errorData = error.response.data;

							if (errorData.error.message) {
								toast({
									title: "Borrow Book Failed",
									description: errorData.error.message,
									status: "error",
									duration: 5000,
									isClosable: true,
									position: "top",
								});
							}

							throw new Error(
								`=>API: Borrow API Call Book Failed:\n${error.response.data.error.message}`
							);
						});

					toast({
						title: "Borrow Book Removed",
						description: "You removed your borrow request.",
						status: "success",
						colorScheme: "red",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				} else if (
					(borrowType === "request" && borrowId) ||
					(borrowType === "request" && borrowStatus === "returned")
				) {
					await axios
						.post(apiConfig.apiEndpoint + "/books/borrows/borrow", {
							apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
							bookId: bookId,
							borrowType: borrowType,
						})
						.catch((error) => {
							const errorData = error.response.data;

							if (errorData.error.message) {
								toast({
									title: "Borrow Book Failed",
									description: errorData.error.message,
									status: "error",
									duration: 5000,
									isClosable: true,
									position: "top",
								});
							}

							throw new Error(
								`=>API: Borrow API Call Book Failed:\n${error.response.data.error.message}`
							);
						});

					toast({
						title: "Borrow Book Success",
						description: "You requested to borrow this book.",
						status: "success",
						colorScheme: "messenger",
						duration: 5000,
						isClosable: true,
						position: "top",
					});
				}
			} catch (error) {
				throw error;
			}
		},
		[toast, usersStateValue.currentUser?.auth?.keys]
	);

	return {
		getBooks,
		sendCancelBorrow,
	};
};

export default useBook;
