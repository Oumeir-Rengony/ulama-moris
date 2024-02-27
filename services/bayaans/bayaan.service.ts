
import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@services/apollo/apollo.service';
import BayaanQuery from './query/bayaan.gql';
import AssetsFragment from '@services/graphql/assets.fragment.gql';
import dayjs from 'dayjs';
import Config from "@config/config.json";



export const GetBayaans = async ({ 
    page, 
    startDate = null, 
    endDate = null,  
    search = null, 
    device = null,
    // categories = null,
    isPreview = false 
}: { 
    page: number; 
    startDate?: string; 
    endDate?: string; 
    search?: string;
    device?: string 
    // categories: string[] | string,
    isPreview?: boolean; 
}): Promise<any> => {

  //determine set of pages to fetch
  const limit = Config.bayaan.pageSize;

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