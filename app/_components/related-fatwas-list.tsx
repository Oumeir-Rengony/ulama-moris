import Link from "next/link";
import Config from "@config/config.json";
import { styled } from "styled-system/jsx";
import RelatedFatwaCard from "@components/card/related-fatwa-card";

const RelatedFatwasList = async ({
   relatedFatwasPromise
}: {
   relatedFatwasPromise: Promise<any>
}) => {

   const fatwas = await relatedFatwasPromise;

   return (
      <StyledWrapper>
         {fatwas?.data?.map((fatwa: any) => (
            <Link key={fatwa?.sys?.id} target="_blank" href={`${Config?.fatwas?.domain}/fatwas/${fatwa?.slug}`} passHref legacyBehavior>
               <a target="_blank" rel="noopener noreferrer" className="fatwas__card">
                  <RelatedFatwaCard {...fatwa} />
               </a>
            </Link>
         ))}
      </StyledWrapper>

   )
}

const StyledWrapper = styled.div`
   display: flex;
   flex-direction: column;
   gap: 24px;

`

export default RelatedFatwasList