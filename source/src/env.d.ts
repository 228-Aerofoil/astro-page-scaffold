/// <reference types="astro/client" />

import type { envValidation } from "astro.config.js";
import type { ReadonlyDeep } from "type-fest";
import type { z } from "zod";

//* we declare global because imports make it a module
// eslint-disable-next-line no-restricted-syntax
declare global {
	interface ImportMetaEnv extends ReadonlyDeep<z.infer<typeof envValidation>> {}

	// eslint-disable-next-line no-unused-vars
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
