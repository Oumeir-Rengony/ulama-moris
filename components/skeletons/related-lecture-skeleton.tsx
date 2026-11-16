import { Skeleton } from "@/components/ui/skeleton"

// The lecture page asks for 4 related lectures.
const RELATED_LECTURE_COUNT = 4

// Mirrors the layout of RelatedLectureCard on the lecture page.
function RelatedLectureCardSkeleton() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      {/* Title (up to two lines) */}
      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-3 h-5 w-2/3" />

      {/* Author, masjid and date */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  )
}

// Fills the "More Lectures" grid while related lectures load.
export function RelatedLectureListSkeleton() {
  const placeholderCards = []
  for (let index = 0; index < RELATED_LECTURE_COUNT; index++) {
    placeholderCards.push(<RelatedLectureCardSkeleton key={index} />)
  }

  return <>{placeholderCards}</>
}
