export function getEventSlug(event: string): string {
  return event.trim().toLowerCase().replace(/[\s-]+/g, "-");
}

export function getEventPath(event: string): string {
  return `/events/${encodeURIComponent(getEventSlug(event))}`;
}

export type EventRecording = {
  date?: string | null;
  duration?: string | null;
  masjid?: {
    sys: { id: string };
    title?: string | null;
  } | null;
} | null;

function getDurationSeconds(duration?: string | null): number | null {
  if (!duration || !/^\d+:\d{2}(:\d{2})?$/.test(duration.trim())) {
    return null;
  }

  const parts = duration.trim().split(":").map(Number);
  const seconds = parts[parts.length - 1];
  const minutes = parts[parts.length - 2];
  const hours = parts.length === 3 ? parts[0] : 0;
  if (seconds >= 60 || (parts.length === 3 && minutes >= 60)) {
    return null;
  }

  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isSafeInteger(total) && total > 0 ? total : null;
}

function getSharedEventLocation(recordings: EventRecording[]): string | null {
  const firstLocation = recordings[0]?.masjid;
  if (!firstLocation?.sys.id || !firstLocation.title?.trim()) {
    return null;
  }

  for (const recording of recordings) {
    const location = recording?.masjid;
    if (location?.sys.id !== firstLocation.sys.id || !location.title?.trim()) {
      return null;
    }
  }

  return firstLocation.title.trim();
}

export function summarizeEventRecordings(recordings: EventRecording[]) {
  let firstDate: Date | null = null;
  let lastDate: Date | null = null;
  let totalSeconds = 0;
  let hasAllDurations = recordings.length > 0;
  for (const recording of recordings) {
    if (recording?.date) {
      const recordedAt = new Date(recording.date);
      if (!Number.isNaN(recordedAt.getTime())) {
        if (!firstDate || recordedAt < firstDate) firstDate = recordedAt;
        if (!lastDate || recordedAt > lastDate) lastDate = recordedAt;
      }
    }

    const seconds = getDurationSeconds(recording?.duration);
    if (seconds === null) {
      hasAllDurations = false;
    } else {
      totalSeconds += seconds;
    }
  }

  let duration: string | null = null;
  if (hasAllDurations) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (parts.length === 0) parts.push(`${totalSeconds}s`);
    duration = parts.join(" ");
  }

  let date: string | null = null;
  if (firstDate && lastDate) {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Indian/Mauritius",
    });
    const start = formatter.format(firstDate);
    const end = formatter.format(lastDate);
    // Events spanning multiple Mauritius calendar days have no single event date to display.
    if (start === end) {
      date = start;
    }
  }

  return {
    date,
    firstDate,
    lastDate,
    total: recordings.length,
    duration,
    location: getSharedEventLocation(recordings),
  };
}

const MAURITIUS_TIME_ZONE = "Indian/Mauritius";

export type EventDirectoryEntry = {
  slug: string;
  path: string;
  title: string;
  total: number;
  duration: string | null;
  location: string | null;
  dateRange: string | null;
  year: string | null;
  day: string | null;
  month: string | null;
  latestTime: number;
};

function formatInMauritius(date: Date, options: Intl.DateTimeFormatOptions): string {
  const formatter = new Intl.DateTimeFormat("en-GB", { ...options, timeZone: MAURITIUS_TIME_ZONE });
  return formatter.format(date);
}

function formatEventDateRange(firstDate: Date, lastDate: Date): string {
  const fullDate: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const dayAndMonth: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

  const start = formatInMauritius(firstDate, fullDate);
  const end = formatInMauritius(lastDate, fullDate);
  if (start === end) {
    return start;
  }

  const startYear = formatInMauritius(firstDate, { year: "numeric" });
  const endYear = formatInMauritius(lastDate, { year: "numeric" });
  if (startYear === endYear) {
    return `${formatInMauritius(firstDate, dayAndMonth)} – ${end}`;
  }

  return `${start} – ${end}`;
}

export function createEventDirectoryEntry(title: string, recordings: EventRecording[]): EventDirectoryEntry {
  const summary = summarizeEventRecordings(recordings);
  const entry: EventDirectoryEntry = {
    slug: getEventSlug(title),
    path: getEventPath(title),
    title,
    total: summary.total,
    duration: summary.duration,
    location: summary.location,
    dateRange: null,
    year: null,
    day: null,
    month: null,
    latestTime: 0,
  };

  if (!summary.firstDate || !summary.lastDate) {
    return entry;
  }

  // The directory is ordered and grouped by when an event last had a recording.
  entry.dateRange = formatEventDateRange(summary.firstDate, summary.lastDate);
  entry.year = formatInMauritius(summary.lastDate, { year: "numeric" });
  // The badge shows when an event started, unless it ran across years: then the start
  // date would contradict the year heading it is listed under, so show the latest date.
  const startYear = formatInMauritius(summary.firstDate, { year: "numeric" });
  let badgeDate = summary.firstDate;
  if (startYear !== entry.year) {
    badgeDate = summary.lastDate;
  }
  entry.day = formatInMauritius(badgeDate, { day: "numeric" });
  entry.month = formatInMauritius(badgeDate, { month: "short" });
  entry.latestTime = summary.lastDate.getTime();
  return entry;
}
