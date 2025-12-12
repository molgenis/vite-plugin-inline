import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/generated/**/*.ts"],
      thresholds: {
        lines: 50,
        functions: 80,
        branches: 80,
        statements: 50,
      },
    },
  },
});
