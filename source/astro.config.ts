import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import cloudflare from "@astrojs/cloudflare";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import { Type as t } from "@sinclair/typebox";
import { defineConfig, passthroughImageService } from "astro/config";

export const envValidation = t.Object({});

const env = await getTargetEnv<typeof envValidation>(import.meta.url, envValidation);
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
	image: {
		service: passthroughImageService(),
	},
	adapter: cloudflare(),
});
