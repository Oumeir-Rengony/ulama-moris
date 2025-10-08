import { LucideIcon } from "lucide-react";
import { useId } from "react";
import { styled } from "styled-system/jsx";

const IconLabel = ({ 
   icon, 
   label, 
   ariaDescription 
}: { 
   icon: React.ReactElement<LucideIcon>
   label: string,
   ariaDescription?: string
}) => {

   const id = useId();

   const descriptionId = ariaDescription ? id : undefined;

   return (
      <StyledWrapper>
         <div className="icon__label">
            {icon}
            <p aria-describedby={descriptionId} className="icon__label-text">{ label }</p>
            { ariaDescription && <span id={descriptionId} className="sr-only"><strong>{ariaDescription}</strong></span>}
         </div>
      </StyledWrapper>
   )
}

const StyledWrapper = styled.div`
   & .icon__label {
      display: flex;
      align-items: center;
      gap: 8px;
   }

   & .icon__label-text {
      color: rgb(113, 113, 122);
      font-weight: 500;
   }
`


export default IconLabel;