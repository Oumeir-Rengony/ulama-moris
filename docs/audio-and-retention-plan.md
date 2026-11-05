# Audio playback and retention plan

Status: not implemented. The retention items (3 and 4) were built once and then reverted so they could be analysed further. The caveats found during that attempt are listed under each item.

## How audio works today

You need this to implement any item below.

- **Audio state:** `contexts/audio-context.tsx` provides `AudioProvider` and `useAudio()`. Each provider creates one `new Audio()` element in an effect and calls `audio.pause()` in that effect's cleanup.
- **Where the providers are mounted:** each page mounts its own `AudioProvider`. None is in `app/layout.tsx`.
  - `app/page.tsx` (homepage, wraps `AudioList` inside `<Suspense>`)
  - `app/audio/[slug]/page.tsx` (wraps `AudioDetailPlayer`)
  - `app/events/[slug]/page.tsx` (wraps the grid of `AudioCard`)
- **Player components:** `components/audio-player/audio-player.tsx` is a compound component (`Root`, `PlayPause`, `Progress`, `Time`, `CurrentTime`, `Duration`, `SeekBackward`, `SeekForward`, `Controls`).
  - `Root` builds an `AudioTrack` (`id`, `src`, `title?`, `author?`) and passes it to its children through `RootContext`.
  - `components/audio-player/audio-card-player.tsx` (used by `components/audio-card.tsx`) passes only `id`, `audioSrc` and `duration` to `Root`, so cards never supply a title or author.
  - `components/audio-player/audio-detail-player.tsx` does not pass a title or author to `Root` either, although it receives `title`.
- **Saved progress:**
  - Stored in the localStorage key `audioTime` (`CONFIG.localstorageKey.audioTime`), as `{ [trackId]: seconds }`.
  - Written every 3 seconds while playing, removed on `ended`, and read in `playTrack` to resume.
  - No UI reads it.
- **Header links:** `components/header.tsx` uses plain `<a href>` for Home, Events and About, so every header click reloads the whole page.
- **Audio URLs:** cards use `${audio.url}?t=${audio.sys.publishedAt}&tag=audio:${audio.sys.id}` (built in `components/audio-list.tsx` and `app/events/[slug]/page.tsx`). The detail page uses the bare `audio.url`. Both use the bayaan `sys.id` as the track id.
- **Caching:**
  - The homepage, `/events` and `/events/[slug]` use `revalidate = 86400`.
  - `/audio/[slug]` is `force-static`.
  - Contentful changes are pushed through `app/api/webhook/revalidate/route.ts`.
- **Data:** bayaan fields come from `services/bayaans/query/bayaan.fragment.ts`. Its `sys` block currently only selects `id`.

## High priority

### 1. Audio playback breaks on navigation

- `AudioProvider` is mounted per page and unmounts on route changes, which triggers `audio.pause()`.
- The header uses `<a href>` instead of `next/link`, which causes full page reloads.
- **Fix:** move `AudioProvider` to `app/layout.tsx`, switch to `next/link`, and add a sticky mini-player (title, play/pause, progress) that persists across pages.

Context and caveats:
- The three per-page providers listed above would have to go. A nested provider would create a second `<audio>` element and a separate `useAudio()` state.
- The mini-player needs a title and author for the current track. As noted above, `AudioCardPlayer` and `AudioDetailPlayer` don't currently pass them to `AudioPlayer.Root`.
- Any link that is still a plain `<a href>` reloads the page and stops audio, even with the provider in the layout. That includes the header logo, the header nav and the "Back to all lectures" links.
- `app/layout.tsx` is a server component. `AudioProvider` is a client component (`"use client"`).

### 2. Missing lock-screen and background audio controls

- The code never uses the Media Session API (`navigator.mediaSession`).
- On mobile, users don't see lecture details on the lock screen, have no playback controls there, and headphone controls are limited.
- **Fix:** implement the Media Session API for lock-screen, notification and headset controls.

Context and caveats:
- Media Session metadata needs a title and artist. Right now the current `AudioTrack` usually has neither, for the same reason as in item 1.
- The site treats every visitor as mobile: `isMobile = true` is hard-coded in `app/page.tsx`.
- The context already exposes `toggle`, `pause`, `skipBackward`, `skipForward` and `seekImmediate`, which the media session action handlers can use.

## User retention improvements

### 3. Expose saved listening progress

Progress is already stored in localStorage but not shown in the UI.

Add:
- a "Continue listening" section on the homepage
- a progress indicator or "X min left" label on partially completed lectures

Caveats found during the first implementation:
- **Hydration mismatch:**
  - On the homepage, `AudioList` (and so every `AudioCard`) sits inside `<Suspense>` and hydrates after `AudioProvider`'s effects have already run.
  - Any state derived from localStorage that the cards render (saved time, slider position, "min left") is therefore different from the server HTML on the cards' first client render.
  - React reported "Hydration failed because the server rendered HTML didn't match the client".
- **Old entries have no details:** existing `audioTime` entries are plain numbers (seconds), with no title, slug, author or length. Visitors' existing data is in this format, so those lectures can't be shown or linked in "Continue listening" as they are.
- **Track details are missing:** to show "Continue listening" without another fetch, the saved entry needs the title, slug, author, audio URL and length. None of these reach the context today (see "How audio works today").
- **Length isn't stored:** the `duration` field from Contentful is a display string (e.g. `"24:53"`). The real length in seconds is only known from the `<audio>` element after metadata loads, and it isn't stored today.
- **Positions can be stale:** progress is only written while playing, every 3 seconds. Pausing can leave the saved position up to 3 seconds behind.
- **Duplicates and reordering:**
  - A lecture in "Continue listening" can also appear in the "Latest lectures" grid on the same page. Both are bound to the same track id.
  - If the row is sorted by last played, it reorders while a lecture is playing.
- **Placement on mobile:** below the hero, the row is off-screen on first load at 390px width.
- **Interaction with item 1:** if item 1 is done first, the homepage provider structure changes. The `<Suspense>` hydration timing above still applies to anything in `AudioList`.

### 4. Highlight new content

Status: built (a gold star "New" seal on cards) and then removed on 2026-11-05 at the owner's request. The caveats below still apply if the idea comes back.

Add a "New" badge for lectures published within the last 7 days.

Context and caveats:
- **Use `sys.firstPublishedAt`:**
  - The bayaan `date` field is when the lecture was given, not when it was uploaded, so it must not be used.
  - Contentful's `sys.publishedAt` changes every time the entry is republished (edited), so it must not be used either.
  - Use `sys.firstPublishedAt`. It is available on the GraphQL `sys` block but isn't selected in `bayaan.fragment.ts` yet.
  - Checked against Contentful on 2026-11-05: "A Country on Fire: Analysis and Lessons" has `date` 2026-10-16, `firstPublishedAt` 2026-11-03 and `publishedAt` 2026-11-04.
- **Caching:** list pages are cached for up to 24 hours. A server-side "is new" check freezes until the next revalidation, and differs from a browser-side check made at a different time, which causes a hydration mismatch.
- **Card header:** `components/audio-card.tsx` only renders its header row (where the category pills are) when the lecture has categories. A badge placed in that row is hidden for lectures with no category. (The stray `0` this row used to render is fixed.)
- **Where to show it:** cards are rendered in two places, `components/audio-list.tsx` and `app/events/[slug]/page.tsx`. Both need the new prop. The related-lecture cards on `/audio/[slug]` use a separate `RelatedLectureCard` component.

## Testing notes

- **Unit tests:** `npm test` (vitest) only covers the sitemap builder.
- **Linting:** `npm run lint` fails because the repo has no `eslint.config.*`.
- **Type check:** `npx tsc --noEmit -p .`.
- **Browser checks:**
  - `playwright-cli` is installed globally. The flow used was: start `next dev`, play a card, wait, pause, reload, then read `localStorage.audioTime` and the browser console for hydration errors.
  - Check the homepage, `/audio/[slug]` and `/events/[slug]`, at both desktop and 390px width.
- **Querying Contentful directly:** `CF_API_URL` and `CF_AUTH` in `.env.local` (`Authorization: Bearer …`).
