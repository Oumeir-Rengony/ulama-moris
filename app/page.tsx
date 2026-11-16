import { Hero } from "@/components/hero"
import { AudioList } from "@/components/audio-list"
import { getBayaansWithPagination, type Local } from "@/services/bayaans/bayaan.service";
import { AudioProvider } from '@/contexts/audio-context';
import { Suspense } from "react";
import { parseDateParam, parsePageParam } from "@/lib/search-params";
import { BayaanListSkeleton } from "@/components/skeletons/bayaan-list-skeleton";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// The hero and the skeleton need no request data, so they are prerendered into the
// static shell. The lecture list depends on the URL query, so it streams in per request.
export default function Home({
  searchParams
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <Suspense fallback={<BayaanListSkeleton />}>
          <LectureListSection searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}

async function LectureListSection({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const queryParams = await searchParams;

  // The URL can be edited by hand, so bad values fall back to safe defaults.
  const page = parsePageParam(queryParams?.page);
  const startDate = parseDateParam(queryParams?.startDate);
  const endDate = parseDateParam(queryParams?.endDate);

  let search = "";
  if (typeof queryParams?.search === "string") {
    search = queryParams.search;
  }

  const region = queryParams?.type as Local || "local"

  // The page size is fixed to mobile for now, so every visitor shares the same cache entries.
  const isMobile = true;

  // getBayaansWithPagination is cached ("use cache"), so each filter combination
  // only reaches Contentful once per cache lifetime.
  const audioListPromise = getBayaansWithPagination({
    page: page,
    startDate: startDate,
    endDate: endDate,
    type: region,
    search: search,
    isMobile: isMobile
  });

  return (
    <AudioProvider>
      <AudioList
        audioListPromise={audioListPromise}
        currentPage={page}
        searchQuery={search}
        region={region}
        isMobile={isMobile}
      />
    </AudioProvider>
  )
}
