"use client"

import { styled } from "styled-system/jsx";
import BaseAudioPlayer from "./base-audio-player";
import AudioSlider from "./audio-slider";
import AudioControls from "./audio-controls";
import useAudio from "./use-audio";
import { AudioContext } from "./audio-context";
import { use, useEffect } from "react";
import { useThrottle } from "hooks/useThrottle";
import config from "config/config.json";



const AudioPlayer = ({
  id,
  src,
  onPlay,
  onPause,
  crossOrigin
}: {
  id: string;
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
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

  useEffect(() => {
    const lastPlayed = localStorage.getItem(config.localstorageKey.audioTime);
    if (lastPlayed) {
      const { audioId, time } = JSON.parse(lastPlayed);
      if (audioId === id && internalAudioRef.current) {
        internalAudioRef.current.currentTime = time;
      }
    }
  }, [id, internalAudioRef]);

  const saveTimestamp = useThrottle(() => {
    if (!internalAudioRef.current) return;
    const currentTime = internalAudioRef.current.currentTime;
    localStorage.setItem(
      config.localstorageKey.audioTime,
      JSON.stringify({ audioId: id, time: currentTime })
    );
  }, 2500); //Save at most once every 2.5 seconds


  const removeTimestamp = () => {
    localStorage.removeItem(config.localstorageKey.audioTime)
  }

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
        onTimeUpdate={saveTimestamp}
        onEnded={removeTimestamp}
        crossOrigin={crossOrigin}
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