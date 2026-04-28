<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Ulama Moris Next.js application (App Router, v16.2.0). PostHog is initialized client-side via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.mjs` to improve reliability and bypass ad blockers. A server-side PostHog client (`lib/posthog-server.ts`) handles event capture from API routes and server components. Eight events are now tracked across six files, covering the core user journey from content discovery through playback, download, and sharing.

| Event | Description | File |
|---|---|---|
| `audio_played` | User presses play on an audio track | `components/audio-player/audio-player.tsx` |
| `audio_downloaded` | User clicks the download button on an audio card | `components/audio-card.tsx` |
| `audio_shared` | User clicks the WhatsApp share button on an audio card | `components/audio-card.tsx` |
| `lecture_searched` | User submits a search query in the lecture list | `components/audio-list.tsx` |
| `lecture_filter_changed` | User switches between local/international region filters | `components/audio-list.tsx` |
| `audio_detail_viewed` | User views an audio lecture detail page (top of funnel) | `app/audio/[slug]/page.tsx` |
| `article_detail_viewed` | User views an article detail page (top of funnel) | `app/articles/[slug]/page.tsx` |
| `audio_download_requested` | Server-side: download API route processes a file request | `app/api/download/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/401002/dashboard/1519532
- **Audio plays over time**: https://us.posthog.com/project/401002/insights/NGF6GO0m
- **Content engagement overview** (plays, downloads, shares): https://us.posthog.com/project/401002/insights/0LG8lx06
- **Audio engagement funnel** (detail viewed → played → downloaded): https://us.posthog.com/project/401002/insights/PbXzSIrC
- **Lecture searches over time**: https://us.posthog.com/project/401002/insights/J2kJlN4a
- **Top shared & downloaded lectures**: https://us.posthog.com/project/401002/insights/Tnta89LA

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
