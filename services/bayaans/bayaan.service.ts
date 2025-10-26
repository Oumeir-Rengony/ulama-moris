import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@services/apollo/apollo.service';
import BayaanQuery from './query/bayaan.gql';
import BayaanByIDQuery from "./query/bayaanByID.gql";
import AssetsFragment from '@services/graphql/assets.fragment.gql';
import BayaanSlug from './query/bayaanSlug.gql';
import BayaanFields from './query/bayaan.fragment.gql';
import BayaanBySlug from './query/bayaanBySlug.gql';
import RelatedBayaanQuery from "./query/relatedBayaans.gql";
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

  return {
    bayaan: result?.bayaanCollection?.items?.[0],
    total: result?.bayaanCollection?.total
  }
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


const getEventID = (event: string, date: string) => {
  return (event && date)
    ? "https://ulama-moris.org/event/" + event?.replace(/\s+/g, '-').toLowerCase() + '-' + dayjs(date).format('YYYY-MM-DD')
    : ""
}

const selectUniqueBayaan= (data: any[], limit=4) => {
  const seen = new Set();
  const final = [];

  for (const set of data) {
    for (const bayaan of set) {
      const key = bayaan.sys?.id
      if (!seen.has(key)) {
        seen.add(key);
        final.push(bayaan);
      }
      if (final.length === limit) return final;
    }
  }

  return final;
}


export const getRelatedBayaans = async ({ 
  currentSlug,
  event, 
  date,
  category,
  totalBayaans
}: { 
  currentSlug: string
  event: string, 
  date: string,
  category: string[] | string,
  totalBayaans: number
}, isPreview: boolean = false): Promise<any> =>  {

  const RELATED_QUERY = gql`
    ${AssetsFragment}
    ${BayaanFields}
    ${RelatedBayaanQuery}
  `;

  //need to filter date to be within the same day

  // Get the start of the given date
  const date_gte = dayjs(date).startOf('day');

  // Get the start of the next day
  const date_lt = dayjs(date).add(1, 'day').startOf('day');

  const randomSkip = Math.max(0, Math.floor(Math.random() * (totalBayaans - 4)));


  const result =  await ExecuteQuery(RELATED_QUERY, {
    variables: {
      event: event,
      date_gte: date_gte,
      date_lt: date_lt,
      category: category,
      skip: randomSkip,
      currentSlug: currentSlug
    },
    preview: isPreview,
  });

  //order of data is by priority
  const sortedResult = selectUniqueBayaan([result?.event?.items, result?.category?.items, result?.random?.items]) 
  return sortedResult;
  
}

const getAudioBookJsonLd = (item: any) => {

  const [masjid, address] = item?.masjid ? item?.masjid?.split(",") : ["", ""];

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
      "@id": getEventID(item?.event, item?.date),
      name: item?.event,
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