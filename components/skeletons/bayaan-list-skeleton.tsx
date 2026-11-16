import { Skeleton } from "@/components/ui/skeleton"
import { BayaanSkeleton } from "@/components/skeletons/bayaan-skeleton"
import CONFIG from "@/config/config.json"

// The homepage currently always renders the mobile page size.
const SKELETON_CARD_COUNT = CONFIG.bayaan.pageSize.mobile

// Loading state for AudioList on the homepage.
export function BayaanListSkeleton() {
  const placeholderCards = []
  for (let index = 0; index < SKELETON_CARD_COUNT; index++) {
    placeholderCards.push(<BayaanSkeleton key={index} />)
  }

  return (
    <section className="py-12" aria-busy="true" aria-label="Loading lectures">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header is static text, so it is shown as-is instead of as a skeleton */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Latest Lectures
          </h2>
          <p className="mt-2 text-muted-foreground">
            Discover Islamic knowledge from our respected scholars
          </p>
        </div>

        {/* Region tabs and search input */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-wrap gap-2">
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-full" />
        </div>

        {/* Results count */}
        <Skeleton className="mb-6 h-5 w-48" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderCards}
        </div>
      </div>
    </section>
  )
}
