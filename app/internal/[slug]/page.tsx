import Link from "next/link"
import { Header } from "@/components/header"
import { AudioDetailPlayer } from "@/components/audio-player"
import {
  User,
  MapPin,
  Calendar,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { arrayify, cleanDescription, toTitleCase } from "@/lib/utils"
import { getBayaanBySlug, getBayaanSlug, getRelatedBayaans } from "@/services/bayaans/bayaan.service"
import dayjs from "dayjs"
import CONFIG from "@/config/config.json";
import { Suspense } from "react"
import type { Metadata, ResolvingMetadata } from "next"
import { AudioProvider } from "@/contexts/audio-context"

export const dynamic = 'force-static';


export const dynamicParams = true;

// Return a list of `params` to populate the [slug] dynamic segment
// export async function generateStaticParams() {
//   const audioList = await getBayaanSlug();

//   return audioList?.items?.map((audio:any) => ({
//     slug: audio?.slug,
//   }))
// }

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {

  const { slug } = await params;

  const { data } = await getBayaanBySlug({ slug });

  const openGraph = (await parent).openGraph || {};

  return {
    title: data?.metaTitle || '',
    description: data?.metaDescription || '',
    authors: data?.author || '',
    openGraph: {
      ...openGraph,
      title: data?.metaTitle || '',
      description: data?.metaDescription || '',
      url: `https://ulama-moris.org/audio/${slug}`,
      audio: {
        url: data?.audio?.url || ''
      },
    },
    alternates: {
      canonical: `https://ulama-moris.org/audio/${slug}`
    }
  }
}


async function RelatedLectureSection({
  relatedLecturesPromise
}: {
  relatedLecturesPromise: Promise<any[]>
}) {
  const relatedLectures = await relatedLecturesPromise;

  return (
    <>
      {relatedLectures.map((item: any) => (
        <RelatedLectureCard key={item?.sys?.id} item={item} slug={item?.slug} />
      ))}
    </>
  )
}

function RelatedLectureCard({
  item,
  slug
}: {
  item: any;
  slug: string
}) {

  return (
    <Link href={`/audio/${slug}`} prefetch={false}>
      <article className="h-full group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
        <h4 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {item.title}
        </h4>
        <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>{item.author}</span>
          </div>
          {/* {item.masjid?.title && (
              <a href={item?.masjid?.geoLink || "#"} className="flex items-center gap-2 text-sm text-muted-foreground pointer-events-none">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{toTitleCase(item?.masjid?.title)}</span>
              </a>
            )} */}
          {item.masjid?.title && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{toTitleCase(item?.masjid?.title)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{dayjs(item?.date).format(CONFIG.bayaan.displayFormat)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default async function AudioDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug;

  const { data, total } = await getBayaanBySlug({
    slug: slug
  });

  const relatedLecturesPromise = getRelatedBayaans({
    currentSlug: slug,
    event: data?.event,
    date: data?.date,
    category: data?.category,
    totalBayaans: total
  })

  const audioDescription = cleanDescription(data?.description);


  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Audio Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            The audio lecture you&apos;re looking for could not be found.
          </p>
          <Link href="/" prefetch={false}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Link
          prefetch={false}
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all lectures
        </Link>

        {/* Header Section */}
        <header className="mb-8">

          {data?.category?.length &&
            <div className="flex justify-between py-3">
              <div className="flex items-center gap-2">
                {
                  arrayify(data?.category)?.map((cat, idx) => (
                    <span key={idx} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border-border`}>
                      {cat}
                    </span>
                  ))
                }
              </div>
            </div>
          }

          <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl text-balance">
            {data?.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <time>{dayjs(data?.date).format(CONFIG.bayaan.displayFormat)}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{data?.author}</span>
            </div>
            {data?.masjid?.title && (
              <a href={data?.masjid?.geoLink || "#"} className="flex items-center gap-2 text-sm text-muted-foreground pointer-events-none">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{toTitleCase(data?.masjid?.title)}</span>
              </a>
            )}
          </div>
        </header>

        <div className="mb-10">
          <AudioProvider>
            <AudioDetailPlayer 
              id={data?.sys?.id} 
              audioSrc={`/api/audio?url=${data?.audio?.url}?v=${data?.audio?.sys?.publishedAt}`}
              // audioSrc={data?.audio?.url}
              duration={data?.duration} 
              title={data?.title}
            />
          </AudioProvider>
        </div>

        {/* About Section */}
        {
          audioDescription &&
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">About this episode</h2>
            <div className="leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: audioDescription }} />
          </section>
        }

        {/* More Lectures Section */}
        <Suspense>
          <section className="mb-10">
            <h2 className="mb-6 text-xl font-semibold text-foreground">More Lectures</h2>
            <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
              <RelatedLectureSection relatedLecturesPromise={relatedLecturesPromise} />
            </div>
          </section>
        </Suspense>

        {/* Related Fatwas Section */}
        {/* <section className="rounded-xl border border-border bg-secondary/30 p-6">
          <h2 className="mb-3 text-xl font-semibold text-foreground">Related Fatwas</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            You can find more fatwas on mufti.mu (Darul Iftaa Nu&apos;maniyyah)
          </p>
          <a 
            href="https://mufti.mu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Visit mufti.mu
            <ExternalLink className="h-4 w-4" />
          </a>
        </section> */}
      </main>
    </div>
  )
}
