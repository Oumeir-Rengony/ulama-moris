import { Hero } from "@/components/hero"
import { AudioList } from "@/components/audio-list"
import { getBayaansWithPagination, type Local } from "@/services/bayaans/bayaan.service";
import { headers } from "next/headers";
import { getSelectorsByUserAgent } from "react-device-detect";
import { AudioProvider } from '@/contexts/audio-context';
import dayjs from "dayjs";

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

  const userAgent = (await headers()).get('user-agent');
  const { isMobile } =  getSelectorsByUserAgent(userAgent || "");

  const audioListPromise = getBayaansWithPagination({ 
    page: +page,
    startDate: startDate,
    endDate: endDate,
    type: region,
    search: search,
    isMobile: isMobile
  });

  
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <AudioProvider>
          <AudioList 
            audioListPromise={audioListPromise}
            currentPage={+page}
            searchQuery={search}
            region={region}
            isMobile={isMobile}
          />
        </AudioProvider>
      </main>
    </div>
  )
}
