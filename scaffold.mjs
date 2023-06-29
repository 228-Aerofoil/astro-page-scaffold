import { getProjectRootPath } from "@aerofoil/aerofoil-core/util/getProjectRootPath";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "source"
);

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
}
