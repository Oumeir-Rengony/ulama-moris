import type { NextRequest } from "next/server";
import { createEventDirectoryEntry } from "@/lib/events";
import { isUsableBayaan, toAppEvent, toAppLecture, type AppLecture } from "@/lib/mobile-app/convert";
import { appApiError, appApiSuccess } from "@/lib/mobile-app/response";
import { getBayaansBase } from "@/services/bayaans/bayaan.service";
import { getEventBySlug, type EventDetails } from "@/services/bayaans/event.service";

type EventRouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/v1/events/[slug]
// One event and all of its lectures, newest first, for the app's Event detail screen.
export async function GET(request: NextRequest, { params }: EventRouteContext) {
  const { slug } = await params;

  // getEventBySlug throws when Contentful fails and returns undefined when there is no such event.
  let event: EventDetails | undefined;
  try {
    event = await getEventBySlug(slug);
  } catch (error) {
    console.error("Error fetching event:", error);
    return appApiError(request, 500, "Failed to fetch event");
  }

  if (!event) {
    return appApiError(request, 404, "Event not found");
  }

  const summary = createEventDirectoryEntry({ title: event.title, slug: event.slug }, event.recordings);

  // An event can be published before any bayaan is added to it.
  if (event.bayaanIds.length === 0) {
    return appApiSuccess(request, { event: toAppEvent(summary), lectures: [] });
  }

  // The event's recordings only carry what the summary needs, so the lectures are fetched
  // in full by id. An event holds at most 10 bayaans, so no paging is needed.
  let collection;
  try {
    const result = await getBayaansBase({ bayaanIds: event.bayaanIds });
    collection = result?.bayaanCollection;
  } catch (error) {
    console.error("Error fetching event lectures:", error);
    return appApiError(request, 500, "Failed to fetch event");
  }

  // ExecuteQuery reports Contentful errors as missing data rather than throwing.
  if (!collection) {
    console.error("Error fetching event lectures: Contentful returned no bayaanCollection");
    return appApiError(request, 500, "Failed to fetch event");
  }

  // The summary above still counts every recording, like the website's event page.
  const lectures: AppLecture[] = [];
  for (const bayaan of collection.items) {
    if (!isUsableBayaan(bayaan)) {
      continue;
    }
    lectures.push(toAppLecture(bayaan));
  }

  return appApiSuccess(request, { event: toAppEvent(summary), lectures });
}
