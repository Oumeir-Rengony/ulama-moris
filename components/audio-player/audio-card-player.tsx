"use client"

import { AudioPlayer } from "./audio-player"

interface AudioCardPlayerProps {
  id: string;
  audioSrc: string;
  duration: string;
}

export function AudioCardPlayer({ id, audioSrc, duration }: AudioCardPlayerProps) {
  return (
    <AudioPlayer.Root id={id} audioSrc={audioSrc} className="space-y-3">
      {/* Progress Slider */}
      <AudioPlayer.Progress thumbSize="md" trackHeight="md" />

      {/* Controls Row */}
      <AudioPlayer.Controls className="flex items-center gap-2">
        <AudioPlayer.SeekBackward size="md" seconds={15} />
        <AudioPlayer.PlayPause size="md" variant="primary" />
        <AudioPlayer.SeekForward size="md" seconds={15} />
        <AudioPlayer.Time duration={duration} className="ml-auto" />
      </AudioPlayer.Controls>
    </AudioPlayer.Root>
  )
}
