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
import React from "react";
import { IoBookSharp, IoLibraryOutline } from "react-icons/io5";
import { BsChevronRight, BsVectorPen } from "react-icons/bs";
import { BiCategory } from "react-icons/bi";
import Link from "next/link";
import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import Head from "next/head";

type ManagePageProps = {};

const ManagePage: React.FC<ManagePageProps> = () => {
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
						<div className="h-[1px] w-full bg-gray-300 mb-2	"></div>
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
										0
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
										0
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
										0
									</Text>
									<Text className="leading-none text-white text-opacity-75">
										Categories
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
