import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@services/apollo/apollo.service';
import BayaanQuery from './query/bayaan.gql';
import BayaanByIDQuery from "./query/bayaanByID.gql";
import AssetsFragment from '@services/graphql/assets.fragment.gql';
import BayaanSlug from './query/bayaanSlug.gql';
import BayaanFields from './query/bayaan.fragment.gql';
import BayaanBySlug from './query/bayaanBySlug.gql';
import dayjs from 'dayjs';
import Config from "@config/config.json";
import { WithContext,  AudioObject, Event, ItemList, Person, Place, PostalAddress } from 'schema-dts';
import { toISODuration } from '@services/utils/utils.service';


const getBayaansBase = async ({
    startDate = null, 
    endDate = null,  
    search = null, 
    limit = 0,
    skip = 0,
    isPreview = false 
}: { 
    limit?: number;
    skip?: number;
    startDate?: string; 
    endDate?: string; 
    search?: string;
    isPreview?: boolean; 
}) => {

  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFields}
    ${BayaanQuery}
  `;

  // Inclusive end date logic
  if (dayjs(endDate).isValid()) {
    endDate = dayjs(endDate)
      .add(1, 'day')
      .format(Config.bayaan.dateFilterFormat);
  }

  const variables: any = {
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(search && { search }),
  };


  const result = await ExecuteQuery(QUERY, {
    variables,
    preview: isPreview,
  });

  return result;
}

export const getBayaansWithPagination = async ({
  page = 1,
  startDate = null,
  endDate = null,
  search = null,
  isMobile = true,
  isPreview = false,
}: {
  page?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  isMobile?: boolean;
  isPreview?: boolean;
}): Promise<any> => {
  
  const limit = isMobile
    ? Config.bayaan.pageSize.mobile
    : Config.bayaan.pageSize.desktop;

  const skipMultiplier = (page === 1) ? 0 : page - 1;
  const skip = skipMultiplier > 0 ? limit * skipMultiplier : 0;

  const result = await getBayaansBase({
    limit,
    skip,
    startDate,
    endDate,
    search,
    isPreview,
  });

  return result?.bayaanCollection;
};

export const getAllBayaans = async ({
  startDate = null,
  endDate = null,
  search = null,
  isPreview = false,
}: {
  startDate?: string;
  endDate?: string;
  search?: string;
  isPreview?: boolean;
}): Promise<any> => {
  
  const result = await getBayaansBase({
    startDate,
    endDate,
    search,
    isPreview,
  });

  return result?.bayaanCollection;
};

export const getBayaanSlug = async (isPreview: boolean = false): Promise<any> => {

  const QUERY = gql`
    ${BayaanSlug}
  `;

  const result = await ExecuteQuery(QUERY, {
    preview: isPreview,
  });

  return result.bayaanCollection;
}

export const getBayaanBySlug = async ({
  slug="", 
  isPreview = false
}: {
  slug: String,
  isPreview?: boolean
}): Promise<any> => {

  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFields}
    ${BayaanBySlug}
  `;

  const result = await ExecuteQuery(QUERY, {
    variables: { slug },
    preview: isPreview,
  });

  return result?.bayaanCollection?.items?.[0];
}

export const GetBayaanById = async (
  id: String,
  isPreview:boolean = false 
): Promise<any> => {


  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFields}
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