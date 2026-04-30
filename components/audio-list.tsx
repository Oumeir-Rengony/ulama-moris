"use client"

import { useState, use, useRef, useMemo, ChangeEvent, useTransition } from "react"
import { AudioCard } from "@/components/audio-card"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import CONFIG from "@/config/config.json";
import { Local } from "@/services/bayaans/bayaan.service"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn, createQueryString } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounce";

export function AudioList({
  audioListPromise,
  currentPage=1,
  searchQuery,
  region,
  isMobile
}: {
  audioListPromise: Promise<any>;
  currentPage?: number;
  searchQuery?: string;
  region?: Local;
  isMobile?: boolean;
}) {

  const audioList = use(audioListPromise);

  const router = useRouter();
  const searchParams = useSearchParams()
  const pathname = usePathname();

  const lectureRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  const ITEMS_PER_PAGE = isMobile ? CONFIG.bayaan.pageSize.mobile : CONFIG.bayaan.pageSize.desktop;
  const totalAudio = audioList?.total || 1;

  const regions: { value: Local; label: string }[] = [
    { value: "local", label: "Local Bayaan" },
    { value: "international", label: "International" },
  ]

  const debounceOptions = useMemo(() => ({
    leading: false,
    trailing: true,
  }),[]);

  const onSearch = (query: string) => {
    const params = createQueryString(searchParams, {
      search: query
    })
    router.push(`${pathname}?${params}`, {scroll: false})
  }


  const debouncedUpdate = useDebouncedCallback(
    (nextValue: string) => {
      onSearch(nextValue);
    },
    490,
    [onSearch],
    debounceOptions
  );


  // Pagination calculations
  const totalPages = Math.ceil(audioList?.total / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  
  const handleRegionChange = (region: Local) => {
    startTransition(() => {
      const params = createQueryString(searchParams, {
        type: region
      })
      router.push(`${pathname}?${params}`, { scroll: false})
    })
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedUpdate(value)
  }

  const handleSearchBlur = () => {
    debouncedUpdate.flush()
  }

  const goToPage = (page: number | string) => {
    if(+page === currentPage){
      return
    }

    const params = createQueryString(searchParams, {
      page: `${page}`
    });

    router.push(`${pathname}?${params}#lectures`)
    
    // Scroll to top of list
    // document.getElementById("audio-list")?.scrollIntoView({ behavior: "smooth" })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }

    return pages
  }

  return (
    <section id="audio-list" className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div id="lectures" className="mb-8" ref={lectureRef}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Latest Lectures
          </h2>
          <p className="mt-2 text-muted-foreground">
            Discover Islamic knowledge from our respected scholars
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full">
            {regions?.map((item) => (
              <button
                key={item.value}
                onClick={() => handleRegionChange(item.value)}
                disabled={isPending}
                className={cn("cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all",
                  region === item.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  isPending ? "opacity-60 " : ""
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lectures..."
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, totalAudio)} of {totalAudio} lectures
        </div>

        {/* Audio Grid */}
        {audioList?.items?.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audioList?.items?.map((item: any) => (
              <div key={item.sys.id}>

              <AudioCard
                id={item.sys.id}
                title={item.title}
                slug={item.slug}
                description={item.description}
                author={item.author}
                masjid={item.masjid?.title}
                masjidLocation={item?.masjid?.geoLink}
                duration={item?.duration}
                date={item.date}
                // audioSrc={`/api/audio?url=${item?.audio?.url}?v=${item?.audio?.sys?.publishedAt}`}
                audioSrc={item?.audio?.url}
                category={item.category}
                whatsAppLink={`whatsapp://send?text=${process.env.NEXT_PUBLIC_SITE_URL}/audio/${item?.slug}`}
              />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No lectures found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`flex h-10 w-10 items-center justify-center cursor-pointer rounded-full text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
