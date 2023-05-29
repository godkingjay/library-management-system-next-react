import { Box, Flex, Grid, Icon, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { MdPendingActions } from "react-icons/md";
import { FaHandHolding } from "react-icons/fa";
import { RiContactsBookUploadLine } from "react-icons/ri";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import { APIEndpointCountParams } from "../api/count";
import useUser from "@/hooks/useUser";

type BorrowsPageProps = {};

const BorrowsPage: React.FC<BorrowsPageProps> = () => {
	const { usersStateValue } = useUser();
	const borrowsMounted = useRef(false);

	const [borrowsData, setBorrowsData] = useState({
		borrowed: 0,
		pending: 0,
		returned: 0,
	});

	const fetchDatabaseDataCount = async () => {
		try {
			const {
				statusCode,
				count,
			}: {
				statusCode: number;
				count: any;
			} = await axios
				.get(apiConfig.apiEndpoint + "/count/", {
					params: {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
						userId: usersStateValue.currentUser?.user?.id,
					} as APIEndpointCountParams,
				})
				.then((response) => response.data)
				.catch((error) => {
					throw new Error(
						`=>API: Fetching database data count failed with error:\n${error.message}`
					);
				});

			if (statusCode === 200) {
				setBorrowsData({
					borrowed: count.borrows.borrowed,
					pending: count.borrows.pending,
					returned: count.borrows.returned,
				});
			}
		} catch (error: any) {
			console.log(
				`=>API: Fetching database data count failed with error:\n${error.message}`
			);
		}
	};

	useEffect(() => {
		if (!borrowsMounted.current && usersStateValue.currentUser?.auth) {
			borrowsMounted.current = true;

			fetchDatabaseDataCount();
		}
	}, [borrowsMounted.current]);

	// console.log({
	// 	borrowsMounted: borrowsMounted.current,
	// 	usersStateValue,
	// });

	return (
		<>
			<Head>
				<title>Dashboard | LibMS</title>
			</Head>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				className="p-4"
			>
				<Box
					maxWidth="5xl"
					width="100%"
					className="
            border border-transparent
            flex flex-col gap-y-4
          "
				>
					<Flex className="flex flex-col">
						<Text
							fontSize={"2xl"}
							fontWeight={"bold"}
							className="text-gray-700"
						>
							Borrows
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
					</Flex>
					<Grid
						gap={6}
						flex={1}
						className="grid-cols-1 xs:grid-cols-2 md:grid-cols-3"
					>
						<Link
							href="/borrows/borrows"
							className="
								w-full bg-gradient-to-br from-[#6ff7e8] to-[#1f7ea1] rounded-lg p-4 py-2 relative overflow-hidden shadow-page-box-1
								duration-200
								hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#6ff7e8] shadow-lg">
									<Icon
										as={FaHandHolding}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-3xl">
										{borrowsData.borrowed}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Borrows
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/borrows/pending"
							className="
							 w-full bg-gradient-to-br from-[#fcb0f3] to-[#3d05dd] rounded-lg p-4 py-2 relative overflow-hidden shadow-page-box-1
							 duration-200
							 hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#fcb0f3] shadow-lg">
									<Icon
										as={MdPendingActions}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-3xl">
										{borrowsData.pending}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Pending
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/borrows/returned"
							className="
								w-full bg-gradient-to-br from-[#6eee87] to-[#5fc52e] rounded-lg p-4 py-2 relative overflow-hidden shadow-page-box-1
								duration-200
								hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#6eee87] shadow-lg">
									<Icon
										as={RiContactsBookUploadLine}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-3xl">
										{borrowsData.returned}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Returned
									</Text>
								</Flex>
							</Flex>
						</Link>
					</Grid>
				</Box>
			</Box>
		</>
	);
};

export default BorrowsPage;
