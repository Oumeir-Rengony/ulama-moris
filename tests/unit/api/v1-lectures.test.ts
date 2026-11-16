import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBayaanBySlug, getBayaansBase } from "@/services/bayaans/bayaan.service";
import { GET as getLectures } from "@/app/api/v1/lectures/route";
import { GET as getLecture } from "@/app/api/v1/lectures/[slug]/route";

vi.mock("@/services/bayaans/bayaan.service", () => ({
  getBayaansBase: vi.fn(),
  getBayaanBySlug: vi.fn(),
}));

const mockedGetBayaansBase = vi.mocked(getBayaansBase);
const mockedGetBayaanBySlug = vi.mocked(getBayaanBySlug);

const bayaan = {
  sys: { id: "id-1" },
  slug: "on-patience",
  title: "On patience",
  local: ["local"],
  category: null,
};

function requestLectures(query: string, headers: Record<string, string> = {}): Promise<Response> {
  return getLectures(new NextRequest(`http://localhost/api/v1/lectures${query}`, { headers }));
}

function requestLecture(slug: string): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/v1/lectures/${slug}`);
  return getLecture(request, { params: Promise.resolve({ slug }) });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("GET /api/v1/lectures", () => {
  it("turns page and limit into an offset and returns the app's shape", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 25, items: [bayaan] } });

    const response = await requestLectures("?page=3&limit=5&type=guest&search=sabr");

    expect(mockedGetBayaansBase).toHaveBeenCalledWith({ limit: 5, skip: 10, type: "international", search: "sabr" });
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body = await response.json();
    expect(body.page).toBe(3);
    expect(body.total).toBe(25);
    expect(body.hasMore).toBe(true);
    expect(body.items[0]).toMatchObject({ id: "id-1", series: "local", category: [] });
  });

  it("defaults to the first page of 10 with no filters", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });

    await requestLectures("");

    expect(mockedGetBayaansBase).toHaveBeenCalledWith({ limit: 10, skip: 0, type: undefined, search: "" });
  });

  it("caps the limit at 50", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });

    await requestLectures("?limit=1000");

    expect(mockedGetBayaansBase).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });

  it("reports no more pages past the end, where Contentful's total reads 0", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });

    const response = await requestLectures("?page=99");

    expect((await response.json()).hasMore).toBe(false);
  });

  it("rejects an unknown type with a 400", async () => {
    const response = await requestLectures("?type=international");

    expect(response.status).toBe(400);
    expect(mockedGetBayaansBase).not.toHaveBeenCalled();
  });

  it("returns a 500 when Contentful sends no data", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetBayaansBase.mockResolvedValue(undefined as never);

    const response = await requestLectures("");

    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Failed to fetch lectures" });
  });

  it("returns a 500 when the service throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedGetBayaansBase.mockRejectedValue(new Error("Contentful down"));

    const response = await requestLectures("");

    expect(response.status).toBe(500);
  });

  it("allows the Expo dev server's origin in development only", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });

    vi.stubEnv("NODE_ENV", "development");
    const devResponse = await requestLectures("", { origin: "http://localhost:8081" });
    expect(devResponse.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:8081");

    vi.stubEnv("NODE_ENV", "production");
    const prodResponse = await requestLectures("", { origin: "http://localhost:8081" });
    expect(prodResponse.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("allows the origin set in APP_WEB_ORIGIN", async () => {
    mockedGetBayaansBase.mockResolvedValue({ bayaanCollection: { total: 0, items: [] } });
    vi.stubEnv("APP_WEB_ORIGIN", "https://app.example.org");

    const response = await requestLectures("", { origin: "https://app.example.org" });

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://app.example.org");
  });
});

describe("GET /api/v1/lectures/[slug]", () => {
  it("returns one lecture in the app's shape", async () => {
    mockedGetBayaanBySlug.mockResolvedValue({ data: bayaan, total: undefined });

    const response = await requestLecture("on-patience");

    expect(mockedGetBayaanBySlug).toHaveBeenCalledWith({ slug: "on-patience" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: "id-1", slug: "on-patience" });
  });

  it("returns a 404 for an unknown slug", async () => {
    mockedGetBayaanBySlug.mockResolvedValue({ data: undefined, total: undefined });

    const response = await requestLecture("missing");

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "Lecture not found" });
  });
});
