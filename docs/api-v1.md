# `/api/v1`: the mobile app API

For agents and developers changing this codebase.

**The Ulama Moris mobile app depends on this API.** The app is a separate codebase, and copies already installed on phones can't all be updated at once. A change here reaches every installed app as soon as it's merged to `main`, which deploys automatically. If a change breaks the API, the app breaks for users, and nothing in this repo will warn you.

Before you change anything under `app/api/v1/` or `lib/mobile-app/`, or a service or query those files call (`services/bayaans/*`, `lib/events.ts`), read [Changing the API](#changing-the-api).

## What it is

A read-only JSON API over the same Contentful data as the website. It returns data already shaped like the app's `Lecture` and `EventSummary` types, so the app only fetches and renders.

| | |
|---|---|
| Base URL | `https://www.ulama-moris.org/api/v1` (local: `http://localhost:3000/api/v1`) |
| Methods | `GET` only. There is no `OPTIONS` handler. |
| Auth | None |
| Response type | `application/json` |
| Headers | `Cache-Control: no-store` and `Vary: Origin` on every response, including errors |
| CORS | `Access-Control-Allow-Origin` is set only for `http://localhost:8081` (Expo dev server, development only) and the origin in `APP_WEB_ORIGIN`. Only the app's web build needs it; native iOS and Android requests send no `Origin`. |

| Endpoint | App screen | Paged | Source |
|---|---|---|---|
| `GET /lectures` | Home list, series filter, lecture search | Yes | `app/api/v1/lectures/route.ts` |
| `GET /lectures/{slug}` | Now Playing, deep links, reminder taps | No | `app/api/v1/lectures/[slug]/route.ts` |
| `GET /events` | Events tab, event search | Yes | `app/api/v1/events/route.ts` |
| `GET /events/{slug}` | Event detail | No (an event holds at most 10 lectures) | `app/api/v1/events/[slug]/route.ts` |

Shared code:

| File | Role |
|---|---|
| `lib/mobile-app/convert.ts` | The `AppLecture` and `AppEvent` shapes, `isUsableBayaan`, `toAppLecture`, `toAppEvent`, series name mapping, event title search. |
| `lib/mobile-app/response.ts` | `appApiSuccess` and `appApiError`. They set the headers above. Every response must go through one of them. |
| `lib/mobile-app/limit-param.ts` | `parseLimitParam`. |
| `lib/search-params.ts` | `parsePageParam`, shared with the website. |

## Response shapes

These are the types the app codes against. `AppLecture` and `AppEvent` in `lib/mobile-app/convert.ts` must stay identical to them.

```ts
type Series = "local" | "guest" | "islahi-majlis";

type Lecture = {
  id: string;                 // Contentful sys.id. The app's list key.
  slug: string;               // Always set. The app's identity for resume points, queue, deep links.
  title: string;              // Always set. Used for every row and its "Play …" label.
  author: string | null;      // App hides the author line when null.
  date: string | null;        // ISO 8601, +04:00. App leaves the date out when null.
  duration: string | null;    // "MM:SS" or "H:MM:SS" as typed by editors. Display only.
  masjid: string | null;
  url: string;                // Always set. Direct audio file on *.ctfassets.net.
  series: Series | null;
  event: string | null;       // Title of the event the lecture belongs to.
  eventSlug: string | null;   // Set whenever event is set.
  category: string[];         // Always an array, possibly empty.
};

type EventSummary = {
  slug: string;
  title: string;
  total: number;                // Lectures in the event, 0 for a new event.
  duration: string | null;      // "2h 34m"; null if any lecture has no usable duration.
  location: string | null;      // Only when every lecture was at the same masjid.
  dateRange: string | null;     // "24 Oct – 31 Oct 2026"
  dateRangeLong: string | null; // "24 – 31 October 2026"
  year: string | null;          // Year of the most recent lecture.
  day: string | null;           // Date badge: start date, or last date if the event spans two years.
  month: string | null;
  latestTime: number;           // Epoch ms of the most recent lecture; 0 if none is dated.
};

type Page<T> = { items: T[]; total: number; page: number; hasMore: boolean };
type ApiError = { error: string };
```

```
GET /api/v1/lectures?page=1&limit=10&type=guest&search=sabr
  → Page<Lecture>                                  | 400 | 500

GET /api/v1/lectures/{slug}
  → Lecture (not wrapped)                          | 404 | 500

GET /api/v1/events?page=1&limit=10&search=seerah
  → Page<EventSummary>                             | 500

GET /api/v1/events/{slug}
  → { event: EventSummary, lectures: Lecture[] }   | 404 | 500
```

Example lecture, as returned today:

```json
{
  "id": "2Lj8Tjw39fHLd4br7v2ObJ",
  "slug": "sacrifices-of-the-sahaba-radiyallahu-anhum-for-islam",
  "title": "Sacrifices of the Şahābā Radiyallāhu 'Anhum for Islam",
  "author": "Mawlana Zyad Ally Quenette",
  "date": "2026-10-31T20:15:00.000+04:00",
  "duration": "46:21",
  "masjid": "MASJID MUSWALLA, HIGHLANDS",
  "url": "https://assets.ctfassets.net/n7lbwg9xm90s/xtKHdICdGePSFGwWeF6sU/2c2c6bf9726cc1821d7c767dd52a7449/b4e8c60f-d0e4-41b1-a309-3b113785f976.m4a",
  "series": "local",
  "event": "The Sahaba Radiyyallahu Anhum",
  "eventSlug": "the-sahaba-radiyyallahu-anhum",
  "category": ["sahaba r.a"]
}
```

## Behaviour the app depends on

Each rule below is something the app's code relies on. Breaking any of them is a breaking change.

### Values

- **Missing values are `null`**, never `""` or left out. `category` is the exception: always an array. Text is trimmed (`textOrNull` in `convert.ts`).
- **Lectures without a slug, title or audio URL are never returned**, from any endpoint. `isUsableBayaan` checks this, and every route that returns lectures must call it before `toAppLecture`. `toAppLecture` assumes the check passed and calls `.trim()` on those three fields.
- **Series names are the app's, not Contentful's.** Contentful's `local` field holds `"local"`, `"international"` and `"islahi majlis"`. The API takes and returns `local`, `guest` and `islahi-majlis`. Convert with `toContentfulSeries` (incoming `type`) and `toAppSeries` (outgoing `series`). A lecture tagged with several series reports the first one.
- **Dates are Mauritius time.** `date` keeps Contentful's `+04:00` offset. Event date fields are computed in Mauritius time by `lib/events.ts`, the same code the website's event pages use, so the app and the website show the same dates.

### Paging (`/lectures` and `/events`)

- `page`: 1-based, default `1`. `limit`: default `10`, capped at `50`. Anything that isn't a positive whole number falls back to the default. **Bad values never cause an error.**
- `/lectures` pages in Contentful (`limit`, `skip = (page - 1) * limit`, ordered `date_DESC`).
- `/events` loads every event with `getEventDirectory()` (cached), filters by search and slices in memory. Events are ordered by `latestTime`, newest first, so undated events come last.
- **The app stops on `hasMore`, never on `total`**, because Contentful reports `total: 0` past the last page.
- **`hasMore` on `/lectures` counts what Contentful returned, not what was kept** after `isUsableBayaan`: `skip + collection.items.length < collection.total`. Counting kept items would make a last page with a skipped lecture report another, empty page.
- **`total` is for display only.** On `/lectures` it can be slightly higher than what the app can load, because skipped lectures are still counted.
- Pages are offset based. The app removes duplicates by `id` (lectures) or `slug` (events) when appending. Don't change the default order of either list; the app's dedupe and year grouping assume newest first.

### Filters

- `/lectures?type=`: `local`, `guest` or `islahi-majlis`. Any other non-empty value returns **400** `{ "error": "Unknown type \"…\"" }`. Values are case-sensitive. An empty or missing `type` means no filter.
- `/lectures?search=`: Contentful `title_contains` on the lecture title, which ignores case and accents (`sahaba` finds "Şahābā"). Trimmed; empty means no filter.
- `/events?search=`: event title only. Events are filtered in memory, so `eventTitleMatchesSearch` copies Contentful's case- and accent-insensitive matching (NFD, strip marks, lowercase).
- `type` and `search` can be combined. `/events` has no `type`.

### Single items

- `GET /lectures/{slug}` returns the lecture itself, not wrapped. It returns **404** `{ "error": "Lecture not found" }` both for an unknown slug and for a lecture that fails `isUsableBayaan`. **This 404 can be temporary**: `getBayaanBySlug` can't tell "no such lecture" apart from a Contentful failure (`ExecuteQuery` returns missing data instead of throwing). The app shows a Retry button for it.
- `GET /events/{slug}` returns `{ event, lectures }`. `lectures` holds the event's lectures, newest first, fetched by id. It's `[]` for an event with no lectures, which is valid. Its 404 `{ "error": "Event not found" }` is reliable, because `getEventBySlug` throws on a Contentful failure, which returns 500.
- **The event summary describes every recording**, the same as the website's event page. `event.total`, `duration` and the dates include lectures that `isUsableBayaan` filtered out of `lectures`, so `lectures.length` can be lower than `event.total`.

### Errors

| Status | When | Body |
|---|---|---|
| `400` | `/lectures` with an unknown `type` | `{ "error": "Unknown type \"…\"" }` |
| `404` | `/lectures/{slug}`: not found or not usable | `{ "error": "Lecture not found" }` |
| `404` | `/events/{slug}`: not found | `{ "error": "Event not found" }` |
| `500` | Contentful failed or returned no data | `{ "error": "Failed to fetch lectures" }` (or `lecture`, `events`, `event`) |

The app acts on the status code. The message is only logged. Every route must check for a missing `bayaanCollection` and return 500, because `ExecuteQuery` uses `errorPolicy: "all"` and reports Contentful errors as missing data.

### Freshness

- Data comes from the same `'use cache'` service functions as the website, tagged `contentful`. The Contentful webhook (`/api/webhook/revalidate`) clears that tag on publish, so the app sees a change as soon as the website does.
- **Responses must stay `Cache-Control: no-store`.** The webhook clears the server cache but can't clear a CDN or HTTP cache, so any HTTP caching would let the app show old content after the website updates. The app relies on this and has no HTTP cache of its own.

## Changing the API

### Safe changes

- Adding a new field to `Lecture` or `EventSummary`. The app ignores fields it doesn't know. A new field should follow the same rules: `null` when missing, trimmed text.
- Adding a new optional query parameter whose absence keeps today's behaviour.
- Adding a new endpoint under `/api/v1`.
- Fixing a bug so the code matches the behaviour described here.
- Internal refactors that leave every response byte-for-byte the same.

### Breaking changes (not allowed in v1)

- Removing or renaming a field or a query parameter.
- Changing a field's type, or making a non-null field nullable (for example letting `slug`, `title` or `url` be `null` again).
- Returning `""`, leaving a field out, or sending `category: null`.
- Changing a status code, or the shape of an error body.
- Changing a series name, or accepting Contentful's names (`international`) for `type`.
- Wrapping `GET /lectures/{slug}` in an object, or changing the `{ items, total, page, hasMore }` envelope.
- Changing the default sort order, the default `limit` or the cap of 50.
- Adding HTTP caching, or requiring auth or custom headers. A custom request header would force a CORS preflight, and there is no `OPTIONS` handler.
- Changing `lib/events.ts` in a way that changes event date strings, `duration` format or `latestTime`. The website and the app share it.

A breaking change needs `/api/v2`, served next to v1 until the app no longer calls v1. Talk to the mobile app's maintainers first.

### Watch for indirect changes

The API reuses website code, so a website change can change the API without touching `app/api/v1/`:

- `services/bayaans/query/bayaan.fragment.ts`: the fields `toAppLecture` reads.
- `services/bayaans/query/bayaan.query.ts`: order, search and series filter for `/lectures`.
- `services/bayaans/event.service.ts` and its queries: `getEventDirectory` (order, which events are included) and `getEventBySlug`.
- `lib/events.ts`: every `EventSummary` field.
- `lib/search-params.ts`: `page` parsing.
- `next.config.mjs` and the webhook route: freshness.

### Checklist for any change here

1. Keep `AppLecture` and `AppEvent` in `convert.ts` matching the types in [Response shapes](#response-shapes). If you add a field, update this doc.
2. Route tests: `tests/unit/api/v1-lectures.test.ts` and `tests/unit/api/v1-events.test.ts` (services mocked). Shape tests: `tests/unit/lib/mobile-app/convert.test.ts`. Add a test for every new rule or edge case.
3. Run `npm test` and `npx tsc --noEmit`. `next build` doesn't type check (`ignoreBuildErrors: true`), so a type mismatch between `AppLecture` and the app's types won't stop a deploy.
4. Check real responses:

   ```bash
   npm run dev
   curl -s 'http://localhost:3000/api/v1/lectures?limit=2' | jq
   curl -s 'http://localhost:3000/api/v1/lectures?type=guest&limit=1' | jq
   curl -s 'http://localhost:3000/api/v1/lectures?page=999' | jq
   curl -s 'http://localhost:3000/api/v1/events?limit=2' | jq
   curl -s -i 'http://localhost:3000/api/v1/lectures/nope'
   ```

5. If the change affects what the app sees, tell the mobile app's maintainers.
