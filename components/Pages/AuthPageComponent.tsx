import useAuth from "@/hooks/useAuth";
import { APIEndpointSignInParameters } from "@/pages/api/auth/signin";
import { EmailRegex, PasswordRegex } from "@/utils/regex";
import {
	Box,
	Button,
	Divider,
	Highlight,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { IoLibrary } from "react-icons/io5";

type AuthPageComponentProps = {};

export type AuthModalTypes = "" | "signin" | "signup";

const AuthPageComponent: React.FC<AuthPageComponentProps> = () => {
	const { loadingUser, signInWithPassword, signUp, error } = useAuth();

	const [authenticating, setAuthenticating] = useState<boolean>(false);

	const [signInForm, setSignInForm] = useState<
		Pick<APIEndpointSignInParameters, "email" | "username" | "password">
	>({
		email: "",
		username: "",
		password: "",
	});

	const [signUpForm, setSignUpForm] = useState<
		Pick<APIEndpointSignInParameters, "email" | "password"> & {
			repeatPassword: string;
		}
	>({
		email: "",
		password: "",
		repeatPassword: "",
	});

	const [authModalOpen, setAuthModalOpen] = useState<AuthModalTypes>("");

	const handleAuthModalOpen = (type: AuthModalTypes) => {
		setAuthModalOpen(type);
	};

	const handleSignInFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSignInForm((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSignUpFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSignUpForm((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmitSignInForm = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		try {
			if (!authenticating) {
				setAuthenticating(true);
				await signInWithPassword({
					email: signInForm.email,
					username: signInForm.username,
					password: signInForm.password,
				});
				setAuthenticating(false);
			}
		} catch (error: any) {
			console.log(error);
			setAuthenticating(false);
		}
	};

	const handleSubmitSignUpForm = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		try {
			if (!authenticating) {
				setAuthenticating(true);
				await signUp({
					email: signUpForm.email,
					password: signUpForm.password,
				});
				setAuthenticating(false);
			}
		} catch (error: any) {
			console.log(error);
			setAuthenticating(false);
		}
	};

	return (
		<>
			<>
				<Box className="flex min-h-screen items-center justify-center flex-col px-8">
					<Box className="bg-white shadow-lg rounded-xl border border-transparent w-full max-w-sm">
						<Box className="p-4 bg-blue-100 flex flex-row items-center justify-center rounded-t-xl">
							<Box className="flex flex-row gap-x-8 items-center group">
								<Box
									className="
										border-blue-500 p-4 aspect-square w-32 h-32 border-4 rounded-xl text-blue-500
									"
								>
									<IoLibrary className="w-full h-full" />
								</Box>
								<Box className="flex flex-col gap-y-0">
									<Text
										className="
											font-bold text-6xl leading-none text-blue-500
										"
									>
										LIB
									</Text>
									<Box
										className="
											h-4 w-full bg-blue-400 rounded-full
										"
									></Box>
									<Box
										className="
											h-4 w-full bg-blue-300 rounded-full
										"
									></Box>
									<Box
										className="
											h-4 w-full bg-blue-200 rounded-full
										"
									></Box>
								</Box>
							</Box>
						</Box>
						<Box className="p-4 flex flex-col gap-y-4">
							<Text className="text-gray-700 font-semibold text-center px-4">
								<Highlight
									query={["libms"]}
									styles={{
										color: "blue.500",
										fontWeight: "bold",
										borderRadius: "full",
									}}
								>
									Welcome to LibMS! The Library Management System
								</Highlight>
							</Text>
							<Divider />
							<Button
								colorScheme="messenger"
								borderRadius={"full"}
								onClick={() => handleAuthModalOpen("signin")}
							>
								Sign In
							</Button>
							<Button
								colorScheme="whatsapp"
								borderRadius={"full"}
								onClick={() => handleAuthModalOpen("signup")}
							>
								Sign Up
							</Button>
						</Box>
					</Box>
				</Box>

				<Modal
					isOpen={authModalOpen == "signin"}
					onClose={() => handleAuthModalOpen("")}
				>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Sign In</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<form
								className="flex flex-col gap-y-4 group"
								onSubmit={(event) =>
									!authenticating &&
									!loadingUser &&
									handleSubmitSignInForm(event)
								}
								data-error-email={
									!EmailRegex.test(signInForm.email) && signInForm.email
										? "true"
										: "false"
								}
								data-error-password={
									!PasswordRegex.test(signInForm.password) && signInForm.password
										? "true"
										: "false"
								}
							>
								<Box className="flex flex-col gap-y-0">
									<label
										htmlFor="email"
										className="font-semibold"
									>
										Email
									</label>
									<input
										type="email"
										title="Email"
										name="email"
										className="
											border border-gray-300 rounded-md p-2 text-sm outline-none
											focus:border-blue-500
											group-data-[error-email='true']:border-red-500
											group-data-[error-email='true']:text-red-500
										"
										placeholder="Email"
										value={signInForm.email}
										onChange={handleSignInFormChange}
										required
									/>
								</Box>
								<Box className="flex flex-col gap-y-0">
									<label
										htmlFor="password"
										className="font-semibold"
									>
										Password
									</label>
									<input
										type="password"
										title="Password"
										name="password"
										className="
											border border-gray-300 rounded-md p-2 text-sm outline-none
											focus:border-blue-500
											group-data-[error-password='true']:border-red-500
											group-data-[error-password='true']:text-red-500
										"
										placeholder="Password"
										value={signInForm.password}
										onChange={handleSignInFormChange}
										required
									/>
								</Box>

								<Button
									type="submit"
									colorScheme="blue"
									isLoading={authenticating || loadingUser}
									loadingText="Signing In"
								>
									Sign In
								</Button>
							</form>
						</ModalBody>
						<ModalFooter></ModalFooter>
					</ModalContent>
				</Modal>
				<Modal
					isOpen={authModalOpen == "signup"}
					onClose={() => handleAuthModalOpen("")}
				>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Sign Up</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<form
								className="flex flex-col gap-y-4 group"
								onSubmit={(event) =>
									!authenticating &&
									!loadingUser &&
									handleSubmitSignUpForm(event)
								}
								data-error-email={
									!EmailRegex.test(signUpForm.email) && signUpForm.email
										? "true"
										: "false"
								}
								data-error-password={
									!PasswordRegex.test(signUpForm.password) && signUpForm.password
										? "true"
										: "false"
								}
								data-error-repeat-password={
									!PasswordRegex.test(signUpForm.repeatPassword) &&
									signUpForm.repeatPassword &&
									signUpForm.repeatPassword != signUpForm.password
										? "true"
										: "false"
								}
							>
								<Box className="flex flex-col gap-y-0">
									<label
										htmlFor="email"
										className="font-semibold"
									>
										Email
									</label>
									<input
										type="email"
										title="Email"
										name="email"
										className="
											border border-gray-300 rounded-md p-2 text-sm outline-none
											focus:border-blue-500
											group-data-[error-email='true']:border-red-500
											group-data-[error-email='true']:text-red-500
										"
										placeholder="Email"
										value={signUpForm.email}
										onChange={handleSignUpFormChange}
										required
									/>
								</Box>

								<Box className="flex flex-col gap-y-0">
									<label
										htmlFor="password"
										className="font-semibold"
									>
										Password
									</label>
									<input
										type="password"
										title="Password"
										name="password"
										className="
											border border-gray-300 rounded-md p-2 text-sm outline-none
											focus:border-blue-500
											group-data-[error-password='true']:border-red-500
											group-data-[error-password='true']:text-red-500
										"
										placeholder="Password"
										value={signUpForm.password}
										onChange={handleSignUpFormChange}
										required
									/>
								</Box>

								<Box className="flex flex-col gap-y-0">
									<label
										htmlFor="repeatPassword"
										className="font-semibold"
									>
										Repeat Password
									</label>
									<input
										type="password"
										title="Password"
										name="repeatPassword"
										className="
											border border-gray-300 rounded-md p-2 text-sm outline-none
											focus:border-blue-500
											group-data-[error-repeat-password='true']:border-red-500
											group-data-[error-repeat-password='true']:text-red-500
										"
										placeholder="Password"
										value={signUpForm.repeatPassword}
										onChange={handleSignUpFormChange}
										required
									/>
								</Box>

								<Button
									type="submit"
									colorScheme="blue"
									isLoading={authenticating}
									loadingText="Signing Up"
								>
									Sign Up
								</Button>
							</form>
						</ModalBody>
						<ModalFooter></ModalFooter>
					</ModalContent>
				</Modal>
			</>
			<></>
		</>
	);
};

export default AuthPageComponent;
