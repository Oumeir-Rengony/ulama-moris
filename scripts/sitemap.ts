// scripts/generate-sitemap.ts
import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";
import {
   buildFallbackSitemapXml,
   buildSitemapXml,
   createSitemapUrls,
   getAudioSitemapItems,
   getEventSitemapEntries,
} from "./sitemap-builder";

loadEnvConfig(process.cwd());

async function generateSitemap() {
   const domain =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ulama-moris.org';

   const filePath = path.join(process.cwd(), 'app', 'sitemap.xml');
   const now = new Date().toISOString();

   try {
      const audioItems = await getAudioSitemapItems();
      const events = await getEventSitemapEntries(now);

      const urls = createSitemapUrls(domain, audioItems, events, now);
      const xml = buildSitemapXml(urls);

      fs.writeFileSync(filePath, xml, {
         encoding: 'utf8',
         flag: 'w',
      });

      console.log('✅ sitemap.xml generated successfully');
   } catch (error) {
      console.error('❌ Failed to generate sitemap.xml:', error);

      const fallbackXml = buildFallbackSitemapXml(domain, now);
      fs.writeFileSync(filePath, fallbackXml, 'utf8');

      console.log('⚠️ Fallback sitemap.xml generated');
   }
}

generateSitemap();
