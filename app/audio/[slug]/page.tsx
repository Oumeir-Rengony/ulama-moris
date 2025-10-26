import { getBayaanBySlug, getBayaanSlug } from "@services/bayaans/bayaan.service";
import Tag from "@components/tag";
import { styled } from "styled-system/jsx";
import IconLabel from "@components/icon-label";
import { CalendarDays, Clock, MapPin, UserRound } from "lucide-react";
import dayjs from "dayjs";
import { arrayify, toTitleCase } from "@services/utils/utils.service";
import { AudioManager } from "@components/audio-player/audio-context";
import AudioPlayer from "@components/audio-player/audio-player";
import RelatedList from "app/_components/related-list";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
export const dynamic = 'force-static';
export const revalidate = 60;

export const dynamicParams = true;

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
   const audioList = await getBayaanSlug();

   return audioList?.items?.map((audio) => ({
      slug: audio?.slug,
   }))
}

export async function generateMetadata(
  { params } : { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {

   const { slug } = await params;

   const { bayaan } = await getBayaanBySlug({ slug });

  const openGraph = (await parent).openGraph || {};
 
  return {
    title: bayaan?.metaTitle || '',
    description: bayaan?.metaDescription || '',
    authors: bayaan?.author || '',
    openGraph: {
      ...openGraph,
      title: bayaan?.metaTitle || '',
      description: bayaan?.metaDescription || '',
    },
    alternates: {
      canonical: `https://ulama-moris.org/audio/${slug}`
    }
  }
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({
   params,
}: {
   params: Promise<{ slug: string }>
}) {

   const { slug } = await params;

   const { bayaan, total } = await getBayaanBySlug({ slug });

   const {
      audio,
      author,
      date,
      description,
      location,
      masjid,
      title,
      event,
      category
   } = bayaan;


   const sanitizeDesc = description === "<p><br></p>" ? "" : description;

   return (
      <StyledWrapper className="brt">

         <div className="container" style={{maxWidth: "720px"}}>
            <div className="row">
               <div className="col">
                  
                   <div className="tag-list">
                     { 
                        category &&
                           arrayify(category).map((cat, idx) => (
                              <Tag key={idx} title={cat} />
                           ))
                     }
                  </div>

                  <h1 className="heading">{ title }</h1>

                  <div className="details">

                     <IconLabel
                        icon={<CalendarDays size={16} color="#71717a" aria-hidden="true"/>}
                        label={dayjs(date).format("MMM DD, YYYY")} 
                        ariaDescription="Date"
                     />

                     <IconLabel 
                        icon={<UserRound size={16} color="#71717a" aria-hidden="true"/>} 
                        label={toTitleCase(author)} 
                        ariaDescription="Speaker" 
                     />

                     {
                        masjid && 
                           <a href={location || "#"} target="_blank" className="figure__info-masjid" rel="noopener noreferrer">
                              <IconLabel 
                                    icon={<MapPin size={16} color="#71717a" aria-hidden="true"/>} 
                                    label={toTitleCase(masjid)} 
                                    ariaDescription="Masjid"
                              />
                           </a>
                     }
                     
                  </div>

                  <div className="player">
                     <div className="image-wrapper">
                        <img 
                           src="https://images.ctfassets.net/n7lbwg9xm90s/0RStDo82kDxqEY0TRkB8f/8b67a58a4038b3dddc00b3348ceb529c/Frame_1.png"
                           alt={title || "Audio Image"}
                           className="image"
                        />
                     </div>

                     <AudioManager>
                        <AudioPlayer id={bayaan?.sys?.id} src={audio?.url}/>
                     </AudioManager>
                  </div>

                  { 
                     sanitizeDesc && 

                        <div className="desc">
                           <h2 className="desc__subtitle"> About this episode </h2>
                           <div className="desc__para" dangerouslySetInnerHTML={{__html: sanitizeDesc}} />
                        </div>
                  }

                  <div className="lecture">
                     <h2 className="lecture__subtitle"> More Lectures </h2>

                     <Suspense>
                        <RelatedList 
                           slug={slug}
                           event={event}
                           date={date}
                           category={category}
                           totalBayaans={total}
                        />
                     </Suspense>
                  </div>

               </div>
            </div>
          </div>


      </StyledWrapper>
   )
}


const StyledWrapper = styled.div`
   min-height: 100vh;
   padding: 24px;


   & .tag-list {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      & .tag {
         font-size: 14px;
         border-radius: 12px;
         padding: 4px 16px;
      }

   }

   & .heading {
      font-size: 24px;
      line-height: 1.25;
      font-weight: 700;
      color: #202318;
      margin-bottom: 16px;
   }  


   & .details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 40px;

      & .icon__label-text {
         font-size: 14px;
      }

   }

   & .player {
      padding-bottom: 12px;

      & .image-wrapper {
         max-width: 400px;
         margin-right: auto;
         margin-left: auto;
         margin-bottom: 20px;


         & .image {
            width: 100%;
            border-radius: 20px;
         }

      }

   }

   & .desc {
      margin-bottom: 16px;

      & .desc__subtitle {
         margin-bottom: 16px;
         font-size: 20px;
         font-weight: 600;
      }

      & .desc__para {
         color: #71717a;
         line-height: 26px;
      }
   }

   & .lecture {

      & .lecture__subtitle {
         margin-bottom: 16px;
         font-size: 20px;
         font-weight: 600;
      }

   }


`