import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";

import store from "@/redux/store";

import "@/styles/app.scss";
import Layout from "@/components/Layout/Layout";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>LibMS</title>
				<link
					rel="icon"
					href="/assets/logo/library.png"
				/>
			</Head>
			<Provider store={store}>
				<ChakraProvider>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</ChakraProvider>
			</Provider>
		</>
	);
}
