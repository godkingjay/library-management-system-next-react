import { BookBorrow, BookInfo } from "@/utils/models/book";
import {
	Box,
	Button,
	Icon,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	MenuGroup,
	Text,
	MenuDivider,
	Divider,
} from "@chakra-ui/react";
import Image from "next/image";
import React from "react";
import {
	MdBrokenImage,
	MdDeleteOutline,
	MdOutlineNoteAdd,
} from "react-icons/md";
import { BiCheckDouble, BiChevronUp } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { HiCheck, HiOutlineClock, HiOutlineX, HiX } from "react-icons/hi";
import { BsCheck2All, BsCheckAll } from "react-icons/bs";
import { FaHandHolding } from "react-icons/fa";
import { APIEndpointBorrowParameters } from "@/pages/api/books/borrows/borrow";
import moment from "moment";

type BorrowCardProps = {
	borrowData: BookInfo;
	onNote?: (borrowData: BookInfo) => void;
	onReturn?: (borrowData: BookInfo) => void;
	onAcceptReject?: (
		borrowData: BookInfo,
		borrowType: APIEndpointBorrowParameters["borrowType"]
	) => void;
	onRemove?: (borrowData: BookInfo) => void;
};

const BorrowCard: React.FC<BorrowCardProps> = ({
	borrowData,
	onNote,
	onAcceptReject,
	onReturn,
	onRemove,
}) => {
	const renderBorrowMenu = (borrowStatus?: BookBorrow["borrowStatus"]) => {
		switch (borrowStatus) {
			case "pending": {
				return (
					<>
						<MenuButton
							as={Button}
							leftIcon={<HiOutlineClock />}
							rightIcon={<BiChevronUp />}
							colorScheme="messenger"
							fontSize={"sm"}
						>
							Pending Menu
						</MenuButton>
					</>
				);

				break;
			}

			case "borrowed": {
				return (
					<>
						<MenuButton
							as={Button}
							leftIcon={<FaHandHolding />}
							rightIcon={<BiChevronUp />}
							colorScheme="whatsapp"
							fontSize={"sm"}
						>
							Borrow Menu
						</MenuButton>
					</>
				);

				break;
			}

			case "returned": {
				return (
					<>
						<MenuButton
							as={Button}
							leftIcon={<BsCheck2All />}
							rightIcon={<BiChevronUp />}
							colorScheme="whatsapp"
							variant={"outline"}
							fontSize={"sm"}
						>
							Returned Menu
						</MenuButton>
					</>
				);

				break;
			}

			default: {
				return <></>;

				break;
			}
		}
	};

	return (
		<>
			<Box className="shadow-page-box-1 p-4 flex flex-col gap-y-4 border border-transparent rounded-lg bg-white group relative">
				<Box className="flex-1 flex flex-row gap-4">
					<Box className="flex flex-col gap-y-2 max-w-[96px]">
						<Box className="flex flex-col aspect-[2/3] min-w-[96px] max-w-[96px] bg-gray-200 items justify-center relative rounded-lg overflow-hidden shadow-md group/image">
							{borrowData.book.cover ? (
								<>
									<a
										href={borrowData.book.cover.fileUrl}
										target="_blank"
										title="View cover image"
									>
										<Image
											src={borrowData.book.cover.fileUrl}
											alt={borrowData.book.title}
											sizes="256px"
											fill
											loading="lazy"
											className="w-full bg-center object-cover duration-200 group-hover/image:scale-110 group-focus-within/image:scale-110"
										/>
									</a>
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
					</Box>
					<Box
						className="flex-1 flex flex-col"
						isTruncated
					>
						<Box className="flex flex-col">
							<Box className="my-2 flex flex-col">
								<Text className="font-bold text-gray-700 truncate text-xl">
									{borrowData.book.title}
								</Text>
								<Text className="text-xs text-gray-500">
									by {borrowData.author.name}
								</Text>
							</Box>
							<Divider />
							<Box className="my-2 flex flex-col flex-1">
								<Text className="text-gray-700 truncate text-xs">
									{borrowData.borrow?.borrowStatus === "pending" && "Requested"}
									{borrowData.borrow?.borrowStatus === "borrowed" && "Borrowed"}
									{borrowData.borrow?.borrowStatus === "returned" &&
										"Returned"}{" "}
									By:
								</Text>
								<Text className="font-bold text-gray-700 truncate">
									{borrowData.borrower?.firstName
										? `${borrowData.borrower.firstName} ${borrowData.borrower.lastName}`
										: `${
												borrowData.borrower?.username ||
												borrowData.borrower?.email
										  }`}
								</Text>
								<Box className="flex flex-col my-2 gap-y-2">
									{borrowData.borrow?.requestedAt && (
										<>
											<Box>
												<Text className="text-gray-700 truncate text-xs">
													Requested At:
												</Text>
												<Text className="font-bold text-gray-700 text-sm truncate">
													{moment(borrowData.borrow.requestedAt).format(
														"MMMM DD, YYYY, h:mm:ss a"
													)}
												</Text>
											</Box>
										</>
									)}
									{borrowData.borrow?.borrowedAt && (
										<>
											<Box>
												<Text className="text-gray-700 truncate text-xs">
													Borrowed At:
												</Text>
												<Text className="font-bold text-gray-700 text-sm truncate">
													{moment(borrowData.borrow.borrowedAt).format(
														"MMMM DD, YYYY, h:mm:ss a"
													)}
												</Text>
											</Box>
										</>
									)}
									{borrowData.borrow?.returnedAt && (
										<>
											<Box>
												<Text className="text-gray-700 truncate text-xs">
													Returned At:
												</Text>
												<Text className="font-bold text-gray-700 text-sm truncate">
													{moment(borrowData.borrow.returnedAt).format(
														"MMMM DD, YYYY, h:mm:ss a"
													)}
												</Text>
											</Box>
										</>
									)}
								</Box>
							</Box>
							<Divider />
							<Box className="my-2 flex flex-col p-2 bg-gray-100 rounded-lg">
								<Text className="font-bold text-gray-700 truncate">Note</Text>
								<Divider className="my-2" />
								<Text className="text-gray-700 text-sm whitespace-pre-wrap break-words">
									{borrowData.borrow?.note
										? borrowData.borrow.note
										: "No note found."}
								</Text>
							</Box>
							{borrowData.borrow?.dueAt && (
								<>
									<Box className="my-2 flex flex-col flex-1">
										<Text className="text-gray-700 truncate text-xs">
											Due At:
										</Text>
										<Text className="font-bold text-gray-700 text-sm truncate">
											{moment(borrowData.borrow.dueAt).format("MMMM DD, YYYY")}
										</Text>
									</Box>
								</>
							)}
							<Divider />
						</Box>
						<Box className="mt-auto flex flex-col items-end p-1 pt-4">
							<Menu placement="top">
								{renderBorrowMenu(borrowData.borrow?.borrowStatus)}
								<MenuList>
									{borrowData.borrow?.borrowStatus === "pending" && (
										<>
											<MenuGroup
												title="Pending"
												className="text-gray-700 !font-bold"
											>
												<MenuDivider className="!my-1" />
												<MenuItem
													className="text-sm !text-gray-700 font-semibold flex flex-row gap-x-2 hover:bg-blue-100 focus-within:bg-blue-100 hover:!text-blue-500 focus-within:!text-blue-500"
													onClick={() => onNote && onNote(borrowData)}
												>
													<Icon as={MdOutlineNoteAdd} />
													<Text>Add Note</Text>
												</MenuItem>
												<MenuItem
													className="text-sm !text-green-500 font-semibold flex flex-row gap-x-2 hover:bg-green-100 focus-within:bg-green-100"
													onClick={() =>
														onAcceptReject &&
														onAcceptReject(borrowData, "accept")
													}
												>
													<Icon as={HiCheck} />
													<Text>Borrow</Text>
												</MenuItem>
												<MenuItem
													className="text-sm !text-red-500 font-semibold flex flex-row gap-x-2 hover:bg-red-100 focus-within:bg-red-100"
													onClick={() =>
														onAcceptReject &&
														onAcceptReject(borrowData, "request")
													}
												>
													<Icon as={HiX} />
													<Text>Reject</Text>
												</MenuItem>
											</MenuGroup>
										</>
									)}
									{borrowData.borrow?.borrowStatus === "borrowed" && (
										<>
											<MenuGroup
												title="Borrow"
												className="text-gray-700 !font-bold"
											>
												<MenuDivider className="!my-1" />
												<MenuItem
													className="text-sm !text-gray-700 font-semibold flex flex-row gap-x-2 hover:bg-blue-100 focus-within:bg-blue-100 hover:!text-blue-500 focus-within:!text-blue-500"
													onClick={() => onNote && onNote(borrowData)}
												>
													<Icon as={MdOutlineNoteAdd} />
													<Text>Add Note</Text>
												</MenuItem>
												<MenuItem
													className="text-sm !text-green-500 font-semibold flex flex-row gap-x-2 hover:bg-green-100 focus-within:bg-green-100"
													onClick={() => onReturn && onReturn(borrowData)}
												>
													<Icon as={HiCheck} />
													<Text>Return</Text>
												</MenuItem>
											</MenuGroup>
										</>
									)}
									{borrowData.borrow?.borrowStatus === "returned" && (
										<>
											<MenuGroup
												title="Returned"
												className="text-gray-700 !font-bold"
											>
												<MenuDivider className="!my-1" />
												<MenuItem
													className="text-sm !text-gray-700 font-semibold flex flex-row gap-x-2 hover:bg-blue-100 focus-within:bg-blue-100 hover:!text-blue-500 focus-within:!text-blue-500"
													onClick={() => onNote && onNote(borrowData)}
												>
													<Icon as={MdOutlineNoteAdd} />
													<Text>Add Note</Text>
												</MenuItem>
												<MenuItem
													className="text-sm !text-red-500 font-semibold flex flex-row gap-x-2 hover:bg-red-100 focus-within:bg-red-100"
													onClick={() => onRemove && onRemove(borrowData)}
												>
													<Icon as={MdDeleteOutline} />
													<Text>Remove</Text>
												</MenuItem>
											</MenuGroup>
										</>
									)}
								</MenuList>
							</Menu>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default BorrowCard;
