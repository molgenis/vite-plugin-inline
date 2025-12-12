# How to generate WebAssembly files

```
wget https://github.com/emscripten-core/emsdk/archive/refs/tags/4.0.21.tar.gz
tar -xzf 4.0.21.tar.gz
rm 4.0.21.tar.gz

wget https://github.com/facebook/zstd/releases/download/v1.5.7/zstd-1.5.7.tar.gz
tar -xzf zstd-1.5.7.tar.gz
rm zstd-1.5.7.tar.gz

cd emsdk-4.0.21/
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

cd ../zstd-1.5.7/build/single_file_libs

./create_single_file_decoder.sh 
emcc zstddeclib.c \
-Oz \
--no-entry \
-s MALLOC=emmalloc \
-s INITIAL_HEAP=1048576 \
-s ALLOW_MEMORY_GROWTH=1 \
-s EXPORTED_FUNCTIONS='["_ZSTD_decompress", "_ZSTD_isError", "_malloc", "_free"]' \
-o zstd_decompress.wasm

./create_single_file_library.sh
emcc zstd.c \
-Oz \
--no-entry \
-s MALLOC=emmalloc \
-s INITIAL_HEAP=1048576 \
-s ALLOW_MEMORY_GROWTH=1 \
-s EXPORTED_FUNCTIONS='["_ZSTD_compressBound", "_ZSTD_compress", "_ZSTD_isError", "_malloc", "_free"]' \
-o zstd_compress.wasm
```