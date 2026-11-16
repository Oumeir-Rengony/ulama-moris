import { Skeleton } from "@/components/ui/skeleton"
import { RelatedLectureListSkeleton } from "@/components/skeletons/related-lecture-skeleton"

// Shown while a lecture page loads. Links to lectures use prefetch={false},
// so without this the previous page stays frozen until the server responds.
export default function AudioDetailLoading() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading lecture">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Skeleton className="mb-6 h-5 w-40" />

        {/* Title and meta information */}
        <header className="mb-8">
          <Skeleton className="mb-3 h-9 w-full" />
          <Skeleton className="mb-4 h-9 w-2/3" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-40" />
          </div>
        </header>

        {/* Audio player */}
        <Skeleton className="mb-10 h-104 w-full rounded-3xl sm:mb-12 md:h-120" />

        {/* About this episode */}
        <section className="mb-10">
          <Skeleton className="mb-4 h-7 w-52" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>

        {/* More lectures */}
        <section className="mb-10">
          <h2 className="mb-6 text-xl font-semibold text-foreground">More Lectures</h2>
          <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
            <RelatedLectureListSkeleton />
          </div>
        </section>
      </main>
    </div>
  )
}
