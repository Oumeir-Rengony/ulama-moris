export function getEventSlug(event: string): string {
  return event.trim().toLowerCase().replace(/[\s-]+/g, "-");
}

export function getEventPath(event: string): string {
  return `/event/${encodeURIComponent(getEventSlug(event))}`;
}

export type EventRecording = {
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
  let totalSeconds = 0;
  let hasAllDurations = recordings.length > 0;
  for (const recording of recordings) {
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

  return {
    total: recordings.length,
    duration,
    location: getSharedEventLocation(recordings),
  };
}
