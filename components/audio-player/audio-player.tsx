"use client"

import { useEffect, useRef, useState } from "react";
import { Slider, type SliderValue } from "@heroui/slider";
import { styled } from "styled-system/jsx";
import dayjs from "dayjs";
import MediaControls from "./media-controls";


const AudioPlayer = ({ 
  audioRef,
  onPlay,
  onPause,
}: {
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


  const togglePlay = () => {
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

      <MediaControls 
        togglePlay={togglePlay}
        onSkip={handleSkip}
        isLoading={isLoading}
        isPlaying={isPlaying}
        mediaTime={mediaTime}
        duration={duration}
      />

    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`

  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
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

`;

export default AudioPlayer;