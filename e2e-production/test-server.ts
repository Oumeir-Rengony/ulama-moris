import path from "node:path";

// Settings shared by playwright.production.config.ts (which starts the server)
// and cache.spec.ts (which talks to it), so the two always agree.

// Its own port, so it never clashes with `npm run dev` or the dev e2e server (3100).
export const PRODUCTION_TEST_PORT = 3200;

// The server is started with this webhook secret instead of the real one, so the
// test can sign webhook requests without knowing the real secret.
// Contentful's signing library only accepts secrets of exactly 64 characters.
export const TEST_WEBHOOK_SECRET = "production-e2e-test-secret-".padEnd(64, "x");

// The server appends one line here for every query that really reaches Contentful
// (see logQueryForCacheTest in services/apollo/apollo.service.ts).
// Ignored by git through the "*.log" rule.
export const CONTENTFUL_QUERY_LOG_PATH = path.resolve("e2e-production", "contentful-queries.log");
