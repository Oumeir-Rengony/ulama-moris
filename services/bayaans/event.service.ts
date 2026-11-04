import { cache } from "react";
import { getEventSlug, summarizeEventRecordings, type EventRecording } from "@/lib/events";
import { ExecuteQuery } from "@/services/apollo/apollo.service";
import EventNamesQuery from "./query/eventNames.query";
import EventSummaryQuery from "./query/eventSummary.query";

export const getEventNames = cache(async (): Promise<string[]> => {
  const names = new Set<string>();
  const limit = 1000;
  let skip = 0;
  let total = 0;

  // Resolve the slug against stored names so punctuation and capitalization survive.
  do {
    const result = await ExecuteQuery(EventNamesQuery, {
      variables: { limit, skip },
      preview: false,
    });
    const collection = result?.bayaanCollection;
    if (!collection) {
      throw new Error("Unable to load event names");
    }

    for (const item of collection.items) {
      if (item?.event?.trim()) {
        names.add(item.event);
      }
    }

    total = collection.total;
    skip += limit;
  } while (skip < total);

  return Array.from(names);
});

export const getEventBySlug = cache(async (slug: string) => {
  const names = await getEventNames();
  const matchingNames = names.filter((name) => getEventSlug(name) === slug);
  if (matchingNames.length === 0) {
    return undefined;
  }

  return { title: matchingNames[0], names: matchingNames };
});

export async function getEventSummary(names: string[]) {
  const recordings: EventRecording[] = [];
  const limit = 1000;
  let skip = 0;
  let total = 0;

  // Summary details must describe the whole event, including later lecture pages.
  do {
    const result = await ExecuteQuery(EventSummaryQuery, {
      variables: { events: names, limit, skip },
      preview: false,
    });
    const collection = result?.bayaanCollection;
    if (!collection || (collection.items.length === 0 && skip < collection.total)) {
      throw new Error("Unable to load event summary");
    }

    recordings.push(...collection.items);
    total = collection.total;
    skip += limit;
  } while (skip < total);

  return summarizeEventRecordings(recordings);
}
