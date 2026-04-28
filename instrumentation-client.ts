import posthog from "posthog-js"

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

if (posthogProjectToken) {
  posthog.init(posthogProjectToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  })
}
