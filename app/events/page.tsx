import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Clock3, Layers3, MapPin, Radio } from "lucide-react";
import CONFIG from "@/config/config.json";
import type { EventDirectoryEntry } from "@/lib/events";
import { toTitleCase } from "@/lib/utils";
import { getEventDirectory } from "@/services/bayaans/event.service";

export const revalidate = 86400; // 24 hours in seconds

const title = "Events | Ulama Moris";
const description = "Browse every event recorded by Ulama Moris and open one to listen to its lectures.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/events" },
  openGraph: { title, description, url: "/events" },
};

type EventsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

type EventYearGroup = {
  heading: string;
  events: EventDirectoryEntry[];
};

function groupEventsByYear(events: EventDirectoryEntry[]): EventYearGroup[] {
  const groups: EventYearGroup[] = [];
  const undatedEvents: EventDirectoryEntry[] = [];

  // Events arrive newest first, so a new year heading starts whenever the year changes.
  for (const event of events) {
    if (!event.year) {
      undatedEvents.push(event);
      continue;
    }

    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.heading === event.year) {
      currentGroup.events.push(event);
    } else {
      groups.push({ heading: event.year, events: [event] });
    }
  }

  if (undatedEvents.length > 0) {
    groups.push({ heading: "Other events", events: undatedEvents });
  }

  return groups;
}

function EventDateBadge({ event }: { event: EventDirectoryEntry }) {
  if (!event.day || !event.month) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Radio className="size-6" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
      <span className="text-2xl font-bold leading-none">{event.day}</span>
      <span className="mt-1 text-xs font-medium">{event.month}</span>
    </div>
  );
}

function EventRow({ event }: { event: EventDirectoryEntry }) {
  const lectureLabel = event.total === 1 ? "1 lecture" : `${event.total} lectures`;

  return (
    <li>
      <Link
        href={event.path}
        prefetch={false}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-5 sm:p-5"
      >
        <EventDateBadge event={event} />

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {event.title}
          </h3>

          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <Layers3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {lectureLabel}
            </li>
            {event.dateRange && (
              <li className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {event.dateRange}
              </li>
            )}
            {event.duration && (
              <li className="inline-flex items-center gap-1.5">
                <Clock3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {event.duration}
              </li>
            )}
            {event.location && (
              <li className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 break-words">{toTitleCase(event.location)}</span>
              </li>
            )}
          </ul>
        </div>

        <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex">
          View lectures
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground sm:hidden" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const query = await searchParams;
  const requestedPage = typeof query.page === "string" ? Number(query.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const events = await getEventDirectory();
  const pageSize = CONFIG.bayaan.pageSize.desktop;
  const totalPages = Math.ceil(events.length / pageSize);
  if (page > 1 && page > totalPages) {
    notFound();
  }

  const firstEventIndex = (page - 1) * pageSize;
  const eventsOnPage = events.slice(firstEventIndex, firstEventIndex + pageSize);
  const yearGroups = groupEventsByYear(eventsOnPage);
  const navigationClassName = "rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-10 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Events</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          Conferences, programmes and gatherings we have recorded. Choose an event to listen to its lectures.
        </p>
        {events.length > 0 && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
            <Radio className="size-4 shrink-0" aria-hidden="true" />
            {events.length === 1 ? "1 event" : `${events.length} events`}
          </p>
        )}
      </header>

      {yearGroups.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No events have been published yet.</p>
          <Link href="/" prefetch={false} className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            Browse all lectures
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {yearGroups.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {group.heading}
            </h2>
            <ul className="space-y-3">
              {group.events.map((event) => (
                <EventRow key={event.slug} event={event} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Event pages" className="mt-10 flex flex-wrap items-center justify-center gap-6">
          {page > 1 && (
            <Link href={`/events?page=${page - 1}`} prefetch={false} rel="prev" className={navigationClassName}>Previous</Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/events?page=${page + 1}`} prefetch={false} rel="next" className={navigationClassName}>Next</Link>
          )}
        </nav>
      )}
    </main>
  );
}
