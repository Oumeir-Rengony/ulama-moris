"use client"

import { styled } from "styled-system/jsx";
import BaseAudioPlayer from "./base-audio-player";
import AudioSlider from "./audio-slider";
import AudioControls from "./audio-controls";
import useAudio from "./use-audio";
import { AudioContext } from "./audio-context";
import { use } from "react";



const AudioPlayer = ({
  id,
  src,
  onPlay,
  onPause,
}: {
  id: string;
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
}) => {

  const { 
    registerAudio, 
    unregisterAudio, 
    togglePlay, 
    isActive 
  } = use(AudioContext);
 
  const {
    internalAudioRef,
    // isPlaying,
    duration,
    mediaTime,
    isLoading,
    // togglePlay,
    onSliderChange,
    handleSkip,
    onThumbClick
  } = useAudio();

  return (
    <StyledWrapper>

      <BaseAudioPlayer
        id={id}
        internalAudioRef={internalAudioRef}
        registerAudio={registerAudio}
        unregisterAudio={unregisterAudio}
        src={src}
        onPlay={onPlay}
        onPause={onPause}
      >
        <AudioSlider
          mediaTime={mediaTime}
          duration={duration}
          onSliderChange={onSliderChange}
          onThumbClick={onThumbClick}
        />

        <AudioControls
          // isPlaying={isPlaying}
          id={id}
          isActive={isActive}
          mediaTime={mediaTime}
          duration={duration}
          isLoading={isLoading}
          togglePlay={togglePlay}
          handleSkip={handleSkip}
        />
        
      </BaseAudioPlayer>

    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`

  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  margin: 20px auto;

`;

export default AudioPlayer;