// @ts-check
import { defineConfig } from "astro/config";

import solidJs from "@astrojs/solid-js";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  server: {
    allowedHosts: ["localhost", "caleheinzz.my.id"],
    port: 3000,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": new URL("./src", import.meta.url).pathname,
      },
    },
  },
});
