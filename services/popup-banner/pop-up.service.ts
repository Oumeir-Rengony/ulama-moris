import { gql } from '@apollo/client'; 
import { ExecuteQuery } from '@services/apollo/apollo.service';
import ModalQuery from './pop-up.query.gql';
import AssetsFragment from '@services/graphql/assets.fragment.gql';



export const GetPopupBanner = async (
  isPreview: boolean = false
): Promise<any> => {
  
  const QUERY = gql`
    ${AssetsFragment}
    ${ModalQuery}
  `;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);


  const result = await ExecuteQuery(QUERY, { 
    variables: { 
      currentDate: currentDate,
      limit: 10,
    }, 
    preview: isPreview 
  });

  return result?.modalCollection?.items;

}



export const getRandomPopup = (arr: Array<any>) => {
  if(Array.isArray(arr)){
    //Generates random index for the array
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }
  else {
    return arr;
  }
}