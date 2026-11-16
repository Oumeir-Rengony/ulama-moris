import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { BayaanSkeleton } from "@/components/skeletons/bayaan-skeleton"

const PLACEHOLDER_LECTURE_COUNT = 6

// On the green header, bg-muted would clash, so a translucent white is used instead.
const ON_PRIMARY_SKELETON = "bg-primary-foreground/15"

// Shown while an event page loads.
export default function EventLoading() {
  const placeholderCards = []
  for (let index = 0; index < PLACEHOLDER_LECTURE_COUNT; index++) {
    placeholderCards.push(<BayaanSkeleton key={index} />)
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading event">
      <Link href="/events" prefetch={false} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All events
      </Link>

      <header className="mb-10 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
        {/* "Event" label */}
        <Skeleton className={`mb-5 h-7 w-20 rounded-full ${ON_PRIMARY_SKELETON}`} />

        {/* Title */}
        <Skeleton className={`mb-3 h-9 w-full max-w-2xl ${ON_PRIMARY_SKELETON}`} />
        <Skeleton className={`h-9 w-1/2 ${ON_PRIMARY_SKELETON}`} />

        {/* Summary pills */}
        <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          <Skeleton className={`h-9 w-44 rounded-xl ${ON_PRIMARY_SKELETON}`} />
          <Skeleton className={`h-9 w-48 rounded-xl ${ON_PRIMARY_SKELETON}`} />
          <Skeleton className={`h-9 w-36 rounded-xl ${ON_PRIMARY_SKELETON}`} />
        </div>
      </header>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Lectures from this event</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderCards}
      </div>
    </main>
  )
}
