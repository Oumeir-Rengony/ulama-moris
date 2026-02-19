import { BookOpen, ExternalLink } from "lucide-react";
import { Card } from "@components/card/base-card";
import { arrayify } from "@services/utils/utils.service";
import { styled } from "styled-system/jsx";

const RelatedFatwaCard = ({
   title,
   category,
}: {
   title: string;
   category?: string
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

            <div className="read-more">
               <div className="link-icon">
                  <BookOpen size={16} />
                  <span>View Fatwaa</span>
               </div>
               <ExternalLink size={16} className="external" />
            </div> 

         </Card>
      </StyledWrapper>
   )
}

const StyledWrapper = styled.div`

   & .base__card {
      cursor: pointer;
   }

   & .tag-list {
      display: flex;
      gap: 8px;
   }

   & .read-more {
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      font-size: 0.875rem;
      line-height: 1.25rem; 
      color: #6B7280; 


      & .link-icon {
         display: flex; 
         gap: 0.5rem; 
         align-items: center; 
      }

      & .link-icon:hover {
         color: #059669; 
      }

      & .external {
         color: #9CA3AF; 
      }

      & .external:hover {
         color: #059669; 
      }

   }
`;

export default RelatedFatwaCard;