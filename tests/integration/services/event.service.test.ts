import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExecuteQuery } from "@/services/apollo/apollo.service";

// Integration test: the real event service and lib/events run together.
// Only the outer boundary, the Contentful query, is mocked.
vi.mock("@/services/apollo/apollo.service", () => ({ ExecuteQuery: vi.fn() }));

const mockedExecuteQuery = vi.mocked(ExecuteQuery);

// The service functions are wrapped in React's cache(). Importing a fresh copy
// for each test keeps one test's cached result out of the next.
async function loadEventService() {
  vi.resetModules();
  return import("@/services/bayaans/event.service");
}

// Queues one Contentful response per call, in order.
function respondWithPages(pages: Array<{ total: number; items: unknown[] } | null>) {
  for (const page of pages) {
    mockedExecuteQuery.mockResolvedValueOnce({ eventCollection: page });
  }
}

function requestedSkips(): number[] {
  const skips: number[] = [];
  for (const call of mockedExecuteQuery.mock.calls) {
    const options = call[1] as { variables: { skip: number } };
    skips.push(options.variables.skip);
  }
  return skips;
}

function contentfulEvent(title: string, slug: string, bayaans: unknown[]) {
  return { title, slug, bayaansCollection: { items: bayaans } };
}

beforeEach(() => {
  mockedExecuteQuery.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getEventDirectory", () => {
  it("reads every page of events, 100 at a time", async () => {
    respondWithPages([
      { total: 150, items: [contentfulEvent("Seerah Week", "seerah-week", [{ date: "2026-11-03T10:00:00Z" }])] },
      { total: 150, items: [contentfulEvent("Ramadan Talks", "ramadan-talks", [{ date: "2026-03-01T10:00:00Z" }])] },
    ]);
    const { getEventDirectory } = await loadEventService();

    const events = await getEventDirectory();

    expect(requestedSkips()).toEqual([0, 100]);
    expect(events.map((event) => event.title)).toEqual(["Seerah Week", "Ramadan Talks"]);
  });

  it("uses the event's own slug and summarises its bayaans", async () => {
    respondWithPages([
      {
        total: 1,
        items: [
          contentfulEvent("Hilaal & Moon Sighting", "hilaal-and-moon-sighting", [
            { date: "2026-11-03T10:00:00Z", duration: "30:00", masjid: { sys: { id: "m1" }, title: "Masjid Noor" } },
            { date: "2026-11-05T10:00:00Z", duration: "45:00", masjid: { sys: { id: "m1" }, title: "Masjid Noor" } },
          ]),
        ],
      },
    ]);
    const { getEventDirectory } = await loadEventService();

    const [event] = await getEventDirectory();

    expect(event).toMatchObject({
      slug: "hilaal-and-moon-sighting",
      path: "/events/hilaal-and-moon-sighting",
      title: "Hilaal & Moon Sighting",
      total: 2,
      duration: "1h 15m",
      location: "Masjid Noor",
      dateRange: "3 Nov – 5 Nov 2026",
    });
  });

  it("skips events without a title or slug", async () => {
    respondWithPages([
      {
        total: 3,
        items: [
          contentfulEvent("Seerah Week", "seerah-week", []),
          contentfulEvent("   ", "blank-title", []),
          contentfulEvent("No Slug", "", []),
        ],
      },
    ]);
    const { getEventDirectory } = await loadEventService();

    const events = await getEventDirectory();

    expect(events.map((event) => event.slug)).toEqual(["seerah-week"]);
  });

  it("puts the most recent events first and undated events last", async () => {
    respondWithPages([
      {
        total: 3,
        items: [
          contentfulEvent("Undated Talks", "undated-talks", [{}]),
          contentfulEvent("Older Event", "older-event", [{ date: "2025-05-01T10:00:00Z" }]),
          contentfulEvent("Newer Event", "newer-event", [{ date: "2026-05-01T10:00:00Z" }]),
        ],
      },
    ]);
    const { getEventDirectory } = await loadEventService();

    const events = await getEventDirectory();

    expect(events.map((event) => event.title)).toEqual(["Newer Event", "Older Event", "Undated Talks"]);
  });

  it("throws when Contentful returns no collection", async () => {
    respondWithPages([null]);
    const { getEventDirectory } = await loadEventService();

    await expect(getEventDirectory()).rejects.toThrow("Unable to load events");
  });
});

describe("getEventBySlug", () => {
  it("asks Contentful for the event with that slug", async () => {
    respondWithPages([{ total: 0, items: [] }]);
    const { getEventBySlug } = await loadEventService();

    await getEventBySlug("seerah-week");

    const options = mockedExecuteQuery.mock.calls[0][1] as { variables: Record<string, unknown> };
    expect(options.variables).toEqual({ slug: "seerah-week" });
  });

  it("returns the event with its bayaan ids and recordings", async () => {
    const bayaans = [
      { sys: { id: "b1" }, date: "2026-11-03T10:00:00Z", duration: "30:00" },
      { sys: { id: "b2" }, date: "2026-11-04T10:00:00Z", duration: "45:00" },
    ];
    respondWithPages([{ total: 1, items: [contentfulEvent("Seerah Week", "seerah-week", bayaans)] }]);
    const { getEventBySlug } = await loadEventService();

    const event = await getEventBySlug("seerah-week");

    expect(event).toEqual({
      title: "Seerah Week",
      slug: "seerah-week",
      bayaanIds: ["b1", "b2"],
      recordings: bayaans,
    });
  });

  it("returns an event with no bayaans yet", async () => {
    respondWithPages([{ total: 1, items: [{ title: "Coming Soon", slug: "coming-soon", bayaansCollection: null }] }]);
    const { getEventBySlug } = await loadEventService();

    const event = await getEventBySlug("coming-soon");

    expect(event).toEqual({ title: "Coming Soon", slug: "coming-soon", bayaanIds: [], recordings: [] });
  });

  it("returns undefined when no event matches", async () => {
    respondWithPages([{ total: 0, items: [] }]);
    const { getEventBySlug } = await loadEventService();

    expect(await getEventBySlug("does-not-exist")).toBeUndefined();
  });

  it("throws when Contentful returns no collection", async () => {
    respondWithPages([null]);
    const { getEventBySlug } = await loadEventService();

    await expect(getEventBySlug("seerah-week")).rejects.toThrow("Unable to load event");
  });
});
