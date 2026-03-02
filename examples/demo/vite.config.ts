import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  server: {
    cors: true,
    fs: { allow: ["../.."] },
  },
  preview: {
    cors: true,
  },
  resolve: {
    alias: {
      // resolve "tailscale-web" imports straight to the library source
      // so Vite handles wasm_exec.js and main.wasm correctly
      "tailscale-web": resolve(__dirname, "../../src/index.ts"),
    },
  },
});
