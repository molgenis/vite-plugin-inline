import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      all: true,
      lines: 45,
      functions: 80,
      branches: 80,
      statements: 45,
    },
  },
});
