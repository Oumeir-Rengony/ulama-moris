import { describe, expect, it } from "vitest";
import {
  createAudioJsonLd,
  createBreadcrumbJsonLd,
  createEventJsonLd,
  getAudioBreadcrumbSteps,
  getAuthorPerson,
  getEventBreadcrumbSteps,
} from "@/lib/json-ld";

function linkedEvent(title: string, slug: string) {
  return { linkedFrom: { eventCollection: { items: [{ title, slug, bayaansCollection: { items: [] } }] } } };
}

const lectureInEvent = {
  slug: "zakaat-part-1",
  title: "Zakaat Part 1",
  metaTitle: "Zakaat Part 1 | Ulama Moris",
  metaDescription: "The first talk on zakaat.",
  author: "Mufti  Ahmad Ali",
  date: "2024-03-15T12:50:00.000+04:00",
  duration: "30:29",
  masjid: { title: " Sunnee Mosque, Rose Hill ", geoLink: "https://maps.example/sunnee" },
  audio: { url: "https://assets.example/zakaat-1.mp3", contentType: "audio/mp4" },
  ...linkedEvent("Special Talk on Zakaat", "special-talk-on-zakaat"),
};

describe("createAudioJsonLd", () => {
  it("describes the lecture as an AudioObject that search engines can read on its own", () => {
    const jsonLd = createAudioJsonLd(lectureInEvent);

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "AudioObject",
      "@id": "https://ulama-moris.org/audio/zakaat-part-1",
      url: "https://ulama-moris.org/audio/zakaat-part-1",
      name: "Zakaat Part 1 | Ulama Moris",
      description: "The first talk on zakaat.",
      contentUrl: "https://assets.example/zakaat-1.mp3",
      encodingFormat: "audio/mp4",
      duration: "PT30M29S",
      uploadDate: "2024-03-15T12:50:00.000+04:00",
      inLanguage: "mfe",
      author: { "@type": "Person", name: "Ahmad Ali" },
    });
  });

  it("says the lecture was recorded at its event, in person at its masjid", () => {
    const jsonLd = createAudioJsonLd(lectureInEvent);

    expect(jsonLd.recordedAt).toEqual({
      "@type": "Event",
      name: "Special Talk on Zakaat",
      url: "https://ulama-moris.org/events/special-talk-on-zakaat",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      startDate: "2024-03-15T12:50:00.000+04:00",
      location: {
        "@type": "Place",
        name: "Sunnee Mosque",
        url: "https://maps.example/sunnee",
        address: { "@type": "PostalAddress", addressCountry: "MU", addressLocality: "Rose Hill" },
      },
    });
  });

  it("leaves out the event and empty fields for a lecture that is not part of an event", () => {
    const jsonLd = createAudioJsonLd({ slug: "short-reminder", title: "Short Reminder" });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "AudioObject",
      "@id": "https://ulama-moris.org/audio/short-reminder",
      url: "https://ulama-moris.org/audio/short-reminder",
      name: "Short Reminder",
      encodingFormat: "audio/mpeg",
      inLanguage: "mfe",
    });
  });

  it("drops a masjid town when the title has no comma", () => {
    const jsonLd = createAudioJsonLd({
      ...lectureInEvent,
      masjid: { title: "Belle Rose Sunnee Mosque" },
    });

    expect(jsonLd.recordedAt).toMatchObject({
      location: {
        "@type": "Place",
        name: "Belle Rose Sunnee Mosque",
        address: { "@type": "PostalAddress", addressCountry: "MU" },
      },
    });
  });
});

describe("createEventJsonLd", () => {
  const lectures = [
    {
      slug: "zakaat-part-2",
      title: "Zakaat Part 2",
      date: "2024-03-22T12:50:00.000+04:00",
      masjid: { sys: { id: "m1" }, title: "Sunnee Mosque, Rose Hill" },
    },
    {
      slug: "zakaat-part-1",
      title: "Zakaat Part 1",
      date: "2024-03-15T12:50:00.000+04:00",
      masjid: { sys: { id: "m1" }, title: "Sunnee Mosque, Rose Hill" },
    },
  ];

  it("describes the event with its first and last dates, its masjid and its recordings", () => {
    const jsonLd = createEventJsonLd({ title: "Special Talk on Zakaat", slug: "special-talk-on-zakaat", lectures });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": "https://ulama-moris.org/events/special-talk-on-zakaat",
      url: "https://ulama-moris.org/events/special-talk-on-zakaat",
      name: "Special Talk on Zakaat",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      startDate: "2024-03-15T08:50:00.000Z",
      endDate: "2024-03-22T08:50:00.000Z",
      location: {
        "@type": "Place",
        name: "Sunnee Mosque",
        address: { "@type": "PostalAddress", addressCountry: "MU", addressLocality: "Rose Hill" },
      },
      recordedIn: [
        {
          "@type": "AudioObject",
          "@id": "https://ulama-moris.org/audio/zakaat-part-2",
          url: "https://ulama-moris.org/audio/zakaat-part-2",
          name: "Zakaat Part 2",
        },
        {
          "@type": "AudioObject",
          "@id": "https://ulama-moris.org/audio/zakaat-part-1",
          url: "https://ulama-moris.org/audio/zakaat-part-1",
          name: "Zakaat Part 1",
        },
      ],
    });
  });

  it("lists every masjid once when the event moved between masjids", () => {
    const jsonLd = createEventJsonLd({
      title: "Seerah Week",
      slug: "seerah-week",
      lectures: [
        { masjid: { sys: { id: "m1" }, title: "Masjid Noor, Port Louis" } },
        { masjid: { sys: { id: "m2" }, title: "Masjid Al Qiblah" } },
        { masjid: { sys: { id: "m1" }, title: "Masjid Noor, Port Louis" } },
      ],
    });

    expect(jsonLd.location).toEqual([
      {
        "@type": "Place",
        name: "Masjid Noor",
        address: { "@type": "PostalAddress", addressCountry: "MU", addressLocality: "Port Louis" },
      },
      { "@type": "Place", name: "Masjid Al Qiblah", address: { "@type": "PostalAddress", addressCountry: "MU" } },
    ]);
  });

  it("leaves out dates, location and recordings for an event with no lectures yet", () => {
    const jsonLd = createEventJsonLd({ title: "Coming Soon", slug: "coming-soon", lectures: [] });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": "https://ulama-moris.org/events/coming-soon",
      url: "https://ulama-moris.org/events/coming-soon",
      name: "Coming Soon",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    });
  });
});

describe("breadcrumbs", () => {
  it("numbers breadcrumb steps from 1 with absolute urls", () => {
    const jsonLd = createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
    ]);

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ulama-moris.org/" },
        { "@type": "ListItem", position: 2, name: "Events", item: "https://ulama-moris.org/events" },
      ],
    });
  });

  it("puts a lecture under its event", () => {
    expect(getAudioBreadcrumbSteps(lectureInEvent)).toEqual([
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
      { name: "Special Talk on Zakaat", path: "/events/special-talk-on-zakaat" },
      { name: "Zakaat Part 1", path: "/audio/zakaat-part-1" },
    ]);
  });

  it("puts a lecture outside any event straight under Home", () => {
    expect(getAudioBreadcrumbSteps({ slug: "short-reminder", title: "Short Reminder" })).toEqual([
      { name: "Home", path: "/" },
      { name: "Short Reminder", path: "/audio/short-reminder" },
    ]);
  });

  it("puts an event under Events", () => {
    expect(getEventBreadcrumbSteps({ title: "Seerah Week", slug: "seerah-week" })).toEqual([
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
      { name: "Seerah Week", path: "/events/seerah-week" },
    ]);
  });
});

describe("getAuthorPerson", () => {
  it("drops honorifics and stray spaces from the name", () => {
    expect(getAuthorPerson("Mufti Ibrahim ")).toEqual({ "@type": "Person", name: "Ibrahim" });
    expect(getAuthorPerson("mawlana  Yusuf  Khan")).toEqual({ "@type": "Person", name: "Yusuf Khan" });
  });

  it("returns nothing when there is no name left", () => {
    expect(getAuthorPerson("Mufti")).toBeUndefined();
    expect(getAuthorPerson("  ")).toBeUndefined();
    expect(getAuthorPerson(null)).toBeUndefined();
  });
});
