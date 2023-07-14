import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import cloudflare from "@astrojs/cloudflare";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { z } from "zod";

// todo add t3-env: https://github.com/t3-oss/t3-env/blob/main/examples/astro/src/t3-env.ts
export const envValidation = z.object({});

const env = await getTargetEnv(import.meta.url, envValidation);
//@ts-ignore
process.env = { ...process.env, ...env };

// https://astro.build/config
export default defineConfig({
	site: "@@site-url@@",
	output: "server",
	outDir: "dist",
	integrations: [
		prefetch({
			selector: "a",
			throttle: 3,
		}),
		sitemap({
			i18n: {
				defaultLocale: "en",
				locales: {
					en: "en-US",
				},
			},
		}),
		"@@style-integration@@",
	],
	adapter: cloudflare(),
});
