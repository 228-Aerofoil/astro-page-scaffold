import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const directory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "source"
);

export async function scaffold({ deploymentName, deploymentPath }) {
  await fs.copy(directory, deploymentPath);
  const packageJSON = await fs.readJSON(
    path.resolve(deploymentPath, "package.json")
  );
  packageJSON.name = deploymentName;
  await fs.writeJSON(
    path.resolve(deploymentPath, "package.json"),
    packageJSON,
    {
      spaces: "\t",
    }
  );
  return {
    deployment: {
      type: "cloudflare-page",
    },
  };
}
