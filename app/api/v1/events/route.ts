import type { NextRequest } from "next/server";
import { appApiError, appApiSuccess } from "@/lib/mobile-app/response";
import { eventTitleMatchesSearch, toAppEvent, type AppEvent } from "@/lib/mobile-app/convert";
import type { EventDirectoryEntry } from "@/lib/events";
import { parseLimitParam } from "@/lib/mobile-app/limit-param";
import { parsePageParam } from "@/lib/search-params";
import { getEventDirectory } from "@/services/bayaans/event.service";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function filterEventsBySearch(events: EventDirectoryEntry[], search: string): EventDirectoryEntry[] {
  if (search === "") {
    return events;
  }

  const matchingEvents: EventDirectoryEntry[] = [];
  for (const event of events) {
    if (eventTitleMatchesSearch(event.title, search)) {
      matchingEvents.push(event);
    }
  }
  return matchingEvents;
}

// GET /api/v1/events?page=1&limit=10&search=sahaba
// The app's Events tab and event search, newest first.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePageParam(searchParams.get("page") ?? undefined);
  const limit = parseLimitParam(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
  const search = searchParams.get("search")?.trim() ?? "";

  let allEvents: EventDirectoryEntry[];
  try {
    allEvents = await getEventDirectory();
  } catch (error) {
    console.error("Error fetching events:", error);
    return appApiError(request, 500, "Failed to fetch events");
  }

  const matchingEvents = filterEventsBySearch(allEvents, search);

  const skip = (page - 1) * limit;
  const pageOfEvents = matchingEvents.slice(skip, skip + limit);

  const items: AppEvent[] = [];
  for (const event of pageOfEvents) {
    items.push(toAppEvent(event));
  }

  const hasMore = skip + items.length < matchingEvents.length;

  return appApiSuccess(request, { items, total: matchingEvents.length, page, hasMore });
}
