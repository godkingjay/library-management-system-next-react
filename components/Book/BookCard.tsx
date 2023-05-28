import { BookInfo } from "@/utils/models/book";
import { Box, Button, Grid, Icon, Text, Tooltip } from "@chakra-ui/react";
import moment from "moment";
import Image from "next/image";
import React from "react";
import { MdBrokenImage } from "react-icons/md";
import CategoryTagsList from "../Category/CategoryTagsList";
import { IoBookSharp } from "react-icons/io5";
import { FaHandHolding } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { SiBookstack } from "react-icons/si";
import { AiOutlineEye } from "react-icons/ai";
import { HiOutlineClock } from "react-icons/hi";

type BookCardProps = {
	bookData: BookInfo;
	onViewBook: (bookData: BookInfo) => void;
};

const BookCard: React.FC<BookCardProps> = ({ bookData, onViewBook }) => {
	return (
		<>
			<Box
				className="shadow-page-box-1 p-4 border border-transparent rounded-lg bg-white group relative hover:border-blue-500"
				// onClick={() => onViewBook(bookData)}
			>
				<Box className="flex flex-row gap-x-4">
					<>
						<Box className="flex flex-col gap-y-2 max-w-[96px]">
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
							<Box className="flex flex-row items-center justify-center gap-1 flex-wrap">
								<Tooltip
									placement="top"
									label={`Total Amount: ${bookData.book.amount}`}
									fontSize={"2xs"}
									hasArrow
								>
									<Box className="flex-1 border border-gray-300 bg-gray-100 rounded-full px-1.5 py-0.5 flex flex-row items-center text-2xs gap-x-1">
										<Icon
											as={IoBookSharp}
											height={3}
											width={3}
											className="!text-gray-500"
										/>
										<Text className="flex-1 text-gray-700">
											{bookData.book.amount}
										</Text>
									</Box>
								</Tooltip>
								<Tooltip
									placement="top"
									label={`Available: ${bookData.book.available}`}
									fontSize={"2xs"}
									hasArrow
								>
									<Box className="flex-1 border border-purple-300 bg-purple-100 rounded-full px-1.5 py-0.5 flex flex-row items-center text-2xs gap-x-1">
										<Icon
											as={ImBooks}
											height={3}
											width={3}
											className="!text-purple-500"
										/>
										<Text className="text-purple-700">
											{bookData.book.available}
										</Text>
									</Box>
								</Tooltip>
								<Tooltip
									placement="top"
									label={`Borrowed: ${bookData.book.borrows}`}
									fontSize={"2xs"}
									hasArrow
								>
									<Box className="flex-1 border border-cyan-300 bg-cyan-100 rounded-full px-1.5 py-0.5 flex flex-row items-center text-2xs gap-x-1">
										<Icon
											as={FaHandHolding}
											height={3}
											width={3}
											className="!text-cyan-500"
										/>
										<Text className="text-cyan-700">
											{bookData.book.borrows}
										</Text>
									</Box>
								</Tooltip>
								<Tooltip
									placement="top"
									label={`Borrowed Times: ${bookData.book.borrowedTimes}`}
									fontSize={"2xs"}
									hasArrow
								>
									<Box className="flex-1 border border-green-300 bg-green-100 rounded-full px-1.5 py-0.5 flex flex-row items-center text-2xs gap-x-1">
										<Icon
											as={SiBookstack}
											height={3}
											width={3}
											className="!text-green-500"
										/>
										<Text className="text-green-700">
											{bookData.book.borrowedTimes}
										</Text>
									</Box>
								</Tooltip>
							</Box>
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
								<Text isTruncated>
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
							<Box className="mt-auto p-1 w-full flex flex-row items-center justify-end gap-x-2 flex-wrap">
								<Button
									colorScheme="messenger"
									size={"sm"}
									display={"flex"}
									flexDirection={"row"}
									alignItems={"center"}
									justifyContent={"center"}
									width={"full"}
									borderRadius={"full"}
									leftIcon={
										<Icon
											as={AiOutlineEye}
											height={5}
											width={5}
										/>
									}
									onClick={() => onViewBook(bookData)}
								>
									<Text>View Book</Text>
								</Button>
							</Box>
						</Box>
					</>
				</Box>
				<>
					{bookData.borrow && bookData.borrow.borrowStatus !== "returned" && (
						<>
							<Box
								className="py-1 duration-200 flex flex-row items-center px-1.5 text-2xs font-semibold text-white shadow-page-box-1 rounded-full absolute top-0 translate-y-[-50%] right-2"
								bgColor={
									bookData.borrow.borrowStatus === "borrowed"
										? "whatsapp.500"
										: "messenger.500"
								}
							>
								<Icon
									as={
										bookData.borrow.borrowStatus === "borrowed"
											? FaHandHolding
											: HiOutlineClock
									}
									height={3}
									className="!w-0 !duration-200 !opacity-0 !mr-0
										group-hover:!block group-hover:!w-3 group-hover:!opacity-100 group-hover:!mr-1
										group-focus-within:!block group-focus-within:!w-3 group-focus-within:!opacity-100 group-focus-within:!mr-1
									"
								/>
								<Text>
									{bookData.borrow.borrowStatus === "borrowed" && "Borrowed"}
									{bookData.borrow.borrowStatus === "pending" &&
										"Pending Borrow"}
								</Text>
							</Box>
						</>
					)}
				</>
			</Box>
		</>
	);
};

export default BookCard;
