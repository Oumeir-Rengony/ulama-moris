import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import config from "@config/config.json";
import Pulsar from "./Pulsar";
import dayjs from "dayjs";

import { styled } from "../styled-system/jsx";

import { CalendarDays as DateIcon, MapPin, UserRound } from "lucide-react";


import AudioPlayer from "app/_components/audio-player";


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
    currentAudioId?: string;
    onAudioPlay?: React.ReactEventHandler<HTMLAudioElement>;
    onAudioPause?: React.ReactEventHandler<HTMLAudioElement>;
    onShare? : React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    description: HTMLElement | string;
    masjid: string;
    date: string;
    author: string;
    audio: Asset;
    tag?: string;
    showPulsar?: boolean;
};


function capitalizeStart(sentence: string) {
  if (typeof sentence !== 'string' || sentence.length === 0) {
    return sentence; // Handle empty strings or non-string inputs
  }
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}



const toTitleCase = (str: string) => {

  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle empty strings or non-string inputs
  }

  return str
    .split(' ')                    
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}


const AudioCard: React.FC<AudioCardProps> = ({
    title,
    index,
    currentAudioId,
    onAudioPlay,
    onAudioPause,
    onShare,
    className='',
    description,
    masjid,
    date,
    author,
    audio,
    tag
}) => {

    const [whatsApp, setWhatsApp] = useState<string>('');
    const [animateShadow, setAnimateShadow] = useState<boolean>(false);
    const [showPulsar, setShowPulsar] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const el = new Audio(audio.url);
        el.preload = "auto";
        // trigger loading now
        el.load();               

        el.onplay = () => setShowPulsar(true);
        el.onpause = () => setShowPulsar(false);
        el.onended = () => setShowPulsar(false);

        audioRef.current = el;

        return () => {
            el.pause();
            audioRef.current = null
        };
    }, [audio.url]);

    useEffect(() => {

        if(audioRef.current && index !== currentAudioId){
            audioRef.current.pause();
            setShowPulsar(false);
        }

    },[index, currentAudioId]);


    // Handle scroll + WhatsApp share when index changes
    useEffect(() => {
        if(!cardRef.current){
            return
        }

        const queryParams = new URLSearchParams(window.location.search);
        const queryId = queryParams.get("id");

        const isInViewport = (element) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }


        // Scroll into view if ?id matches
        if(queryId === index && !isInViewport(audioRef.current)){

            //small offset to give top space
            const offset = 10;

            //but use Card Ref for scrolling to show card
            const y = cardRef.current.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({top: y, behavior: 'smooth'});

            setAnimateShadow(true);
        }

        // Update WhatsApp share link
        queryParams.set("id", index);
        //reset=1 is done so that social media consider it as a new url to refresh their cache
        const url = `${window.location.origin}/?${queryParams.toString()}&reset=1`;
        setWhatsApp(`whatsapp://send?text=${encodeURIComponent(url)}`);

    },[index])



    return (

        <StyledWrapper className={`audio__card ${animateShadow ? 'shadow-glow' : ""} ${className}`} ref={cardRef}>
            
            { showPulsar && <Pulsar/> }

            { 
                tag && 
                    <div className="tag">
                        { 
                            tag.split(",").map((t, index) => (
                                <span key={index} className="tag__item"> { toTitleCase(t) }</span> 
                            ))
                        }
                    </div>
            }

            <h2 className="title">{ title }</h2>

            <figure className="figure">
                <figcaption className="figure__caption">

                    { description && <div className="figure__desc" dangerouslySetInnerHTML={{__html: description}}/> }

                    <div className="figure__info">

                        <div className="figure__info-item">
                            <UserRound size={18} color="#71717a" />
                            <p className="figure__info-title"> { toTitleCase(author) } </p>
                        </div>
                        
                        {
                            masjid && 
                                <div className="figure__info-item">
                                    <MapPin color="#71717a" size={18}/>
                                    <p className="figure__info-title"> { toTitleCase(masjid) } </p>
                                </div>
                        }


                        <div className="figure__info-item">
                            <DateIcon size={18} color="#71717a" />
                            <p className="figure__info-title"> { dayjs(date).format(config.bayaan.displayFormat) } </p>
                        </div>

                    </div>

                </figcaption>

                <AudioPlayer audioRef={audioRef} />
            </figure>


            <div className="bottom">
                <div className="share-links">
                    <a href={whatsApp} data-action="share/whatsapp/share">
                        <Image  width={26} height={26} className="wa-image" src="/wa.png" alt="whats app"/>
                    </a>
                </div>
            </div>

        </StyledWrapper>

    )
};



const StyledWrapper = styled.div`
    position: relative;
    max-width: 100%;
    box-shadow: 0px 0px 4px 0px #00000033;
    border-radius: 12px;
    background-image: linear-gradient(135deg, rgba(176,251,175,1), #ffffff 15% , #ffffff 85%, rgba(176,251,175,1));
    padding: 24px;
    margin: 24px 0;
    transition: 1000ms all ease-in-out 0ms;


    &.shadow-glow { 
        background-size:cover !important;  
        animation: glow 1.8s ease 4;

        & ::after {
            width:100%;
            height:100%;
            content:'';
            border-radius:50px;
            position:absolute;
            top:0;
            left:0;
            z-index:-1;
            background:inherit;
            filter:blur(20px);
            transform:scale(1.05);
            opacity:0.8;
        }
    }

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