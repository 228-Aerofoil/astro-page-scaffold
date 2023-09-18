const base = require("./base");

module.exports = {
	extends: [
		...base.extends,
		"plugin:jsx-a11y/strict",
		"plugin:astro/jsx-a11y-strict",
		"plugin:solid/typescript",
	],
	parser: "@typescript-eslint/parser",
	plugins: [...base.plugins, "jsx-a11y", "solid", "astro"],
	overrides: [
		{
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			rules: {
				// override/add rules settings here, such as
				"solid/components-return-once": "off",
				"solid/event-handlers": "off",
				"solid/imports": "off",
				"solid/jsx-no-duplicate-props": "off",
				"solid/jsx-no-script-url": "off",
				"solid/jsx-no-undef": "off",
				"solid/jsx-uses-vars": "off",
				"solid/no-destructure": "off",
				"solid/no-innerhtml": "off",
				"solid/no-react-specific-props": "off",
				"solid/no-unknown-namespaces": "off",
				"solid/prefer-classlist": "off",
				"solid/prefer-for": "off",
				"solid/prefer-show": "off",
				"solid/reactivity": "off",
				"solid/self-closing-comp": "off",
				"solid/style-prop": "off",
			},
		},
	],
	rules: {
		"astro/no-conflict-set-directives": "error",
		"astro/no-deprecated-astro-canonicalurl": "error",
		"astro/no-deprecated-astro-fetchcontent": "error",
		"astro/no-deprecated-astro-resolve": "error",
		"astro/no-unused-define-vars-in-style": "error",
		...base.rules,
		"import/no-unresolved": [
			"error",
			{ ignore: ["astro:*", "virtual:uno.css"] },
		],
	},
	settings: {
		"import/parsers": {
			...base.settings["import/parsers"],
			"astro-eslint-parser": [".astro"],
			solid: [".js", ".jsx", ".ts", ".tsx"],
		},
	},
};
