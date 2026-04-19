"use client"

import { useState, use, useRef, useMemo, ChangeEvent, useTransition } from "react"
import { ArticleCard } from "@/components/article-card"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import CONFIG from "@/config/config.json"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createQueryString } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounce"

export function ArticleList({
  articleListPromise,
  currentPage = 1,
  searchQuery,
  category,
  isMobile
}: {
  articleListPromise: Promise<any>;
  currentPage?: number;
  searchQuery?: string;
  category?: string;
  isMobile?: boolean;
}) {
  const articleList = use(articleListPromise)

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const articleRef = useRef<HTMLDivElement>(null)

  const [isPending, startTransition] = useTransition()

  const ITEMS_PER_PAGE = isMobile ? CONFIG.article.pageSize.mobile : CONFIG.article.pageSize.desktop
  const totalArticles = articleList?.total || 1

  const debounceOptions = useMemo(() => ({
    leading: false,
    trailing: true,
  }), [])

  const onSearch = (query: string) => {
    const params = createQueryString(searchParams, {
      search: query,
      page: "1"
    })
    router.push(`${pathname}?${params}`, { scroll: false })
  }

  const debouncedUpdate = useDebouncedCallback(
    (nextValue: string) => {
      onSearch(nextValue)
    },
    490,
    [onSearch],
    debounceOptions
  )

  // Pagination calculations
  const totalPages = Math.ceil(articleList?.total / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    debouncedUpdate(value)
  }

  const handleSearchBlur = () => {
    debouncedUpdate.flush()
  }

  const goToPage = (page: number | string) => {
    if (+page === currentPage) {
      return
    }

    const params = createQueryString(searchParams, {
      page: `${page}`
    })

    router.push(`${pathname}?${params}#articles`)
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
    <section id="articles" className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div id="article-list" className="mb-8" ref={articleRef}>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Latest Articles
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore Islamic knowledge through our written articles
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              defaultValue={searchQuery}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, totalArticles)} of {totalArticles} articles
        </div>

        {/* Article Grid */}
        {articleList?.items?.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articleList?.items?.map((item: any) => (
              <div key={item.sys.id}>
                <ArticleCard
                  id={item.sys.id}
                  title={item.title}
                  slug={item.slug}
                  excerpt={item.excerpt}
                  author={item.author}
                  date={item.sys.publishedAt}
                  category={item.category}
                  coverImage={item.coverImage}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria
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
                    className={`flex h-10 w-10 items-center justify-center cursor-pointer rounded-full text-sm font-medium transition-colors ${currentPage === page
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
