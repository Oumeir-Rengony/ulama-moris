import { Skeleton } from "@/components/ui/skeleton"

const PLACEHOLDER_EVENT_COUNT = 5

// Mirrors the layout of EventRow on the events page.
function EventRowSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-5">
      {/* Date badge */}
      <Skeleton className="size-16 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </li>
  )
}

// Shown while the events page loads.
export default function EventsLoading() {
  const placeholderRows = []
  for (let index = 0; index < PLACEHOLDER_EVENT_COUNT; index++) {
    placeholderRows.push(<EventRowSkeleton key={index} />)
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading events">
      {/* The header text is static, so it is shown as-is instead of as a skeleton */}
      <header className="mb-10 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Events</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          Conferences, programmes and gatherings we have recorded. Choose an event to listen to its lectures.
        </p>
        {/* Event count. bg-muted would clash with the green header, so a translucent white is used. */}
        <Skeleton className="mt-6 h-9 w-28 rounded-xl bg-primary-foreground/15" />
      </header>

      <section>
        {/* Year heading */}
        <Skeleton className="mb-4 h-7 w-16" />
        <ul className="space-y-3">{placeholderRows}</ul>
      </section>
    </main>
  )
}
