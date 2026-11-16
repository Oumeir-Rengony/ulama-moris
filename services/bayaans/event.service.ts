import { cache } from "react";
import {
  createEventDirectoryEntry,
  type EventDirectoryEntry,
  type EventLecture,
} from "@/lib/events";
import { ExecuteQuery } from "@/services/apollo/apollo.service";
import EventBySlugQuery from "./query/eventBySlug.query";
import EventDirectoryQuery from "./query/eventDirectory.query";

type ContentfulEvent = {
  title?: string | null;
  slug?: string | null;
  bayaansCollection?: {
    items?: EventLecture[];
  } | null;
} | null;

export type EventDetails = {
  title: string;
  slug: string;
  bayaanIds: string[];
  recordings: EventLecture[];
};

function getEventRecordings(event: ContentfulEvent): EventLecture[] {
  return event?.bayaansCollection?.items ?? [];
}

export const getEventBySlug = cache(async (slug: string): Promise<EventDetails | undefined> => {
  const result = await ExecuteQuery(EventBySlugQuery, {
    variables: { slug },
    preview: false,
  });
  const collection = result?.eventCollection;
  if (!collection) {
    throw new Error("Unable to load event");
  }

  const event: ContentfulEvent = collection.items[0];
  const title = event?.title?.trim();
  const eventSlug = event?.slug?.trim();
  if (!title || !eventSlug) {
    return undefined;
  }

  const recordings = getEventRecordings(event);
  const bayaanIds: string[] = [];
  for (const recording of recordings) {
    if (recording?.sys?.id) {
      bayaanIds.push(recording.sys.id);
    }
  }

  return { title, slug: eventSlug, bayaanIds, recordings };
});

export async function getEventDirectory(): Promise<EventDirectoryEntry[]> {
  const events: EventDirectoryEntry[] = [];
  // Each event asks for up to 10 bayaans, so 100 events per request keeps the
  // query well inside Contentful's query complexity limit.
  const limit = 100;
  let skip = 0;
  let total = 0;

  do {
    const result = await ExecuteQuery(EventDirectoryQuery, {
      variables: { limit, skip },
      preview: false,
    });
    const collection = result?.eventCollection;
    if (!collection) {
      throw new Error("Unable to load events");
    }

    for (const event of collection.items as ContentfulEvent[]) {
      const title = event?.title?.trim();
      const slug = event?.slug?.trim();
      if (!title || !slug) {
        continue;
      }

      events.push(createEventDirectoryEntry({ title, slug }, getEventRecordings(event)));
    }

    total = collection.total;
    skip += limit;
  } while (skip < total);

  // Most recent events first; events without any dated recording go last.
  events.sort((first, second) => second.latestTime - first.latestTime);
  return events;
}
