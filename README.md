# Ulama Moris

The website at [ulama-moris.org](https://www.ulama-moris.org) for listening to Islamic lectures recorded in Mauritius. It's built with [Next.js](https://nextjs.org), and all content comes from Contentful. It also serves the read-only JSON API that the mobile app uses ([docs/api-v1.md](docs/api-v1.md)).

How the code is organised, how caching works, and the rules for changing `/api/v1` are in [AGENTS.md](AGENTS.md). Read it before making changes.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. Start new chats there to make changes, and v0 will push commits directly to this repo. **Every merge to `main` deploys automatically.**

[Continue working on v0 →](https://v0.app/chat/projects/prj_igFUt31AHGKXEsojW7Nr7E8m154d)

## Getting started

1. Create `.env.local` with at least `CF_API_URL` and `CF_AUTH` (Contentful). [AGENTS.md](AGENTS.md#environment-variables) lists all the variables.
2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000). The mobile app API is at [http://localhost:3000/api/v1/lectures](http://localhost:3000/api/v1/lectures).

## Testing

| Command | Runs |
|---|---|
| `npm test` | Unit, component and integration tests (Vitest) |
| `npm run test:watch` | The same, re-running on change |
| `npm run test:coverage` | The same, plus a coverage report in the terminal and in `tests/coverage/index.html`. Pages under `app/` show 0% because only end-to-end tests reach them. |
| `npx tsc --noEmit` | Type check. `next build` skips it (`ignoreBuildErrors: true`), so run it yourself. |
| `npm run test:e2e` | End-to-end tests (Playwright) against live Contentful. Needs `.env.local` with `CF_API_URL` and `CF_AUTH`. |
| `npm run test:e2e:production` | The production cache test. Builds the app, starts it on port 3200 and checks that the cache and the webhook work. Takes a minute or two because of the build. |
| `npx playwright show-report e2e/playwright-report` | Open the HTML report of the last end-to-end run. |
| `npx playwright show-trace e2e/test-results/<test>/trace.zip` | Step through a failed end-to-end test (traces are kept for failures only). |

Before the first end-to-end run, install a browser with `npx playwright install chromium`.

When a dev server is already running, point the end-to-end tests at it, because Next.js refuses to start a second one in the same folder:

```bash
E2E_BASE_URL=http://localhost:3001 npm run test:e2e
```

There is no CI, so run the tests before merging. Where tests live and how the app is tested are covered in [AGENTS.md](AGENTS.md#testing).
