import { getBayaanSlug } from "@/services/bayaans/bayaan.service";
import { type  MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = process.env.NEXT_PUBLIC_SITE_URL;
  
  try {
    const audioList = await getBayaanSlug();
    const audioSitemap = audioList?.items?.map((audio: any) => ({
      url: `${domain}/audio/${audio?.slug}`,
      lastModified: audio?.sys?.publishedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })) || [];
    
    return [
      {
        url: domain || '',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1,
      },
      ...audioSitemap,
    ];
  } catch (error) {
    console.error('Failed to fetch audio data for sitemap:', error);
    // Return at least the homepage
    return [{
      url: domain || '',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    }];
  }
}