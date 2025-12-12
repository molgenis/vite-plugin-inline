import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

fs.mkdirSync("dist-generate", { recursive: true });
await build({
  entryPoints: ["src/Base85.ts"],
  outfile: "dist-generate/Base85.js",
  bundle: true,
  format: "esm",
  platform: "node",
  minify: false,
  sourcemap: false,
});

const base85Path = path.resolve("dist-generate/Base85.js");
const { enc } = await import(`file://${base85Path}`);

const wasmFileMetadatas = [
  {
    inputFilePath: "resources/zstd_compress.wasm",
    outputFilePath: "src/generated/zstd_compress_wasm.ts",
    exportName: "ZSTD_COMPRESS_WASM_BASE85",
  },
  {
    inputFilePath: "resources/zstd_decompress.wasm",
    outputFilePath: "src/generated/zstd_decompress_wasm.ts",
    exportName: "ZSTD_DECOMPRESS_WASM_BASE85",
  },
];

for (const wasmFileMetadata of wasmFileMetadatas) {
  const wasmBytes = new Uint8Array(fs.readFileSync(wasmFileMetadata.inputFilePath));
  const tsContents = `/*
BSD License

For Zstandard software

Copyright (c) Meta Platforms, Inc. and affiliates. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

 * Neither the name Facebook, nor Meta, nor the names of its contributors may
   be used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
// generated code, do not edit
export const ${wasmFileMetadata.exportName} = "${enc(wasmBytes)}"`;
  fs.mkdirSync(path.dirname(wasmFileMetadata.outputFilePath), { recursive: true });
  fs.writeFileSync(wasmFileMetadata.outputFilePath, tsContents, "utf8");
}
