import { build } from "esbuild";
import path from "node:path";
import fs from "node:fs";

await build({
  entryPoints: {
    index: "src/index.ts",
  },
  outfile: "dist/plugin/index.mjs",
  format: "esm",
  bundle: true,
  minify: false,
  target: "es2022",
});

// copy types
fs.copyFileSync(path.resolve("src/index.d.ts"), path.resolve("dist/plugin/index.d.ts"));
