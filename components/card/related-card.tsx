import { styled } from "styled-system/jsx";
import { Card } from "@components/card/base-card";
import { arrayify } from "@services/utils/utils.service";


export interface RelatedCardProps {
   title: string;
   className?: string;
   description: HTMLElement | string;
   location: string;
   masjid: string;
   date: string;
   author: string;
   duration?: string;
   category?: string | string[];
}


const RelatedCard: React.FC<RelatedCardProps> = ({
   title,
   className = "",
   description,
   location,
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

            <Card.MediaInfo author={author} masjid={masjid} location={location} date={date} />

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