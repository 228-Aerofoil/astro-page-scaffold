/// <reference types="astro/client" />

import type { EnvType } from "astro.config.ts";
import type { ReadonlyDeep } from "type-fest";

//* we declare global because imports make it a module
// eslint-disable-next-line no-restricted-syntax
declare global {
	interface ImportMetaEnv extends ReadonlyDeep<EnvType> {}

	// eslint-disable-next-line no-unused-vars
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
