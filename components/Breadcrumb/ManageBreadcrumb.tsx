import {
	Flex,
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { BsChevronRight } from "react-icons/bs";

type ManageBreadcrumbProps = {};

const ManageBreadcrumb: React.FC<ManageBreadcrumbProps> = () => {
	const router = useRouter();
	const { pathname } = router;
	const paths = pathname.split("/").filter((path) => path);

	return (
		<>
			<Flex className="bg-white p-2 shadow-page-box-1 rounded-md text-gray-500">
				<Breadcrumb
					spacing="8px"
					separator={<BsChevronRight color="gray.500" />}
				>
					{paths.map((path, index) => (
						<BreadcrumbItem
							key={index}
							isCurrentPage={index === paths.length - 1}
							data-current={index === paths.length - 1}
							className="
                data-[current='true']:font-semibold
                data-[current='true']:text-gray-700
                data-[current='false']:hover:text-blue-500
                data-[current='false']:hover:underline
                data-[current='false']:focus-within:text-blue-500
                data-[current='false']:focus-within:underline
              "
						>
							<Link
								href={"/" + paths.slice(0, index + 1).join("/")}
								className="
                rounded-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                "
							>
								{path.substring(0, 1).toUpperCase() + path.substring(1)}
							</Link>
						</BreadcrumbItem>
					))}
				</Breadcrumb>
			</Flex>
		</>
	);
};

export default ManageBreadcrumb;
