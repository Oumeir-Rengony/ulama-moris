import { readFile } from "node:fs/promises";
import { signRequest } from "@contentful/node-apps-toolkit";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { CONTENTFUL_QUERY_LOG_PATH, TEST_WEBHOOK_SECRET } from "./test-server";

// Runs against a production build only: npm run test:e2e:production
// (playwright.production.config.ts explains why it is not on the dev server).
//
// What it proves, end to end:
//   1. the first visit to a page queries Contentful;
//   2. a second visit is served from the "use cache" cache, with no query;
//   3. after a signed Contentful webhook, the next visit queries Contentful again.
//
// It only touches this test's own local server. The live site's cache and the
// Contentful content are never changed: the webhook goes to localhost and is
// signed with a test secret that only this server knows.

const WEBHOOK_PATH = "/api/webhook/revalidate";

// How many queries the server has sent to Contentful since it started.
async function countContentfulQueries(): Promise<number> {
  let log = "";
  try {
    log = await readFile(CONTENTFUL_QUERY_LOG_PATH, "utf8");
  } catch (error) {
    const fileDoesNotExistYet = (error as NodeJS.ErrnoException).code === "ENOENT";
    if (fileDoesNotExistYet) {
      return 0;
    }
    throw error;
  }

  let lineCount = 0;
  for (const line of log.split("\n")) {
    if (line.trim() !== "") {
      lineCount += 1;
    }
  }
  return lineCount;
}

// Loads a page and returns how many Contentful queries that load caused.
async function countQueriesWhileLoading(request: APIRequestContext, pagePath: string): Promise<number> {
  const queriesBefore = await countContentfulQueries();

  const response = await request.get(pagePath);
  expect(response.status()).toBe(200);
  // Reading the body waits for the streamed part of the page to finish.
  await response.text();

  const queriesAfter = await countContentfulQueries();
  return queriesAfter - queriesBefore;
}

// Sends the webhook the way Contentful does when an entry is published.
async function sendSignedWebhook(request: APIRequestContext) {
  const body = JSON.stringify({
    sys: { id: "production-e2e-test", type: "Entry", contentType: { sys: { id: "bayaan" } } },
    fields: {},
  });
  const headers = { "content-type": "application/json" };

  const signatureHeaders = signRequest(TEST_WEBHOOK_SECRET, {
    method: "POST",
    path: WEBHOOK_PATH,
    headers,
    body,
  });

  return request.post(WEBHOOK_PATH, {
    headers: { ...headers, ...signatureHeaders },
    data: body,
  });
}

test("the Contentful webhook clears the cache that serves repeat visits", async ({ request }) => {
  // A search nobody else has made, so this page starts with an empty cache entry
  // even if something else loaded the home page first.
  const pagePath = `/?search=cache-test-${Date.now()}`;

  const firstVisitQueries = await countQueriesWhileLoading(request, pagePath);
  expect(firstVisitQueries, "the first visit should query Contentful").toBeGreaterThan(0);

  const repeatVisitQueries = await countQueriesWhileLoading(request, pagePath);
  expect(repeatVisitQueries, "a repeat visit should be served from the cache").toBe(0);

  const webhookResponse = await sendSignedWebhook(request);
  expect(webhookResponse.status()).toBe(200);
  expect(await webhookResponse.json()).toEqual({ revalidated: true });

  const visitAfterWebhookQueries = await countQueriesWhileLoading(request, pagePath);
  expect(visitAfterWebhookQueries, "after the webhook the page should query Contentful again").toBeGreaterThan(0);
});
