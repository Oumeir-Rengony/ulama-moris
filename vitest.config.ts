import path from "path";
import { defineConfig } from "vitest/config";

// `npm test` runs every Vitest test under tests/, split by level (see docs/testing-plan.md):
//   tests/unit         pure logic and API route handlers, in Node
//   tests/component    one React component, dependencies stubbed, in jsdom
//   tests/integration  real hooks/state/services, only the outer boundary mocked
// Browser tests live in e2e/ at the root and run separately with `npm run test:e2e`.
export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json.
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    // Unit tests run in Node. Component and integration tests opt in to a
    // simulated DOM with a `// @vitest-environment jsdom` comment at the top of the file.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/vitest.setup.ts"],
    // `npm run test:coverage`. The HTML report is written to tests/coverage/index.html.
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "tests/coverage",
      // Our own source code; every file is listed, including ones no test touches.
      include: ["app/**", "components/**", "contexts/**", "hooks/**", "lib/**", "services/**", "scripts/**"],
      exclude: [
        // Third-party shadcn primitives we do not change (see docs/testing-plan.md).
        "components/ui/**",
        // Static data that nothing imports.
        "lib/audio-data.ts",
        // Not served: Next.js ignores folders starting with "_".
        "app/api/_audio/**",
        "**/*.d.ts",
      ],
    },
  },
});
