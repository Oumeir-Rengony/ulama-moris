// scripts/generate-sitemap.ts
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { bayaanSlugQuery } from "@/services/bayaans/query";
import EventSitemapQuery from "@/services/bayaans/query/eventSitemap.query";
import { getEventPath, getEventSlug } from "@/lib/events";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CF_AUTH = process.env.CF_AUTH;
const CF_API_URL = process.env.CF_API_URL!;


// Contentful returns at most 100 entries per request unless asked for more, so fetch in batches.
async function getBayaanSlug(isPreview: boolean = false, type?: string) {
   const items: any[] = [];
   const limit = 1000;
   let skip = 0;
   let total = 0;

   do {
      const bayaanReq = await fetch(CF_API_URL, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CF_AUTH}`,
         },
         body: JSON.stringify({
            query: bayaanSlugQuery.loc?.source.body,
            variables: { limit, skip },
         }),
      });

      const bayaanRes = await bayaanReq.json() as any;
      const collection = bayaanRes?.data?.bayaanCollection;
      if (!collection) {
         throw new Error("Unable to load audio slugs for the sitemap");
      }

      items.push(...collection.items);
      total = collection.total;
      skip += limit;
   } while (skip < total);

   return { items };
}

type EventSitemapEntry = {
   path: string;
   lastModified: string;
};

// Returns one entry per event page, dated by the most recently published lecture in it.
async function getEventSitemapEntries(): Promise<EventSitemapEntry[]> {
   const entriesBySlug = new Map<string, EventSitemapEntry>();
   const limit = 1000;
   let skip = 0;
   let total = 0;

   do {
      const eventReq = await fetch(CF_API_URL, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CF_AUTH}`,
         },
         body: JSON.stringify({
            query: EventSitemapQuery.loc?.source.body,
            variables: { limit, skip },
         }),
      });

      const eventRes = await eventReq.json() as any;
      const collection = eventRes?.data?.bayaanCollection;
      if (!collection) {
         throw new Error("Unable to load events for the sitemap");
      }

      for (const item of collection.items) {
         const name = item?.event;
         if (!name?.trim()) {
            continue;
         }

         const publishedAt = item?.sys?.publishedAt || new Date().toISOString();
         const slug = getEventSlug(name);
         const existingEntry = entriesBySlug.get(slug);

         if (!existingEntry) {
            entriesBySlug.set(slug, { path: getEventPath(name), lastModified: publishedAt });
         } else if (publishedAt > existingEntry.lastModified) {
            existingEntry.lastModified = publishedAt;
         }
      }

      total = collection.total;
      skip += limit;
   } while (skip < total);

   return Array.from(entriesBySlug.values());
}

function getLatestDate(entries: EventSitemapEntry[]): string {
   let latestDate = "";
   for (const entry of entries) {
      if (entry.lastModified > latestDate) {
         latestDate = entry.lastModified;
      }
   }
   return latestDate || new Date().toISOString();
}

function escapeXml(value: string) {
   return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}

async function generateSitemap() {
   const domain =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ulama-moris.org';

   const filePath = path.join(process.cwd(), 'app', 'sitemap.xml');

   try {
      const audioList = await getBayaanSlug();
      const events = await getEventSitemapEntries();

      const urls = [
         {
            loc: domain,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: '1.0',
         },
         ...((audioList?.items || []).map((audio: any) => ({
            loc: `${domain}/audio/${audio?.slug}`,
            lastModified:
               audio?.sys?.publishedAt || new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: '0.8',
         }))),
         {
            loc: `${domain}/events`,
            lastModified: getLatestDate(events),
            changeFrequency: 'weekly',
            priority: '0.9',
         },
         ...events.map((event) => ({
            loc: `${domain}${event.path}`,
            lastModified: event.lastModified,
            changeFrequency: 'monthly',
            priority: '0.8',
         })),
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
               (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`;


      fs.writeFileSync(filePath, xml, {
         encoding: 'utf8',
         flag: 'w',
      });

      console.log('✅ sitemap.xml generated successfully');
   } catch (error) {
      console.error('❌ Failed to generate sitemap.xml:', error);


      const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(domain)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

      fs.writeFileSync(filePath, fallbackXml, 'utf8');

      console.log('⚠️ Fallback sitemap.xml generated');

   }
}

generateSitemap();