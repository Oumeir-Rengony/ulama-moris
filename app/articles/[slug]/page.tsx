import Link from "next/link"
import Image from "next/image"
import { RichTextRenderer } from "@/components/rich-text-renderer"
import {
  User,
  Calendar,
  ArrowLeft,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { arrayify } from "@/lib/utils"
import { getArticleBySlug, getArticleSlugs, getRelatedArticles, createArticleJsonLd } from "@/services/articles/article.service"
import dayjs from "dayjs"
import CONFIG from "@/config/config.json"
import { Suspense } from "react"
import type { Metadata, ResolvingMetadata } from "next"
import { getPostHogClient } from "@/lib/posthog-server"

export const dynamicParams = true

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const articleList = await getArticleSlugs()

  return articleList?.items?.map((article: any) => ({
    slug: article?.slug,
  })) || []
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params

  const { data } = await getArticleBySlug({ slug })

  const openGraph = (await parent).openGraph || {}

  return {
    title: data?.title || "",
    description: data?.excerpt || "",
    authors: [{ name: data?.author || "" }],
    openGraph: {
      ...openGraph,
      title: data?.title || "",
      description: data?.excerpt || "",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}articles/${slug}`,
      images: data?.coverImage?.url ? [{ url: data.coverImage.url }] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`
    }
  }
}

async function RelatedArticlesSection({
  relatedArticlesPromise
}: {
  relatedArticlesPromise: Promise<any[]>
}) {
  const relatedArticles = await relatedArticlesPromise

  if (!relatedArticles || relatedArticles.length === 0) {
    return null
  }

  return (
    <section className="mb-10">
      <h2 className="mb-6 text-xl font-semibold text-foreground">More Articles</h2>
      <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
        {relatedArticles.map((item: any) => (
          <RelatedArticleCard key={item?.sys?.id} item={item} slug={item?.slug} />
        ))}
      </div>
    </section>
  )
}

function RelatedArticleCard({
  item,
  slug
}: {
  item: any
  slug: string
}) {
  return (
    <Link href={`/articles/${slug}`} prefetch={false}>
      <article className="h-full group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
        {item.coverImage?.url && (
          <div className="mb-3 aspect-video overflow-hidden rounded-lg">
            <Image
              src={item.coverImage.url}
              alt={item.coverImage.title || item.title}
              width={300}
              height={170}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <h4 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {item.title}
        </h4>
        <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>{item.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{dayjs(item?.date).format(CONFIG.article.displayFormat)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug

  const { data, total } = await getArticleBySlug({ slug })

  const relatedArticlesPromise = getRelatedArticles({
    currentSlug: slug,
    category: data?.category,
    totalArticles: total
  })

  const jsonLd = createArticleJsonLd(data)

  if (data) {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: "anonymous",
      event: "article_detail_viewed",
      properties: {
        article_slug: slug,
        article_title: data?.title,
        article_author: data?.author,
      },
    })
    await posthog.shutdown()
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Article Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            The article you&apos;re looking for could not be found.
          </p>
          <Link href="/articles" prefetch={false}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Link
          prefetch={false}
          href="/articles"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>

        {/* Header Section */}
        <header className="mb-8">
          {/* Category */}
          {(data?.category && data.category.length > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {arrayify(data.category).map((category: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border-border">
                  {category}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl text-balance">
            {data?.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <time>{dayjs(data?.sys.publishedAt).format(CONFIG.article.displayFormat)}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{data?.author}</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {data?.coverImage?.url && (
          <figure className="mb-10 overflow-hidden rounded-xl">
            <Image
              src={data.coverImage.url}
              alt={data.coverImage.title || data.title}
              width={data.coverImage.width || 1200}
              height={data.coverImage.height || 630}
              className="w-full object-cover"
              priority
            />
          </figure>
        )}

        {/* Article Body */}
        {data?.content && (
          <article className="mb-10">
            <RichTextRenderer content={data?.content} />
          </article>
        )}

        {/* More Articles Section */}
        <Suspense fallback={
          <section className="mb-10">
            <h2 className="mb-6 text-xl font-semibold text-foreground">More Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="animate-pulse">
                    <div className="mb-3 aspect-video bg-muted rounded-lg" />
                    <div className="h-5 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        }>
          <RelatedArticlesSection relatedArticlesPromise={relatedArticlesPromise}/>
        </Suspense>
      </main>
    </div>
  )
}