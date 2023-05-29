import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
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
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import { FaHandHolding } from "react-icons/fa";
import { IoExitOutline } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";

type UserMenuProps = {};

const UserMenu: React.FC<UserMenuProps> = () => {
	const { signOut } = useAuth();
	const { usersStateValue } = useUser();

	const router = useRouter();
	const { pathname } = router;
	const directories = pathname.split("/");

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
				<MenuList className="!py-1 group">
					{usersStateValue.currentUser?.user?.roles.includes("admin") && (
						<>
							<MenuItem
								className="
									group
									data-[active-directory=true]:bg-blue-100
								"
								data-active-directory={
									directories[1] === "manage" && !directories[2]
								}
							>
								<Link
									href="/manage"
									className="
										flex-1 gap-x-4 font-semibold !text-gray-500 flex flex-row items-center !no-underline
										group-data-[active-directory=true]:!text-blue-500
									"
								>
									<Box className="h-6 w-6">
										<MdSpaceDashboard className="h-full w-full" />
									</Box>
									<Text>Dashboard</Text>
								</Link>
							</MenuItem>
						</>
					)}

					{/* <MenuItem
						className="
									group
									data-[active-directory=true]:bg-blue-100
								"
						data-active-directory={
							directories[1] === "borrows" && !directories[2]
						}
					>
						<Link
							href="/borrows"
							className="
										flex-1 gap-x-4 font-semibold !text-gray-500 flex flex-row items-center !no-underline
										group-data-[active-directory=true]:!text-blue-500
									"
						>
							<Box className="h-6 w-6">
								<FaHandHolding className="h-full w-full" />
							</Box>
							<Text>Borrows</Text>
						</Link>
					</MenuItem> */}

					<MenuItem
						className="
            hover:bg-red-500 hover:bg-opacity-10
            focus:bg-red-500 focus:bg-opacity-10
            "
						onClick={() => setSignOutModalOpen(true)}
					>
						<Box className="flex-1 gap-x-4 !text-red-500 font-semibold flex flex-row items-center">
							<Box className="h-6 w-6">
								<IoExitOutline className="h-full w-full" />
							</Box>
							<Text>Sign Out</Text>
						</Box>
					</MenuItem>
				</MenuList>
			</Menu>

			<AlertDialog
				isOpen={signOutModalOpen}
				leastDestructiveRef={cancelRef}
				onClose={signOutModalClose}
				isCentered
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
