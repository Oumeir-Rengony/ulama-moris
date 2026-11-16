import { getBayaanEvent, type EventDirectoryEntry } from "@/lib/events";
import type { Local } from "@/services/bayaans/bayaan.service";

// Shapes returned by the mobile app's API (/api/v1/*). They match the app's own
// `Lecture` and `EventSummary` types, so the app can use them without converting.
// Missing values are sent as null; the app turns null into "not set".

export type AppSeries = "local" | "guest" | "islahi-majlis";

export type AppLecture = {
  id: string;
  slug: string | null;
  title: string | null;
  author: string | null;
  date: string | null;
  duration: string | null;
  masjid: string | null;
  url: string | null;
  series: AppSeries | null;
  event: string | null;
  eventSlug: string | null;
  category: string[];
};

export type AppEvent = Omit<EventDirectoryEntry, "path">;

// Contentful stores the series under the website's original names. The website already
// shows "international" as "Guest", and the app uses that name for it.
const SERIES_FROM_CONTENTFUL: Record<Local, AppSeries> = {
  local: "local",
  international: "guest",
  "islahi majlis": "islahi-majlis",
};

const SERIES_TO_CONTENTFUL: Record<AppSeries, Local> = {
  local: "local",
  guest: "international",
  "islahi-majlis": "islahi majlis",
};

function toAppSeries(local: unknown): AppSeries | null {
  if (!Array.isArray(local) || local.length === 0) {
    return null;
  }

  const firstSeries = local[0] as Local;
  return SERIES_FROM_CONTENTFUL[firstSeries] ?? null;
}

// The Contentful series for an app series name, or null when the name is not one we know.
export function toContentfulSeries(appSeries: string): Local | null {
  if (!Object.hasOwn(SERIES_TO_CONTENTFUL, appSeries)) {
    return null;
  }

  return SERIES_TO_CONTENTFUL[appSeries as AppSeries];
}

function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  return trimmed;
}

// A bayaan as Contentful returns it (see BayaanFragment), turned into the app's Lecture.
// `any` because the bayaan service is untyped.
export function toAppLecture(bayaan: any): AppLecture {
  // The Event entry that lists this bayaan. Its slug is the one /api/v1/events/[slug] takes.
  const linkedEvent = getBayaanEvent(bayaan);
  let event: string | null = null;
  let eventSlug: string | null = null;
  if (linkedEvent) {
    event = linkedEvent.title;
    eventSlug = linkedEvent.slug;
  }

  let category: string[] = [];
  if (Array.isArray(bayaan.category)) {
    category = bayaan.category;
  }

  return {
    id: bayaan.sys.id,
    slug: bayaan.slug ?? null,
    title: bayaan.title ?? null,
    author: bayaan.author ?? null,
    date: bayaan.date ?? null,
    duration: textOrNull(bayaan.duration),
    masjid: textOrNull(bayaan.masjid?.title),
    url: bayaan.audio?.url ?? null,
    series: toAppSeries(bayaan.local),
    event,
    eventSlug,
    category,
  };
}

export function toAppEvent(entry: EventDirectoryEntry): AppEvent {
  return {
    slug: entry.slug,
    title: entry.title,
    total: entry.total,
    duration: entry.duration,
    location: entry.location,
    dateRange: entry.dateRange,
    dateRangeLong: entry.dateRangeLong,
    year: entry.year,
    day: entry.day,
    month: entry.month,
    latestTime: entry.latestTime,
  };
}

// Lowercase with accents removed, so "sahaba" finds "Şahābā" the way lecture search does.
function toSearchableText(text: string): string {
  const withoutAccents = text.normalize("NFD").replace(/\p{Mark}/gu, "");
  return withoutAccents.toLowerCase();
}

export function eventTitleMatchesSearch(title: string, search: string): boolean {
  return toSearchableText(title).includes(toSearchableText(search.trim()));
}
