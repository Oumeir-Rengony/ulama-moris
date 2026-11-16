import { describe, expect, it } from "vitest";
import { createEventDirectoryEntry } from "@/lib/events";
import { eventTitleMatchesSearch, isUsableBayaan, toAppEvent, toAppLecture, toContentfulSeries } from "@/lib/mobile-app/convert";

// A bayaan as Contentful returns it (BayaanFragment).
const contentfulBayaan = {
  sys: { id: "1iEGTjX7Rtu1dshU00v5FI" },
  slug: "gravity-of-talking-bad-about-the-sahaba",
  title: "Gravity of Talking Bad about the Şahābā",
  author: "Mufti Houzeifa Mamoojee",
  date: "2026-10-31T21:15:00.000+04:00",
  duration: "35:48",
  masjid: { title: " MASJID MUSWALLA, HIGHLANDS ", geoLink: "https://maps.example" },
  audio: { url: "https://assets.ctfassets.net/audio.m4a" },
  local: ["international"],
  category: ["sahaba r.a"],
  linkedFrom: {
    eventCollection: {
      items: [{ title: "The Sahaba Radiyyallahu Anhum", slug: "the-sahaba", bayaansCollection: { items: [] } }],
    },
  },
};

describe("toAppLecture", () => {
  it("turns a Contentful bayaan into the app's Lecture", () => {
    expect(toAppLecture(contentfulBayaan)).toEqual({
      id: "1iEGTjX7Rtu1dshU00v5FI",
      slug: "gravity-of-talking-bad-about-the-sahaba",
      title: "Gravity of Talking Bad about the Şahābā",
      author: "Mufti Houzeifa Mamoojee",
      date: "2026-10-31T21:15:00.000+04:00",
      duration: "35:48",
      masjid: "MASJID MUSWALLA, HIGHLANDS",
      url: "https://assets.ctfassets.net/audio.m4a",
      series: "guest",
      event: "The Sahaba Radiyyallahu Anhum",
      eventSlug: "the-sahaba",
      category: ["sahaba r.a"],
    });
  });

  it("sends missing values as null and a missing category as an empty list", () => {
    const lecture = toAppLecture({
      sys: { id: "abc" },
      slug: "a-talk",
      title: "A talk",
      audio: { url: "https://assets.ctfassets.net/a-talk.m4a" },
      duration: null,
      masjid: null,
      local: null,
      category: null,
      linkedFrom: { eventCollection: { items: [] } },
    });

    expect(lecture.author).toBeNull();
    expect(lecture.date).toBeNull();
    expect(lecture.duration).toBeNull();
    expect(lecture.masjid).toBeNull();
    expect(lecture.series).toBeNull();
    expect(lecture.event).toBeNull();
    expect(lecture.eventSlug).toBeNull();
    expect(lecture.category).toEqual([]);
  });

  it("sends a blank author as null", () => {
    expect(toAppLecture({ ...contentfulBayaan, author: "  " }).author).toBeNull();
  });

  it("trims the slug, title and url", () => {
    const lecture = toAppLecture({
      ...contentfulBayaan,
      slug: " a-talk ",
      title: " A talk ",
      audio: { url: " https://assets.ctfassets.net/a-talk.m4a " },
    });

    expect(lecture.slug).toBe("a-talk");
    expect(lecture.title).toBe("A talk");
    expect(lecture.url).toBe("https://assets.ctfassets.net/a-talk.m4a");
  });

  it("uses the app's names for each series", () => {
    expect(toAppLecture({ ...contentfulBayaan, local: ["local"] }).series).toBe("local");
    expect(toAppLecture({ ...contentfulBayaan, local: ["islahi majlis"] }).series).toBe("islahi-majlis");
  });
});

describe("isUsableBayaan", () => {
  it("accepts a complete bayaan", () => {
    expect(isUsableBayaan(contentfulBayaan)).toBe(true);
  });

  it("accepts a bayaan without an author or date, which are optional", () => {
    expect(isUsableBayaan({ ...contentfulBayaan, author: undefined, date: undefined })).toBe(true);
    expect(isUsableBayaan({ ...contentfulBayaan, author: null, date: null })).toBe(true);
  });

  const emptyValues = [undefined, null, "", "   "];

  it("rejects a bayaan without a slug", () => {
    for (const slug of emptyValues) {
      expect(isUsableBayaan({ ...contentfulBayaan, slug })).toBe(false);
    }
  });

  it("rejects a bayaan without a title", () => {
    for (const title of emptyValues) {
      expect(isUsableBayaan({ ...contentfulBayaan, title })).toBe(false);
    }
  });

  it("rejects a bayaan without an audio url", () => {
    for (const url of emptyValues) {
      expect(isUsableBayaan({ ...contentfulBayaan, audio: { url } })).toBe(false);
    }
  });

  it("rejects a bayaan whose audio is null", () => {
    expect(isUsableBayaan({ ...contentfulBayaan, audio: null })).toBe(false);
  });
});

describe("toContentfulSeries", () => {
  it("maps the app's series names back to Contentful's", () => {
    expect(toContentfulSeries("local")).toBe("local");
    expect(toContentfulSeries("guest")).toBe("international");
    expect(toContentfulSeries("islahi-majlis")).toBe("islahi majlis");
  });

  it("returns null for a name it does not know", () => {
    expect(toContentfulSeries("international")).toBeNull();
    expect(toContentfulSeries("toString")).toBeNull();
  });
});

describe("toAppEvent", () => {
  it("keeps every directory field except the website path", () => {
    const entry = createEventDirectoryEntry({ title: "Seerah Week", slug: "seerah-week" }, [{ date: "2026-11-03T10:00:00Z", duration: "30:00" }]);

    const event = toAppEvent(entry);

    expect(event).not.toHaveProperty("path");
    expect(event.slug).toBe("seerah-week");
    expect(event.dateRangeLong).toBe("3 November 2026");
  });
});

describe("eventTitleMatchesSearch", () => {
  it("ignores case and accents", () => {
    expect(eventTitleMatchesSearch("Şahābā Day", "sahaba")).toBe(true);
    expect(eventTitleMatchesSearch("The Sahaba", "ŞAHĀBĀ")).toBe(true);
  });

  it("does not match a title without the search text", () => {
    expect(eventTitleMatchesSearch("Seerah Week", "sahaba")).toBe(false);
  });
});
