import { useState } from "react";
import {
	Tag,
	TagCloseButton,
	TagLabel,
	Input,
	HStack,
	VStack,
	FormLabel,
	FormControl,
	Flex,
	Text,
} from "@chakra-ui/react";

interface BookCategoryTagsProps {
	categories: string[];
	onAddCategory: (category: string) => void;
	onRemoveCategory: (category: string) => void;
}

const BookCategoryTags: React.FC<BookCategoryTagsProps> = ({
	categories,
	onAddCategory,
	onRemoveCategory,
}) => {
	const [newCategory, setNewCategory] = useState("");

	const handleAddCategory = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();

		if (newCategory.trim() === "") return;

		const formattedInput = newCategory
			.toLowerCase()
			.replace(/[^\w.,_\-\/\s]/g, "")
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/-+/g, "-")
			.replace(/(^-|-$)/g, "")
			.trim();

		if (
			formattedInput === "" ||
			categories.find((category) => category === formattedInput)
		) {
			return;
		}

		onAddCategory(formattedInput);
		setNewCategory("");
	};

	const handleRemoveCategory = (category: string) => {
		onRemoveCategory(category);
	};

	return (
		<>
			<VStack
				spacing={2}
				align="flex-start"
			>
				<FormControl>
					<FormLabel>
						Categories{" "}
						<span style={{ color: "red", marginLeft: "0.2rem" }}>*</span>
					</FormLabel>
					<Input
						type="text"
						placeholder="Add a category"
						value={newCategory}
						onChange={(event) => setNewCategory(event.target.value)}
						onKeyDown={(event) =>
							event.key === "Enter" && handleAddCategory(event)
						}
					/>
				</FormControl>
				{categories.length > 0 && (
					<>
						<Flex
							gap={2}
							flexWrap={"wrap"}
							width={"100%"}
						>
							{categories.map((category) => (
								<Tag
									key={category}
									borderRadius="full"
									variant="solid"
									colorScheme="green"
									size={"lg"}
									isTruncated
									display={"flex"}
									gap={1}
									title={category}
								>
									<TagLabel
										display={"inline"}
										flex={1}
										isTruncated
									>
										{category}
									</TagLabel>
									<TagCloseButton
										onClick={() => handleRemoveCategory(category)}
									/>
								</Tag>
							))}
						</Flex>
					</>
				)}
			</VStack>
		</>
	);
};

export default BookCategoryTags;
