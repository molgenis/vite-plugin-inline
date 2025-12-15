import { HtmlTagDescriptor, IndexHtmlTransformContext, IndexHtmlTransformResult, Plugin } from "vite";
import { dec, enc } from "./Base85";
import { OutputAsset, OutputChunk } from "./rollup";
import { ZSTD_COMPRESS_WASM_BASE85 } from "./generated/zstd_compress_wasm";
import { createZstdCompressor, ZstdCompressor } from "./zstd_compress";

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

async function inlineJs(html: string, chunk: OutputChunk, zstdCompressor: ZstdCompressor): Promise<string> {
  const regExp = new RegExp(`<script type="module"[^>]*?src="/?${chunk.fileName}"[^>]*?></script>`);
  const src = Uint8Array.from(chunk.code, (v) => v.charCodeAt(0));
  const bytes = zstdCompressor.compress(src);
  const code = `<script type="application/zstd" class="ldr-js" data-csize="${bytes.length}" data-dsize="${src.length}">${enc(bytes)}</script>`;
  return html.replace(regExp, () => code);
}

async function inlineCss(html: string, asset: OutputAsset, zstdCompressor: ZstdCompressor): Promise<string> {
  const regExp = new RegExp(`<link rel="stylesheet"[^>]*?href="/?${asset.fileName}"[^>]*?>`);
  const src = Uint8Array.from(asset.source as string, (v) => v.charCodeAt(0));
  const bytes = zstdCompressor.compress(src);
  const code = `<script type="application/zstd" class="ldr-css" data-csize="${bytes.length}" data-dsize="${src.length}">${enc(bytes)}</script>`;
  return html.replace(regExp, () => code);
}

export default function inline(): Plugin {
  return {
    name: "vite:inline",
    transformIndexHtml: {
      order: "post",
      async handler(html: string, ctx?: IndexHtmlTransformContext): Promise<IndexHtmlTransformResult> {
        if (!ctx || !ctx.bundle) return html;

        const zstdCompressor = await createZstdCompressor(dec(ZSTD_COMPRESS_WASM_BASE85) as BufferSource);
        try {
          const tags = [];
          for (const [, value] of Object.entries(ctx.bundle)) {
            if (value.fileName.match(/assets\/loader-.*\.js/)) {
              tags.push(createLoaderTag(html, value as OutputChunk));
            } else if (value.fileName.match(/assets\/index-.*\.js/)) {
              html = await inlineJs(html, value as OutputChunk, zstdCompressor);
            } else if (value.fileName.match(/assets\/index-.*\.css/)) {
              html = await inlineCss(html, value as unknown as OutputAsset, zstdCompressor);
            }
            // prevent rollup from outputting inline bundles
            delete ctx.bundle[value.fileName];
          }
          return { html, tags };
        } finally {
          zstdCompressor.destroy();
        }
      },
    },
  };
}
