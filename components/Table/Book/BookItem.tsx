import { Author } from "@/utils/models/author";
import { Book, BookInfo } from "@/utils/models/book";
import {
	Tr,
	Td,
	Stack,
	Button,
	Icon,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	Flex,
	Text,
	useClipboard,
	Tooltip,
} from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import { FiEdit } from "react-icons/fi";
import { MdContentCopy, MdOutlineDeleteOutline } from "react-icons/md";

type BookItemProps = {
	index: number;
	bookInfo: BookInfo;
	onEdit?: (book: Book) => void;
	onDelete?: (book: Book) => void;
};

const BookItem: React.FC<BookItemProps> = ({
	index,
	bookInfo,
	onEdit,
	onDelete,
}) => {
	const { onCopy, setValue, hasCopied } = useClipboard("");

	const handleCopyText = (text: string) => {
		setValue(text);
		onCopy();
	};

	return (
		<>
			<Tr>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					<Popover placement="top">
						<PopoverTrigger>
							<Button colorScheme="gray">{index}</Button>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader fontWeight={"bold"}>Book</PopoverHeader>
							<PopoverBody>
								<Flex
									direction={"row"}
									gap={2}
									alignItems={"center"}
								>
									<Text
										fontWeight={"bold"}
										color={"gray.700"}
									>
										ID:
									</Text>
									<Text color={"gray.500"}>{bookInfo.book.id}</Text>
									<Tooltip
										placement="top"
										label={hasCopied ? "Copied!" : "Copy to clipboard"}
										closeOnClick={false}
									>
										<Button
											size={"2xs"}
											onClick={() => handleCopyText(bookInfo.book.id)}
											className="w-5 h-5 flex flex-row items-center p-1"
										>
											<Icon
												className="h-full w-full"
												as={MdContentCopy}
											/>
										</Button>
									</Tooltip>
								</Flex>
							</PopoverBody>
						</PopoverContent>
					</Popover>
				</Td>
				{/**
				 * Cover
				 */}
				<Td className="text-sm">Cover</Td>
				<Td className="text-sm">{bookInfo.book.title}</Td>
				<Td className="text-sm break-words whitespace-pre">
					{bookInfo.book.description?.length
						? bookInfo.book.description.length > 256
							? bookInfo.book.description.slice(0, 256) + "..."
							: bookInfo.book.description
						: "---"}
				</Td>
				<Td className="text-sm">{bookInfo.author.name}</Td>
				<Td className="text-sm">{bookInfo.book.ISBN}</Td>
				<Td className="text-sm">{bookInfo.book.categories.toString()}</Td>
				<Td className="text-sm">{bookInfo.book.amount}</Td>
				<Td className="text-sm">{bookInfo.book.available}</Td>
				<Td className="text-sm">{bookInfo.book.borrows}</Td>
				<Td className="text-sm">{bookInfo.book.borrowedTimes}</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{bookInfo.book.publicationDate
						? typeof bookInfo.book.publicationDate === "string"
							? moment(bookInfo.book.publicationDate).format("DD/MM/YYYY")
							: moment(
									new Date(bookInfo.book.publicationDate).toISOString()
							  ).format("DD/MM/YYYY")
						: "---"}
				</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{bookInfo.book.updatedAt
						? typeof bookInfo.book.updatedAt === "string"
							? moment(bookInfo.book.updatedAt).format("DD/MM/YYYY")
							: moment(new Date(bookInfo.book.updatedAt).toISOString()).format(
									"DD/MM/YYYY"
							  )
						: "---"}
				</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{bookInfo.book.createdAt
						? typeof bookInfo.book.createdAt === "string"
							? moment(bookInfo.book.createdAt).format("DD/MM/YYYY")
							: moment(new Date(bookInfo.book.createdAt).toISOString()).format(
									"DD/MM/YYYY"
							  )
						: "---"}
				</Td>
				<Td
					className="text-sm"
					align="center"
				>
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
							onClick={() => onEdit && onEdit(bookInfo.book)}
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
							onClick={() => onDelete && onDelete(bookInfo.book)}
						>
							<Icon as={MdOutlineDeleteOutline} />
						</Button>
					</Stack>
				</Td>
			</Tr>
		</>
	);
};

export default BookItem;
