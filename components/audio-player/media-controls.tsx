"use client"

import { useEffect, useRef, useState } from "react";
import { 
  Play as PlayIcon, 
  Pause as PauseIcon,
} from "lucide-react";
import SkipButton from "./skip";
import { styled } from "styled-system/jsx";

const formatTime = (time: number) => {
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

const MediaControls = ({ 
  togglePlay,
  onSkip,
  isPlaying,
  mediaTime,
  isLoading,
  duration
}: {
  togglePlay: () => void;
  onSkip: (value: number) => void;
  isPlaying: boolean;
  mediaTime: number;
  isLoading: boolean;
  duration: number;
}) => {
 
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

   return () => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
   }

  },[])


  return (
    <StyledWrapper>     
       <p className="time-info">{formatTime(mediaTime)}</p>
        
        <div className="controls">
          <SkipButton onSkip={onSkip} type="rewind" />
          {
            isLoading
              ? <div className="spinner-container">
                  <div className="spinner" />
                </div>

              : <button onClick={togglePlay} className="control-btn btn-play">
                { isPlaying ? <PauseIcon size={18} color="#53606c"/> : <PlayIcon size={18} color="#53606c"/> }
              </button>
          }
          <SkipButton onSkip={onSkip} type="forward" />
        </div>

        <p className="time-info">{formatTime(duration)}</p>
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`
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


      & .btn-skip {
         position: relative;
         border-radius: 50%;
         background: #e4e6e7;
         padding: 8px;

         & .skip-text {
            position: absolute; 
            top: -32px; 
            line-height: 2rem; 
            font-weight: 700; 
            color: #2563EB; 
            opacity: 0;
            transform : translateY(8px);
            pointer-events: none;
            transition-property: all;
            transition-duration: 300ms; 
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); 
         }

         & .visible-skip {
            opacity: 100%;
            transform : translateY(0px);
            pointer-events: unset;
         }

      }

      & .control-btn:active {
         & .lucide {
            stroke: #000000; 
         }
      }

      & .spinner-container {
         width: 50px;
         height: 50px;
         display: flex;
         align-items: center;
         justify-content: center;

         & .spinner {
            width: 28px;
            height: 28px;
            border: 2px solid #ccc;
            border-top: 2px solid #53606c;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
         }
      }

   } 
`;

export default MediaControls;