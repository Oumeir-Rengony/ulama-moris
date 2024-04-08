
import { gql } from '@apollo/client';
import { ExecuteQuery } from '@services/apollo/apollo.service';
import BayaanQuery from './query/bayaan.gql';
import BayaanTotalQuery from './query/bayaanTotal.gql';
import BayaanFragment from './fragments/bayaan.fragment.gql';
import AssetsFragment from '@services/graphql/assets.fragment.gql';
import dayjs from 'dayjs';
import Config from "@config/config.json";



export const GetBayaans = async ({
  page,
  startDate = null,
  endDate = null,
  search = null,
  isMobile = true,
  isPreview = false
}: {
  page: number;
  startDate?: string | string[];
  endDate?: string | string[];
  search?: string | string[];
  isMobile?: boolean
  isPreview?: boolean;
}): Promise<any> => {

  //determine set of pages to fetch
  const limit = isMobile ? Config.bayaan.pageSize.mobile : Config.bayaan.pageSize.desktop;

  const skipMultiplier = (page === 1) ? 0 : page - 1;
  const skip = skipMultiplier > 0 ? limit * skipMultiplier : 0;


  const QUERY = gql`
    ${AssetsFragment}
    ${BayaanFragment}
    ${BayaanQuery}
  `;


  /* end date of 2023-05-08T00:00:00.00Z will not search for date after midnight.
  so one day is added to the end date */
  if (dayjs(endDate as string).isValid()) {
    endDate = dayjs(endDate as string).add(1, 'day').format(Config.bayaan.dateFilterFormat);
  }


  const result = await ExecuteQuery(QUERY, {
    variables: {
      startDate,
      endDate,
      search,
      limit,
      skip
    },
    preview: isPreview
  });


  return result?.bayaanCollection;
}


export const GetBayaanTotal = async ({
  startDate = null,
  endDate = null,
  search = null,
  isPreview = false
}: {
  startDate?: string | string[];
  endDate?: string | string[];
  search?: string | string[];
  isPreview?: boolean;
}): Promise<any> => {


  const QUERY = gql`
    ${BayaanTotalQuery}
  `;


  /* end date of 2023-05-08T00:00:00.00Z will not search for date after midnight.
  so one day is added to the end date */
  if (dayjs(endDate as string).isValid()) {
    endDate = dayjs(endDate as string).add(1, 'day').format(Config.bayaan.dateFilterFormat);
  }


  const result = await ExecuteQuery(QUERY, {
    variables: {
      startDate,
      endDate,
      search,
    },
    preview: isPreview
  });


  return result?.bayaanCollection?.total;
}