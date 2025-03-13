"use client"

import { startTransition, useEffect, useState } from "react";
import { 
  Play as PlayIcon, 
  Pause as PauseIcon,
  Rewind as RewindIcon,
  FastForward as ForwardIcon
} from "lucide-react";
import { Slider, type SliderValue } from "@heroui/slider";
import { styled } from "styled-system/jsx";

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
  // onPlay,
  // onPause,
  children
}: {
  // src: string;
  audioRef: React.MutableRefObject<HTMLAudioElement>;
  // onPlay: (e?: React.SyntheticEvent<HTMLAudioElement>) => void;
  // onPause: (e?: React.SyntheticEvent<HTMLAudioElement>) => void;
  children: React.ReactNode;
}) => {
 
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaTime, setMediaTime] = useState(0);


  useEffect(() => {

    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
    }
    const onTimeUpdate = () => {
      setMediaTime(audioRef.current.currentTime);
    };

    const handlePlay = () => {
      console.log("play")
      setIsPlaying(true);
    }

    const handlePause = () => {
      console.log("pause")
      setIsPlaying(false);
    }

    if(audioRef.current){
      audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', onTimeUpdate);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
    }

    return () => {
      if(audioRef.current){
        audioRef.current.removeEventListener('LoadedMetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('TimeUpdate', onTimeUpdate);
        audioRef.current.removeEventListener('Play', handlePlay);
        audioRef.current.removeEventListener('Pause', handlePause);
      }
    }

  },[audioRef.current])


  const togglePlaying = () => {
    setIsPlaying(!isPlaying);
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };


  const onSliderChange = (value: SliderValue) => {
    startTransition(() => {
      setMediaTime(value as number);
      audioRef.current.currentTime = value as number;
    })
  }

  const onRewind = () => {
    const { currentTime } = audioRef.current;
    const newTime = Math.max(currentTime - 15, 0);
    setMediaTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const onFastForward = () => {
    const { currentTime } = audioRef.current;
    const newTime = Math.min(currentTime + 15, duration);
    setMediaTime(newTime);
    audioRef.current.currentTime = newTime;
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
        onChange={onSliderChange}
        classNames={{
          track: "slider-track",
          thumb: "slider-thumb",
        }}
      />
      <div className="controls">
        <button onClick={togglePlaying} className="control-btn">
          { isPlaying ? <PauseIcon color="#53606c" /> : <PlayIcon color="#53606c" /> }
        </button>
        <p className="time-info">{formatTime(mediaTime)} / {formatTime(duration)}</p>
        <button onClick={onRewind} className="control-btn"><RewindIcon size={20} color="#53606c"/> 15s </button>
        <button onClick={onFastForward} className="control-btn"><ForwardIcon size={20} color="#53606c"/> 15s</button>
      </div>
      { children }
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`

  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: #f2f4f5;
  margin: 20px auto;
  

  & .time-info {
    color: #53606c;
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
    width: unset !important;
    height: unset !important;
  }


  & .controls {
    display: flex;
    align-items: center;
    font-size: 14px;
    gap: 10px;

    @media(min-width: 768px){
      gap: 16px;
    }
    

    & .control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      /* gap: 4px; */
    }
  } 
  
`;

export default AudioPlayer;