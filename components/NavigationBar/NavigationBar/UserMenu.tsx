import useAuth from "@/hooks/useAuth";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import { IoExitOutline } from "react-icons/io5";

type UserMenuProps = {};

const UserMenu: React.FC<UserMenuProps> = () => {
	const { signOut } = useAuth();

	const [signOutModalOpen, setSignOutModalOpen] = useState(false);

	const [signingOut, setSigningOut] = useState(false);

	const cancelRef = useRef(null);

	const signOutModalClose = () => setSignOutModalOpen(false);

	const handleSignOut = async () => {
		try {
			if (!signingOut) {
				setSigningOut(true);

				await signOut();

				setSigningOut(false);
				signOutModalClose();
			}
		} catch (error: any) {
			console.error(`=>Hook: Sign Out Failed:\n${error.message}`);

			setSigningOut(false);
		}
	};

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
						onClick={() => setSignOutModalOpen(true)}
					>
						<Box className="h-6 w-6">
							<IoExitOutline className="h-full w-full" />
						</Box>
						<Text>Sign Out</Text>
					</MenuItem>
				</MenuList>
			</Menu>

			<AlertDialog
				isOpen={signOutModalOpen}
				leastDestructiveRef={cancelRef}
				onClose={signOutModalClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
						>
							Sign Out
						</AlertDialogHeader>

						<AlertDialogBody>Are you sure you want to sign out?</AlertDialogBody>

						<AlertDialogFooter className="flex flex-row gap-x-2">
							<Button
								ref={cancelRef}
								onClick={signOutModalClose}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								isLoading={signingOut}
								loadingText="Signing Out"
								onClick={handleSignOut}
							>
								Sign Out
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};

export default UserMenu;
