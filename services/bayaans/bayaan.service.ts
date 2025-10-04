import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@services/apollo/apollo.service';
import BayaanQuery from './query/bayaan.gql';
import BayaanByIDQuery from "./query/bayaanByID.gql";
import AssetsFragment from '@services/graphql/assets.fragment.gql';
import dayjs from 'dayjs';
import Config from "@config/config.json";
import {WithContext,  AudioObject, Event, ItemList, Person, Place, PostalAddress } from 'schema-dts';
import { toISODuration } from '@services/utils/utils.service';


export const GetBayaans = async ({ 
    page, 
    startDate = null, 
    endDate = null,  
    search = null, 
    isMobile = true,
    // categories = null,
    isPreview = false 
}: { 
    page: number; 
    startDate?: string; 
    endDate?: string; 
    search?: string;
    isMobile?: boolean 
    // categories: string[] | string,
    isPreview?: boolean; 
}): Promise<any> => {

  //determine set of pages to fetch
  const limit = isMobile ? Config.bayaan.pageSize.mobile : Config.bayaan.pageSize.desktop;

  const skipMultiplier = (page === 1) ? 0 : page - 1;
  const skip = skipMultiplier > 0 ? limit * skipMultiplier : 0;
  

  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanQuery}
  `;

  
  /* end date of 2023-05-08T00:00:00.00Z will not search for date after midnight.
  so one day is added to the end date */
  if(dayjs(endDate).isValid()) {
    endDate = dayjs(endDate).add(1, 'day').format(Config.bayaan.dateFilterFormat);
  } 


  const result = await ExecuteQuery(QUERY, { 
    variables: { 
      startDate,
      endDate,
      search,
      // categories,
      limit, 
      skip 
    }, 
    preview: isPreview 
  });


  return result?.bayaanCollection;
}


export const GetBayaanById = async (
  id: String,
  isPreview:boolean = false 
): Promise<any> => {


  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanByIDQuery}
  `;


  const result = await ExecuteQuery(QUERY, { 
    variables: {
      id
    }, 
    preview: isPreview 
  });


  return result?.bayaan;
}

const getAudioBookJsonLd = (item: any) => {

  const [masjid, address] = item?.masjid ? item?.masjid?.split(",") : ["", ""];

  const eventId = (item?.event && item?.date)
    ? "https://ulama-moris.org/event/" + item?.event?.replace(/\s+/g, '-').toLowerCase() + '-' + dayjs(item?.date).format('YYYY-MM-DD')
    : ""

  return {
    "@type": "AudioObject",
    name: item?.metaTitle,
    description: item?.metaDescription,
    contentUrl: item?.audio?.url,
    encodingFormat: "audio/mpeg",
    duration: toISODuration(item?.duration),
    inLanguage: "mfe",
    author: {
      "@type": "Person",
      "name": item?.author?.replace(/(mufti|mawlana)/gi, ""),
    } as Person,
    subjectOf: {
      "@type": "Event",
      "@id": eventId,
      name: item?.metaTitle,
      startDate: item?.date,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: masjid,
        url: item?.geoLink,
        address: {
          "@type": "PostalAddress",
          addressLocality: address,
          addressCountry: "MU"
        } as PostalAddress
      } as Place
    } as Event
  } as AudioObject

}


export const createAudioListJsonLd = (data: any) => {

  const JsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Islamic lectures",
    itemListElement: data?.map((item: any, index: number) => {
    return {
      "@type": "ListItem",
      position: index,
      "item": getAudioBookJsonLd(item)
    }})
  }

  return JsonLd;
}

export const createAudioJsonLd = (data: any) => {

  return getAudioBookJsonLd(data);
}