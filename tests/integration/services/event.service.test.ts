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
    mockedExecuteQuery.mockResolvedValueOnce({ bayaanCollection: page });
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

beforeEach(() => {
  mockedExecuteQuery.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getEventDirectory", () => {
  it("reads every page of results, 1000 at a time", async () => {
    respondWithPages([
      { total: 1500, items: [{ event: "Seerah Week", date: "2026-11-03T10:00:00Z" }] },
      { total: 1500, items: [{ event: "Ramadan Talks", date: "2026-03-01T10:00:00Z" }] },
    ]);
    const { getEventDirectory } = await loadEventService();

    const events = await getEventDirectory();

    expect(requestedSkips()).toEqual([0, 1000]);
    expect(events.map((event) => event.title)).toEqual(["Seerah Week", "Ramadan Talks"]);
  });

  it("lists names that share a slug as one event, using the first name seen", async () => {
    respondWithPages([
      {
        total: 3,
        items: [
          { event: "Seerah Week", date: "2026-11-03T10:00:00Z" },
          { event: "seerah  week", date: "2026-11-04T10:00:00Z" },
          { event: "   ", date: "2026-11-04T10:00:00Z" },
        ],
      },
    ]);
    const { getEventDirectory } = await loadEventService();

    const events = await getEventDirectory();

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Seerah Week");
    expect(events[0].total).toBe(2);
  });

  it("puts the most recent events first and undated events last", async () => {
    respondWithPages([
      {
        total: 3,
        items: [
          { event: "Undated Talks" },
          { event: "Older Event", date: "2025-05-01T10:00:00Z" },
          { event: "Newer Event", date: "2026-05-01T10:00:00Z" },
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
  it("returns the event with every stored name that matches the slug", async () => {
    respondWithPages([
      { total: 3, items: [{ event: "Seerah Week" }, { event: "seerah week" }, { event: "Ramadan Talks" }] },
    ]);
    const { getEventBySlug } = await loadEventService();

    const event = await getEventBySlug("seerah-week");

    expect(event).toEqual({ title: "Seerah Week", names: ["Seerah Week", "seerah week"] });
  });

  it("returns undefined when no event matches", async () => {
    respondWithPages([{ total: 1, items: [{ event: "Seerah Week" }] }]);
    const { getEventBySlug } = await loadEventService();

    expect(await getEventBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getEventSummary", () => {
  it("summarises recordings from every page", async () => {
    respondWithPages([
      { total: 1001, items: [{ duration: "30:00" }] },
      { total: 1001, items: [{ duration: "45:00" }] },
    ]);
    const { getEventSummary } = await loadEventService();

    const summary = await getEventSummary(["Seerah Week"]);

    expect(requestedSkips()).toEqual([0, 1000]);
    expect(summary.total).toBe(2);
    expect(summary.duration).toBe("1h 15m");
  });

  it("throws when a page comes back empty before the total is reached", async () => {
    respondWithPages([{ total: 5, items: [] }]);
    const { getEventSummary } = await loadEventService();

    await expect(getEventSummary(["Seerah Week"])).rejects.toThrow("Unable to load event summary");
  });
});
