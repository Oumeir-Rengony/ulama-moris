import { cn } from "@heroui/theme"
import { toTitleCase } from "@services/utils/utils.service"
import { styled } from "styled-system/jsx"

const Tag = ({ title, className }: { title: string; className?: string}) => {
   return (
      <StyledWrapper>
         <div className={cn("tag", className)}>
            { 
               title.split(",").map((t, index) => (
                  <span key={index} className="tag__item"> { toTitleCase(t) }</span> 
               ))
            }
         </div>
      </StyledWrapper>
   )
}


const StyledWrapper = styled.div`

   & .tag {
      display: flex;
      gap: 8px;


      & .tag__item {
         display: inline-block;
         background-color: rgba(133, 208, 61, 0.2);
         color: #378b59;
         padding: 4px 8px;
         font-size: 12px;
         /* infinity number */
         border-radius: 33554400px;
         margin-bottom: 8px;
         font-weight: 500;
      }
   }
`;

export default Tag;