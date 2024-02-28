import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import config from "@config/config.json";
import { styled } from "styled-components";
import Pulsar from "./Pulsar";
import { useRouter } from "next/router";


const ShareIcon = ({ color= '#a9a8a8', ...otherprops }) => (
    <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height={26} width={26} version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve" {...otherprops}>
        <path fill="#EDEDED"  d="M0,512l35.31-128C12.359,344.276,0,300.138,0,254.234C0,114.759,114.759,0,255.117,0  S512,114.759,512,254.234S395.476,512,255.117,512c-44.138,0-86.51-14.124-124.469-35.31L0,512z"/>
        <path className="bg" fill={color} d="M137.71,430.786l7.945,4.414c32.662,20.303,70.621,32.662,110.345,32.662  c115.641,0,211.862-96.221,211.862-213.628S371.641,44.138,255.117,44.138S44.138,137.71,44.138,254.234  c0,40.607,11.476,80.331,32.662,113.876l5.297,7.945l-20.303,74.152L137.71,430.786z"/>
        <path fill="#FEFEFE"  d="M187.145,135.945l-16.772-0.883c-5.297,0-10.593,1.766-14.124,5.297  c-7.945,7.062-21.186,20.303-24.717,37.959c-6.179,26.483,3.531,58.262,26.483,90.041s67.09,82.979,144.772,105.048  c24.717,7.062,44.138,2.648,60.028-7.062c12.359-7.945,20.303-20.303,22.952-33.545l2.648-12.359  c0.883-3.531-0.883-7.945-4.414-9.71l-55.614-25.6c-3.531-1.766-7.945-0.883-10.593,2.648l-22.069,28.248  c-1.766,1.766-4.414,2.648-7.062,1.766c-15.007-5.297-65.324-26.483-92.69-79.448c-0.883-2.648-0.883-5.297,0.883-7.062  l21.186-23.834c1.766-2.648,2.648-6.179,1.766-8.828l-25.6-57.379C193.324,138.593,190.676,135.945,187.145,135.945"/>
    </svg>
);


const DownloadIcon = ({ color= '#a9a8a8', ...otherprops }) => (
    <svg className="download-icon" width={24} height={24} fill={color} viewBox="0 0 20 20" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" {...otherprops}>
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
    </svg>
)

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
            // audioRef.current.scrollIntoView({block: 'center', behavior: 'smooth'});

            const y = audioRef.current.getBoundingClientRect().top + window.scrollY - 110

            window.scrollTo({top: y, behavior: 'smooth'});
        }

    },[audioRef, router.query.id, index])


    useEffect(() => {
        if(typeof window !== 'undefined'){
            console.log(window.location.href)
            setWhatsApp(`whatsapp://send?text=${window.location.href}`);
        }
    },[])


    const onPlay = (e) => {

        setShowPulsar(true);

        if(onAudioPlay){
            onAudioPlay(e);
        }
    }


    const onPause = (e) => {
        setShowPulsar(false);

        if(onAudioPause){
            onAudioPause(e);
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
                    controlsList="nodownload noplaybackrate"
                    src={audio?.url} 
                />             
            </figure>


            <p className="info__author"> { author } </p>

            <p className="info__date"> { dayjs(date).format(config.bayaan.displayFormat) }</p>

            <div className="bottom">
                <div className="share-links">
                    <a href={whatsApp} data-action="share/whatsapp/share">
                        <ShareIcon/>
                    </a>
                    <a href="" download={audio.url}><DownloadIcon download={audio.url}/></a>
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
            padding: 0 0 0 12px;
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

        .download-icon {
            &:hover {
                fill: #4e4e50 ;
                border-radius: 2px;
            }
        }

        .share-icon {
            padding: 1px;

            &:hover {
                border-radius: 20%;

                .bg {
                    fill: #4e4e50 ;
                }
            }
        }
    }
    

    
}
`

export default AudioCard;