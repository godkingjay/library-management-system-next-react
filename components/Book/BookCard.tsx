import { BookInfo } from "@/utils/models/book";
import { Box, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import Image from "next/image";
import React from "react";
import { MdBrokenImage } from "react-icons/md";
import CategoryTagsList from "../Category/CategoryTagsList";

type BookCardProps = {
	bookData: BookInfo;
};

const BookCard: React.FC<BookCardProps> = ({ bookData }) => {
	return (
		<>
			<Box className="shadow-page-box-1 p-4 border border-transparent rounded-lg bg-white group relative cursor-pointer hover:border-blue-500">
				<Box className="flex flex-row gap-x-4">
					<>
						<Box className="flex flex-col aspect-[2/3] min-w-[96px] max-w-[96px] bg-gray-200 items justify-center relative rounded-lg overflow-hidden shadow-md group/image">
							{bookData.book.cover ? (
								<>
									<Image
										src={bookData.book.cover.fileUrl}
										alt={bookData.book.title}
										sizes="256px"
										fill
										loading="lazy"
										className="w-full bg-center object-cover duration-200 group-hover/image:scale-110"
									/>
								</>
							) : (
								<>
									<Box className="flex flex-col h-full w-full p-4 bg-gradient-to-t from-slate-700 to-slate-600 items-center justify-center text-white">
										<Box className="h-12 w-12">
											<Icon
												as={MdBrokenImage}
												height={"full"}
												width={"full"}
											/>
										</Box>
										<Text className="text-center text-xs font-mono">
											No cover image available
										</Text>
									</Box>
								</>
							)}
						</Box>
						<Box
							className="flex-1 flex flex-col"
							isTruncated
						>
							<Text
								title={bookData.book.title}
								className="first-letter:text-2xl first-letter:font-serif text-gray-700 font-bold"
								isTruncated
							>
								{bookData.book.title}
							</Text>
							<Box className="flex flex-row font-mono gap-x-2 items-center text-xs text-gray-500">
								<Text>{bookData.author.name}</Text>
								<Text>|</Text>
								<Text>
									{moment(bookData.book.publicationDate).format("MMMM DD, YYYY")}
								</Text>
							</Box>
							<Text className="text-xs font-semibold text-gray-500">
								ISBN: {bookData.book.ISBN}
							</Text>
							<CategoryTagsList
								itemName="Categories"
								items={bookData.book.categories}
								maxItems={3}
							/>
						</Box>
					</>
				</Box>
			</Box>
		</>
	);
};

export default BookCard;
