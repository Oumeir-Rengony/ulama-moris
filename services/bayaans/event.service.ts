import { cache } from "react";
import {
  createEventDirectoryEntry,
  getEventSlug,
  summarizeEventRecordings,
  type EventDirectoryEntry,
  type EventRecording,
} from "@/lib/events";
import { ExecuteQuery } from "@/services/apollo/apollo.service";
import EventDirectoryQuery from "./query/eventDirectory.query";
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

type EventGroup = {
  title: string;
  recordings: EventRecording[];
};

export async function getEventDirectory(): Promise<EventDirectoryEntry[]> {
  const groupsBySlug = new Map<string, EventGroup>();
  const limit = 1000;
  let skip = 0;
  let total = 0;

  // Names that share a slug open the same event page, so they are listed as one event.
  do {
    const result = await ExecuteQuery(EventDirectoryQuery, {
      variables: { limit, skip },
      preview: false,
    });
    const collection = result?.bayaanCollection;
    if (!collection) {
      throw new Error("Unable to load events");
    }

    for (const item of collection.items) {
      const name = item?.event;
      if (!name?.trim()) {
        continue;
      }

      const slug = getEventSlug(name);
      let group = groupsBySlug.get(slug);
      if (!group) {
        group = { title: name, recordings: [] };
        groupsBySlug.set(slug, group);
      }
      group.recordings.push(item);
    }

    total = collection.total;
    skip += limit;
  } while (skip < total);

  const events: EventDirectoryEntry[] = [];
  for (const group of groupsBySlug.values()) {
    events.push(createEventDirectoryEntry(group.title, group.recordings));
  }

  // Most recent events first; events without any dated recording go last.
  events.sort((first, second) => second.latestTime - first.latestTime);
  return events;
}
