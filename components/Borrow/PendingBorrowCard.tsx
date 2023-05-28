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
} from "@chakra-ui/react";
import Image from "next/image";
import React from "react";
import { MdBrokenImage } from "react-icons/md";
import { BiCheckDouble, BiChevronUp } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { HiCheck, HiOutlineClock, HiOutlineX } from "react-icons/hi";
import { BsCheck2All, BsCheckAll } from "react-icons/bs";
import { FaHandHolding } from "react-icons/fa";

type PendingBorrowCardProps = {
	borrowData: BookInfo;
};

const PendingBorrowCard: React.FC<PendingBorrowCardProps> = ({ borrowData }) => {
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
				<Box className="flex flex-row gap-4">
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
						<Box className="mt-auto flex flex-col items-end p-1">
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
												<MenuItem className="text-sm !text-green-500 font-semibold flex flex-row gap-x-2 hover:bg-green-100 focus-within:bg-green-100">
													<Icon as={HiCheck} />
													<Text>Borrow</Text>
												</MenuItem>
												<MenuItem className="text-sm !text-red-500 font-semibold flex flex-row gap-x-2 hover:bg-red-100 focus-within:bg-red-100">
													<Icon as={HiOutlineX} />
													<Text>Reject</Text>
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

export default PendingBorrowCard;
