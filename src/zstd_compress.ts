export interface ZstdExports {
  _initialize: () => void;
  memory: WebAssembly.Memory;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
  ZSTD_compressBound: (srcSize: number) => number;
  ZSTD_compress: (
    dstPtr: number,
    dstCapacity: number,
    srcPtr: number,
    srcSize: number,
    compressionLevel: number,
  ) => number;
  ZSTD_isError: (code: number) => number;
}

export interface ZstdCompressor {
  compress(src: Uint8Array, compressionLevel?: number): Uint8Array;
  destroy(): void;
}

export async function createZstdCompressor(bufferSource: BufferSource): Promise<ZstdCompressor> {
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

  function compress(src: Uint8Array, compressionLevel = 19): Uint8Array {
    const maxCompressedLength = exports.ZSTD_compressBound(src.length);

    const srcPtr = exports.malloc(src.length);
    const dstPtr = exports.malloc(maxCompressedLength);
    if (heapU8 === null) {
      updateHeapView(); // update if malloc did not trigger emscripten_notify_memory_growth
    }

    try {
      heapU8!.set(src, srcPtr);

      const ret = exports.ZSTD_compress(dstPtr, maxCompressedLength, srcPtr, src.length, compressionLevel);
      if (exports.ZSTD_isError(ret)) {
        throw new Error(`zstd compression failed (code ${ret})`);
      }

      return heapU8!.slice(dstPtr, dstPtr + ret);
    } finally {
      exports.free(srcPtr);
      exports.free(dstPtr);
    }
  }

  function destroy() {
    heapU8 = null;
    memory = null;
  }

  return Object.freeze({ compress, destroy });
}
