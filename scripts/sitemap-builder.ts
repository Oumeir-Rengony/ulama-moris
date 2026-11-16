import fetch from "node-fetch";
import { bayaanSlugQuery } from "@/services/bayaans/query";
import EventSitemapQuery from "@/services/bayaans/query/eventSitemap.query";
import { getEventPath } from "@/lib/events";

// Kept free of side effects (no env loading, no file writes) so it can be unit tested.

export type SitemapUrl = {
   loc: string;
   lastModified: string;
   changeFrequency: string;
   priority: string;
};

export type AudioSitemapItem = {
   slug?: string | null;
   sys?: { publishedAt?: string | null } | null;
} | null;

export type EventSitemapEntry = {
   path: string;
   lastModified: string;
};

export type EventSitemapItem = {
   slug?: string | null;
   sys?: { publishedAt?: string | null } | null;
   bayaansCollection?: {
      items?: Array<{ sys?: { publishedAt?: string | null } | null } | null>;
   } | null;
} | null;

// Contentful returns at most 100 entries per request unless asked for more, so fetch in batches.
const AUDIO_BATCH_SIZE = 1000;
// Each event also asks for up to 10 bayaans, so fewer events per request keeps the
// query inside Contentful's query complexity limit.
const EVENT_BATCH_SIZE = 100;

async function fetchContentfulData(query: string | undefined, limit: number, skip: number) {
   const response = await fetch(process.env.CF_API_URL!, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${process.env.CF_AUTH}`,
      },
      body: JSON.stringify({
         query,
         variables: { limit, skip },
      }),
   });

   const result = await response.json() as any;
   return result?.data;
}

export async function getAudioSitemapItems(): Promise<AudioSitemapItem[]> {
   const items: AudioSitemapItem[] = [];
   let skip = 0;
   let total = 0;

   do {
      const data = await fetchContentfulData(bayaanSlugQuery.loc?.source.body, AUDIO_BATCH_SIZE, skip);
      const collection = data?.bayaanCollection;
      if (!collection) {
         throw new Error("Unable to load audio slugs for the sitemap");
      }

      items.push(...collection.items);
      total = collection.total;
      skip += AUDIO_BATCH_SIZE;
   } while (skip < total);

   return items;
}

// An event page changes when the event itself or any of its lectures is published,
// so it is dated by whichever of those was published last.
function getEventLastModified(item: NonNullable<EventSitemapItem>, now: string): string {
   let lastModified = item.sys?.publishedAt || "";

   const bayaans = item.bayaansCollection?.items ?? [];
   for (const bayaan of bayaans) {
      const publishedAt = bayaan?.sys?.publishedAt || "";
      if (publishedAt > lastModified) {
         lastModified = publishedAt;
      }
   }

   return lastModified || now;
}

export function createEventSitemapEntries(items: EventSitemapItem[], now: string): EventSitemapEntry[] {
   const entries: EventSitemapEntry[] = [];

   for (const item of items) {
      const slug = item?.slug?.trim();
      if (!item || !slug) {
         continue;
      }

      entries.push({ path: getEventPath(slug), lastModified: getEventLastModified(item, now) });
   }

   return entries;
}

export async function getEventSitemapEntries(now: string): Promise<EventSitemapEntry[]> {
   const items: EventSitemapItem[] = [];
   let skip = 0;
   let total = 0;

   do {
      const data = await fetchContentfulData(EventSitemapQuery.loc?.source.body, EVENT_BATCH_SIZE, skip);
      const collection = data?.eventCollection;
      if (!collection) {
         throw new Error("Unable to load events for the sitemap");
      }

      items.push(...collection.items);
      total = collection.total;
      skip += EVENT_BATCH_SIZE;
   } while (skip < total);

   return createEventSitemapEntries(items, now);
}

export function getLatestDate(entries: EventSitemapEntry[], now: string): string {
   let latestDate = "";
   for (const entry of entries) {
      if (entry.lastModified > latestDate) {
         latestDate = entry.lastModified;
      }
   }
   return latestDate || now;
}

export function createSitemapUrls(
   domain: string,
   audioItems: AudioSitemapItem[],
   events: EventSitemapEntry[],
   now: string,
): SitemapUrl[] {
   const urls: SitemapUrl[] = [
      {
         loc: domain,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: '1.0',
      },
   ];

   for (const audio of audioItems) {
      urls.push({
         loc: `${domain}/audio/${audio?.slug}`,
         lastModified: audio?.sys?.publishedAt || now,
         changeFrequency: 'yearly',
         priority: '0.8',
      });
   }

   urls.push({
      loc: `${domain}/events`,
      lastModified: getLatestDate(events, now),
      changeFrequency: 'weekly',
      priority: '0.9',
   });

   for (const event of events) {
      urls.push({
         loc: `${domain}${event.path}`,
         lastModified: event.lastModified,
         changeFrequency: 'monthly',
         priority: '0.8',
      });
   }

   return urls;
}

export function escapeXml(value: string) {
   return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}

export function buildSitemapXml(urls: SitemapUrl[]): string {
   const urlElements: string[] = [];
   for (const url of urls) {
      urlElements.push(`  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`);
   }

   return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('\n')}
</urlset>`;
}

export function buildFallbackSitemapXml(domain: string, now: string): string {
   return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(domain)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}
