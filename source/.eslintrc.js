module.exports = {
	root: true,
	extends: ["aerofoil/solid"],
	parserOptions: {
		sourceType: "module",
		project: "./tsconfig.json",
	},
	settings: {
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: "./tsconfig.json",
			},
		},
	},
};
