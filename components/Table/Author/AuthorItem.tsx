import { Author } from "@/utils/models/author";
import { Tr, Td, Stack, Button, Icon } from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";

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
	return (
		<>
			<Tr>
				<Td
					className="text-sm"
					textAlign={"center"}
				>
					{index}
				</Td>
				<Td className="text-sm">{author.name}</Td>
				<Td className="text-sm break-words whitespace-pre">
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
