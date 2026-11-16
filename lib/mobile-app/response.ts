import { NextResponse, type NextRequest } from "next/server";

// No response is cached by the CDN. The data under these routes is already cached on
// the server ('use cache', tagged "contentful"), and the Contentful webhook clears that
// cache on publish. A CDN copy would not be cleared by the webhook, so the app could keep
// showing old content after the website has updated.
const CACHE_CONTROL = "no-store";

// Only the app's web build needs CORS; the iOS and Android apps don't send an Origin.
// The Expo dev server runs on port 8081. Set APP_WEB_ORIGIN once the web build has an address.
function getAllowedOrigins(): string[] {
  const allowedOrigins: string[] = [];

  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:8081");
  }

  const appWebOrigin = process.env.APP_WEB_ORIGIN;
  if (appWebOrigin) {
    allowedOrigins.push(appWebOrigin);
  }

  return allowedOrigins;
}

function buildHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  headers.set("Cache-Control", CACHE_CONTROL);
  // The CORS header depends on the caller, so any cache must keep one copy per Origin.
  headers.set("Vary", "Origin");

  const origin = request.headers.get("origin");
  if (origin && getAllowedOrigins().includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

export function appApiSuccess(request: NextRequest, body: unknown): NextResponse {
  return NextResponse.json(body, { status: 200, headers: buildHeaders(request) });
}

export function appApiError(request: NextRequest, status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: buildHeaders(request) });
}
