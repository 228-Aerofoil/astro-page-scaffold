import { getProjectRootPath } from "@aerofoil/aerofoil-core/util/getProjectRootPath";
import { exec } from "@aerofoil/aerofoil-core/util/exec";
import { logger } from "@aerofoil/logger";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "source"
);
const templateDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "templates"
);

async function replaceStyleIntegration(
  astroConfigPath,
  styleIntegrationCode,
  imports = []
) {
  const astroConfig = await fs.readFile(astroConfigPath, "utf-8");
  let newAstroConfig = astroConfig.replace(
    '\n    "@@style-integration@@",',
    `${styleIntegrationCode}`
  );
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
  }
  await fs.writeFile(astroConfigPath, newAstroConfig);
}

export async function scaffold({
  generateDeploymentInfo,
  generateDatabaseInfo,
  deploymentTypes,
  addTodos,
}) {
  const rootPath = await getProjectRootPath();
  const deployInfo = await generateDeploymentInfo(null, {
    deployment: { type: "cloudflare-page" },
  });
  const deploymentRootPath = path.resolve(
    rootPath,
    "deployments",
    deployInfo.name
  );
  const astroConfigPath = path.resolve(deploymentRootPath, "astro.config.mjs");

  const styleOption = await logger.listInput("Select style library", [
    ["none"],
    ["unocss"],
  ]);

  let setupStyle;
  switch (styleOption) {
    // todo support tailwindcss
    // case "tailwindcss": {
    //   break;
    // }

    case "unocss": {
      //* add uno css deps
      //* add uno.config.ts
      //* add to astro.config.mjs
      setupStyle = async () => {
        await exec(
          "npm i -D unocss @unocss/preset-web-fonts @unocss/preset-wind @unocss/reset"
        );
        await fs.copyFile(
          path.resolve(templateDirectory, "unocss", "uno.config.ts"),
          path.resolve(deploymentRootPath, "uno.config.ts")
        );
        await replaceStyleIntegration(
          astroConfigPath,
          `
UnoCSS({
	injectReset: true,
	content: {
		pipeline: {
			exclude: [/\?astro/],
		},
	},
}),`,
          ['import UnoCSS from "unocss/astro";']
        );
      };
      break;
    }

    default:
    case "none": {
      setupStyle = async () => {
        await replaceStyleIntegration(astroConfigPath, "");
      };
      break;
    }
  }

  await logger.awaitOrderedList([
    {
      text: "Creating deployment directory",
      promise: async () => {
        await fs.copy(sourceDirectory, deploymentRootPath);
      },
    },
    {
      text: "Setup style library",
      promise: setupStyle,
    },
    {
      text: "Adding deployment info",
      promise: async () => {
        await fs.copy(sourceDirectory, deploymentRootPath);
        const packageJSON = await fs.readJSON(
          path.resolve(deploymentRootPath, "package.json")
        );
        packageJSON.name = deployInfo.name;
        await fs.writeJSON(
          path.resolve(deploymentRootPath, "package.json"),
          packageJSON,
          {
            spaces: "\t",
          }
        );
        await fs.writeFile(
          astroConfigPath,
          (
            await fs.readFile(astroConfigPath, "utf-8")
          ).replace(
            "@@site-url@@",
            `https://${deployInfo?.deployment?.routes?.[0] ?? ""}`
          )
        );
      },
    },
  ]);
}
