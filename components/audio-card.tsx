import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import config from "@config/config.json";
import Pulsar from "./pulsar";
import dayjs from "dayjs";

import { styled } from "../styled-system/jsx";

import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { toTitleCase } from "@services/utils/utils.service";
import Tag from "./tag";
import IconLabel from "./icon-label";
import AudioPlayer from "./audio-player/audio-player";
import { AudioContext } from "./audio-player/audio-context";



interface Asset {
    title: string;
    description: string;
    url: string;
    contentType?: string;
    fileName?: string;
    size?: string;
    width?: string;
    height?: string;
}


export interface AudioCardProps {
    title: string;
    index?: string;
    onAudioPlay?: () => void
    onAudioPause?: () => void
    onShare? : () => void;
    className?: string;
    description: HTMLElement | string;
    location: string;
    masjid: string;
    date: string;
    author: string;
    audio: Asset;
    duration?: string;
    tag?: string;
    showPulsar?: boolean;
    whatsAppLink?: string;
};


function capitalizeStart(sentence: string) {
  if (typeof sentence !== 'string' || sentence.length === 0) {
    return sentence; // Handle empty strings or non-string inputs
  }
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}


const AudioCard: React.FC<AudioCardProps> = ({
    title,
    index,
    onAudioPlay,
    onAudioPause,
    onShare,
    className='',
    description,
    location,
    masjid,
    date,
    author,
    audio,
    duration,
    whatsAppLink,
    tag
}) => {

    const [showPulsar, setShowPulsar] = useState<boolean>(false);

    const cardRef = useRef<HTMLDivElement>(null);

    // const { currentAudioRef } = use(AudioContext);


    // Handle scroll + WhatsApp share when index changes
    // useEffect(() => {

    //     if(!cardRef.current && !currentAudioRef.current){
    //         return
    //     }

    //     const queryParams = new URLSearchParams(window.location.search);
    //     const queryId = queryParams.get("id");

    //     const isInViewport = (element) => {
    //         if(!element){
    //             return
    //         }

    //         const rect = element?.getBoundingClientRect();
    //         return (
    //             rect.top >= 0 &&
    //             rect.left >= 0 &&
    //             rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    //             rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    //         );
    //     }


    //     // Scroll into view if ?id matches
    //     if(queryId === index && !isInViewport(currentAudioRef?.current)){

    //         //small offset to give top space
    //         const offset = 10;

    //         //but use Card Ref for scrolling to show card
    //         const y = cardRef?.current?.getBoundingClientRect().top + window.scrollY - offset;
    //         window.scrollTo({top: y, behavior: 'smooth'});

    //         setAnimateShadow(true);
    //     }

    //     // Update WhatsApp share link
    //     queryParams.set("id", index);
    //     //reset=1 is done so that social media consider it as a new url to refresh their cache
    //     const url = `${window.location.origin}/?${queryParams.toString()}&reset=1`;
    //     setWhatsApp(`whatsapp://send?text=${encodeURIComponent(url)}`);

    // },[index, currentAudioRef.current])


    const onPlay = () => {

        setShowPulsar(true);

        if(onAudioPlay){
            onAudioPlay();
        }
    }


    const onPause = () => {
        setShowPulsar(false);

        if(onAudioPause){
            onAudioPause();
        }
    }


    return (

        <StyledWrapper className={`audio__card ${className}`} ref={cardRef} id={`card-${index}`}>
            
            { showPulsar && <Pulsar/> }

            { 
                tag && <Tag title={tag} />
            }

            <h2 className="title">{ title }</h2>

            <figure className="figure">
                <figcaption className="figure__caption">

                    { description && <div className="figure__desc" dangerouslySetInnerHTML={{__html: description}}/> }

                    <div className="figure__info">

                        <IconLabel 
                            icon={<UserRound size={18} color="#71717a" aria-hidden="true"/>} 
                            label={toTitleCase(author)} 
                            ariaDescription="Speaker" 
                        />

                        {
                            masjid && 
                                <a href={location || "#"} target="_blank" className="figure__info-masjid" rel="noopener noreferrer">
                                    <IconLabel 
                                        icon={<MapPin size={18} color="#71717a" aria-hidden="true"/>} 
                                        label={toTitleCase(masjid)} 
                                        ariaDescription="Masjid"
                                    />
                                </a>
                        }
                        
                        <IconLabel 
                            icon={<CalendarDays size={18} color="#71717a" aria-hidden="true"/>} 
                            label={dayjs(date).format(config.bayaan.displayFormat)} 
                            ariaDescription="Date" 
                        />

                    </div>

                </figcaption>

                <AudioPlayer
                    id={index}
                    src={audio?.url} 
                    onPlay={onPlay}
                    onPause={onPause}
                />

            </figure>


            <div className="bottom">
                <div className="share-links">
                    <a href={whatsAppLink} data-action="share/whatsapp/share">
                        <Image  width={26} height={26} className="wa-image" src="/wa.png" alt="whats app"/>
                    </a>
                </div>
            </div>

        </StyledWrapper>

    )
};


const StyledWrapper = styled.article`
    position: relative;
    max-width: 100%;
    box-shadow: 0px 0px 4px 0px #00000033;
    border-radius: 12px;
    background-image: linear-gradient(135deg, rgba(176,251,175,1), #ffffff 15% , #ffffff 85%, rgba(176,251,175,1));
    padding: 24px;
    margin: 24px 0;
    transition: 1000ms all ease-in-out 0ms;


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


    & .figure {
        margin: 0;
        overflow: hidden;  
        
        & audio {
            visibility: hidden;
            opacity: 0;
            width: 0;
            height: 0;
        }
    }


    & .figure__caption {
        font-size: 14px;

        & .figure__desc {
            padding-bottom: 12px;
        }
    }
    
    & .title {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 600;
    }


    & .figure__info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-bottom: 10px;

        & .figure__info-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        & .figure__info-masjid {
            pointer-events: none;
            cursor: unset;
        }

        & .figure__info-title {
            color: rgb(113, 113, 122);
            font-weight: 500;
        }

    }


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

export default AudioCard;