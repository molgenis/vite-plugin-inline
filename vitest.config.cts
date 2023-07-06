import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      all: true,
      lines: 45,
      functions: 75,
      branches: 75,
      statements: 45,
    },
  },
});
