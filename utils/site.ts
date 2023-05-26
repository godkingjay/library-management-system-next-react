export const siteConfig = {
	baseUrl: process.env.NEXT_PUBLIC_BASE_URL as string,
};

export const apiConfig = {
	apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT as string,
};

export const jwtConfig = {
	secretKey: process.env.NEXT_PUBLIC_JWT_SECRET_KEY as string,
};
