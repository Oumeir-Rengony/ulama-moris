import RelatedCard from "@components/audio-card/related-card";
import { getRelatedBayaans,  } from "@services/bayaans/bayaan.service";
import { styled } from "styled-system/jsx";


const RelatedList = async ({ 
   event,
   date,
   category,
   totalBayaans 
}: { 
   event: string;
   date: string;
   category: string[] | string;
   totalBayaans: number;
}) => {

   const audioList = await getRelatedBayaans({
      event, 
      date, 
      category, 
      totalBayaans
   });
   

   return (
      <StyledWrapper>
         {
            audioList?.map((audioItem) => {
               return (
                  <div className="related__card" key={audioItem?.sys?.id}>
                     <RelatedCard
                        index={audioItem?.sys?.id}
                        {...audioItem}
                     />
                  </div>
               )
            })
         }
      </StyledWrapper>        
   )
}

const StyledWrapper = styled.div`
   display: flex;
   flex-direction: column;
   gap: 24px;

   & .related__card {
      
   }
`

export default RelatedList;