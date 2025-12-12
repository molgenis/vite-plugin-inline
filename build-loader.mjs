import { build } from "esbuild";

await build({
  entryPoints: {
    loader: "src/loader.ts",
  },
  outfile: "dist/loader/loader.js",
  charset: "utf8",
  format: "iife",
  bundle: true,
  minify: true,
  target: "es2022",
});
