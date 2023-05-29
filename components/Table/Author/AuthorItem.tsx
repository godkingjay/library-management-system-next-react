import { Author } from "@/utils/models/author";
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

type AuthorItemProps = {
	index: number;
	author: Author;
	onEdit?: (author: Author) => void;
	onDelete?: (author: Author) => void;
};

const AuthorItem: React.FC<AuthorItemProps> = ({
	index,
	author,
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
					<Popover>
						<PopoverTrigger>
							<Button colorScheme="gray">{index}</Button>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverArrow />
							<PopoverCloseButton />
							<PopoverHeader fontWeight={"bold"}>Author</PopoverHeader>
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
									<Text color={"gray.500"}>{author.id}</Text>
									<Tooltip
										placement="top"
										label={hasCopied ? "Copied!" : "Copy to clipboard"}
										closeOnClick={false}
									>
										<Button
											size={"2xs"}
											onClick={() => handleCopyText(author.id)}
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
				<Td className="text-sm break-words whitespace-pre-wrap">
					{author.name}
				</Td>
				<Td className="text-sm break-words whitespace-pre-wrap min-w-[384px]">
					{author.biography?.length
						? author.biography.length > 256
							? author.biography.slice(0, 256) + "..."
							: author.biography
						: "---"}
				</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{author.birthdate
						? typeof author.birthdate === "string"
							? moment(author.birthdate).format("DD/MM/YYYY")
							: moment(new Date(author.birthdate).toISOString()).format(
									"DD/MM/YYYY"
							  )
						: "---"}
				</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{author.updatedAt
						? typeof author.updatedAt === "string"
							? moment(author.updatedAt).format("DD/MM/YYYY")
							: moment(new Date(author.updatedAt).toISOString()).format(
									"DD/MM/YYYY"
							  )
						: "---"}
				</Td>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{author.createdAt
						? typeof author.createdAt === "string"
							? moment(author.createdAt).format("DD/MM/YYYY")
							: moment(new Date(author.createdAt).toISOString()).format(
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
							onClick={() => onEdit && onEdit(author)}
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
							onClick={() => onDelete && onDelete(author)}
						>
							<Icon as={MdOutlineDeleteOutline} />
						</Button>
					</Stack>
				</Td>
			</Tr>
		</>
	);
};

export default AuthorItem;
