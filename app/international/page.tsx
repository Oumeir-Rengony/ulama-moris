import AudioList from "../_components/audio-list";
import Pagination from "@components/pagination";
import Filter from "@components/filter";

import { createAudioListJsonLd, GetBayaanById, getBayaansWithPagination  } from "@services/bayaans/bayaan.service";

import dayjs from "dayjs";
import config from "@config/config.json";
import { getSelectorsByUserAgent } from "react-device-detect";
import { headers } from "next/headers";
import { type ResolvingMetadata, type Metadata } from "next";
import { Suspense } from "react";
import Loading from "@components/loading";
import Footer from "@components/footer";
import BayaanSwicther from "@components/bayaan-switcher";
import { styled } from "styled-system/jsx";


const metaDesc = "Discover inspiring talks on the life and teachings of Prophet Muhammad (ﷺ) by respected Ulama from outside Mauritius, grounded in the Qur’an and Sunnah to help you strengthen your faith and grow spiritually—wherever you are.";





//dynamic api, force page to be dynamic
export async function generateMetadata(
  { searchParams } : { searchParams: Promise<{ [key: string]: string | string[] | undefined }> },
  parent: ResolvingMetadata
): Promise<Metadata> {

  const id = (await searchParams)?.id as string;

  if(!id){
    return {
      title: "Listen to Qur’an, Hadith & Islamic Lectures | Ulama Moris",
      description: metaDesc,
      icons: "/favicon.ico",
      alternates: {
        canonical: "https://ulama-moris.org/international"
      },
      openGraph: {
        title: config.meta.title,
        description: "Discover inspiring talks on the life and teachings of Prophet Muhammad (ﷺ) by respected Ulama from outside Mauritius, grounded in the Qur’an and Sunnah to help you strengthen your faith and grow spiritually—wherever you are.",
        siteName: "Ulama Moris",
        type: 'website',
        url: 'https://ulama-moris.org/international',
        images: {
          width: 900,
          height: 600,
          url: 'https://images.ctfassets.net/n7lbwg9xm90s/3piSujtUCq7IuclAQAeqtl/a3d014dd9277e17f73d07b31bb661724/open-graph-image.png'
        }
      }
    }
  }
  
  const audio = await GetBayaanById(id);

  const openGraph = (await parent).openGraph || {};
 
  return {
    title: audio?.metaTitle || '',
    description: audio?.metaDescription || metaDesc,
    authors: audio?.author || '',
    openGraph: {
      ...openGraph,
      title: audio?.metaTitle || '',
      description: audio?.metaDescription || metaDesc,
      url: 'https://ulama-moris.org/international',
    },
    alternates: {
      canonical: 'https://ulama-moris.org/international'
    }
  }
}

export default async function International(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}){  
  const searchParams = await props.searchParams;

  const page = searchParams?.page ? +searchParams?.page : 1;
  const startDate = searchParams?.startDate ? searchParams?.startDate as string : "";
  const endDate = searchParams?.endDate ? searchParams?.endDate as string : "";
  const search = searchParams?.search ? searchParams?.search as string : "";
  
  const validStartDate = dayjs(startDate).isValid() ? startDate : "";
  const validEndDate = dayjs(endDate).isValid() ? endDate : "";

  
  return (
    <Suspense fallback={<Loading/>}>
      <PageLayout
        key={`${searchParams.page}`}
        page={page}
        startDate={validStartDate}
        endDate={validEndDate}
        search={search}
      />    
    </Suspense>

  );
}


async function PageLayout({
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
  const { isMobile } =  getSelectorsByUserAgent(userAgent || "");
  const pageSize = isMobile ? config.bayaan.pageSize.mobile : config.bayaan.pageSize.desktop;

  const audioList = await getBayaansWithPagination({ 
    page: +page,
    startDate: startDate,
    endDate: endDate,
    type: "international",
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

            <BayaanSwicther />

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

  & .tabs {

    @media(min-width: 768px){
      width: max-content;
      
      & .tab {
        flex: unset;
      }
    }

  }


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