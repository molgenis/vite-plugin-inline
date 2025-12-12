export interface ZstdExports {
  _initialize: () => void;
  memory: WebAssembly.Memory;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
  ZSTD_decompress: (dstPtr: number, dstCapacity: number, srcPtr: number, compressedSize: number) => number;
  ZSTD_isError: (code: number) => number;
}

export interface ZstdDecompressor {
  decompress(src: Uint8Array, decompressedSize: number): Uint8Array;
  destroy(): void;
}

export async function createZstdDecompressor(bufferSource: BufferSource, maxMemory: number): Promise<ZstdDecompressor> {
  let heapU8: Uint8Array<ArrayBuffer> | null = null;
  let memory: WebAssembly.Memory | null = null;

  const updateHeapView = () => {
    heapU8 = new Uint8Array(memory!.buffer);
  };

  const { instance } = await WebAssembly.instantiate(bufferSource, {
    env: { emscripten_notify_memory_growth: updateHeapView },
  });
  const exports = instance.exports as unknown as ZstdExports;
  memory = exports.memory;
  exports._initialize();

  // scratch buffer
  const scratchPtr = exports.malloc(maxMemory);
  if (heapU8 === null) {
    updateHeapView(); // update if malloc did not trigger emscripten_notify_memory_growth
  }

  function decompress(src: Uint8Array, decompressedSize: number): Uint8Array {
    const srcPtr = scratchPtr;
    const dstPtr = scratchPtr + src.length;

    heapU8!.set(src, srcPtr);

    const ret = exports.ZSTD_decompress(dstPtr, decompressedSize, srcPtr, src.length);
    if (exports.ZSTD_isError(ret)) {
      throw new Error(`zstd decompression failed (code ${ret})`);
    }

    return heapU8!.slice(dstPtr, dstPtr + ret);
  }

  function destroy() {
    if (scratchPtr !== 0) {
      exports.free(scratchPtr);
    }
    heapU8 = null;
    memory = null;
  }

  return Object.freeze({ decompress, destroy });
}
