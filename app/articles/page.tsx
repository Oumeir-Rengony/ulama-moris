import { Suspense } from "react"
import { headers } from "next/headers"
import type { Metadata } from "next"
import { ArticleList } from "@/components/article-list"
import { JsonLdScript } from "@/components/json-ld-script"
import { getArticlesWithPagination, createArticleListJsonLd } from "@/services/articles/article.service"

export const metadata: Metadata = {
  title: "Islamic Articles | Ulama Moris",
  description: "Read Islamic articles on various topics including Qur'an, Hadith, Fiqh, and Islamic spirituality from respected scholars.",
  openGraph: {
    title: "Islamic Articles | Ulama Moris",
    description: "Read Islamic articles on various topics including Qur'an, Hadith, Fiqh, and Islamic spirituality from respected scholars.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// The fallback is prerendered into the static shell. The list depends on the URL
// query and the user agent, so it streams in per request.
export default function ArticlesPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Suspense fallback={<ArticleListFallback />}>
          <ArticleListSection searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}

async function ArticleListSection({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const page = Number(params?.page) || 1
  const search = typeof params?.search === "string" ? params.search : ""
  const category = typeof params?.category === "string" ? params.category : ""

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile = /mobile/i.test(userAgent)

  // JSON-LD needs the articles, so the list is awaited here instead of streamed.
  const articleList = await getArticlesWithPagination({
    page,
    search,
    category,
    isMobile
  })
  const jsonLd = createArticleListJsonLd(articleList?.items || [])

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <ArticleList
        articleListPromise={Promise.resolve(articleList)}
        currentPage={page}
        searchQuery={search}
        category={category}
        isMobile={isMobile}
      />
    </>
  )
}

function ArticleListFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="h-40 bg-muted rounded mb-4" />
              <div className="h-5 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
