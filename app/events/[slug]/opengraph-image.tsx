import { notFound } from "next/navigation";
import { getEventBySlug } from "@/services/bayaans/event.service";
import { summarizeEventRecordings } from "@/lib/events";
import { createEventOgImage } from "@/lib/og/event-image";

export const alt = "Event lectures from Ulama Moris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const summary = summarizeEventRecordings(event.recordings);
  return createEventOgImage({ title: event.title, date: summary.date });
}
