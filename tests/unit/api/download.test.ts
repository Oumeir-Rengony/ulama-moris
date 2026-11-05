import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/download/route";

const AUDIO_URL = "https://assets.ctfassets.net/space/asset/hash/Mauritius_islamic_finance_hub.mp4";

const mockedFetch = vi.fn();

function requestDownload(fileUrl?: string): Promise<Response> {
  const requestUrl = new URL("http://localhost/api/download");
  if (fileUrl !== undefined) {
    requestUrl.searchParams.set("url", fileUrl);
  }
  return GET(new NextRequest(requestUrl));
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockedFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockedFetch.mockReset();
});

describe("GET /api/download", () => {
  it("returns 400 when no file URL is given", async () => {
    const response = await requestDownload();

    expect(response.status).toBe(400);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed file URL", async () => {
    const response = await requestDownload("not a url");

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid file URL");
  });

  it("refuses to download from hosts other than Contentful's asset CDN", async () => {
    const lookalikeHost = await requestDownload("https://ctfassets.net.attacker.example/file.mp3");
    const otherHost = await requestDownload("https://example.com/file.mp3");

    expect(lookalikeHost.status).toBe(403);
    expect(otherHost.status).toBe(403);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("refuses a URL that only pretends to be Contentful's host", async () => {
    // Everything before "@" is a username; the real host is attacker.example.
    const response = await requestDownload("https://assets.ctfassets.net@attacker.example/file.mp3");

    expect(response.status).toBe(403);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("falls back to a generic type and file name when Contentful gives none", async () => {
    // A Response built from a string gets a text type; remove it to simulate no type.
    const upstream = new Response("audio-bytes", { status: 200 });
    upstream.headers.delete("content-type");
    mockedFetch.mockResolvedValue(upstream);

    const response = await requestDownload("https://assets.ctfassets.net/space/asset/hash/");

    expect(response.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="download"');
  });

  it("returns 500 when Contentful does not return the file", async () => {
    mockedFetch.mockResolvedValue(new Response("Not found", { status: 404 }));

    const response = await requestDownload(AUDIO_URL);

    expect(response.status).toBe(500);
  });

  it("returns 500 when the request to Contentful fails", async () => {
    mockedFetch.mockRejectedValue(new Error("network down"));

    const response = await requestDownload(AUDIO_URL);

    expect(response.status).toBe(500);
  });

  it("streams the file back as an attachment named after the file", async () => {
    mockedFetch.mockResolvedValue(
      new Response("audio-bytes", { status: 200, headers: { "content-type": "video/mp4" } })
    );

    const response = await requestDownload(AUDIO_URL);

    expect(mockedFetch).toHaveBeenCalledWith(AUDIO_URL, expect.any(Object));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Mauritius_islamic_finance_hub.mp4"'
    );
    expect(await response.text()).toBe("audio-bytes");
  });
});
