/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./components/**/*.{js,jsx,ts,tsx,mdx}",
		"./pages/**/*.{js,jsx,ts,tsx,mdx}",
		"./hooks/**/*.{js,jsx,ts,tsx,mdx}",
	],
	theme: {
		extend: {
			boxShadow: {
				"around-2xs": "0 0 1px 1px #0001",
				"around-xs": "0 0 2px 1px #0001",
				"around-sm": "0 0 4px 0 #0001",
				"around-md": "0 0 8px 0 #0001",
				"around-lg": "0 0 16px 0 #0001",
				"around-xl": "0 0 24px 0 #0002",
				"page-box-1": "0 1px 1px   #0002",
			},
			fontSize: {
				"2xs": "0.625rem",
				"3xs": "0.5rem",
			},
			maxWidth: {
				"2xs": "256px",
			},
			screens: {
				"2xs": "360px",
				xs: "480px",
				sm2: "640px",
			},
			width: {
				"2xs": "256px",
				xs: "320px",
				sm: "384px",
				xl: "640px",
				"2xl": "764px",
			},
		},
	},
	plugins: [],
};
