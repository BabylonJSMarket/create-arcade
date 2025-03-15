import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Arcade",
      // the proper extensions will be added
      fileName: "arcade",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      plugins: [nodePolyfills(/* options */)],
      // into your library
      external: ["@clack/prompts", "fs", "path"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        // globals: {
        //   "@clack/prompts": "Prompts",
        //   fs: "fs",
        //   path: "path",
        // },
      },
    },
  },
});
