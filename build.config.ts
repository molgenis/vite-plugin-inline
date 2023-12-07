// derived from https://github.com/vitejs/vite-plugin-vue/blob/plugin-vue%405.0.0-beta.0/packages/plugin-vue/build.config.ts
export default {
    entries: ['src/index'],
    externals: ['vite'],
    clean: true,
    declaration: 'compatible',
    rollup: {
        emitCJS: true,
        inlineDependencies: true,
    },
};