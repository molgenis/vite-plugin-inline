import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 45,
        functions: 75,
        branches: 75,
        statements: 45,
      }
    },
  },
});
