import {
	Box,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineUser } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import { IoExitOutline } from "react-icons/io5";

type UserMenuProps = {};

const UserMenu: React.FC<UserMenuProps> = () => {
	return (
		<>
			<Menu>
				<MenuButton
					as={Button}
					rightIcon={<BiChevronDown />}
				>
					<Box className="h-4 w-4">
						<AiOutlineUser className="h-full w-full" />
					</Box>
				</MenuButton>
				<MenuList className="!py-1">
					<MenuItem
						className="
              gap-x-2 !text-red-500
              hover:bg-red-500 hover:bg-opacity-10
              focus:bg-red-500 focus:bg-opacity-10
            "
					>
						<Box className="h-6 w-6">
							<IoExitOutline className="h-full w-full" />
						</Box>
						<Text>Sign Out</Text>
					</MenuItem>
				</MenuList>
			</Menu>
		</>
	);
};

export default UserMenu;
