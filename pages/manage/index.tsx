import {
	Box,
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	Flex,
	Grid,
	GridItem,
	Icon,
	Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IoBookSharp, IoLibraryOutline } from "react-icons/io5";
import { BsChevronRight, BsVectorPen } from "react-icons/bs";
import { BiCategory } from "react-icons/bi";
import Link from "next/link";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import Head from "next/head";
import { MdPendingActions } from "react-icons/md";
import { FaHandHolding } from "react-icons/fa";
import { RiContactsBookUploadLine } from "react-icons/ri";
import axios from "axios";
import { apiConfig } from "@/utils/site";
import { APIEndpointCountParams } from "../api/count";
import useUser from "@/hooks/useUser";

type ManagePageProps = {};

const ManagePage: React.FC<ManagePageProps> = () => {
	const { usersStateValue } = useUser();
	const dashboardMounted = useRef(false);

	const [dashboardData, setDashboardData] = useState({
		books: 0,
		authors: 0,
		categories: 0,
		borrows: {
			borrowed: 0,
			pending: 0,
			returned: 0,
		},
	});

	const fetchDatabaseDataCount = async () => {
		try {
			const { statusCode, count } = await axios
				.get(apiConfig.apiEndpoint + "/count/", {
					params: {
						apiKey: usersStateValue.currentUser?.auth?.keys[0].key,
					} as APIEndpointCountParams,
				})
				.then((response) => response.data)
				.catch((error) => {
					throw new Error(
						`=>API: Fetching database data count failed with error:\n${error.message}`
					);
				});

			if (statusCode === 200) {
				setDashboardData(count);
			}
		} catch (error: any) {
			console.log(
				`=>API: Fetching database data count failed with error:\n${error.message}`
			);
		}
	};

	useEffect(() => {
		if (!dashboardMounted.current && usersStateValue.currentUser?.auth) {
			dashboardMounted.current = true;

			fetchDatabaseDataCount();
		}
	}, [dashboardMounted.current]);

	// console.log({
	// 	dashboardMounted: dashboardMounted.current,
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
							Dashboard
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
					</Flex>
					<Grid
						gap={6}
						flex={1}
						className="grid-cols-1 xs:grid-cols-2 md:grid-cols-3"
					>
						<Link
							href="/manage/books"
							className="
								w-full bg-gradient-to-br from-[#f5af19] to-[#f12711] rounded-lg p-4 relative overflow-hidden shadow-page-box-1
								duration-200
								hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#f5af19] shadow-lg">
									<Icon
										as={IoLibraryOutline}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-4xl">
										{dashboardData.books}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Books
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/manage/authors"
							className="
							 w-full bg-gradient-to-br from-[#60efff] to-[#0061ff] rounded-lg p-4 relative overflow-hidden shadow-page-box-1
							 duration-200
							 hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#60efff] shadow-lg">
									<Icon
										as={BsVectorPen}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-4xl">
										{dashboardData.authors}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Authors
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/manage/categories"
							className="
								w-full bg-gradient-to-br from-[#f9ab8f] to-[#f40752] rounded-lg p-4 relative overflow-hidden shadow-page-box-1
								duration-200
								hover:scale-105 focus:scale-105
							"
						>
							<Flex
								direction={"row"}
								gap={2}
								className="items-center"
							>
								<Box className="h-14 w-14 rounded-xl p-3 m-2 bg-white text-[#f9ab8f] shadow-lg">
									<Icon
										as={BiCategory}
										width={"full"}
										height={"full"}
									/>
								</Box>
								<Flex
									direction={"column"}
									height={"full"}
								>
									<Text className="leading-none text-white font-bold text-4xl">
										{dashboardData.categories}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Categories
									</Text>
								</Flex>
							</Flex>
						</Link>
						<div className="h-[1px] w-full bg-gray-300 col-span-full"></div>
						<Link
							href="/manage/borrows"
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
										{dashboardData.borrows.borrowed}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Borrows
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/manage/pending"
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
										{dashboardData.borrows.pending}
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Pending
									</Text>
								</Flex>
							</Flex>
						</Link>
						<Link
							href="/manage/returned"
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
										{dashboardData.borrows.returned}
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

export default ManagePage;
