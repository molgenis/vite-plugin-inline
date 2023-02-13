[![Build Status](https://app.travis-ci.com/molgenis/vite-plugin-inline.svg?branch=main)](https://app.travis-ci.com/molgenis/vite-plugin-inline)

# vite-plugin-inline
[Vite](https://vitejs.dev/) plugin that embeds .js and .css as gzipped base85 encoded data. Can be used together with the provided loader to create a stand-alone .html that can be viewed offline in a web browser. See https://github.com/molgenis/vip-report-template for an example.

# Usage
## Configuration
Update `vite-config.ts` as follows:

```js
import { defineConfig } from "vitest/config";
import inlinePlugin from "@molgenis/vite-plugin-inline/src/vite-plugin-inline.js";

export default defineConfig({
  plugins: [inlinePlugin()],
  build: {
    rollupOptions: {
      input: ["./index.html", "@molgenis/vite-plugin-inline/src/loader.ts"],
      output: {
        manualChunks: undefined,
      },
    },
  },
});
```
Change `./index.html` if your .html path differs.
## Build
Execute `npm run build` to build a stand-alone .html.
# Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="data:,">
  <title>Example</title>
  <script type="application/gzip" class="ldr-js"><!-- put your base85 encoded gzipped JavaScript here --></script>
  <script type="application/gzip" class="ldr-css"><!-- put your base85 encoded CSS here --></script>
</head>
<body>
  <div id="app"></div>
  <script id="ldr"><!-- loader is injected here that unzips and decodes data --></script>
</body>
</html>
```
