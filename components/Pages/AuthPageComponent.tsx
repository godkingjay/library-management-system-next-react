import useAuth from "@/hooks/useAuth";
import { APIEndpointSignInParameters } from "@/pages/api/auth/signin";
import { EmailRegex, PasswordRegex } from "@/utils/regex";
import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
} from "@chakra-ui/react";
import React, { useState } from "react";

type AuthPageComponentProps = {};

export type AuthModalTypes = "" | "signin" | "signup";

const AuthPageComponent: React.FC<AuthPageComponentProps> = () => {
	const { loadingUser, signInWithPassword } = useAuth();

	const [authenticating, setAuthenticating] = useState<boolean>(false);

	const [signInForm, setSignInForm] = useState<
		Pick<APIEndpointSignInParameters, "email" | "username" | "password">
	>({
		email: "",
		username: "",
		password: "",
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

	return (
		<>
			<>
				<Button onClick={() => handleAuthModalOpen("signin")}>Open Modal</Button>

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
								onSubmit={handleSubmitSignInForm}
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
								<div className="flex flex-col gap-y-0">
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
								</div>
								<div className="flex flex-col gap-y-0">
									<label
										htmlFor="email"
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
								</div>

								<Button
									type="submit"
									colorScheme="blue"
									isLoading={authenticating}
									loadingText="Signing In"
								>
									Sign In
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
