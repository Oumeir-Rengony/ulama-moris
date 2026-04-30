import { Hero } from "@/components/hero"
import { AudioList } from "@/components/audio-list"
import { getBayaansWithPagination, type Local } from "@/services/bayaans/bayaan.service";
// import { headers } from "next/headers";
// import { getSelectorsByUserAgent } from "react-device-detect";
import { AudioProvider } from '@/contexts/audio-context';
import dayjs from "dayjs";
import { Suspense } from "react";

export const dynamic = 'force-static';


export const dynamicParams = true;

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const queryParams = await searchParams;

  const page = queryParams?.page || 1;

  const startDate = queryParams?.startDate as string || "";
  const endDate = queryParams?.endDate as string || "";
  const search = queryParams?.search as string || "";

  const region = queryParams?.type as Local || "local"
  
  const validStartDate = dayjs(startDate).isValid() ? startDate : "";
  const validEndDate = dayjs(endDate).isValid() ? endDate : "";

  //headers undefine din force-static
  // const userAgent = (await headers()).get('user-agent');
  // const { isMobile } =  getSelectorsByUserAgent(userAgent || "");

  const isMobile = true; // Assuming mobile for now since headers are not available in force-static mode

  const audioListPromise = getBayaansWithPagination({ 
    page: +page,
    startDate: startDate,
    endDate: endDate,
    type: region,
    search: search,
    isMobile: true
    // isMobile: isMobile
  });

  
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <Suspense>
        <AudioProvider>
          <AudioList 
            audioListPromise={audioListPromise}
            currentPage={+page}
            searchQuery={search}
            region={region}
            isMobile={isMobile}
          />
        </AudioProvider>
        </Suspense>
      </main>
    </div>
  )
}
