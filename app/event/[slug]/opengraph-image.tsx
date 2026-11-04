import { notFound } from "next/navigation";
import { getEventBySlug, getEventSummary } from "@/services/bayaans/event.service";
import { createEventOgImage } from "@/lib/og/event-image";

export const alt = "Event lectures from Ulama Moris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const summary = await getEventSummary(event.names);
  return createEventOgImage({ title: event.title, total: summary.total, date: summary.date });
}
