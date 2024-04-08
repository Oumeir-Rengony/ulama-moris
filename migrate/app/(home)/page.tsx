import { Suspense } from 'react';
import { headers } from 'next/headers'
import dayjs from "dayjs";
import Image from "next/image";
import { getSelectorsByUserAgent } from 'react-device-detect';
import { styled } from "../../styled-system/jsx";

import { GetBayaanTotal, GetBayaans } from '@services/bayaans/bayaan.service';

import { AudioProvider} from "../providers";

import Loading from '@components/Loading';
import Filter from './_components//Filter.home';
import AudioList from './_components/AudioList.home';
import Pagination from './_components/Pagination.home';

import config  from '@config/config.json';



export default async function Home({
  searchParams
}:{
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';


  const { isMobile } = getSelectorsByUserAgent(userAgent);

  const {
    page,
    startDate,
    endDate,
    search,
    id
  } = searchParams;

  const validStartDate = dayjs(startDate as string).isValid() ? startDate : null;
  const validEndDate = dayjs(endDate as string).isValid() ? endDate : null;

  const audioList = await GetBayaans({ 
    page: +page,
    startDate: validStartDate,
    endDate: validEndDate,
    search,
    isMobile
  });


  const pageSize = isMobile ? config.bayaan.pageSize.mobile : config.bayaan.pageSize.desktop;

  const totalPage = await GetBayaanTotal({
    startDate,
    endDate,
    search,
  });
  

  return (
    <StyledWrapper>

        <div className="container">
          <div className="row">
            <div className="col">

              <h1 className="heading">Bayaan par les Ulama de Moris</h1>

              <AudioProvider>
                <Filter />
                <Suspense fallback={<Loading/>}>
                  <AudioList audioList={audioList} />
                </Suspense>
              </AudioProvider>

            </div>
          </div>
        </div>

        <div className="fixed-bottom">
          
          <Pagination
            page={+page}
            total={Math.ceil(totalPage/pageSize)}
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
  );
}

const StyledWrapper = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  & .heading {
    text-align: center;
    margin: 2rem;
    color: #6d6b6b;
    font-size: 28px;
    font-weight: 600;
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
