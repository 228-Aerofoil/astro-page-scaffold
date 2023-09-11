import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import cloudflare from "@astrojs/cloudflare";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import { Type as t } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { defineConfig } from "astro/config";

// todo add t3-env: https://github.com/t3-oss/t3-env/blob/main/examples/astro/src/t3-env.ts
export const envValidationSchema = t.Object({});
const envValidation = TypeCompiler.Compile(envValidationSchema);

const env = await getTargetEnv<typeof envValidationSchema, typeof envValidation>(import.meta.url, envValidation);
//@ts-ignore
process.env = { ...process.env, ...env };

export type EnvType = typeof env;

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
		@@astro-integrations@@
	],
	vite: {
		plugins: [@@vite-plugins@@],
	},
	adapter: cloudflare(),
});
