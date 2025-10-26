import RelatedCard from "@components/audio-card/related-card";
import { getRelatedBayaans,  } from "@services/bayaans/bayaan.service";
import Link from "next/link";
import { styled } from "styled-system/jsx";


const RelatedList = async ({ 
   slug,
   event,
   date,
   category,
   totalBayaans 
}: { 
   slug: string;
   event: string;
   date: string;
   category: string[] | string;
   totalBayaans: number;
}) => {

   const audioList = await getRelatedBayaans({
      currentSlug: slug,
      event, 
      date, 
      category, 
      totalBayaans,
   });
   

   return (
      <StyledWrapper>
         {
            audioList?.map((audioItem) => {
               return (
                  <Link href={`/audio/${audioItem?.slug}`} className="related__card" key={audioItem?.sys?.id} passHref legacyBehavior>
                     <RelatedCard
                        index={audioItem?.sys?.id}
                        {...audioItem}
                     />
                  </Link>
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

`

export default RelatedList;