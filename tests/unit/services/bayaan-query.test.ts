import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExecuteQuery } from "@/services/apollo/apollo.service";

// Checks how filters become Contentful query variables. Only the query call is mocked.
vi.mock("@/services/apollo/apollo.service", () => ({ ExecuteQuery: vi.fn() }));

const mockedExecuteQuery = vi.mocked(ExecuteQuery);

// The service functions are wrapped in React's cache(); a fresh import per test
// keeps one test's cached result out of the next.
async function loadBayaanService() {
  vi.resetModules();
  return import("@/services/bayaans/bayaan.service");
}

function sentVariables(): Record<string, unknown> {
  const options = mockedExecuteQuery.mock.calls[0][1] as { variables: Record<string, unknown> };
  return options.variables;
}

beforeEach(() => {
  mockedExecuteQuery.mockReset();
  mockedExecuteQuery.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });
});

describe("getBayaansWithPagination", () => {
  it("asks for the first page without an offset", async () => {
    const { getBayaansWithPagination } = await loadBayaanService();

    await getBayaansWithPagination({ page: 1, isMobile: true });

    // Mobile page size is 6 (config.json).
    expect(sentVariables()).toEqual({ limit: 6, local: undefined });
  });

  it("turns a page number into an offset of whole pages", async () => {
    const { getBayaansWithPagination } = await loadBayaanService();

    await getBayaansWithPagination({ page: 3, isMobile: true });

    expect(sentVariables()).toMatchObject({ limit: 6, skip: 12 });
  });

  it("uses the desktop page size when not on mobile", async () => {
    const { getBayaansWithPagination } = await loadBayaanService();

    await getBayaansWithPagination({ page: 2, isMobile: false });

    expect(sentVariables()).toMatchObject({ limit: 8, skip: 8 });
  });

  it("passes the filters that are set and leaves out the empty ones", async () => {
    const { getBayaansWithPagination } = await loadBayaanService();

    await getBayaansWithPagination({ page: 1, search: "sabr", type: "international", events: ["Seerah Week"] });

    expect(sentVariables()).toEqual({
      limit: 6,
      search: "sabr",
      events: ["Seerah Week"],
      local: "international",
    });
  });

  it("returns the collection from Contentful", async () => {
    mockedExecuteQuery.mockResolvedValue({ bayaanCollection: { total: 1, items: [{ title: "On patience" }] } });
    const { getBayaansWithPagination } = await loadBayaanService();

    const collection = await getBayaansWithPagination({ page: 1 });

    expect(collection).toEqual({ total: 1, items: [{ title: "On patience" }] });
  });
});

describe("getBayaansBase date filter", () => {
  it("includes the whole end day by asking for dates before the next day", async () => {
    const { getBayaansBase } = await loadBayaanService();

    await getBayaansBase({ startDate: "2026-02-01", endDate: "2026-02-01" });

    expect(sentVariables()).toMatchObject({ startDate: "2026-02-01", endDate: "2026-02-02" });
  });

  it("rolls the end date over months and years correctly", async () => {
    const { getBayaansBase } = await loadBayaanService();

    await getBayaansBase({ endDate: "2026-12-31" });

    expect(sentVariables()).toMatchObject({ endDate: "2027-01-01" });
  });
});
