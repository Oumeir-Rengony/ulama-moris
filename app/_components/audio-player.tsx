"use client"

import { useEffect, useRef, useState } from "react";
import { 
  Play as PlayIcon, 
  Pause as PauseIcon,
  ChevronsLeft as RewindIcon,
  ChevronsRight as ForwardIcon
} from "lucide-react";
import { Slider, type SliderValue } from "@heroui/slider";
import { styled } from "styled-system/jsx";
import dayjs from "dayjs";

const formatTime = (time) => {
  // Hours, minutes and seconds
  const hrs = Math.floor(~~(time / 3600)); // eslint-disable-line
  const mins = Math.floor(~~((time % 3600) / 60)); // eslint-disable-line
  const secs = Math.floor(time % 60);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? "0" : ""}`;
  }

  ret += `${mins}:${secs < 10 ? "0" : ""}`;
  ret += `${secs}`;
  return ret;
};

const AudioPlayer = ({ 
  // src,
  audioRef,
  onPlay,
  onPause,
}: {
  // src: string;
  audioRef: React.MutableRefObject<HTMLAudioElement>;
  onPlay?: (e?: React.SyntheticEvent<HTMLAudioElement>) => void;
  onPause?: (e?: React.SyntheticEvent<HTMLAudioElement>) => void;
}) => {
 
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaTime, setMediaTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  const lastSkipTimeRef = useRef<dayjs.Dayjs | null>(null);

  const hasSliderChangedRef = useRef<boolean>(false);

  useEffect(() => {

    if(!audioRef.current){
      return
    }

    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
    }

    const onTimeUpdate = () => {
      setMediaTime(audioRef.current.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(true);
    }

    
    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    }

    // buffering/loading
    const handleWaiting = () => { 
      setIsLoading(true);
    }
      
    // enough data to play
    // const handleCanPlay = () => { 
    //   setIsLoading(false);  
    // }

    // actually started
    const handlePlaying = () => {
      setIsLoading(false);
    }


    if(audioRef.current){
      audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', onTimeUpdate);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener("waiting", handleWaiting);
      // audioRef.current.addEventListener("canplay", handleCanPlay);
      audioRef.current.addEventListener("playing", handlePlaying);
    }

    return () => {
      if(audioRef.current){
        audioRef.current.removeEventListener('LoadedMetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('TimeUpdate', onTimeUpdate);
        audioRef.current.removeEventListener('Play', handlePlay);
        audioRef.current.removeEventListener('Pause', handlePause);
        audioRef.current.removeEventListener("waiting", handleWaiting);
        // audioRef.current.removeEventListener("canplay", handleCanPlay);
        audioRef.current.removeEventListener("playing", handlePlaying);
      }
    }

  },[audioRef.current])


  const togglePlaying = () => {
    // setIsPlaying(!isPlaying);
    // isPlaying ? audioRef.current.pause() : audioRef.current.play();

    if (!isPlaying) {
      // Try to play and catch interruption
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {/*ignore*/});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }

  };


  const onSliderChange = (value: SliderValue) => {
    if(!value) return;
    hasSliderChangedRef.current = true;
    setMediaTime(value as number);
    audioRef.current.currentTime = value as number;
  }

  const onThumbClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if(hasSliderChangedRef.current){
      hasSliderChangedRef.current = false;
      return
    }

    const thumbRect = e.currentTarget.getBoundingClientRect();
    const thumbCenter = thumbRect.left + thumbRect.width / 2;
    const mouseX = e.clientX;

    const cooldown = 500; // ms

    // respect cooldown
    if (lastSkipTimeRef.current && dayjs().diff(lastSkipTimeRef.current, "ms") < cooldown) {
      return;
    }

    if (mouseX < thumbCenter) {
      handleSkip(-15);
    }
    else {
      handleSkip(15);
    }

    lastSkipTimeRef.current = dayjs();

  }


  const handleSkip = (skipValue: number) => {

    const { currentTime } = audioRef.current;

    let newTime = currentTime + skipValue;

    // Ensure newTime is not below 0
    if (newTime < 0) {
      newTime = 0;
    }

    // Ensure newTime is not above the duration
    if (newTime > duration) {
      newTime = duration;
    }
    setMediaTime(newTime);
    audioRef.current.currentTime = newTime;
    
  }


  const onRewind = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleSkip(-15);
  };

  const onFastForward = (e: React.MouseEvent<HTMLButtonElement>, value: number = 15) => {
    handleSkip(15);
  };



  return (
    <StyledWrapper>
      <Slider
        aria-label="audio"
        value={mediaTime}
        minValue={0}
        defaultValue={0}
        maxValue={duration}
        step={0.01}
        renderThumb={(props) => <div {...props} onClick={onThumbClick} />}
        onChange={onSliderChange}
        classNames={{
          base: "slider-base",
          track: "slider-track",
          thumb: "slider-thumb",
        }}
      />

     
      <div className="media-bar">

        <p className="time-info">{formatTime(mediaTime)}</p>
        
        <div className="controls">
          <button onClick={onRewind} className="control-btn btn-skip"><RewindIcon size={24} color="#53606c"/>  </button>
          {
            isLoading
              ? <div className="spinner" />
              : <button onClick={togglePlaying} className="control-btn btn-play">
                { isPlaying ? <PauseIcon size={18} color="#53606c"/> : <PlayIcon size={18} color="#53606c"/> }
              </button>
          }
          <button onClick={onFastForward} className="control-btn btn-skip"><ForwardIcon size={24} color="#53606c"/></button>
        </div>

        <p className="time-info">{formatTime(duration)}</p>

      </div>

    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`

  display: flex;
  flex-direction: column;
  width: 100%;
  /* padding: 12px; */
  border-radius: 10px;
  /* background: #f2f4f5; */
  margin: 20px auto;
  

 

  & .slider-base {
    padding-bottom: 12px;
  }

  & .slider-track {
    margin-bottom: 16px;
    cursor: pointer;
  }

  & .slider-thumb {
    width: 22px;
    height: 22px;
  }
  
  & .slider-thumb:after {
    width: 18px !important;
    height: 18px !important;
  }

  & .slider-thumb:before {
    width: 18px !important;
    height: 32px !important;
    border-radius: unset !important;
  }

  & .media-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;


    & .time-info {
      color: #53606c;
      
    }

    & .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      gap: 16px;

      @media(min-width: 768px){
        gap: 16px;
      }
      

      & .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      & .btn-play {
        background: #b0fbaf;
        padding: 16px;
        border-radius: 6px;
      }


      & .control-btn:active {
        & .lucide {
          stroke: #000000; 
        }
      }

      & .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #ccc;
        border-top: 2px solid #53606c;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

    } 

  }

`;

export default AudioPlayer;