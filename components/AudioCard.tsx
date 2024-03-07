import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import config from "@config/config.json";
import { styled } from "styled-components";
import Pulsar from "./Pulsar";
import { useRouter } from "next/router";



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
    date: string;
    author: string;
    audio: Asset;
    showPulsar?: boolean;
};

const AudioCard: React.FC<AudioCardProps> = ({
    title,
    index,
    currentAudioId,
    onAudioPlay,
    onAudioPause,
    onShare,
    className='',
    description,
    date,
    author,
    audio,
}) => {

    const [whatsApp, setWhatsApp] = useState<string>('');
    const [showPulsar, setShowPulsar] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement>();

    const router = useRouter();


    useEffect(() => {

        if(!audioRef.current){
            return;
        }


        if(index !== currentAudioId){
            audioRef.current.pause();
            setShowPulsar(false);
        }

    },[audioRef, index, currentAudioId]);


    useEffect(() => {
        if(!audioRef.current){
            return
        }

        const isInViewport = (element) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        if(router.query.id === index && !isInViewport(audioRef.current)){
            const y = audioRef.current.getBoundingClientRect().top + window.scrollY - 110

            window.scrollTo({top: y, behavior: 'smooth'});
        }

    },[audioRef, router.query.id, index])


    useEffect(() => {
        if(typeof window !== 'undefined'){
            const queryParams = new URLSearchParams(window.location.search); 

            if(queryParams.has("id")){
                queryParams.delete("id");
            }

            queryParams.append("id", index);
            //reset=1 is done so tht social media consider it as a new url to refresh their cache
            const url = `${window.location.origin}/?${queryParams.toString()}&reset=1`;
            setWhatsApp(`whatsapp://send?text=${encodeURIComponent(url)}`);
        }
    },[index])


    const onPlay = (e: React.SyntheticEvent<HTMLAudioElement>) => {

        setShowPulsar(true);

        if(onAudioPlay){
            onAudioPlay(e);
        }
    }


    const onPause = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        setShowPulsar(false);

        if(onAudioPause){
            onAudioPause(e);
        }
    }


    const onWhatsAppShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if(onShare){
            onShare(e);
        }
    }



    return (
        <StyledWrapper className={`audio__card ${className}`}>
            
           { showPulsar && <Pulsar/> }

            <h2 className="title">{ title }</h2>

            <figure className="figure">
                <figcaption className="figure__description">
                    <div dangerouslySetInnerHTML={{__html: description}}/>
                </figcaption>
                <audio 
                    ref={audioRef}
                    onPlay={onPlay}
                    onPause={onPause}
                    className="audio"
                    controls
                    controlsList="nodownload noplaybackrate noremoteplayback nodownload"
                >
                    <source src={audio?.url} type={audio.contentType} />
                </audio>           
            </figure>


            <p className="info__author"> { author } </p>

            <p className="info__date"> { dayjs(date).format(config.bayaan.displayFormat) }</p>

            <div className="bottom">
                <div className="share-links">
                    <a href={whatsApp} onClick={onWhatsAppShare} data-action="share/whatsapp/share">
                        <img className="wa-image" src="wa.png" alt="whats app"/>
                    </a>
                </div>
            </div>
            
        </StyledWrapper>
    )
};


const StyledWrapper = styled.div`

&.audio__card {
    position: relative;
    max-width: 100%;
    box-shadow: 0px 0px 4px 0px #00000033;
    border-radius: 12px;
    background: rgb(243,253,255);
    background-image: linear-gradient(135deg, rgba(176,251,175,1), #ffffff 15% , #ffffff 85%, rgba(176,251,175,1));
    padding: 12px 18px;
    margin: 24px 0;


    .figure__description {
        font-size: 14px;
    }


    .title {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 22px;
        font-weight: 600;
    }

    .figure {
        margin: 0;
        overflow: hidden;


        .audio {
            width: 100%;
            height: 34px;
            margin: 12px 0;
            background: none;;
        }


        .audio::-webkit-media-controls-play-button,
        .audio::-webkit-media-controls-current-time-display,
        .audio::-webkit-media-controls-time-remaining-display{
            position: relative; 
            left: -9px;
        }
    
        .audio::-webkit-media-controls-mute-button,
        .audio::-webkit-media-controls-volume-slider { 
            display: none !important;
        }

        .audio::-webkit-media-controls-timeline {
            width: 100%;
            padding: 0 0 0 4px;
        }

    }
  
    .info__author, .info__date {
        color: rgb(113, 113, 122);
        font-weight: 500;
        margin: 0 0 14px;
    }



    .info__date {
        font-size: 12px;
        margin: 0;
    }


    .share-links {
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

        .wa-image{
            width: 26px;
            height: 26px;
        }
    }
    

    
}
`

export default AudioCard;