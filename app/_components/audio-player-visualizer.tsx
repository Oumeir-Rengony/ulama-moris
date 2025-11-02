"use client"

import { AudioContext as AudioPlayerContext } from "@components/audio-player/audio-context";
import AudioPlayer from "@components/audio-player/audio-player";
import { useVisualizer } from "hooks/useVisualizer";
import { use, useRef } from "react";

const AudioPlayerVisualizer = ({
  id,
  src
}: any) => {
  const { activeAudioRef } = use(AudioPlayerContext);

  const canvasRef = useRef(null);

  const { start, stop } = useVisualizer({
    audioRef: activeAudioRef,
    canvasRef,
  })

  return (
    <>
      <canvas width={400} height={80} ref={canvasRef} style={{ margin: '0 auto' }} />
      <AudioPlayer id={id} onPlay={start} onPause={stop} src={src} crossOrigin="anonymous" />
    </>
  )
}


export default AudioPlayerVisualizer;