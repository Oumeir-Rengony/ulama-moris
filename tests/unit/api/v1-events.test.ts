import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createEventDirectoryEntry, type EventDirectoryEntry } from "@/lib/events";
import { getBayaansBase } from "@/services/bayaans/bayaan.service";
import { getEventBySlug, getEventDirectory, type EventDetails } from "@/services/bayaans/event.service";
import { GET as getEvents } from "@/app/api/v1/events/route";
import { GET as getEvent } from "@/app/api/v1/events/[slug]/route";

vi.mock("@/services/bayaans/bayaan.service", () => ({ getBayaansBase: vi.fn() }));
vi.mock("@/services/bayaans/event.service", () => ({
  getEventBySlug: vi.fn(),
  getEventDirectory: vi.fn(),
}));

const mockedGetBayaansBase = vi.mocked(getBayaansBase);
const mockedGetEventBySlug = vi.mocked(getEventBySlug);
const mockedGetEventDirectory = vi.mocked(getEventDirectory);

function directoryEntry(title: string, slug: string): EventDirectoryEntry {
  return createEventDirectoryEntry({ title, slug }, [{ date: "2026-10-24T15:00:00Z", duration: "30:00" }]);
}

const directory = [
  directoryEntry("Şahābā Week", "sahaba-week"),
  directoryEntry("Seerah Week", "seerah-week"),
  directoryEntry("Jummah", "jummah"),
];

// An event as getEventBySlug returns it.
const seerahWeek: EventDetails = {
  title: "Seerah Week",
  slug: "seerah-week",
  bayaanIds: ["id-1"],
  recordings: [{ sys: { id: "id-1" }, date: "2026-11-03T10:00:00Z", duration: "30:00" }],
};

// A bayaan as Contentful returns it, linked to Seerah Week.
const seerahWeekBayaan = {
  sys: { id: "id-1" },
  slug: "seerah-day-one",
  title: "Seerah day one",
  audio: { url: "https://assets.ctfassets.net/seerah-day-one.m4a" },
  local: ["local"],
  linkedFrom: {
    eventCollection: {
      items: [{ title: "Seerah Week", slug: "seerah-week", bayaansCollection: { items: [{ sys: { id: "id-1" } }] } }],
    },
  },
};

function requestEvents(query: string): Promise<Response> {
  return getEvents(new NextRequest(`http://localhost/api/v1/events${query}`));
}

function requestEvent(slug: string): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/v1/events/${slug}`);
  return getEvent(request, { params: Promise.resolve({ slug }) });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/events", () => {
  it("returns one page of events without the website path", async () => {
    mockedGetEventDirectory.mockResolvedValue(directory);

    const response = await requestEvents("?page=1&limit=2");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(3);
    expect(body.page).toBe(1);
    expect(body.hasMore).toBe(true);
    expect(body.items).toHaveLength(2);
    expect(body.items[0]).not.toHaveProperty("path");
    expect(body.items[0].dateRangeLong).toBe("24 October 2026");
  });

  it("reports no more pages on the last page", async () => {
    mockedGetEventDirectory.mockResolvedValue(directory);

    const response = await requestEvents("?page=2&limit=2");

    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.hasMore).toBe(false);
  });

  it("filters titles ignoring case and accents", async () => {
    mockedGetEventDirectory.mockResolvedValue(directory);

    const response = await requestEvents("?search=SAHABA");

    const body = await response.json();
    expect(body.total).toBe(1);
    expect(body.items[0].title).toBe("Şahābā Week");
  });

  it("returns a 500 when the events cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetEventDirectory.mockRejectedValue(new Error("Unable to load events"));

    const response = await requestEvents("");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to fetch events" });
  });
});

describe("GET /api/v1/events/[slug]", () => {
  it("returns the event and its lectures, fetched by the event's bayaan ids", async () => {
    mockedGetEventBySlug.mockResolvedValue(seerahWeek);
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 1, items: [seerahWeekBayaan] } });

    const response = await requestEvent("seerah-week");

    expect(mockedGetEventBySlug).toHaveBeenCalledWith("seerah-week");
    expect(mockedGetBayaansBase).toHaveBeenCalledWith({ bayaanIds: ["id-1"] });
    expect(mockedGetEventDirectory).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body = await response.json();
    expect(body.event).toMatchObject({ slug: "seerah-week", title: "Seerah Week", total: 1, dateRangeLong: "3 November 2026" });
    expect(body.event).not.toHaveProperty("path");
    expect(body.lectures).toHaveLength(1);
    expect(body.lectures[0]).toMatchObject({ id: "id-1", event: "Seerah Week", eventSlug: "seerah-week" });
  });

  it("leaves out lectures the app can't use but keeps the summary", async () => {
    mockedGetEventBySlug.mockResolvedValue({
      ...seerahWeek,
      bayaanIds: ["id-1", "id-2"],
      recordings: [...seerahWeek.recordings, { sys: { id: "id-2" }, date: "2026-11-04T10:00:00Z", duration: "30:00" }],
    });
    const bayaanWithoutTitle = { ...seerahWeekBayaan, sys: { id: "id-2" }, title: null };
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 2, items: [seerahWeekBayaan, bayaanWithoutTitle] } });

    const response = await requestEvent("seerah-week");

    const body = await response.json();
    expect(body.event.total).toBe(2);
    expect(body.lectures).toHaveLength(1);
    expect(body.lectures[0].id).toBe("id-1");
  });

  it("returns an event with no bayaans without asking Contentful for lectures", async () => {
    mockedGetEventBySlug.mockResolvedValue({ title: "Seerah Week", slug: "seerah-week", bayaanIds: [], recordings: [] });

    const response = await requestEvent("seerah-week");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.event.total).toBe(0);
    expect(body.lectures).toEqual([]);
    expect(mockedGetBayaansBase).not.toHaveBeenCalled();
  });

  it("returns a 404 for an unknown slug", async () => {
    mockedGetEventBySlug.mockResolvedValue(undefined);

    const response = await requestEvent("missing");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Event not found" });
    expect(mockedGetBayaansBase).not.toHaveBeenCalled();
  });

  it("returns a 500 when the event cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetEventBySlug.mockRejectedValue(new Error("Unable to load event"));

    const response = await requestEvent("seerah-week");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to fetch event" });
  });

  it("returns a 500 when Contentful sends no lecture data", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetEventBySlug.mockResolvedValue(seerahWeek);
    mockedGetBayaansBase.mockResolvedValue(undefined as never);

    const response = await requestEvent("seerah-week");

    expect(response.status).toBe(500);
  });
});
