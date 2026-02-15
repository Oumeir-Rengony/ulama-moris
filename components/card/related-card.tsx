import { styled } from "styled-system/jsx";
import { Card } from "@components/card/base-card";
import { arrayify } from "@services/utils/utils.service";


interface Masjid{
   title: string;
   geoLink: string
}
export interface RelatedCardProps {
   title: string;
   className?: string;
   description: HTMLElement | string;
   location: string;
   masjid?: Masjid;
   date: string;
   author: string;
   duration?: string;
   category?: string | string[];
}


const RelatedCard: React.FC<RelatedCardProps> = ({
   title,
   className = "",
   description,
   masjid,
   date,
   author,
   category,
}) => {

   return (
      <StyledWrapper>
         <Card>
            <div className="tag-list">
               { 
                  category &&
                     arrayify(category).map((cat, idx) => (
                        <Card.Tag key={idx} tag={cat} />
                     ))
               }
            </div>

            <Card.Title title={title} />

            {description && <Card.Description description={description} />}

            <Card.MediaInfo author={author} masjid={masjid?.title} location={masjid?.geoLink} date={date} />

         </Card>
      </StyledWrapper>
   );
};

const StyledWrapper = styled.div`

   & .base__card {
      cursor: pointer;
   }

   & .tag-list {
      display: flex;
      gap: 8px;
   }

`;

export default RelatedCard;