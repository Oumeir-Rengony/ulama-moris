import { useEffect, useRef } from "react";
import { styled } from "styled-system/jsx";
import SkipButton from "./skip";
import { formatTime } from "@services/utils/utils.service";
import { PauseIcon, PlayIcon } from "lucide-react";

const AudioControls = ({
   // isPlaying,
   id,
   mediaTime,
   duration,
   isLoading,
   togglePlay,
   isActive,
   handleSkip
}: {
   // isPlaying:boolean,
   id: string;
   mediaTime: number,
   duration: number,
   isLoading:boolean,
   isActive: (id: string) => boolean
   togglePlay: (id: string) => void;
   handleSkip: (skipValue: number) => void;
}) => {

   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {

      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
         }
      }

   }, []);

   const handleClick = () => {

      if(!id){
         return;
      }

      togglePlay(id);
   }


   return (
      <StyledWrapper id={`controls-${id}`}>
         <p className="time-info">{formatTime(mediaTime)}</p>

         <div className="controls">
            <SkipButton onSkip={handleSkip} type="rewind" className="control-btn" />
            {/* {
               isLoading
                  ? <div className="spinner-container">
                     <div className="spinner" />
                  </div>

                  : <button onClick={togglePlay} className="control-btn btn-play">
                     {isPlaying ? <PauseIcon size={18} color="#53606c" /> : <PlayIcon size={18} color="#53606c" />}
                  </button>
            } */}

            {
               isLoading && isActive(id) ? (
                  <div className="spinner-container"><div className="spinner" /></div>
               ) : (
                  <button onClick={handleClick} className="control-btn btn-play">
                     {isActive(id)
                        ? <PauseIcon size={18} color="#53606c" />
                        : <PlayIcon size={18} color="#53606c" />}
                  </button>
               )
            }

            <SkipButton onSkip={handleSkip} type="forward" className="control-btn" />
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

         &:hover {
            background: #9ff99d;
         }

         &:active {
            background: #86f286;
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


export default AudioControls;