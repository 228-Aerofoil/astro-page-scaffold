/// <reference types="astro/client" />

import { EnvType } from "astro.config";

interface ImportMeta {
  readonly env: EnvType;
}
