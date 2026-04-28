<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Ulama Moris Next.js (App Router) project. PostHog is initialized client-side via `instrumentation-client.ts` using a reverse proxy through Next.js rewrites, with error tracking enabled. A server-side PostHog client in `lib/posthog-server.ts` handles API route tracking. Eleven events are captured across audio playback, downloads, sharing, search, filtering, and pagination.

## Files created

| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialization with reverse proxy & error tracking |
| `lib/posthog-server.ts` | Server-side PostHog singleton client |

## Files modified

| File | Change |
|------|--------|
| `next.config.mjs` | Added `/ingest/*` reverse proxy rewrites for PostHog |

## Event tracking

| Event | Description | File |
|-------|-------------|------|
| `audio_played` | User clicks play on a lecture | `components/audio-player/audio-player.tsx` |
| `audio_paused` | User pauses a playing lecture | `components/audio-player/audio-player.tsx` |
| `audio_seeked` | User seeks to a position in the audio player | `components/audio-player/audio-player.tsx` |
| `audio_downloaded` | User downloads an audio from the lecture card | `components/audio-card.tsx` |
| `audio_shared_whatsapp` | User shares a lecture via WhatsApp | `components/audio-card.tsx` |
| `audio_downloaded_detail` | User downloads audio from the detail player | `components/audio-player/audio-detail-player.tsx` |
| `lecture_searched` | User performs a search on the lectures list | `components/audio-list.tsx` |
| `lecture_filter_changed` | User switches between local/international filter | `components/audio-list.tsx` |
| `lecture_page_changed` | User navigates to another page in the lecture list | `components/audio-list.tsx` |
| `article_searched` | User performs a search on the articles list | `components/article-list.tsx` |
| `audio_download_requested` | Server-side: download API route served a file | `app/api/download/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/401002/dashboard/1519365
- **Audio Plays Over Time** (daily trend of play events): https://us.posthog.com/project/401002/insights/cH8TQP7P
- **Download Conversion Funnel** (play → download conversion rate): https://us.posthog.com/project/401002/insights/nBXmeWHZ
- **Search Activity** (lecture & article search trends): https://us.posthog.com/project/401002/insights/xIOiu7Oq
- **WhatsApp Shares vs Downloads** (content sharing breakdown): https://us.posthog.com/project/401002/insights/x6jKztuG
- **Region Filter Usage** (local vs international preference): https://us.posthog.com/project/401002/insights/I5eGcnqU

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
