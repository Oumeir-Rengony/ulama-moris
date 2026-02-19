import RelatedCard from "@components/card/related-card";
import Link from "next/link";
import { styled } from "styled-system/jsx";


const RelatedAudioList = async ({ 
   relatedAudioPromise
}: { 
   relatedAudioPromise: Promise<any>
}) => {

  const audioList = await relatedAudioPromise;

   return (
      <StyledWrapper>
         {
            audioList?.map((audioItem: any) => {
               return (
                  <Link href={`/audio/${audioItem?.slug}`} className="related__card" key={audioItem?.sys?.id} passHref legacyBehavior>
                     <RelatedCard
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

export default RelatedAudioList;