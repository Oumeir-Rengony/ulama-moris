import Image from "next/image";

import Pagination from "@components/Pagination";
import Filter from "@components/Filter";

import { GetBayaanById, GetBayaans } from "@services/bayaans/bayaan.service";

import { styled } from "../styled-system/jsx";

import dayjs from "dayjs";
import config from "@config/config.json";
import { getSelectorsByUserAgent } from "react-device-detect";
import { headers } from "next/headers";
import { type ResolvingMetadata, type Metadata } from "next";
import AudioList from "./_components/audio-list";
import { MailPlus as MailPlusIcon } from "lucide-react";
import { Suspense } from "react";
import Loading from "@components/Loading";


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
    title: audio.metaTitle || '',
    description: audio.metaDescription || '',
    authors: audio.author || '',
    openGraph: {
      ...openGraph,
      title: audio.metaTitle || '',
      description: audio.metaDescription || '',
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

  const audioList = await GetBayaans({ 
    page: +page,
    startDate: startDate,
    endDate: endDate,
    search: search,
    isMobile: isMobile
  });

  return (
    <StyledWrapper>

      <div className="container">
        <div className="row">
          <div className="col">

            <div className="heading">
              <h1 className="heading__title">Bayaan par les Ulama de Moris</h1>
              <a href="https://www.mufti.mu" target="_blank">
                <button className="ask-btn">Ask a Question <MailPlusIcon size={20}/> </button>
              </a>
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

        <footer className="footer">
          <div className="container">
            <div className="row">
              <div className="col">
                  <Image loading="lazy" width={90} height={56} className="footer-item img" src="/logo.webp" alt="logo"/>
                  <p className="footer-item">contact: ulama.moris@gmail.com</p>
              </div>
              </div>
          </div>
        </footer>

      </div>

    </StyledWrapper>
  )
}


const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;


  & .heading {
    margin: 2rem 1rem 12px 1rem;

    @media(min-width: 992px){
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & .heading__title {
      text-align: center;
      margin: 2rem;
      color: #6d6b6b;
      font-size: 28px;
      font-weight: 600;
    }

    & .ask-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      padding: 0 12px;
      color: #fff;
      background: rgb(0, 112, 240);
      height: 40px;
      border-radius: 8px;
      gap: 12;

      @media(min-width: 992px){
        width: unset;
      }

    }
  }

  & .filter {
    margin: 24px 16px 40px;
  }


  & .audio__list {
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


    & .footer {
      background: #767677;

      & .col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
      }
      

      & .footer-item {
        font-size: 14px;
        color: white;
        padding: 0 12px;
      }

      & .img {
        width: 90px;
        height: auto;
      }

    }

  }

`;