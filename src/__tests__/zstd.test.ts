import { dec } from "../Base85";
import { ZSTD_DECOMPRESS_WASM_BASE85 } from "../generated/zstd_decompress_wasm";
import { createZstdDecompressor } from "../zstd_decompress";
import { expect, test } from "vitest";
import { ZSTD_COMPRESS_WASM_BASE85 } from "../generated/zstd_compress_wasm";
import { createZstdCompressor } from "../zstd_compress";

function createInput(len: number): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = i & 0xff; // wrap around 0–255
  }
  return arr;
}

async function compressDecompress(arr: Uint8Array<ArrayBufferLike>): Promise<Uint8Array<ArrayBufferLike>> {
  const zstdCompressor = await createZstdCompressor(dec(ZSTD_COMPRESS_WASM_BASE85) as BufferSource);
  try {
    const dst = zstdCompressor.compress(arr, 1);

    const zstdDecompressor = await createZstdDecompressor(
      dec(ZSTD_DECOMPRESS_WASM_BASE85) as BufferSource,
      arr.length + dst.length,
    );
    try {
      return zstdDecompressor.decompress(dst, arr.length);
    } finally {
      zstdDecompressor.destroy();
    }
  } finally {
    zstdCompressor.destroy();
  }
}

test("compress decompress round trip", async () => {
  const arr = createInput(10);
  expect(await compressDecompress(arr)).toEqual(arr);
});
