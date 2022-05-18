import { HtmlTagDescriptor, IndexHtmlTransformContext, IndexHtmlTransformResult, Plugin } from "vite";
import { gzipSync } from "fflate";
import { enc } from "./Base85";
import { OutputAsset, OutputChunk } from "./rollup";

function compress(str: string): string {
  const byteArray = Uint8Array.from(str, (v) => v.charCodeAt(0));
  const byteArrayCompressed = gzipSync(byteArray, { level: 9 });
  return enc(byteArrayCompressed);
}

function createLoaderTag(html: string, chunk: OutputChunk): HtmlTagDescriptor {
  const prefix = "(function() {";
  const code = chunk.code.trim();
  const postfix = "})();";
  return {
    tag: "script",
    attrs: { id: "ldr" },
    children: `${prefix}${code}${postfix}`,
    injectTo: "body",
  };
}

function inlineJs(html: string, chunk: OutputChunk): string {
  const regExp = new RegExp(`<script type="module"[^>]*?src="/?${chunk.fileName}"[^>]*?></script>`);
  const code = `<script type="application/gzip" class="ldr-js">${compress(chunk.code)}</script>`;
  return html.replace(regExp, () => code);
}

function inlineCss(html: string, asset: OutputAsset): string {
  const regExp = new RegExp(`<link rel="stylesheet"[^>]*?href="/?${asset.fileName}"[^>]*?>`);
  const code = `<script type="application/gzip" class="ldr-css">${compress(asset.source as string)}</script>`;
  return html.replace(regExp, () => code);
}

export default function inline(): Plugin {
  return {
    name: "vite:inline",
    transformIndexHtml: {
      enforce: "post",
      transform(html: string, ctx?: IndexHtmlTransformContext): IndexHtmlTransformResult {
        if (!ctx || !ctx.bundle) return html;

        const tags = [];
        for (const [, value] of Object.entries(ctx.bundle)) {
          if (value.fileName.match(/assets\/loader\..*\.js/)) {
            tags.push(createLoaderTag(html, value as OutputChunk));
          } else if (value.fileName.match(/assets\/index\..*\.js/)) {
            html = inlineJs(html, value as OutputChunk);
          } else if (value.fileName.match(/assets\/index\..*\.css/)) {
            html = inlineCss(html, value as OutputAsset);
          }
          // prevent rollup from outputting inline bundles
          delete ctx.bundle[value.fileName];
        }
        return { html, tags };
      },
    },
  };
}
