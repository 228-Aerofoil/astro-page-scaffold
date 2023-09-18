import { logger } from "@aerofoil/logger";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"source",
);

const VALID_DEPLOYMENT_TYPES = ["@cloudflare/page"];

export async function scaffold({
	fs,
	projectConfig,
	projectRootPath,
	generateDeploymentInfo,
	deploymentTypes,
}) {
	const imports = [];
	const vitePlugins = [];
	const astroIntegrations = [];
	const dependencies = {};
	const devDependencies = {};

	const availableDeploymentTypes = deploymentTypes.filter((type) =>
		VALID_DEPLOYMENT_TYPES.includes(type),
	);

	let type = null;
	if (availableDeploymentTypes.length === 1) {
		logger.info(`Creating deployment without: ${type}`);
		type = availableDeploymentTypes[0];
	} else if (availableDeploymentTypes.length > 1) {
		type = await logger.listInput("Select deployment type", [
			availableDeploymentTypes,
		]);
	} else {
		logger.warn("Creating deployment without a deployment type");
	}

	const deployInfo = await generateDeploymentInfo(null, {
		...(type != null && {
			deployment: {
				type,
			},
		}),
	});

	const deploymentRootPath = path.resolve(
		projectRootPath,
		"deployments",
		deployInfo.name,
	);
	const astroConfigPath = path.resolve(deploymentRootPath, "astro.config.ts");

	function chooseStyleFunc(styleOption) {
		switch (styleOption) {
			case "unocss":
				imports.push('import unoCSS from "unocss/vite";');
				vitePlugins.push("unoCSS()");
				devDependencies.unocss = "^0.55.4";
				devDependencies["@unocss/preset-web-fonts"] = "^0.55.4";
				devDependencies["@unocss/preset-wind"] = "^0.55.4";
				devDependencies["@unocss/reset"] = "^0.55.4";
				return async () => {
					await fs.copy(
						path.resolve(sourceDirectory, "..", "extras", "uno.config.ts"),
						path.resolve(deploymentRootPath, "uno.config.ts"),
					);
					const metaLayout = await fs.readFile(
						path.resolve(deploymentRootPath, "src", "layouts", "Meta.astro"),
						"utf8",
					);
					await fs.writeFile(
						path.resolve(deploymentRootPath, "src", "layouts", "Meta.astro"),
						metaLayout.replace(
							"---",
							'---\nimport "@unocss/reset/tailwind.css";\nimport "virtual:uno.css";',
						),
					);
				};

			case "none":
				return async () => {};
			default:
				throw new Error("Error selecting style");
		}
	}

	function chooseFrameworkFunction(frameworkOption) {
		switch (frameworkOption) {
			case "solid-js":
				astroIntegrations.push("solid()");
				imports.push('import solid from "@astrojs/solid-js";');
				dependencies["@astrojs/solid-js"] = "^3.0.0";
				dependencies["solid-js"] = "^1.7.11";
				return async () => {};
			default:
				throw new Error("Error selecting framework");
		}
	}

	//* start scaffolding

	const styleFunc = chooseStyleFunc(
		await logger.listInput("Select style library", [["none"], ["unocss"]]),
	);

	const frameworks = (
		await logger.multiSelectInput("Select style library", [
			{ name: "SolidJS", value: "solid-js" },
		])
	).map(chooseFrameworkFunction);

	await logger.awaitOrderedList([
		{
			text: "Creating deployment directory",
			promise: async () => {
				await fs.copy(sourceDirectory, deploymentRootPath);
			},
		},
		{
			text: "Configuring Deployment",
			promise: async () => {
				//#region updating package.json
				const packageJSON = JSON.parse(
					await fs.readFile(
						path.resolve(deploymentRootPath, "package.json"),
						"utf8",
					),
				);
				packageJSON.name = `@${projectConfig.name}/${deployInfo.name}`;
				packageJSON.dependencies = {
					...packageJSON.dependencies,
					...dependencies,
				};
				packageJSON.devDependencies = {
					...packageJSON.devDependencies,
					...devDependencies,
				};
				await fs.writeFile(
					path.resolve(deploymentRootPath, "package.json"),
					JSON.stringify(packageJSON, null, "\t"),
				);
				//#endregion

				//#region update astro.config.ts
				let newAstroConfig = await fs.readFile(astroConfigPath, "utf-8");
				for (const imp of imports) {
					const lines = newAstroConfig.split("\n");
					let i = 0;
					while (
						i < lines.length &&
						lines[i].startsWith("import") &&
						lines[i].split("from ")[1] < imp.split("from ")[1]
					) {
						i++;
					}
					lines.splice(i, 0, imp);
					newAstroConfig = lines.join("\n");
				}
				newAstroConfig = newAstroConfig.replace(
					"\t\t@@astro-integrations@@\n",
					astroIntegrations.length > 0
						? `\t\t${astroIntegrations.join(",\n\t\t")},\n`
						: "",
				);
				newAstroConfig = newAstroConfig.replace(
					"@@vite-plugins@@",
					vitePlugins.length > 0
						? `\n\t\t\t${vitePlugins.join(",\n\t\t\t")},\n\t\t`
						: "",
				);
				newAstroConfig = newAstroConfig.replace(
					"@@site-url@@",
					`https://${deployInfo?.deployment?.routes?.[0] ?? ""}`,
				);
				await fs.writeFile(astroConfigPath, newAstroConfig, "utf8");
				//#endregion

				//#region extend eslint config
				const eslintConfigPath = path.resolve(
					projectRootPath,
					"libraries",
					"eslint-config-aerofoil",
				);
				const eslintPackageJSON = JSON.parse(
					await fs.readFile(
						path.resolve(eslintConfigPath, "package.json"),
						"utf8",
					),
				);
				eslintPackageJSON.dependencies = {
					...eslintPackageJSON.dependencies,
					"eslint-plugin-astro": "latest",
					"eslint-plugin-jsx-a11y": "latest",
					"eslint-plugin-solid": "latest",
					// "prettier-plugin-astro": "latest",
					// "prettier-plugin-tailwind": "latest",
				};
				eslintPackageJSON.exports = {
					...eslintPackageJSON.exports,
					"./eslint-page-astro": {
						import: "./eslint-page-astro.js",
						require: "./eslint-page-astro.js",
					},
				};
				await fs.writeFile(
					path.resolve(eslintConfigPath, "package.json"),
					JSON.stringify(eslintPackageJSON, null, "\t"),
				);
				await fs.copy(
					path.resolve(sourceDirectory, "..", "extras", "eslint-page-astro.js"),
					path.resolve(eslintConfigPath, "eslint-page-astro.js"),
				);
				//#endregion
			},
		},
		{
			text: "Seting up style library",
			promise: styleFunc,
		},
		{
			text: "Setting up frameworks",
			promise: async () => {
				for (const func of frameworks) {
					await func();
				}
			},
		},
	]);
}
