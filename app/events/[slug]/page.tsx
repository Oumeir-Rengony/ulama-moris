import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Radio, Layers3, Clock3, MapPin } from "lucide-react";
import { AudioCard } from "@/components/audio-card";
import CONFIG from "@/config/config.json";
import { AudioProvider } from "@/contexts/audio-context";
import { getEventPath } from "@/lib/events";
import { getBayaansWithPagination } from "@/services/bayaans/bayaan.service";
import { getEventBySlug, getEventSummary } from "@/services/bayaans/event.service";
import { toTitleCase } from "@/lib/utils";
import { parsePageParam } from "@/lib/search-params";

export const revalidate = 86400; // 24 hours in seconds

type EventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const title = `${event.title} | Ulama Moris`;
  const description = `Listen to all bayaans from ${event.title}.`;
  const path = getEventPath(event.title);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const query = await searchParams;
  const page = parsePageParam(query.page);
  const [audioList, summary] = await Promise.all([
    getBayaansWithPagination({ events: event.names, page, isMobile: false }),
    getEventSummary(event.names),
  ]);
  if (!audioList) {
    throw new Error("Unable to load event lectures");
  }

  const totalPages = Math.ceil(audioList.total / CONFIG.bayaan.pageSize.desktop);
  if (page > 1 && page > totalPages) {
    notFound();
  }

  const path = getEventPath(event.title);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ulama-moris.org";
  const navigationClassName = "rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/events" prefetch={false} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All events
      </Link>

      <header className="mb-10 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
          <Radio className="size-4 shrink-0" aria-hidden="true" />
          Event
        </p>
        <h1 className="max-w-4xl break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{event.title}</h1>
        <ul aria-label="Event summary" className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          <li className="inline-flex max-w-full items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
            <Layers3 className="size-4 shrink-0" aria-hidden="true" />
            <span>{summary.total} {summary.total === 1 ? "recorded lecture" : "recorded lectures"}</span>
          </li>
          {summary.duration && (
            <li className="inline-flex max-w-full items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
              <Clock3 className="size-4 shrink-0" aria-hidden="true" />
              <span>{summary.duration} total duration</span>
            </li>
          )}
          {summary.location && (
            <li className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{toTitleCase(summary.location)}</span>
            </li>
          )}
        </ul>
      </header>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Lectures from this event</h2>

      {audioList.items.length > 0 ? (
        <AudioProvider>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audioList.items.map((item: any) => (
              <AudioCard
                key={item.sys.id}
                id={item.sys.id}
                title={item.title}
                slug={item.slug}
                description={item.description}
                author={item.author}
                masjid={item.masjid?.title}
                masjidLocation={item.masjid?.geoLink}
                duration={item.duration}
                date={item.date}
                audioSrc={`${item.audio?.url}?t=${item.audio?.sys?.publishedAt}&tag=audio:${item.audio?.sys?.id}`}
                downloadSrc={`/api/download?url=${item.audio?.url}?t=${item.audio?.sys?.publishedAt}&tag=audio:${item.audio?.sys?.id}`}
                category={item.category}
                whatsAppLink={`whatsapp://send?text=${siteUrl}/audio/${item.slug}`}
              />
            ))}
          </div>
        </AudioProvider>
      ) : (
        <p className="py-12 text-center text-muted-foreground">No lectures are available for this event yet.</p>
      )}

      {totalPages > 1 && (
        <nav aria-label="Event lecture pages" className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {page > 1 && (
            <Link href={`${path}?page=${page - 1}`} prefetch={false} rel="prev" className={navigationClassName}>Previous</Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`${path}?page=${page + 1}`} prefetch={false} rel="next" className={navigationClassName}>Next</Link>
          )}
        </nav>
      )}
    </main>
  );
}
