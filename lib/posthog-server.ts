import { PostHog } from "posthog-node"

let posthogClient: PostHog | null = null
const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ??
  "https://us.i.posthog.com"

export function getPostHogClient(): PostHog | null {
  if (!posthogProjectToken) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(posthogProjectToken, {
      host: posthogHost,
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}
