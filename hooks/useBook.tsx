import { APIEndpointBooksParameters } from "@/pages/api/books";
import React from "react";
import useUser from "./useUser";
import { BookInfo } from "@/utils/models/book";
import axios from "axios";
import { apiConfig } from "@/utils/site";

const useBook = () => {
	const { usersStateValue } = useUser();

	const getBooks = async ({
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
	};

	return {
		getBooks,
	};
};

export default useBook;
