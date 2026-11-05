import { describe, expect, it } from "vitest";
import {
  createEventDirectoryEntry,
  getEventPath,
  getEventSlug,
  groupEventsByYear,
  summarizeEventRecordings,
  type EventDirectoryEntry,
  type EventRecording,
} from "@/lib/events";

// Builds a recording with only the fields a test cares about.
function recording(fields: {
  date?: string;
  duration?: string;
  masjidId?: string;
  masjidTitle?: string;
}): EventRecording {
  let masjid = null;
  if (fields.masjidId) {
    masjid = { sys: { id: fields.masjidId }, title: fields.masjidTitle ?? "Masjid" };
  }

  return {
    date: fields.date ?? null,
    duration: fields.duration ?? null,
    masjid,
  };
}

describe("getEventSlug", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(getEventSlug("  Seerah Conference 2026 ")).toBe("seerah-conference-2026");
  });

  it("collapses existing hyphens and spaces into one hyphen", () => {
    expect(getEventSlug("Islahi - Majlis")).toBe("islahi-majlis");
  });

  it("returns an empty slug for an empty or blank name", () => {
    expect(getEventSlug("")).toBe("");
    expect(getEventSlug("   ")).toBe("");
  });

  it("keeps hyphens at the ends, so existing event URLs do not change", () => {
    expect(getEventSlug("- Seerah -")).toBe("-seerah-");
  });
});

describe("getEventPath", () => {
  it("URL-encodes characters that are not safe in a path", () => {
    expect(getEventPath("Q&A Night")).toBe("/events/q%26a-night");
  });

  it("keeps accented letters, URL-encoded", () => {
    expect(getEventPath("Şahābā Day")).toBe("/events/%C5%9Fah%C4%81b%C4%81-day");
  });
});

describe("summarizeEventRecordings", () => {
  it("adds up durations and formats the total in hours and minutes", () => {
    const summary = summarizeEventRecordings([
      recording({ duration: "45:00" }),
      recording({ duration: "1:20:00" }),
    ]);

    expect(summary.duration).toBe("2h 5m");
    expect(summary.total).toBe(2);
  });

  it("shows seconds when the total is under a minute", () => {
    const summary = summarizeEventRecordings([recording({ duration: "0:45" })]);

    expect(summary.duration).toBe("45s");
  });

  it("shows no total when any duration is missing, malformed or out of range", () => {
    expect(summarizeEventRecordings([recording({ duration: "45:00" }), recording({})]).duration).toBeNull();
    expect(summarizeEventRecordings([recording({ duration: "about an hour" })]).duration).toBeNull();
    expect(summarizeEventRecordings([recording({ duration: "1:75" })]).duration).toBeNull();
    expect(summarizeEventRecordings([recording({ duration: "1:75:00" })]).duration).toBeNull();
    expect(summarizeEventRecordings([recording({ duration: "1:5" })]).duration).toBeNull();
  });

  it("ignores spaces around a duration", () => {
    expect(summarizeEventRecordings([recording({ duration: " 45:00 " })]).duration).toBe("45m");
  });

  it("treats a 0:00 duration as unknown, so the event shows no total", () => {
    const summary = summarizeEventRecordings([recording({ duration: "0:00" }), recording({ duration: "30:00" })]);

    expect(summary.duration).toBeNull();
  });

  it("returns an empty summary for an event with no recordings", () => {
    expect(summarizeEventRecordings([])).toEqual({
      date: null,
      firstDate: null,
      lastDate: null,
      total: 0,
      duration: null,
      location: null,
    });
  });

  it("counts empty (null) rows but cannot total their duration", () => {
    const summary = summarizeEventRecordings([null, recording({ duration: "10:00" })]);

    expect(summary.total).toBe(2);
    expect(summary.duration).toBeNull();
  });

  it("skips an unreadable date and uses the others", () => {
    const summary = summarizeEventRecordings([
      recording({ date: "not-a-date" }),
      recording({ date: "2026-11-03T10:00:00Z" }),
    ]);

    expect(summary.date).toBe("03 Nov 2026");
  });

  it("shows no location when the first recording has no masjid or a masjid has no name", () => {
    const firstWithoutMasjid = summarizeEventRecordings([
      recording({}),
      recording({ masjidId: "m1", masjidTitle: "Masjid Noor" }),
    ]);
    const blankName = summarizeEventRecordings([
      recording({ masjidId: "m1", masjidTitle: "Masjid Noor" }),
      recording({ masjidId: "m1", masjidTitle: "  " }),
    ]);

    expect(firstWithoutMasjid.location).toBeNull();
    expect(blankName.location).toBeNull();
  });

  it("shows the location only when every recording is at the same masjid", () => {
    const sameMasjid = summarizeEventRecordings([
      recording({ masjidId: "m1", masjidTitle: " Masjid Al Qiblah " }),
      recording({ masjidId: "m1", masjidTitle: "Masjid Al Qiblah" }),
    ]);
    const mixedMasjids = summarizeEventRecordings([
      recording({ masjidId: "m1", masjidTitle: "Masjid Al Qiblah" }),
      recording({ masjidId: "m2", masjidTitle: "Masjid Noor" }),
    ]);

    expect(sameMasjid.location).toBe("Masjid Al Qiblah");
    expect(mixedMasjids.location).toBeNull();
  });

  it("shows a single date when all recordings fall on the same day in Mauritius", () => {
    // 21:00 UTC on 2 Nov is 01:00 on 3 Nov in Mauritius (UTC+4).
    const summary = summarizeEventRecordings([
      recording({ date: "2026-11-02T21:00:00Z" }),
      recording({ date: "2026-11-03T10:00:00Z" }),
    ]);

    expect(summary.date).toBe("03 Nov 2026");
  });

  it("shows no single date when recordings span several Mauritius days", () => {
    const summary = summarizeEventRecordings([
      recording({ date: "2026-11-03T10:00:00Z" }),
      recording({ date: "2026-11-04T10:00:00Z" }),
    ]);

    expect(summary.date).toBeNull();
    expect(summary.firstDate?.toISOString()).toBe("2026-11-03T10:00:00.000Z");
    expect(summary.lastDate?.toISOString()).toBe("2026-11-04T10:00:00.000Z");
  });
});

describe("createEventDirectoryEntry", () => {
  it("shows a short range for an event within one year, badged with its start date", () => {
    const entry = createEventDirectoryEntry("Seerah Week", [
      recording({ date: "2026-11-03T10:00:00Z" }),
      recording({ date: "2026-11-05T10:00:00Z" }),
    ]);

    expect(entry.slug).toBe("seerah-week");
    expect(entry.path).toBe("/events/seerah-week");
    expect(entry.dateRange).toBe("3 Nov – 5 Nov 2026");
    expect(entry.year).toBe("2026");
    expect(entry.day).toBe("3");
    expect(entry.month).toBe("Nov");
    expect(entry.latestTime).toBe(Date.parse("2026-11-05T10:00:00Z"));
  });

  it("badges an event that crosses years with its latest date, to match its year heading", () => {
    const entry = createEventDirectoryEntry("New Year Programme", [
      recording({ date: "2025-12-30T10:00:00Z" }),
      recording({ date: "2026-01-02T10:00:00Z" }),
    ]);

    expect(entry.dateRange).toBe("30 Dec 2025 – 2 Jan 2026");
    expect(entry.year).toBe("2026");
    expect(entry.day).toBe("2");
    expect(entry.month).toBe("Jan");
  });

  it("shows a single date for an event recorded on one Mauritius day", () => {
    const entry = createEventDirectoryEntry("One Evening", [
      recording({ date: "2026-11-03T08:00:00Z" }),
      recording({ date: "2026-11-03T12:00:00Z" }),
    ]);

    expect(entry.dateRange).toBe("3 Nov 2026");
  });

  it("leaves the date fields empty when no recording has a date", () => {
    const entry = createEventDirectoryEntry("Undated Talks", [recording({ duration: "30:00" })]);

    expect(entry.dateRange).toBeNull();
    expect(entry.year).toBeNull();
    expect(entry.day).toBeNull();
    expect(entry.latestTime).toBe(0);
    expect(entry.duration).toBe("30m");
  });
});

describe("groupEventsByYear", () => {
  function event(title: string, year: string | null): EventDirectoryEntry {
    return {
      slug: title,
      path: `/events/${title}`,
      title,
      total: 1,
      duration: null,
      location: null,
      dateRange: null,
      year,
      day: null,
      month: null,
      latestTime: 0,
    };
  }

  it("groups consecutive events under their year, keeping the incoming order", () => {
    const groups = groupEventsByYear([event("a", "2026"), event("b", "2026"), event("c", "2025")]);

    expect(groups).toEqual([
      { heading: "2026", events: [event("a", "2026"), event("b", "2026")] },
      { heading: "2025", events: [event("c", "2025")] },
    ]);
  });

  it("puts undated events last under 'Other events'", () => {
    const groups = groupEventsByYear([event("undated", null), event("a", "2026")]);

    expect(groups.map((group) => group.heading)).toEqual(["2026", "Other events"]);
    expect(groups[1].events[0].title).toBe("undated");
  });

  it("expects events sorted newest first: unsorted input repeats a year heading", () => {
    const groups = groupEventsByYear([event("a", "2026"), event("b", "2025"), event("c", "2026")]);

    expect(groups.map((group) => group.heading)).toEqual(["2026", "2025", "2026"]);
  });

  it("returns no groups for no events", () => {
    expect(groupEventsByYear([])).toEqual([]);
  });
});
