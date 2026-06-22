import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // env.ts validates JWT_SECRET at import time; provide a value for tests.
    env: {
      JWT_SECRET: "test-secret-for-vitest-only",
    },
  },
});
