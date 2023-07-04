/// <reference types="astro/client" />

import type { ReadonlyDeep } from "type-fest";
import type { z } from "zod";
import type { envValidation } from "astro.config.js";

type t = ReadonlyDeep<z.infer<typeof envValidation>>;

//* we declare global because imports make it a module
declare global {
	interface ImportMetaEnv {}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
