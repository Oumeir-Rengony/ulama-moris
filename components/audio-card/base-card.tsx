import Image from "next/image";
import dayjs from "dayjs";
import config from "@config/config.json";
import { styled } from "styled-system/jsx";
import { UserRound, MapPin, CalendarDays } from "lucide-react";

import TagComponent from "@components/tag";
import IconLabel from "@components/icon-label";
import { toTitleCase } from "@services/utils/utils.service";

const Card = ({ children }: { children: React.ReactNode }) => (
  <StyledCard className="base__card">
    {children}
  </StyledCard>
)

const StyledCard = styled.article`
  position: relative;
  max-width: 100%;
  box-shadow: 0px 0px 4px 0px #00000033;
  border-radius: 12px;
  background-image: linear-gradient(
    135deg,
    rgba(176, 251, 175, 1),
    #ffffff 15%,
    #ffffff 85%,
    rgba(176, 251, 175, 1)
  );
  padding: 24px;
  transition: 100ms background ease-in-out;

  &.base__card:hover {
    /* box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); */
    box-shadow: rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;
    outline: solid oklab(0.45 -0.14 0.06 / 0.5) 2px;
  }
  
`

const Tag = ({ tag }: { tag: string }) => {
  return (
    <TagComponent title={tag} />
  )
};



const Title = ({ title }: { title: string }) => (
  <StyledTitle className="title">{title}</StyledTitle>
);

const StyledTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
`;


const MediaInfo = ({
  author,
  masjid,
  location,
  date,
}: {
  author: string;
  masjid: string;
  location: string;
  date: string;
}) => (
  <StyledMediaInfo className="media__info">
    <IconLabel
      icon={<UserRound size={18} color="#71717a" aria-hidden="true" />}
      label={toTitleCase(author)}
      ariaDescription="Speaker"
    />

    {masjid && (
      <a
        href={location || "#"}
        target="_blank"
        className="media__info-masjid"
        rel="noopener noreferrer"
      >
        <IconLabel
          icon={<MapPin size={18} color="#71717a" aria-hidden="true" />}
          label={toTitleCase(masjid)}
          ariaDescription="Masjid"
        />
      </a>
    )}

    <IconLabel
      icon={<CalendarDays size={18} color="#71717a" aria-hidden="true" />}
      label={dayjs(date).format(config.bayaan.displayFormat)}
      ariaDescription="Date"
    />
  </StyledMediaInfo>
);

const StyledMediaInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: 4px;
   padding-bottom: 10px;
   font-size: 14px;


   & .media__info-item {
      display: flex;
      align-items: center;
      gap: 8px;
   }

   & .media__info-masjid {
      pointer-events: none;
      cursor: unset;
   }

   & .media__info-title {
      color: rgb(113, 113, 122);
      font-weight: 500;
   }

`

const Description = ({ description }: { description: HTMLElement | string; }) => {

  if (description === "<p><br></p>") {
    return null
  }

  return (
    <StyledDescription
      className="figure__desc"
      dangerouslySetInnerHTML={{ __html: description as string }}
    />
  )
};

const StyledDescription = styled.div`
  padding-bottom: 12px;
  font-size: 14px;
`

const Footer = ({ whatsAppLink }: { whatsAppLink: string }) => (
  <StyledFooter className="bottom">
    <div className="share-links">
      <a href={whatsAppLink} data-action="share/whatsapp/share">
        <Image width={26} height={26} className="wa-image" src="/wa.png" alt="whats app" />
      </a>
    </div>
  </StyledFooter>
);

const StyledFooter = styled.div`
   & .share-links {
      position: absolute;
      bottom: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      @media(min-width: 992px){
         display: none;
      }
   }
`


Card.Title = Title;
Card.Description = Description;
Card.Tag = Tag;
Card.MediaInfo = MediaInfo
Card.Footer = Footer

export { Card }