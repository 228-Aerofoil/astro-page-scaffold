import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import { getTargetEnv } from "@aerofoil/aerofoil-core/util/getTargetEnv";
import type { ReadonlyDeep } from "type-fest";
import { z } from "zod";

// todo add t3-env: https://github.com/t3-oss/t3-env/blob/main/examples/astro/src/t3-env.ts
const envValidation = z.object({});

export type EnvType = ReadonlyDeep<z.infer<typeof envValidation>>;

// https://astro.build/config
export default defineConfig({
  output: "server",
  outDir: "dist",
  integrations: [
    {
      name: "aerofoil-cloudflare",
      hooks: {
        "astro:config:setup": async () => {
          const env = await getTargetEnv("page", envValidation);
          process.env = { ...process.env, ...env };
        },
      },
    },
  ],
  adapter: cloudflare(),
});
