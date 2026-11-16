import { cache } from 'react';
import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@/services/apollo/apollo.service';

import dayjs from 'dayjs';
import Config from "@/config/config.json";

import {
  BayaanFragment,
  BayaanQuery,
  bayaanSlugQuery,
  BayaanBySlugQuery,
  BayaanByIDQuery,
  BayaanTotalQuery,
  RelatedBayaanQuery
} from "./query"

import { AssetsFragment } from '@/services/query';

export type Local = "local" | "international" | "islahi majlis";

export const getBayaansBase = cache(async ({
    startDate = "", 
    endDate = "",  
    search = "", 
    bayaanIds,
    limit = 0,
    skip = 0,
    type,
    isPreview = false 
}: { 
    limit?: number;
    skip?: number;
    startDate?: string; 
    endDate?: string; 
    search?: string;
    bayaanIds?: string[];
    type?: Local,
    isPreview?: boolean; 
}): Promise<{bayaanCollection: any}> => {

  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFragment}
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
    ...(bayaanIds && { bayaanIds }),
    local: type
  };


  const result = await ExecuteQuery(QUERY, {
    variables,
    preview: isPreview,
  });

  return result;
});

export const getBayaansWithPagination = cache(async ({
  page = 1,
  startDate = "",
  endDate = "",
  search = "",
  bayaanIds,
  type,
  isMobile = true,
  isPreview = false,
}: {
  page?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  bayaanIds?: string[];
  type?: Local;
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
    type,
    search,
    bayaanIds,
    isPreview,
  });

  return result?.bayaanCollection;
});

export const getAllBayaans = cache(async ({
  startDate = "",
  endDate = "",
  type,
  search = "",
  isPreview = false,
}: {
  startDate?: string;
  type?: Local;
  endDate?: string;
  search?: string;
  isPreview?: boolean;
}): Promise<any> => {
  
  const result = await getBayaansBase({
    startDate,
    endDate,
    type,
    search,
    isPreview,
  });

  return result?.bayaanCollection;
});

export const getBayaanSlug = cache(async (isPreview: boolean = false, type?: Local): Promise<any> => {

  const QUERY = gql`
    ${bayaanSlugQuery}
  `;

  const result = await ExecuteQuery(QUERY, {
    preview: isPreview,
    variables: {
      local: type
    }
  });

  return result?.bayaanCollection;
})

export const getBayaanBySlug = cache(async ({
  slug="", 
  isPreview = false
}: {
  slug: String,
  isPreview?: boolean
}): Promise<any> => {

  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFragment}
    ${BayaanBySlugQuery}
  `;

  const result = await ExecuteQuery(QUERY, {
    variables: { slug },
    preview: isPreview,
  });


  return {
    data: result?.bayaanCollection?.items?.[0],
    total: result?.bayaanCollection?.total
  }
})

export const GetBayaanById = cache(async (
  id: String,
  isPreview:boolean = false 
): Promise<any> => {


  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFragment}
    ${BayaanByIDQuery}
  `;


  const result = await ExecuteQuery(QUERY, { 
    variables: {
      id
    }, 
    preview: isPreview 
  });


  return result?.bayaan;
});

const getTotalBayaan = cache(async (isPreview?: boolean):Promise<number> => {

  const QUERY = gql`
    ${BayaanTotalQuery}
  `;

  const result = await ExecuteQuery(QUERY, {
    preview: isPreview || false
  })

  return result?.bayaanCollection?.total;
})


// Exported for tests.
export const selectUniqueBayaan= (data: any[], limit=4) => {
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


export const getRelatedBayaans = cache(async ({ 
  currentSlug,
  eventBayaanIds,
  date,
  category,
  totalBayaans,
  limit=4
}: { 
  currentSlug: string
  // Undefined when the bayaan is not part of an event: the same-day lectures are used instead.
  eventBayaanIds?: string[],
  date: string,
  category: string[] | string,
  totalBayaans: number,
  limit?: number;
}, isPreview: boolean = false): Promise<any> =>  {

  const RELATED_QUERY = gql`
    ${AssetsFragment}
    ${BayaanFragment}
    ${RelatedBayaanQuery}
  `;

  //need to filter date to be within the same day

  // Get the start of the given date
  const date_gte = date ? dayjs(date).startOf('day') : null;

  // Get the start of the next day
  const date_lt = date ? dayjs(date).add(1, 'day').startOf('day') : null;

  let total = totalBayaans;

  //required for mufti.mu as total won't be avalaible
  if(!totalBayaans){
    total = await getTotalBayaan(false);
  }

  const randomSkip = Math.max(0, Math.floor(Math.random() * (total - 4)));

  const result =  await ExecuteQuery(RELATED_QUERY, {
    variables: {
      eventBayaanIds: eventBayaanIds,
      date_gte: date_gte,
      date_lt: date_lt,
      category: category,
      skip: randomSkip,
      currentSlug: currentSlug,
      limit: limit
    },
    preview: isPreview,
  });

  //order of data is by priority
  const sortedResult = selectUniqueBayaan([result?.event?.items, result?.category?.items, result?.random?.items]) 
  return sortedResult;
  
});
