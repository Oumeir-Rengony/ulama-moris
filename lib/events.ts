export function getEventSlug(event: string): string {
  return event.trim().toLowerCase().replace(/[\s-]+/g, "-");
}

export function getEventPath(event: string): string {
  return `/event/${encodeURIComponent(getEventSlug(event))}`;
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
    date = start;
    if (start !== end) date = `${start} – ${end}`;
  }

  return {
    date,
    total: recordings.length,
    duration,
    location: getSharedEventLocation(recordings),
  };
}
