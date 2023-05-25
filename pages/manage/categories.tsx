import ManageBreadcrumb from "@/components/Breadcrumb/ManageBreadcrumb";
import { Box, Flex, Text } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";

type ManageCategoriesPageProps = {};

const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = () => {
	return (
		<>
			<Head>
				<title>Manage Categories | LibMS</title>
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
					</Flex>
				</Box>
			</Box>
		</>
	);
};

export default ManageCategoriesPage;
