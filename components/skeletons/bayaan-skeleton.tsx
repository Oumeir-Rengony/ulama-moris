import { Skeleton } from "@/components/ui/skeleton"

// Mirrors the layout of AudioCard so the page does not jump when real cards load.
export function BayaanSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Category badge header */}
      <div className="flex gap-2 border-b border-border bg-secondary/30 px-5 py-2.5 md:py-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="p-5">
        {/* Title */}
        <Skeleton className="mb-3 h-6 w-3/4" />

        {/* Description (two lines) */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Author, masjid and date */}
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-2/5" />
        </div>

        {/* Audio player: progress bar and controls */}
        <div className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Download and share buttons */}
      <div className="flex justify-end gap-2 border-t border-border bg-secondary/30 px-5 py-2.5">
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}
