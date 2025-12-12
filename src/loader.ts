import { dec } from "./Base85";
import { ZSTD_DECOMPRESS_WASM_BASE85 } from "./generated/zstd_decompress_wasm";
import { createZstdDecompressor } from "./zstd_decompress";

async function runLoader() {
  const doc = document;

  // step 0: get compressed script tags
  const scripts = Array.from(doc.querySelectorAll<HTMLScriptElement>("script[type='application/zstd']"));
  if (scripts.length === 0) {
    return;
  }

  // step 1: calc mem required for decompressor
  let maxMemory = 0;
  scripts.forEach((script) => {
    const cSize = Number(script.dataset.csize);
    const dSize = Number(script.dataset.dsize);
    if (isNaN(cSize) || isNaN(dSize)) {
      throw new Error("missing or invalid data-csize / data-dsize on script tag");
    }

    maxMemory = Math.max(maxMemory, cSize + dSize);
  });

  // step 2: create decompressor
  const wasmBuffer = dec(ZSTD_DECOMPRESS_WASM_BASE85) as BufferSource;
  const zstd = await createZstdDecompressor(wasmBuffer, maxMemory);
  const utf8Decoder = new TextDecoder("utf-8");

  // step 3: decompress script tags
  await Promise.all(
    scripts.map(async (script) => {
      const decompressedSize = Number(script.dataset.dsize);
      const decompressed = zstd.decompress(dec(script.textContent), decompressedSize);

      let element: HTMLElement;
      const cls = script.className;
      if (cls === "ldr-js") {
        element = doc.createElement("script");
        element.setAttribute("type", "module");
      } else if (cls === "ldr-css") {
        element = doc.createElement("style");
      } else {
        throw new Error(`unknown class '${cls}'`);
      }

      element.textContent = utf8Decoder.decode(decompressed);
      script.replaceWith(element);
    }),
  );

  // step 4: cleanup
  zstd.destroy();
  doc.getElementById("ldr")?.remove();
}

runLoader().catch((err) => console.error("loader failed", err));
