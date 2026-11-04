import { getBayaanBySlug } from "@/services/bayaans/bayaan.service";
import { getEventBySlug, getEventSummary } from "@/services/bayaans/event.service";
import { createAudioOgImage } from "@/lib/og/audio-image";
import { createEventOgImage } from "@/lib/og/event-image";

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const slug = query.get("slug");
  const title = query.get("title")?.trim();
  if (!slug) return new Response("Choose an event or audio lecture", { status: 400 });
  if (title && title.length > 2000) return new Response("Title must be 2000 characters or fewer", { status: 400 });

  if (query.get("type") === "audio") {
    const { data } = await getBayaanBySlug({ slug });
    if (!data) return new Response("Audio not found", { status: 404 });
    return createAudioOgImage({ title: title || data.metaTitle || data.title, author: data.author });
  }

  const event = await getEventBySlug(slug);
  if (!event) return new Response("Event not found", { status: 404 });
  const summary = await getEventSummary(event.names);
  return createEventOgImage({ title: title || event.title, total: summary.total, date: summary.date });
}
