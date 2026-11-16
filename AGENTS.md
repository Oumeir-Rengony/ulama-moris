# AGENTS.md

Ulama Moris (ulama-moris.org): a Next.js website for listening to Islamic lectures recorded in Mauritius. All content lives in Contentful. The website also serves a read-only JSON API at `/api/v1` that the **mobile app** uses. The mobile app is a separate codebase, and the API is sensitive: read [docs/api-v1.md](docs/api-v1.md) before changing it.

## Before you finish a change

- `npm test`: unit, component and integration tests (Vitest).
- `npx tsc --noEmit`: required, because `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `next build` does **not** catch type errors.
- There is no working lint step: `npm run lint` fails because the repo has no `eslint.config.*`.
- `npm run test:e2e` when you change a page or the player (needs `.env.local`, see below).
- `npm run test:e2e:production` when you change caching (`"use cache"`, `cacheLife`, `cacheTag`, `next.config.mjs`), the webhook route or `ExecuteQuery`.

There is no CI. Every merge to `main` deploys to production automatically (the repo is linked to v0/Vercel). Treat `main` as live.

## Words used in the code

| Word | Meaning |
|---|---|
| **bayaan** | A lecture. The Contentful content type is `Bayaan`. Code and Contentful say "bayaan"; the UI and `/api/v1` say "lecture". |
| **event** | A Contentful `Event` entry that groups up to 10 bayaans (a lecture series, a majlis). A bayaan belongs to at most one event. |
| **local** (Contentful field) | The bayaan's series: `"local"`, `"international"` or `"islahi majlis"` (type `Local` in `services/bayaans/bayaan.service.ts`). The website shows `"international"` as "Guest". `/api/v1` calls the series `local`, `guest` and `islahi-majlis`. The mapping lives in `lib/mobile-app/convert.ts`. |
| **recording** | The small form of a bayaan inside an event query (date, duration, masjid), used to build event summaries. |

## Layout

```
app/                      Next.js App Router pages
  page.tsx                Home: lecture list with filters
  audio/[slug]/           Lecture page
  events/, events/[slug]/ Event list and event page (/event/:slug redirects here)
  articles/, about/, og-preview/
  api/v1/                 Mobile app API (see below)
  api/webhook/revalidate/ Contentful webhook: clears the cache
  api/download/           Proxies an audio download from *.ctfassets.net only
services/
  apollo/apollo.service.ts  ExecuteQuery: the single entry point to Contentful GraphQL
  bayaans/                  Bayaan and event queries (bayaan.service.ts, event.service.ts, query/)
  articles/
lib/
  events.ts               Event summaries: dates, durations, year groups (pure, unit tested)
  mobile-app/             Shapes and helpers for /api/v1 only
  search-params.ts        Safe parsing of page/date query params
  cache.ts                CONTENTFUL_CACHE_TAG
components/, contexts/audio-context.tsx, hooks/
config/config.json        Page sizes, date formats, localStorage keys
scripts/sitemap.ts        Runs before every build (prebuild)
docs/                     Longer docs, including api-v1.md
tests/, e2e/, e2e-production/
```

## Data and caching

- **All Contentful reads go through `ExecuteQuery`.** It runs on the server only, retries up to 3 times and uses `errorPolicy: "all"`: a Contentful error comes back as **missing data, not a thrown error**. Callers must check for a missing collection and treat it as a failure (see `app/api/v1/lectures/route.ts`).
- **Caching uses Cache Components** (`cacheComponents: true`). Each service function starts with `'use cache'`, `cacheLife('days')` and `cacheTag(CONTENTFUL_CACHE_TAG)`. A new Contentful query must do the same, or it will hit Contentful on every request.
- **The webhook clears everything.** `POST /api/webhook/revalidate` checks the signature with `CF_WEBHOOK_SECRET` and calls `revalidateTag("contentful", { expire: 0 })`. A payload doesn't say which pages its entry appears on, so there is one tag for everything. Don't switch to per-entry tags without solving that.
- **`"use cache"` freezes randomness.** `getRelatedBayaans` picks a random offset inside the cache, so "More Lectures" stays the same until the cache is cleared. That's intended.
- **Search** uses Contentful's `title_contains`, which ignores case and accents. Event search can't use it (events are filtered in memory from `getEventDirectory()`), so `eventTitleMatchesSearch` copies that behaviour.
- **Times are Mauritius time (`+04:00`).** Event dates are worked out in Mauritius time, not the server's.

## Environment variables

| Variable | Used for |
|---|---|
| `CF_API_URL` | Contentful GraphQL endpoint. Required. |
| `CF_AUTH` | Contentful delivery token. Required. |
| `CF_PREV_AUTH` | Contentful preview token (draft mode). |
| `CF_WEBHOOK_SECRET` | Signs the revalidate webhook. Without it the webhook refuses every request. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, JSON-LD and the sitemap. Falls back to `https://ulama-moris.org`. |
| `APP_WEB_ORIGIN` | Extra CORS origin for `/api/v1`, for the mobile app's web build. |
| `CONTENTFUL_QUERY_LOG` | Set only by the production cache test. Never set it elsewhere. |

Local values go in `.env.local`, which is not committed.

## Mobile app API (`/api/v1`): sensitive

**Read [docs/api-v1.md](docs/api-v1.md) before touching `app/api/v1/`, `lib/mobile-app/`, or any service, query or `lib/events.ts` code they call.**

The mobile app (a separate codebase) depends on this API, and installed copies can't all be updated at once. A merge to `main` deploys straight to every installed app, and nothing in this repo will warn you if a change breaks it. In short:

- No breaking changes in v1: don't remove or rename fields, change types, make non-null fields nullable, change status codes, series names, sort order or paging. Adding optional fields, optional parameters or endpoints is fine. A breaking change needs `/api/v2`.
- Website changes can change the API indirectly: the bayaan fragment and queries, `event.service.ts` and `lib/events.ts` all feed it.
- Keep `docs/api-v1.md` in step with the code, and add tests in `tests/unit/api/v1-*.test.ts` and `tests/unit/lib/mobile-app/convert.test.ts`.

## Testing

The tests follow the four levels in [docs/testing-strategy-for-react-applications.md](docs/testing-strategy-for-react-applications.md): unit, component, integration and end-to-end. The commands are listed in [README.md](README.md#testing).

### Where tests live

```
tests/                Vitest: npm test
  vitest.setup.ts     jest-dom matchers, ResizeObserver stub, cleanup
  unit/               Node: lib/, scripts/, services/, API route handlers (api/)
  component/          jsdom: one component, dependencies stubbed
  integration/        jsdom or Node: audio playback, services/ with ExecuteQuery mocked
e2e/                  Playwright: npm run test:e2e (*.spec.ts)
e2e-production/       Playwright: npm run test:e2e:production
```

- Inside `tests/<level>/`, the path mirrors the source: `lib/events.ts` is tested by `tests/unit/lib/events.test.ts`. Tests import code through the `@/` alias.
- Vitest runs in Node by default. Component and integration test files opt in to a simulated DOM with a `// @vitest-environment jsdom` comment at the top.
- The setup file adds a no-op `ResizeObserver`, because the Radix slider needs one and jsdom has none.
- Playwright specs are named `*.spec.ts`, so Vitest never picks them up. The `mobile` project (Pixel 7) runs only `mobile.spec.ts`; everything else runs in the `desktop` project (Chromium).
- Without `E2E_BASE_URL`, `npm run test:e2e` starts its own dev server on port 3100. Next.js refuses a second dev server in the same folder, so when one is already running, use `E2E_BASE_URL=http://localhost:3001 npm run test:e2e`.

### How the app is tested

- **Pages are async server components**, which React Testing Library can't render. Page behaviour is covered by end-to-end tests, and pure helpers are kept in `lib/` so they can be unit tested.
- **The outer boundary is `ExecuteQuery`.** Integration tests mock it with `vi.mock("@/services/apollo/apollo.service")`. Mock Service Worker isn't needed. API route tests mock the services one level up (`@/services/bayaans/...`).
- **`"use cache"` is a no-op in Vitest.** `tests/vitest.setup.ts` turns `cacheLife()` and `cacheTag()` into no-ops, so cached service functions run as plain functions. Whether the cache really works is checked by the production cache test.
- **Audio playback in jsdom:** `HTMLMediaElement.prototype.play` and `.pause` are stubbed, and media events (`play`, `pause`, `loadedmetadata`, `ended`) are dispatched by hand.
- **End-to-end tests use live Contentful data**, which changes. They check structure and behaviour, never specific lecture titles; each test reads what it needs from the page, such as the first card's title. The events pagination test skips itself while no event has more than one page of lectures.

### The production cache test

`e2e-production/cache.spec.ts` checks the `"use cache"` setup against a real production server:

1. The first visit to a page queries Contentful.
2. A second visit is served from the cache, with no query.
3. After a signed Contentful webhook (`/api/webhook/revalidate`), the next visit queries Contentful again.

The server is started with `CONTENTFUL_QUERY_LOG` set, so `ExecuteQuery` appends one line per real Contentful query to `e2e-production/contentful-queries.log`, and the test counts the lines added during each page load. Counting is used because timing is too noisy to tell a cache hit from a fast response.

It has its own config (`playwright.production.config.ts`) because:

- **It needs a production build.** The dev server ignores the cache for requests sent with `Cache-Control: no-cache` (DevTools "Disable cache" or a hard reload), clears the cache whenever a file is saved, and the dev e2e config may reuse a dev server you already have running.
- **It is slow to start.** Keeping `next build` out of `npm run test:e2e` keeps the everyday run fast.
- **It needs its own server settings:** port 3200, always a fresh server with an empty cache (`reuseExistingServer: false`), and a test webhook secret so the test can sign webhook requests.

It doesn't touch the live site: the webhook goes to the local test server only, and Contentful is only read. A running `npm run dev` keeps working, because the dev server uses its own folder (`.next/dev`).

### Tested as it is, on purpose

Don't "fix" these:

- Event slugs keep stray hyphens (`"- Seerah -"` → `-seerah-`), so existing event URLs don't change.
- A `0:00` lecture duration counts as unknown, so the event shows no total length.
- `groupEventsByYear` expects events sorted newest first.

### Deliberately not tested

- **shadcn primitives in `components/ui/*`:** library code we don't change. They are also left out of coverage.
- **OG image layout:** only a smoke test that the route returns an image. Pixel-level layout isn't checked.
- **`lib/audio-data.ts`:** static data that no code imports.

## Other docs

- [docs/api-v1.md](docs/api-v1.md): the `/api/v1` mobile app API, and how to change it safely.
- [docs/testing-strategy-for-react-applications.md](docs/testing-strategy-for-react-applications.md): the testing approach.
- [docs/audio-and-retention-plan.md](docs/audio-and-retention-plan.md): planned audio and retention work, not implemented yet. Its "How audio works today" section describes the player and is partly out of date on caching (pages now use `"use cache"`, not `revalidate`).
