import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";


import AudioCard from "@components/AudioCard";
import { Pagination } from "@nextui-org/pagination";
import Filter from "@components/Filter";


import { GetBayaans } from "@services/bayaans/bayaan.service";

import styled from "styled-components";
import dayjs from "dayjs";
import config from "@config/config.json";



function Home({
  audioList
}) {

  const [metaTitle, setMetaTitle] = useState(config.meta.title);
  const [updatedAudioList, setUpdatedAudioList] = useState(audioList);
  const [currentAudioId, setCurrentAudioId] = useState(null);

  const router = useRouter();


  //query params { page, startDate, endDate, search, categories }
  const page = router.query.page ? +router.query.page : 1;
  const startDate = router.query.startDate ? router.query.startDate as string : null;
  const endDate = router.query.endDate ? router.query.endDate as string : null;
  const search = router.query.search ? router.query.search as string : null;

  // let categories = router.query.categories ? router.query.categories: null


  useEffect(() => {

    const validStartDate = dayjs(startDate).isValid() ? startDate : null;
    const validEndDate = dayjs(endDate).isValid() ? endDate : null;
    
    // if(categories !== null) {
    //   categories = (categories as string).split(Config.filter.delimeter);
    // }

    const fetchAudio = async () => { 

      const fetchedAuio =  await GetBayaans({
        page,
        startDate: validStartDate,
        endDate: validEndDate,
        search
        // categories
      });

      setUpdatedAudioList(fetchedAuio);
    }
    
    fetchAudio().catch(err => console.error(err))

  }, [page, startDate, endDate, search]);



  const handlePageChanges = (newPage: number) => {

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
    }, undefined, { shallow: true});

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  const onAudioPlay = (audio) => {
    setCurrentAudioId(audio.sys.id);
    setMetaTitle(`${audio.title} par ${audio.author}`);

    const queryParams = {
      ...page ? { page } : {},
      ...startDate ? { startDate } : {},
      ...endDate ? { endDate } : {},
      ...search ? { search } : {},
      id: audio.sys.id
      // ...categories ? { categories }: {}
    }

    router.push({
      pathname: router.pathname,
      query: queryParams
    }, undefined, { shallow: true});

  }



  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={config.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StyledWrapper>


        <div className="container">
          <div className="row">
            <div className="col">


              <h1 className="heading">Bayaan par les Ulama de Moris</h1>


              <Filter onSubmit={() => setCurrentAudioId(null)}/>

              <div className="audio__list">
                {
                  updatedAudioList?.items.map(audio => {
                    return (
                      <AudioCard 
                        key={audio?.sys?.id} 
                        index={audio?.sys?.id}
                        currentAudioId={currentAudioId}
                        onAudioPlay={() => onAudioPlay(audio)}
                        onShare={() => setMetaTitle(`${audio.title} par ${audio.author}`)}
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
          total={Math.ceil(updatedAudioList.total/config.bayaan.pageSize)}
          onChange={handlePageChanges}
        />

        <footer className="footer">

          <div className="container">
            <div className="row">
              <div className="col">
                  <img className="footer-item img" src="./logo.png"/>
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

  .heading {
    text-align: center;
    margin: 2rem;
    color: #6d6b6b;
    font-size: 28px;
    font-weight: 600;
  }


  .audio__list {
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

    .audio__card {
      @media(min-width: 768px){
        margin: 0;
      }
    }


  }

  
  .fixed-bottom {
    margin-top: auto;


    .pagination {
      /* padding: 24px; */
      margin: 20px auto;

      .pagination-ul {
        margin: auto;
      }
    }


    .footer {
      background: rgba(112, 128, 144, 0.7);


      .col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
      }
      

      .footer-item {
        font-size: 14px;
        color: white;
        padding: 0 12px;
      }


      .footer-item.img {
        width: 80px;
      }
    }

  }

`;



export const getServerSideProps: GetServerSideProps = async (ctx) => {

  const page = ctx.query?.page;
  const startDate = ctx.query?.startDate as string;
  const endDate = ctx.query?.endDate as string;
  const search = ctx.query?.search as string;

  const audioList = await GetBayaans({ 
    page: +page,
    startDate,
    endDate,
    search,
  });
 
  return {
    props: {
      audioList,
    }
  }
}


export default Home;