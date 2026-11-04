import { notFound } from "next/navigation";
import { getBayaanBySlug } from "@/services/bayaans/bayaan.service";
import { createAudioOgImage } from "@/lib/og/audio-image";

export const alt = "Ulama Moris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getBayaanBySlug({ slug });
  if (!data) notFound();

  return createAudioOgImage({ title: data.metaTitle || data.title, author: data.author });
}
