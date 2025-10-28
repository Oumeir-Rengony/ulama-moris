import { getBayaanSlug } from '@services/bayaans/bayaan.service';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

   const domain = process.env.NEXT_PUBLIC_SITE_URL;

   const audioList = await getBayaanSlug();

   const audioSitemap: MetadataRoute.Sitemap  = audioList?.map((audio) => ({
      url: `${domain}/audio/${audio?.slug}`,
      lastModified: audio?.sys?.publishedAt,
      changeFrequency: 'yearly',
      priority: 0.8,
   }))

   return [
      {
         url: domain,
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 1,
      },
      ...audioSitemap
   ]
}