// scripts/generate-sitemap.ts
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { bayaanSlugQuery } from "@/services/bayaans/query";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const CF_AUTH = process.env.CF_AUTH;
const CF_API_URL = process.env.CF_API_URL!;


async function getBayaanSlug(isPreview: boolean = false, type?: string) {

   const bayaanReq = await fetch(CF_API_URL, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${CF_AUTH}`,
      },
      body: JSON.stringify({ query: bayaanSlugQuery.loc?.source.body }),
   });

   const bayaanRes = await bayaanReq.json() as any;

   return bayaanRes?.data?.bayaanCollection;

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