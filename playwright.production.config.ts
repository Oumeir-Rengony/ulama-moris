import { defineConfig } from "@playwright/test";
import {
  CONTENTFUL_QUERY_LOG_PATH,
  PRODUCTION_TEST_PORT,
  TEST_WEBHOOK_SECRET,
} from "./e2e-production/test-server";

// Run with: npm run test:e2e:production
//
// Tests that need a PRODUCTION build (`next build` + `next start`), kept apart
// from the dev-server tests in playwright.config.ts (`npm run test:e2e`).
//
// Why separate: the cache test checks that "use cache" really skips Contentful.
// The dev server is not reliable for that:
//   - it ignores the cache for any request sent with `Cache-Control: no-cache`
//     (browser DevTools "Disable cache", or a hard reload);
//   - saving any file clears the cache, so editing code during a run breaks it;
//   - the dev e2e config reuses a dev server you may already have running, so
//     the cache would hold whatever you clicked on before.
// A fresh production server behaves like the live site and starts with an empty cache.
//
// The build takes a minute or two, which is why this is not part of `npm run test:e2e`.
// Like the other e2e tests it uses live Contentful, so `.env.local` must contain
// CF_API_URL and CF_AUTH.
const baseURL = `http://localhost:${PRODUCTION_TEST_PORT}`;

export default defineConfig({
  testDir: "e2e-production",
  outputDir: "e2e-production/test-results",
  timeout: 60_000,
  // One worker: the test counts every Contentful query the server makes, so no
  // other test may load pages at the same time.
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL },
  webServer: {
    // `next build` directly, not `npm run build`, so the sitemap is not regenerated.
    command: `npx next build && npx next start -p ${PRODUCTION_TEST_PORT}`,
    url: baseURL,
    // Always a fresh server: an existing one would not have the test secret or
    // the query log, and its cache would not start empty.
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      CF_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
      CONTENTFUL_QUERY_LOG: CONTENTFUL_QUERY_LOG_PATH,
    },
  },
});
