import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  assetsInclude: ["**/*.wasm"],
  build: {
    outDir: resolve(__dirname, "../../docs/demo"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "tailscale-web": resolve(__dirname, "../../src/index.ts"),
    },
  },
});
