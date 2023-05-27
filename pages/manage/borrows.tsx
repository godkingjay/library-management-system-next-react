import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import { Box, Flex, Text } from "@chakra-ui/react";
import Head from "next/head";
import React, { useState } from "react";

type ManageBorrowsPageProps = {};

const ManageBorrowsPage: React.FC<ManageBorrowsPageProps> = () => {
	return (
		<>
			<Head>
				<title>Manage Borrows | LibMS</title>
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
							Categories
						</Text>
						<div className="h-[1px] w-full bg-gray-300 mb-2"></div>
						<ManageBreadcrumb />
						<Flex className="flex-col gap-y-4"></Flex>
					</Flex>
					<Flex className="flex flex-col gap-y-4 shadow-page-box-1 bg-white rounded-lg p-4"></Flex>
				</Box>
			</Box>
		</>
	);
};

export default ManageBorrowsPage;