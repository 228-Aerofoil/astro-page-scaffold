import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import { z } from "zod";

// todo add t3-env: https://github.com/t3-oss/t3-env/blob/main/examples/astro/src/t3-env.ts
export const envValidation = z.object({});

const env = await getTargetEnv(import.meta.url, envValidation);
process.env = { ...process.env, ...env };

// https://astro.build/config
export default defineConfig({
	output: "server",
	outDir: "dist",
	adapter: cloudflare(),
});
