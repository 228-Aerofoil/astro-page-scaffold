// uno.config.ts
import presetWebFonts from "@unocss/preset-web-fonts";
import presetWind from "@unocss/preset-wind";
import { defineConfig } from "unocss";

export default defineConfig({
  presets: [
    presetWind(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: ["Atkinson Hyperlegible"],
      },
    }),
  ],
  //! ugly hack, but you shouldn't be importing this anyway
}) as unknown;
