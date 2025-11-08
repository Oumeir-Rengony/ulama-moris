import { createAudioJsonLd, getBayaanBySlug, getBayaanSlug } from "@services/bayaans/bayaan.service";
import Tag from "@components/tag";
import { styled } from "styled-system/jsx";
import IconLabel from "@components/icon-label";
import { ArrowLeft, CalendarDays, Clock, MapPin, UserRound } from "lucide-react";
import dayjs from "dayjs";
import { arrayify, toTitleCase } from "@services/utils/utils.service";
import { AudioManager } from "@components/audio-player/audio-context";
import AudioPlayer from "@components/audio-player/audio-player";
import RelatedAudioList from "app/_components/related-audio-list";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { getRelatedFatwas } from "@services/fatwas/fatwas.service"
import RelatedFatwasList from "app/_components/related-fatwas-list";
import { getRelatedBayaans } from "@services/bayaans/bayaan.service";
import Config from "@config/config.json";
import Image from "next/image";
// import AudioPlayerVisualizer from "app/_components/audio-player-visualizer";


export const dynamicParams = true;

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
   const audioList = await getBayaanSlug();

   return audioList?.map((audio) => ({
      slug: audio?.slug,
   }))
}

export async function generateMetadata(
   { params }: { params: Promise<{ slug: string }> },
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

   const jsonLd = createAudioJsonLd(bayaan);

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

    const relatedAudioPromise = getRelatedBayaans({
      currentSlug: slug,
      event, 
      date, 
      category, 
      totalBayaans: total,
   });

   const relatedFatwasPromise = getRelatedFatwas(category);



   const sanitizeDesc = description === "<p><br></p>" ? "" : description;

   return (
      <StyledWrapper>

         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
               __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
            }}
         />

         <div className="header">
            <div style={{ maxWidth: "720px", margin: '0 auto' }}>
               <Link href="/" className="home-link">
                  <ArrowLeft size={20} className="arrow" />
                  <button>Back to Lectures</button>
               </Link>
            </div>
         </div>


         <div className="container" style={{ maxWidth: "720px" }}>
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

                  <h1 className="heading">{title}</h1>

                  <div className="details">

                     <IconLabel
                        icon={<CalendarDays size={16} color="#71717a" aria-hidden="true" />}
                        label={dayjs(date).format("MMM DD, YYYY")}
                        ariaDescription="Date"
                     />

                     <IconLabel
                        icon={<UserRound size={16} color="#71717a" aria-hidden="true" />}
                        label={toTitleCase(author)}
                        ariaDescription="Speaker"
                     />

                     {
                        masjid &&
                        <a href={location || "#"} target="_blank" className="figure__info-masjid" rel="noopener noreferrer">
                           <IconLabel
                              icon={<MapPin size={16} color="#71717a" aria-hidden="true" />}
                              label={toTitleCase(masjid)}
                              ariaDescription="Masjid"
                           />
                        </a>
                     }

                  </div>

                  <div className="player">
                     <div className="image-wrapper">
                        <Image
                           src="https://images.ctfassets.net/n7lbwg9xm90s/7CDEWt7qQ4mJuVNTyhrcsG/bceace8b3d44c7ea4fb47b1244d26529/ulama-moris-logo.webp"
                           alt={title || "Audio Image"}
                           className="image"
                           width={400}
                           height={400}
                           fetchPriority="high"
                        />
                     </div>

                     <AudioManager>
                        <AudioPlayer id={bayaan?.sys?.id} src={audio?.url} />
                        {/* <AudioPlayerVisualizer id={bayaan?.sys?.id} src={audio?.url} /> */}
                     </AudioManager>
                  </div>

                  {
                     sanitizeDesc &&

                     <div className="desc">
                        <h2 className="desc__subtitle"> About this episode </h2>
                        <div className="desc__para" dangerouslySetInnerHTML={{ __html: sanitizeDesc }} />
                     </div>
                  }

                  <section className="lecture">
                     <h2 className="lecture__subtitle"> More Lectures </h2>

                     <Suspense>
                        <RelatedAudioList relatedAudioPromise={relatedAudioPromise}/>
                     </Suspense>
                  </section>

                  <section className="fatwas">
                     <h2 className="fatwas__subtitle"> Related Fatwas </h2>
                     <p className="fatwas__para">Below is a list of fatwas available on <a className="mufti-link" target="_blank" href={Config.fatwas.domain}>mufti.mu</a> (Darul Iftaa Nu&apos;maniyyah)</p>

                     <Suspense>
                        <RelatedFatwasList relatedFatwasPromise={relatedFatwasPromise}/>
                     </Suspense>
                  </section>

               </div>
            </div>
         </div>


      </StyledWrapper>
   )
}


const StyledWrapper = styled.div`

& .header {
   width:  100%;
   background: oklab(1 0 0 / 0.5);
   backdrop-filter: blur(8px);
   border: solid oklab(0.9 -0.005 0.00866025 / 0.5) 1px;
   padding: 16px;

   & .home-link {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: transform 0.3s ease;

      &:hover {
         transform: translateX(-3px);
      }
   }
}

& .container {
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
         margin-bottom: 40px;

         & .image {
            width: 100%;
            border-radius: 20px;
            z-index: 2;
         }

      }

   }

   & .desc {
      margin-bottom: 24px;

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
         margin-bottom: 24px;
         font-size: 20px;
         font-weight: 600;
      }

      margin-bottom: 24px;

   }

   & .fatwas {

      & .fatwas__subtitle {
         margin-bottom: 16px;
         font-size: 20px;
         font-weight: 600;
      }

      & .fatwas__para {
         color: #71717a;
         line-height: 26px;
         margin-bottom: 24px;

         & .mufti-link {
            color: #7abd3b;
            transition: color 0.1s ease;

            &:hover {
               color: #059669;
            }
         }

      }

      & .tag-list {
         margin-bottom: 12px;
      }

   }
}

`