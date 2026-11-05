# Testing plan for Ulama Moris

This plan applies [Testing Strategy for React Applications](testing-strategy-for-react-applications.md) to this app. It compares what is tested today with the strategy's four levels, then lists what to test at each level, in the order to build it.

Decisions:
- End-to-end tests run against **live Contentful** data.
- Tests run **locally** through npm scripts. There is no CI.
- Tests are added **phase by phase**.
- All tests live in one top-level `tests/` folder, split by level (see Phase 0).

**Status (2026-11-05): phases 0–4 are implemented.**
- `npm test`: 175 tests in 18 files (unit, component and integration).
- `npm run test:e2e`: 14 passing, 1 skipped. The pagination journey skips itself while no event has more than one page of lectures (the largest has 8, exactly one page).
- Section 1 describes the state **before** this work; it is kept as the record of the analysis.

## 1. Where we are today

| Level | Strategy expects | What we have | Gap |
|---|---|---|---|
| Unit | Vitest on logic and business rules | Vitest 3 (`vitest.config.ts`). It uses the `node` environment and only picks up `**/*.test.ts`. One test file: `scripts/sitemap-builder.test.ts` (19 tests, mocks `node-fetch`). | Nothing tests `lib/events.ts`, `lib/utils.ts`, `lib/og/title-font-size.ts` or the API route handlers. Some logic is hidden inside components or pages and can't be tested on its own: `getPageNumbers` in `components/audio-list.tsx`, `groupEventsByYear` in `app/events/page.tsx`, and `selectUniqueBayaan` in `services/bayaans/bayaan.service.ts` (not exported). |
| Component | Vitest + React Testing Library in a simulated DOM | Nothing. React Testing Library, user-event, jest-dom and jsdom aren't installed, and `.tsx` test files aren't picked up. | Client components are untested: `AudioCard`, `Header`, `AudioList`, and the `AudioPlayer` parts. |
| Integration | Real hooks, state and context; only the outer boundary mocked | Nothing. | Untested: the audio player working with `AudioProvider` (play/pause, one track at a time, resuming from the `audioTime` saved in localStorage). Also untested: the Contentful service layer (`services/bayaans/event.service.ts`, `bayaan.service.ts`). |
| End-to-end | Playwright for critical user journeys | No `@playwright/test`. `playwright-cli` has only been used for manual checks. | No automated browser coverage of routing, real Contentful data, audio playback or downloads. |

### What is specific to this app

- **Pages are server components.** Everything under `app/**/page.tsx` is an async server component, which React Testing Library can't render. Page-level behaviour is covered by end-to-end tests. Pure helpers inside pages are moved into `lib/` so they can be unit tested.
- **The outer boundary is `ExecuteQuery`, not `fetch` in the browser.** All Contentful calls run on the server through Apollo (`services/apollo/apollo.service.ts`). Integration tests mock `ExecuteQuery` with `vi.mock`. Mock Service Worker isn't needed for now.
- **Linting doesn't run.** `npm run lint` fails because the repo has no `eslint.config.*`. This is outside this plan.

### Bugs found during this analysis

All of these are now fixed and covered by Phase 1 tests. The webhook and download tests were checked against the original code, where they fail.

| File | Problem | Fix |
|---|---|---|
| `app/api/webhook/revalidate/route.ts` | `if(!id)` is inverted, so `revalidateTag` only runs when there is no id, and then with `audio:undefined`. | The check is now `if (id)`. |
| `app/api/webhook/revalidate/route.ts` | The id is read from `body.fields.sys.id`, but a Contentful webhook payload has `sys` at the top level (`body.sys.id`). | Reads `body.sys.id`. Audio URLs are tagged with the audio **asset** id, so the tag only matches when the webhook fires for an asset, not for a lecture entry. |
| `app/api/webhook/revalidate/route.ts` | A leftover `console.log({ isVerifiedRequest })` runs on every call. | Removed. |
| `app/api/download/route.ts` | `new URL(fileUrl)` throws on a malformed `url` and isn't caught, so the response is a 500 instead of a 400. | Returns 400 "Invalid file URL". |
| `lib/utils.ts` | `toISODuration` throws on a duration that isn't `MM:SS` or `HH:MM:SS`. It is only used by `createAudioJsonLd` and `createAudioListJsonLd`, which nothing calls today, so the bug isn't triggered yet. | Returns `undefined` for malformed input, so the field is left out of JSON-LD. |

## 2. The plan, phase by phase

### Phase 0: Setup

- **Dev dependencies:**
  - `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
  - `@playwright/test`, then install a browser with `npx playwright install chromium`
- **Versions:** jest-dom 6 and jsdom 26, which are known to work with Vitest 3.
- **Where tests live:** two root folders, one per test runner, so each can be run on its own.
  - `tests/` holds the Vitest tests, one folder per level. `npm test` runs all three levels at once. Inside each folder, the path mirrors the source, so `lib/events.ts` is tested by `tests/unit/lib/events.test.ts`. Tests import the code through the `@/` alias.
  - `e2e/` holds the Playwright specs. `npm run test:e2e` runs them, independently of `npm test`.

  ```
  tests/                Vitest: npm test
    vitest.setup.ts     jest-dom matchers, ResizeObserver stub, cleanup
    unit/               Node: lib/, scripts/, API route handlers (api/)
    component/          jsdom: one component, dependencies stubbed
    integration/        jsdom or Node: audio playback, services/ with ExecuteQuery mocked
  e2e/                  Playwright: npm run test:e2e (*.spec.ts)
  ```
- **`vitest.config.ts`:**
  - Includes `tests/**/*.test.{ts,tsx}`. Playwright specs are in `e2e/` and named `*.spec.ts`, so Vitest never picks them up.
  - Keeps `node` as the default environment.
  - Component and integration test files opt in to the DOM with a `// @vitest-environment jsdom` comment at the top, so each file shows which environment it uses.
  - `setupFiles: ["./tests/vitest.setup.ts"]`. Besides the jest-dom matchers, the setup adds a no-op `ResizeObserver` (the Radix slider needs one and jsdom has none) and unmounts components after each test.
- **`playwright.config.ts`:**
  - `testDir: "e2e"`
  - `baseURL` from the `E2E_BASE_URL` environment variable.
  - Without `E2E_BASE_URL`, Playwright starts its own dev server on port 3100. Next.js refuses to start a second dev server in the same folder, so **when a dev server is already running, point the tests at it**, e.g. `E2E_BASE_URL=http://localhost:3001 npm run test:e2e`.
  - Two projects: `desktop` (Chromium) and `mobile` (Pixel 7, runs `mobile.spec.ts` only).
  - Needs `CF_API_URL` and `CF_AUTH` from `.env.local`, because the tests use live Contentful.
- **npm scripts:** `test` (unchanged, `vitest run`), `test:watch` (`vitest`), `test:e2e` (`playwright test`)

### Phase 1: Unit tests (Vitest, node environment)

**`lib/events.ts`**
- `getEventSlug` and `getEventPath`: spaces, repeated hyphens, upper case, and URL encoding of special characters
- `summarizeEventRecordings`:
  - missing, malformed and out-of-range durations (e.g. `"1:75"`) mean no total duration is shown
  - the `h`/`m`/`s` total formatting
  - one shared masjid versus mixed masjids
  - recordings on the same day versus several days, in the Mauritius time zone
- `createEventDirectoryEntry`:
  - a date range within one year and across two years
  - the badge date uses the start date unless the event crosses years
  - an entry with no dated recordings

**`lib/utils.ts`**
- `toISODuration`, including the throw for bad input
- `formatTime`, `cleanDescription`, `createQueryString`, `arrayify`, `toTitleCase`

**`lib/og/title-font-size.ts`**
- `getOgTitleFontSize` on each side of every boundary: 60, 100, 160 and 240 characters

**Helpers to move out first** (a small refactor that doesn't change behaviour):
- `getPageNumbers(currentPage, totalPages)` moves to a new `lib/pagination.ts`. Test: up to 5 pages, near the start, in the middle and near the end.
- `groupEventsByYear` moves from `app/events/page.tsx` to `lib/events.ts`. Test: grouping by year in order, and undated events going last under "Other events".
- `selectUniqueBayaan` is exported from `services/bayaans/bayaan.service.ts`. Test: earlier lists take priority, duplicates are removed, and the limit is respected.

**API route handlers** (call the exported `GET` or `POST` directly with a `NextRequest`):
- `app/api/download/route.ts`, with `fetch` mocked:
  - 400 when `url` is missing
  - 403 for a host other than `ctfassets.net`
  - 400 for a malformed URL (bug)
  - 500 when the upstream response isn't OK
  - `Content-Type` and `Content-Disposition` passed through on success
- `app/api/webhook/revalidate/route.ts`, with `@contentful/node-apps-toolkit` and `next/cache` mocked:
  - 401 when the signature check fails
  - on success, `revalidatePath` is called for `/`, `/events`, the event layout and `/audio/{slug}`
  - `revalidateTag("audio:{id}")` is called with the real entry id (bug)
- `app/api/bayaans/route.ts`, with the service mocked:
  - query parameters are passed to `getBayaansWithPagination`
  - a 500 JSON error when the service throws

### Phase 2: Component tests (Vitest + React Testing Library, jsdom, dependencies stubbed)

**`components/audio-card.tsx`** (stub `./audio-player`)
- The title links to `/audio/{slug}`.
- The download link points to `downloadSrc`, and the share link to `whatsAppLink`.
- Category pills render, and no stray "0" appears when there are no categories.
- Clicking Download shows the "Download started" toast (stub `sonner`).

**`components/header.tsx`** (mock `usePathname` from `next/navigation`)
- `aria-current="page"` is on Home for `/` and `/audio/x`, on Events for `/events/x`, and on About for `/about`.
- The mobile menu button opens and closes the menu.

**`components/audio-list.tsx`** (mock `useRouter`, `useSearchParams` and `usePathname`; pass an already-resolved promise and render inside `<Suspense>`)
- The search box shows the current `searchQuery`.
- With results, "Showing 1–N of T lectures" is correct. With 0 results, the count is hidden and "No lectures found" shows.
- Typing in the search box calls `router.push` with `search=` after the debounce (fake timers). Leaving the box triggers the push straight away.
- Clicking a region tab pushes `type=`.
- Clicking a page number or Next pushes `page=`. Previous is disabled on page 1.

**`components/audio-player/audio-detail-player.tsx`** (the lecture page's player; `useAudio` replaced by a fake)
- Ready state: Play, `0:00` and the lecture length.
- Play asks the player to play this lecture; Pause and the position show while it plays; another lecture's position is ignored.
- Loading state while buffering; the skip buttons skip 15 seconds; Download has the right link and shows the toast.

### Phase 3: Integration tests (real hooks and state; only the outer boundary mocked)

**Audio playback:** `AudioProvider` with real `AudioCardPlayer` and `AudioPlayer` parts
- Stub `HTMLMediaElement.prototype.play` and `.pause`. jsdom doesn't play media, so media events (`play`, `pause`, `loadedmetadata`, `ended`) are dispatched by hand.
- Clicking Play starts the track, and the button switches to Pause. Clicking again pauses.
- With two cards, starting the second one leaves the first showing Play.
- With `localStorage.audioTime` already set for a track, playing it resumes at the saved time once `loadedmetadata` fires.
- While playing, progress is saved every 3 seconds (fake timers). On `ended` it is removed.
- Skip ±15s, stopping at the start and the end; a skip button on a lecture that isn't playing starts it instead.
- The progress slider moves the playing lecture, and starts a lecture that isn't playing.
- Loading spinner while buffering (only on the buffering lecture); an audio error returns to Play; the end of a lecture resets it to `0:00`.
- Pressing Play again resumes without reloading; when the browser blocks playback, the button stays on Play.
- `useAudio` controls no component uses yet (`toggle`, `pause`, `seek`), the length learned from `durationchange`/`canplay`, and the clear errors when `useAudio` or a player part is used outside its provider.

**Contentful service layer** (mock `ExecuteQuery` with `vi.mock("@/services/apollo/apollo.service")`)
- `getEventDirectory`:
  - pages through results with `limit`/`skip`
  - merges event names that share a slug
  - sorts the newest first, with undated events last
  - throws when the collection is missing
- `getEventBySlug`: finds the matching names, and returns `undefined` when none match.
- `getEventSummary`: pages through all recordings, and throws on an empty page before the total is reached.
- `getRelatedBayaans`: puts same-event lectures first, then same-category, then random; removes duplicates; returns at most 4.
- These functions are wrapped in React's `cache()`. Reset modules between tests (`vi.resetModules()` and a fresh import) so a cached result doesn't leak into the next test.

### Phase 4: End-to-end tests (Playwright, live Contentful, critical journeys only)

Contentful content changes, so assertions check structure and behaviour, never specific lecture titles. Each test reads what it needs from the page, for example the first card's title.

| # | Journey | What it checks |
|---|---|---|
| 1 | Home and search | The lecture grid renders. Typing a search updates `?search=` and shows results or the empty state. After a reload, the search box still shows the term. |
| 2 | Region tabs | Clicking "Guest" sets `type=international` and the list changes. |
| 3 | Playback | Playing a card switches the button to Pause and the time moves forward. Pausing and playing again resumes rather than restarting. |
| 4 | Lecture page | Opening a card's title goes to `/audio/{slug}`. The `h1` matches the card title, the player is present, and "More Lectures" lists lectures. The page's OG image returns `image/png`. |
| 5 | Events | `/events` lists events under year headings. Opening one shows its lectures. Pagination works when there is a second page. |
| 6 | Download | A card's download link goes through `/api/download`. Requesting it returns 200 with `Content-Disposition: attachment`. |
| 7 | Not found | `/events/does-not-exist` returns 404. `/audio/does-not-exist` shows "Audio Not Found". |
| 8 | Mobile navigation | In the Pixel project, the menu button opens the menu and its links go to Events and About. |
| 9 | About | `/about` shows its heading, the Mission, Values and Get in Touch sections, and a Contact Us email link; the header marks About as the current page. |

### Unit-test review (2026-11-05)

A review of edge cases after phases 0–4 found more bugs. Each now has a test that failed before the fix:

| Area | Problem | Fix |
|---|---|---|
| `app/page.tsx`, events pages, OG preview, `/api/bayaans` | `?page=abc` became `NaN` on the home page; the home page computed valid dates and then sent the raw ones to Contentful; the events pages each had their own copy of the page check. | Shared `parsePageParam` and `parseDateParam` in `lib/search-params.ts`. Dates must be a real `YYYY-MM-DD` date (strict: `2026-13-45` is rejected, not rolled over to 2027). |
| `components/audio-list.tsx` | Searching or switching region kept the page number, often landing on an empty page; clearing the search left `search=` in the URL. | New filters reset to page 1, and an empty search removes the parameter. |
| `lib/utils.ts` | `toISODuration("0:00")` returned the invalid `"PT"`; `cleanDescription` showed `<p> </p>` / `<p><br/></p>` as a description. | Returns `"PT0S"`; any paragraph with only spaces, `&nbsp;` or `<br>` counts as empty. |
| `app/api/webhook/revalidate/route.ts` | A missing `CF_WEBHOOK_SECRET` was read once at startup and passed on as `undefined`; a signed body that wasn't JSON threw. The test never checked what was passed to the signature check. | Fails closed with 500 when the secret is missing; 400 for invalid JSON; the test now checks the secret and the exact request passed to `verifyRequest`. |
| `contexts/audio-context.tsx` | If the browser refused to save (`setItem` throws: storage full, private mode), the error escaped every 3 seconds while playing; saved data like `null` crashed reading. | Storage helpers moved to `lib/listening-progress.ts`, which contains every storage failure. Storage format unchanged. |

Behaviour that is tested **as it is**, on purpose:
- Event slugs keep stray hyphens (`"- Seerah -"` → `-seerah-`), so existing event URLs don't change.
- A `0:00` lecture duration counts as unknown, so the event shows no total length.
- `groupEventsByYear` expects events sorted newest first.

## 3. Deliberately not tested

Following the strategy's advice to go for distinct coverage rather than repeating the same checks:

- **shadcn primitives in `components/ui/*`:** library code that we don't change.
- **OG image layout:** only a smoke test that the route returns an image (journey 4). Pixel-level layout isn't checked.
- **`lib/audio-data.ts`:** static data that no code imports.
- **`app/api/_audio/route.ts`:** the folder name starts with `_`, so Next.js doesn't serve it as a route.

## 4. Running the tests

| Command | Runs |
|---|---|
| `npm test` | Unit, component and integration tests (Vitest) |
| `npm run test:watch` | The same, re-running on change |
| `npm run test:coverage` | The same, plus a coverage report in the terminal and in `tests/coverage/index.html`. Pages under `app/` show 0% because only end-to-end tests reach them. |
| `npm run test:e2e` | End-to-end tests (Playwright). Needs `.env.local` with the Contentful variables. If a dev server is already running, add `E2E_BASE_URL=http://localhost:<port>` in front. |
| `npx playwright show-report e2e/playwright-report` | Open the HTML report of the last end-to-end run. |
| `npx playwright show-trace e2e/test-results/<test>/trace.zip` | Step through a failed end-to-end test (traces are kept for failures only). |
