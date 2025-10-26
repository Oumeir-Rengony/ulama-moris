import { styled } from "styled-system/jsx";
import { Card } from "@components/audio-card/base-card";


export interface RelatedCardProps {
   title: string;
   className?: string;
   description: HTMLElement | string;
   location: string;
   masjid: string;
   date: string;
   author: string;
   duration?: string;
   tag?: string;
}


const RelatedCard: React.FC<RelatedCardProps> = ({
   title,
   className = "",
   description,
   location,
   masjid,
   date,
   author,
   tag,
}) => {

   return (
      <StyledWrapper className={`related__card ${className}`} >
         <Card>

            { tag && <Card.Tag tag={tag} /> }

            <Card.Title title={title} />

            {description && <Card.Description description={description} />}

            <Card.MediaInfo author={author} masjid={masjid} location={location} date={date} />

         </Card>
      </StyledWrapper>
   );
};

const StyledWrapper = styled.article`

`;

export default RelatedCard;