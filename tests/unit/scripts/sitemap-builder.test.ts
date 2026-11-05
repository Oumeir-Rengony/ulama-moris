import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   buildFallbackSitemapXml,
   buildSitemapXml,
   createSitemapUrls,
   escapeXml,
   getAudioSitemapItems,
   getEventSitemapEntries,
   getLatestDate,
   groupEventSitemapItems,
} from "@/scripts/sitemap-builder";

vi.mock("node-fetch", () => ({ default: vi.fn() }));

const mockedFetch = vi.mocked(fetch);

const NOW = "2026-11-05T00:00:00.000Z";
const DOMAIN = "https://www.ulama-moris.org";

// Makes the mocked fetch answer like Contentful's GraphQL API, one response per call.
function mockContentfulResponses(collections: Array<{ total: number; items: unknown[] } | null>) {
   for (const collection of collections) {
      const body = { data: { bayaanCollection: collection } };
      mockedFetch.mockResolvedValueOnce({ json: async () => body } as any);
   }
}

function getRequestedSkips(): number[] {
   const skips: number[] = [];
   for (const call of mockedFetch.mock.calls) {
      const requestOptions = call[1] as { body: string };
      const requestBody = JSON.parse(requestOptions.body);
      skips.push(requestBody.variables.skip);
   }
   return skips;
}

beforeEach(() => {
   process.env.CF_API_URL = "https://contentful.test/graphql";
   process.env.CF_AUTH = "test-token";
});

afterEach(() => {
   mockedFetch.mockReset();
});

describe("getAudioSitemapItems", () => {
   it("returns every audio item when they fit in one batch", async () => {
      mockContentfulResponses([
         { total: 2, items: [{ slug: "first" }, { slug: "second" }] },
      ]);

      const items = await getAudioSitemapItems();

      expect(items).toEqual([{ slug: "first" }, { slug: "second" }]);
      expect(mockedFetch).toHaveBeenCalledTimes(1);
   });

   it("keeps fetching batches until it has the total Contentful reports", async () => {
      mockContentfulResponses([
         { total: 2500, items: [{ slug: "batch-1" }] },
         { total: 2500, items: [{ slug: "batch-2" }] },
         { total: 2500, items: [{ slug: "batch-3" }] },
      ]);

      const items = await getAudioSitemapItems();

      expect(items).toEqual([{ slug: "batch-1" }, { slug: "batch-2" }, { slug: "batch-3" }]);
      expect(getRequestedSkips()).toEqual([0, 1000, 2000]);
   });

   it("throws instead of returning a partial list when Contentful returns no data", async () => {
      mockContentfulResponses([null]);

      await expect(getAudioSitemapItems()).rejects.toThrow("Unable to load audio slugs for the sitemap");
   });
});

describe("groupEventSitemapItems", () => {
   it("creates one entry per event page using the /events path", () => {
      const entries = groupEventSitemapItems([
         { event: "Jummah", sys: { publishedAt: "2026-01-01T00:00:00.000Z" } },
         { event: "Strong Youth Strong Ummah", sys: { publishedAt: "2026-02-01T00:00:00.000Z" } },
      ], NOW);

      expect(entries).toEqual([
         { path: "/events/jummah", lastModified: "2026-01-01T00:00:00.000Z" },
         { path: "/events/strong-youth-strong-ummah", lastModified: "2026-02-01T00:00:00.000Z" },
      ]);
   });

   it("merges event names that open the same page and keeps the newest publish date", () => {
      const entries = groupEventSitemapItems([
         { event: "Jummah", sys: { publishedAt: "2026-03-01T00:00:00.000Z" } },
         { event: "jummah ", sys: { publishedAt: "2026-08-21T00:00:00.000Z" } },
         { event: "JUMMAH", sys: { publishedAt: "2026-05-01T00:00:00.000Z" } },
      ], NOW);

      expect(entries).toEqual([
         { path: "/events/jummah", lastModified: "2026-08-21T00:00:00.000Z" },
      ]);
   });

   it("skips lectures without an event name", () => {
      const entries = groupEventSitemapItems([
         { event: null, sys: { publishedAt: "2026-01-01T00:00:00.000Z" } },
         { event: "   ", sys: { publishedAt: "2026-01-01T00:00:00.000Z" } },
         null,
      ], NOW);

      expect(entries).toEqual([]);
   });

   it("uses the current time when a lecture has no publish date", () => {
      const entries = groupEventSitemapItems([{ event: "Jummah", sys: null }], NOW);

      expect(entries).toEqual([{ path: "/events/jummah", lastModified: NOW }]);
   });
});

describe("getEventSitemapEntries", () => {
   it("groups events across every fetched batch", async () => {
      mockContentfulResponses([
         { total: 1500, items: [{ event: "Jummah", sys: { publishedAt: "2026-01-01T00:00:00.000Z" } }] },
         { total: 1500, items: [{ event: "Jummah", sys: { publishedAt: "2026-06-01T00:00:00.000Z" } }] },
      ]);

      const entries = await getEventSitemapEntries(NOW);

      expect(entries).toEqual([{ path: "/events/jummah", lastModified: "2026-06-01T00:00:00.000Z" }]);
      expect(getRequestedSkips()).toEqual([0, 1000]);
   });

   it("throws when Contentful returns no data", async () => {
      mockContentfulResponses([null]);

      await expect(getEventSitemapEntries(NOW)).rejects.toThrow("Unable to load events for the sitemap");
   });
});

describe("getLatestDate", () => {
   it("returns the newest date among the entries", () => {
      const latestDate = getLatestDate([
         { path: "/events/a", lastModified: "2026-01-01T00:00:00.000Z" },
         { path: "/events/b", lastModified: "2026-09-01T00:00:00.000Z" },
         { path: "/events/c", lastModified: "2026-04-01T00:00:00.000Z" },
      ], NOW);

      expect(latestDate).toBe("2026-09-01T00:00:00.000Z");
   });

   it("falls back to the current time when there are no entries", () => {
      expect(getLatestDate([], NOW)).toBe(NOW);
   });
});

describe("createSitemapUrls", () => {
   const audioItems = [
      { slug: "tafseer-surah-kahf", sys: { publishedAt: "2026-02-02T00:00:00.000Z" } },
      { slug: "no-publish-date", sys: null },
   ];
   const events = [
      { path: "/events/jummah", lastModified: "2026-08-21T00:00:00.000Z" },
      { path: "/events/the-sahaba", lastModified: "2026-11-03T00:00:00.000Z" },
   ];

   it("lists the home page, audio pages, the events page and each event page in order", () => {
      const urls = createSitemapUrls(DOMAIN, audioItems, events, NOW);
      const locations = urls.map((url) => url.loc);

      expect(locations).toEqual([
         DOMAIN,
         `${DOMAIN}/audio/tafseer-surah-kahf`,
         `${DOMAIN}/audio/no-publish-date`,
         `${DOMAIN}/events`,
         `${DOMAIN}/events/jummah`,
         `${DOMAIN}/events/the-sahaba`,
      ]);
   });

   it("dates the events page by its most recently updated event", () => {
      const urls = createSitemapUrls(DOMAIN, audioItems, events, NOW);
      const eventsPage = urls.find((url) => url.loc === `${DOMAIN}/events`);

      expect(eventsPage).toEqual({
         loc: `${DOMAIN}/events`,
         lastModified: "2026-11-03T00:00:00.000Z",
         changeFrequency: "weekly",
         priority: "0.9",
      });
   });

   it("uses the current time for audio pages without a publish date", () => {
      const urls = createSitemapUrls(DOMAIN, audioItems, events, NOW);
      const audioPage = urls.find((url) => url.loc === `${DOMAIN}/audio/no-publish-date`);

      expect(audioPage?.lastModified).toBe(NOW);
   });

   it("still lists the events page when there are no events", () => {
      const urls = createSitemapUrls(DOMAIN, [], [], NOW);

      expect(urls).toEqual([
         { loc: DOMAIN, lastModified: NOW, changeFrequency: "monthly", priority: "1.0" },
         { loc: `${DOMAIN}/events`, lastModified: NOW, changeFrequency: "weekly", priority: "0.9" },
      ]);
   });
});

describe("escapeXml", () => {
   it("escapes characters that would break the XML", () => {
      expect(escapeXml(`a&b"c'd<e>f`)).toBe("a&amp;b&quot;c&apos;d&lt;e&gt;f");
   });
});

describe("buildSitemapXml", () => {
   it("writes a valid urlset with one url element per page", () => {
      const xml = buildSitemapXml([
         { loc: `${DOMAIN}/events`, lastModified: NOW, changeFrequency: "weekly", priority: "0.9" },
      ]);

      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/events</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
   });

   it("escapes special characters in page addresses", () => {
      const xml = buildSitemapXml([
         { loc: `${DOMAIN}/audio/q&a`, lastModified: NOW, changeFrequency: "yearly", priority: "0.8" },
      ]);

      expect(xml).toContain(`<loc>${DOMAIN}/audio/q&amp;a</loc>`);
      expect(xml).not.toContain("q&a</loc>");
   });
});

describe("buildFallbackSitemapXml", () => {
   it("lists only the home page", () => {
      const xml = buildFallbackSitemapXml(DOMAIN, NOW);

      expect(xml.match(/<url>/g)).toHaveLength(1);
      expect(xml).toContain(`<loc>${DOMAIN}</loc>`);
      expect(xml).toContain(`<lastmod>${NOW}</lastmod>`);
   });
});
