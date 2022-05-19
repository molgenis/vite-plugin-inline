import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      lines: 45,
      functions: 80,
      branches: 80,
      statements: 45,
    },
  },
});
