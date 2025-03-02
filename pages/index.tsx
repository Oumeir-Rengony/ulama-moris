import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Image from "next/image";

import Pagination from "@components/Pagination";
import Filter from "@components/Filter";
import Loading from "@components/Loading";

import { GetBayaans } from "@services/bayaans/bayaan.service";

import { styled } from "../styled-system/jsx";

import dayjs from "dayjs";
import config from "@config/config.json";
import dynamic from "next/dynamic";
import { getSelectorsByUserAgent } from "react-device-detect";
import { useDisclosure } from "@nextui-org/modal";
import Modal from "@components/Modal";
import { GetPopupBanner, getRandomPopup } from "@services/popup-banner/pop-up.service";


export const MailPlusIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-plus">
    <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="M19 16v6"/><path d="M16 19h6"/>
  </svg>
)



const AudioCard = dynamic(() => import('@components/AudioCard'));


function Home({
  audioList,
  isMobile,
  openGraphMeta,
  popupBanners
}) {

  const [loading, setLoading] = useState<boolean>(false);
  const [metaTitle, setMetaTitle] = useState<string>(config.meta.title);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [activePopup, setActivePopup] = useState<any>();
  const ref = useRef<HTMLDivElement>();


  const pageSize = isMobile ? config.bayaan.pageSize.mobile : config.bayaan.pageSize.desktop;

  const router = useRouter();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();


  useEffect(() => {

    if (!Array.isArray(popupBanners)) return;

    const popupSeenDate = localStorage.getItem("popup");
    const popupDelay = 3 * 60 * 1000; // 3min
    const popupReactivateDelay = 30; //36 hours

    const dateReAppear = dayjs(popupSeenDate).add(popupReactivateDelay, 'hour');

    const currDate = dayjs(new Date());

    //if delay to re show modal is not passed return
    // if (currDate.isBefore(dateReAppear)) return;
    
    const date = new Date();
    localStorage.setItem("popup", date.toISOString());
    const randomPopup = getRandomPopup(popupBanners);

    if(randomPopup){
      setTimeout(() => {
        setActivePopup(randomPopup);
        onOpen();
      }, popupDelay)
    }
    

  },[popupBanners, getRandomPopup])




  useEffect(() => {
    setLoading(false)
  },[audioList])


  //query params { page, startDate, endDate, search, categories }
  const page = router.query.page ? +router.query.page : 1;
  const startDate = router.query.startDate ? router.query.startDate as string : null;
  const endDate = router.query.endDate ? router.query.endDate as string : null;
  const search = router.query.search ? router.query.search as string : null;


  const handlePageChanges = (newPage: number) => {

    setLoading(true);

    //add date conditionally else url will show empty query params
    const queryParams = {
      page: newPage,
      ...startDate ? { startDate } : {},
      ...endDate ? { endDate } : {},
      ...search ? { search } : {},
      // ...categories ? { categories }: {}
    }

    router.push({
      pathname: router.pathname,
      query: queryParams
    }, undefined, { shallow: false });


  }

  const onAudioPlay = (audio) => {
    setCurrentAudioId(audio.sys.id);
    setMetaTitle(audio.title);

    const queryParams = {
      ...page ? { page } : {},
      ...startDate ? { startDate } : {},
      ...endDate ? { endDate } : {},
      ...search ? { search } : {},
      id: audio.sys.id
    }

    router.push({
      pathname: router.pathname,
      query: queryParams
    }, undefined, { shallow: true });

  }


  const handleSubmit = () => {
    setLoading(true);
    setCurrentAudioId(null);
  }



  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={config.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://ulama-moris.org" />
        {openGraphMeta?.title && <meta property="og:title" content={openGraphMeta?.title}/>}
        {openGraphMeta?.description && <meta property="og:description" content={openGraphMeta?.description} />}
        {openGraphMeta?.image && <meta property="og:image" content={openGraphMeta?.image} />}
        {openGraphMeta?.image  && <meta property="og:image:width" content="900" />}
        {openGraphMeta?.image && <meta property="og:image:height" content="600" />}
        {openGraphMeta?.url && <meta property="og:url" content={openGraphMeta?.url}  />}
        {<meta property="og:site_name" content="Ulama De Moris" />}
        {<meta property="og:type" content="website"  />}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StyledWrapper>

        {loading && <Loading/>}

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <img src={activePopup?.image?.url}  alt={activePopup?.image?.title} width="100%" height={600}/>
        </Modal>

        <div className="container">
          <div className="row">
            <div className="col">

              <div className="heading">
                <h1 className="heading__title">Bayaan par les Ulama de Moris</h1>
                <a href="https://www.mufti.mu" target="_blank">
                  <button className="ask-btn">Ask a Question <MailPlusIcon/> </button>
                </a>
              </div>


              <Filter onSubmit={handleSubmit}/>

              <div className="audio__list" ref={ref}>
                {
                  audioList?.items.map(audio => {
                    return (
                      <AudioCard 
                        key={audio?.sys?.id} 
                        index={audio?.sys?.id}
                        currentAudioId={currentAudioId}
                        onAudioPlay={() => onAudioPlay(audio)}
                        // onShare={() => setMetaDescription(`${audio.title} par ${audio.author}`)}
                        {...audio}
                      />
                    )
                  })
                }
              </div>

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
            onChange={handlePageChanges}
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

    </>
  );
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


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const page = ctx.query?.page;
  const startDate = ctx.query?.startDate as string;
  const endDate = ctx.query?.endDate as string;
  const search = ctx.query?.search as string;
  const id = ctx.query?.id as string;

  const validStartDate = dayjs(startDate).isValid() ? startDate : null;
  const validEndDate = dayjs(endDate).isValid() ? endDate : null;


  const { isMobile } = getSelectorsByUserAgent(ctx.req.headers["user-agent"]);
  

  const audioListPromise =  GetBayaans({ 
    page: +page,
    startDate: validStartDate,
    endDate: validEndDate,
    search,
    isMobile
  });

  const popupBannerPromise =  GetPopupBanner();

  const [audioList, popupBanners] = await Promise.all([
    audioListPromise,
    popupBannerPromise,
  ]);


  const GetMetaData = () => {
    if(id === null){
      return null;
    }

    const audio =  audioList.items.find(audio => {
      return audio?.sys?.id === id
    });

    return ({
      title: audio?.title || config.meta.title,
      description: audio?.author || config.meta.description,
      image: 'https://www.ulama-moris.org/og1.png',
      url: 'https://' + ctx?.req?.headers?.host + ctx?.resolvedUrl
    })
  }
 
  return {
    props: {
      audioList,
      isMobile,
      openGraphMeta: GetMetaData(),
      popupBanners
    }
  }
}


export default Home;