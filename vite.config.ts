import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "tailscale-web",
      fileName: (format) => `tailscale-web.${format}.js`,
    },
  },
  assetsInclude: ["**/*.wasm"],
})
