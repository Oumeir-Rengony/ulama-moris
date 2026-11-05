import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBayaansWithPagination } from "@/services/bayaans/bayaan.service";
import { GET } from "@/app/api/bayaans/route";

vi.mock("@/services/bayaans/bayaan.service", () => ({ getBayaansWithPagination: vi.fn() }));

const mockedGetBayaans = vi.mocked(getBayaansWithPagination);

function requestBayaans(query: string): Promise<Response> {
  return GET(new NextRequest(`http://localhost/api/bayaans${query}`));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/bayaans", () => {
  it("passes the query parameters to the service and returns its result", async () => {
    mockedGetBayaans.mockResolvedValue({ total: 1, items: [{ title: "On patience" }] });

    const response = await requestBayaans(
      "?page=2&startDate=2026-01-01&endDate=2026-02-01&search=sabr&type=international"
    );

    expect(mockedGetBayaans).toHaveBeenCalledWith({
      page: 2,
      startDate: "2026-01-01",
      endDate: "2026-02-01",
      search: "sabr",
      type: "international",
      isMobile: false,
      isPreview: false,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ total: 1, items: [{ title: "On patience" }] });
  });

  it("defaults to the first page with no filters", async () => {
    mockedGetBayaans.mockResolvedValue({ total: 0, items: [] });

    await requestBayaans("");

    expect(mockedGetBayaans).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, startDate: "", endDate: "", search: "", type: undefined })
    );
  });

  it("ignores an invalid page number or date instead of passing it to Contentful", async () => {
    mockedGetBayaans.mockResolvedValue({ total: 0, items: [] });

    await requestBayaans("?page=abc&startDate=not-a-date&endDate=2026-13-45");

    expect(mockedGetBayaans).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, startDate: "", endDate: "" })
    );
  });

  it("returns a 500 JSON error when the service fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetBayaans.mockRejectedValue(new Error("Contentful down"));

    const response = await requestBayaans("?page=1");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to fetch bayaans" });
  });
});
