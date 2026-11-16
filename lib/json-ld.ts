import type { AudioObject, BreadcrumbList, Event, ListItem, Person, Place, WithContext } from "schema-dts";
import {
  getBayaanEvent,
  getEventPath,
  summarizeEventRecordings,
  type BayaanEventLink,
  type EventLecture,
} from "@/lib/events";
import { toISODuration } from "@/lib/utils";

// JSON-LD ids and urls must be absolute, and they should match the canonical urls.
const SITE_URL = "https://ulama-moris.org";

const OFFLINE_ATTENDANCE = "https://schema.org/OfflineEventAttendanceMode";

type Masjid = {
  sys?: { id: string } | null;
  title?: string | null;
  geoLink?: string | null;
} | null | undefined;

type BayaanForJsonLd = BayaanEventLink & {
  slug?: string | null;
  title?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  author?: string | null;
  date?: string | null;
  duration?: string | null;
  masjid?: Masjid;
  audio?: { url?: string | null; contentType?: string | null } | null;
};

export type BreadcrumbStep = {
  name: string;
  path: string;
};

function getAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function getAudioPath(slug: string): string {
  return `/audio/${encodeURIComponent(slug)}`;
}

// Masjid titles are written "Name, Town", sometimes with stray spaces around them.
function getMasjidPlace(masjid: Masjid): Place | undefined {
  const title = masjid?.title?.trim();
  if (!title) {
    return undefined;
  }

  const commaIndex = title.indexOf(",");
  let name = title;
  let town = "";
  if (commaIndex !== -1) {
    name = title.slice(0, commaIndex).trim();
    town = title.slice(commaIndex + 1).trim();
  }

  const place: Place = {
    "@type": "Place",
    name,
    address: {
      "@type": "PostalAddress",
      addressCountry: "MU",
      ...(town && { addressLocality: town }),
    },
    ...(masjid?.geoLink && { url: masjid.geoLink }),
  };
  return place;
}

// Honorifics such as "Mufti" are dropped so search engines see the person's name.
// Used for lecture speakers and article authors alike.
export function getAuthorPerson(author?: string | null): Person | undefined {
  const name = author?.replace(/(mufti|mawlana)/gi, "").replace(/\s+/g, " ").trim();
  if (!name) {
    return undefined;
  }

  return { "@type": "Person", name };
}

export function createAudioJsonLd(bayaan: BayaanForJsonLd): WithContext<AudioObject> {
  const url = bayaan?.slug ? getAbsoluteUrl(getAudioPath(bayaan.slug)) : undefined;
  const speaker = getAuthorPerson(bayaan?.author);
  const duration = toISODuration(bayaan?.duration ?? "");
  const event = getBayaanEvent(bayaan);

  // The recording describes the session it was recorded at: this lecture's own date
  // and masjid. The event page describes the event as a whole.
  let recordedAt: Event | undefined;
  if (event) {
    const location = getMasjidPlace(bayaan?.masjid);
    recordedAt = {
      "@type": "Event",
      name: event.title,
      url: getAbsoluteUrl(getEventPath(event.slug)),
      eventAttendanceMode: OFFLINE_ATTENDANCE,
      ...(bayaan?.date && { startDate: bayaan.date }),
      ...(location && { location }),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    ...(url && { "@id": url, url }),
    name: bayaan?.metaTitle || bayaan?.title || "",
    ...(bayaan?.metaDescription && { description: bayaan.metaDescription }),
    ...(bayaan?.audio?.url && { contentUrl: bayaan.audio.url }),
    encodingFormat: bayaan?.audio?.contentType || "audio/mpeg",
    ...(duration && { duration }),
    ...(bayaan?.date && { uploadDate: bayaan.date }),
    inLanguage: "mfe",
    ...(speaker && { author: speaker }),
    ...(recordedAt && { recordedAt }),
  };
}

function getEventLocations(lectures: Array<EventLecture | null>): Place[] {
  const places: Place[] = [];
  const seenMasjidIds = new Set<string>();

  for (const lecture of lectures) {
    const masjidId = lecture?.masjid?.sys?.id;
    if (!masjidId || seenMasjidIds.has(masjidId)) {
      continue;
    }

    const place = getMasjidPlace(lecture?.masjid);
    if (place) {
      seenMasjidIds.add(masjidId);
      places.push(place);
    }
  }

  return places;
}

function getEventRecordings(lectures: Array<EventLecture | null>): AudioObject[] {
  const recordings: AudioObject[] = [];

  for (const lecture of lectures) {
    if (!lecture?.slug || !lecture.title) {
      continue;
    }

    const url = getAbsoluteUrl(getAudioPath(lecture.slug));
    recordings.push({ "@type": "AudioObject", "@id": url, url, name: lecture.title });
  }

  return recordings;
}

export function createEventJsonLd(event: {
  title: string;
  slug: string;
  lectures: Array<EventLecture | null>;
}): WithContext<Event> {
  const url = getAbsoluteUrl(getEventPath(event.slug));
  const summary = summarizeEventRecordings(event.lectures);
  const locations = getEventLocations(event.lectures);
  const recordings = getEventRecordings(event.lectures);

  // An event held at several masjids lists each one as a location.
  let location: Place | Place[] | undefined;
  if (locations.length === 1) {
    location = locations[0];
  } else if (locations.length > 1) {
    location = locations;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": url,
    url,
    name: event.title,
    eventAttendanceMode: OFFLINE_ATTENDANCE,
    ...(summary.firstDate && { startDate: summary.firstDate.toISOString() }),
    ...(summary.lastDate && { endDate: summary.lastDate.toISOString() }),
    ...(location && { location }),
    ...(recordings.length > 0 && { recordedIn: recordings }),
  };
}

export function createBreadcrumbJsonLd(steps: BreadcrumbStep[]): WithContext<BreadcrumbList> {
  const items: ListItem[] = [];

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    items.push({
      "@type": "ListItem",
      // Breadcrumb positions start at 1.
      position: index + 1,
      name: step.name,
      item: getAbsoluteUrl(step.path),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function getAudioBreadcrumbSteps(bayaan: BayaanForJsonLd): BreadcrumbStep[] {
  const steps: BreadcrumbStep[] = [{ name: "Home", path: "/" }];

  const event = getBayaanEvent(bayaan);
  if (event) {
    steps.push({ name: "Events", path: "/events" });
    steps.push({ name: event.title, path: getEventPath(event.slug) });
  }

  if (bayaan?.slug) {
    steps.push({ name: bayaan.title || bayaan.metaTitle || bayaan.slug, path: getAudioPath(bayaan.slug) });
  }

  return steps;
}

export function getEventBreadcrumbSteps(event: { title: string; slug: string }): BreadcrumbStep[] {
  return [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: event.title, path: getEventPath(event.slug) },
  ];
}
