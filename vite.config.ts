import { defineConfig, type Plugin } from "vite"
import dts from "vite-plugin-dts"
import { readFileSync } from "fs"
import { basename } from "path"

// Emit .wasm files as separate assets rather than inlining them as base64.
// Rollup replaces import.meta.ROLLUP_FILE_URL_<ref> with the emitted file's URL.
function wasmPlugin(): Plugin {
  return {
    name: "wasm-emit",
    enforce: "pre",
    load(id: string) {
      if (!id.endsWith(".wasm")) return
      const ref = this.emitFile({
        type: "asset",
        fileName: basename(id),
        source: readFileSync(id),
      })
      return `export default import.meta.ROLLUP_FILE_URL_${ref}`
    },
  }
}

export default defineConfig({
  plugins: [
    wasmPlugin(),
    dts({ rollupTypes: true, tsconfigPath: "tsconfig.docs.json" }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "tailscale-web",
      fileName: (format) => `tailscale-web.${format}.js`,
    },
  },
  assetsInclude: ["**/*.wasm"],
})
