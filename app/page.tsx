import AudioList from "./_components/audio-list";
import Pagination from "@components/pagination";
import Filter from "@components/filter";

import { createAudioListJsonLd, GetBayaanById, getBayaansWithPagination  } from "@services/bayaans/bayaan.service";

import { styled } from "../styled-system/jsx";

import dayjs from "dayjs";
import config from "@config/config.json";
import { getSelectorsByUserAgent } from "react-device-detect";
import { headers } from "next/headers";
import { type ResolvingMetadata, type Metadata } from "next";
import { Suspense } from "react";
import Loading from "@components/loading";
import Footer from "@components/footer";

//dynamic api, force page to be dynamic
export async function generateMetadata(
  { searchParams } : { searchParams: Promise<{ [key: string]: string | string[] | undefined }> },
  parent: ResolvingMetadata
): Promise<Metadata> {

  const id = (await searchParams)?.id as string;

  if(!id){
    return null;
  }
  
  const audio = await GetBayaanById(id);

  const openGraph = (await parent).openGraph || {};
 
  return {
    title: audio?.metaTitle || '',
    description: audio?.metaDescription || '',
    authors: audio?.author || '',
    openGraph: {
      ...openGraph,
      title: audio?.metaTitle || '',
      description: audio?.metaDescription || '',
    },
    alternates: {
      canonical: 'https://ulama-moris.org'
    }
  }
}

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}){  
  const searchParams = await props.searchParams;

  const page = searchParams?.page ? +searchParams?.page : 1;
  const startDate = searchParams?.startDate ? searchParams?.startDate as string : null;
  const endDate = searchParams?.endDate ? searchParams?.endDate as string : null;
  const search = searchParams?.search ? searchParams?.search as string : null;
  
  const validStartDate = dayjs(startDate).isValid() ? startDate : null;
  const validEndDate = dayjs(endDate).isValid() ? endDate : null;

  
  return (
    <Suspense fallback={<Loading/>}>
      <HomeLayout
        key={`${searchParams.page}`}
        page={page}
        startDate={validStartDate}
        endDate={validEndDate}
        search={search}
      />    
    </Suspense>

  );
}


async function HomeLayout({
  page,
  startDate,
  endDate,
  search
}:{
  page: number
  startDate: string
  endDate: string
  search: string
}){

  const userAgent = (await headers()).get('user-agent');
  const { isMobile } =  getSelectorsByUserAgent(userAgent);
  const pageSize = isMobile ? config.bayaan.pageSize.mobile : config.bayaan.pageSize.desktop;

  const audioList = await getBayaansWithPagination({ 
    page: +page,
    startDate: startDate,
    endDate: endDate,
    search: search,
    isMobile: isMobile
  });

  const jsonLd = createAudioListJsonLd(audioList?.items);


  return (
    <StyledWrapper>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="container">
        <div className="row">
          <div className="col">

            <div className="heading">
              <h1 className="heading__title">Islamic Audio Library</h1>
              <p className="heading__subtitle">
                <span className="heading__subtitle-text">Learn Islam through Audio from Our Ulama —</span>
                <span className="heading__subtitle-text">Need Guidance? <a href="https://www.mufti.mu" target="_blank" rel="external" className="ask__link">Ask a Question ✉️</a></span>
              </p>
            </div>

            <Filter />

            <AudioList audioList={audioList?.items}/>

          </div>
        </div>
      </div>

      <div className="fixed-bottom">
        
        <Pagination
          classNames={{base: 'pagination',wrapper: 'pagination-ul'}}
          showControls={true} 
          initialPage={page ? page : 1}
          page={page}
          total={Math.ceil(audioList.total/pageSize)}
        />

        <Footer />

      </div>

    </StyledWrapper>
  )
}


const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;


  & .heading {
    margin: 2rem 0;


    & .heading__title {
      text-align: center;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #6d6b6b;
      font-size: 24px;
      font-weight: 600;

      @media(min-width: 992px){
        font-size: 32px;
      }
    }

    & .heading__subtitle {
      font-size: 14px;
      color: #74746a;
      text-align: center;
      padding: 0 12px;

      @media(min-width: 992px){
        font-size: 18px;
      } 

      & .heading__subtitle-text {
        display: block;

        @media(min-width: 768px){
          display: inline;
        }
      }
        
      & .ask__link {
        color: #0070f0;
        text-decoration: none;
        font-weight: bold;
        margin-left: 6px;
      }

      & .ask__link:hover {
        text-decoration: underline;
      }
    }

  }

  & .filter {
    margin: 24px 16px 40px;
  }


  & .audio__list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 100%;
    margin: 1rem;

    @media(min-width: 768px){
      display: grid;
      /* 100px here is the min width of that the content takes else its auto 
         which is the content size itself. hence it larger and causes overflowing.
         It is just a way of making the browser not overflowing content out of grid
      */
      grid-template-columns: repeat(2, minmax(100px, 1fr));
      grid-gap: 1rem;
    }


    @media(min-width: 1400px){
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      grid-gap: 2rem;
    }

    & .audio__card {
      @media(min-width: 768px){
        margin: 0;
      }
    }


  }

  
  & .fixed-bottom {
    margin-top: auto;


    & .pagination {
      margin: 20px auto;

      & .pagination-ul {
        margin: auto;
      }
    }


  }

`;