import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the real Next.js app and live Contentful data,
// so `.env.local` must contain CF_API_URL and CF_AUTH.
const DEFAULT_PORT = 3100;
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${DEFAULT_PORT}`;

export default defineConfig({
  testDir: "e2e",
  // Keep everything Playwright writes next to the specs, inside e2e/.
  outputDir: "e2e/test-results",
  // Live data and a dev server that compiles pages on first visit make the first
  // request slow, so allow more time than Playwright's 30s default.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 1,
  // "list" prints progress in the terminal; "html" saves a browsable report.
  reporter: [
    ["list"],
    ["html", { outputFolder: "e2e/playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  // Start a dev server unless E2E_BASE_URL points at one that is already running.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${DEFAULT_PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
