import { Skeleton } from "@/components/ui/skeleton"

// Shown while an article page loads. With Cache Components the slug is only known
// at request time, so the page needs a Suspense boundary; this file provides it.
export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading article">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Skeleton className="mb-6 h-5 w-40" />

        {/* Title and meta information */}
        <header className="mb-8">
          <Skeleton className="mb-3 h-9 w-full" />
          <Skeleton className="mb-6 h-9 w-2/3" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
          </div>
        </header>

        {/* Cover image */}
        <Skeleton className="mb-10 aspect-video w-full rounded-xl" />

        {/* Article body */}
        <div className="mb-10 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  )
}
