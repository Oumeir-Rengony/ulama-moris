"use client"

import { useCallback, useId, useMemo, type ReactNode } from "react"
import { useAudio, type AudioTrack } from "@/contexts/audio-context"
import { Play, Pause, RotateCcw, RotateCw, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn, formatTime } from "@/lib/utils"

// ============================================================================
// Root Component - Now just provides track context to children
// ============================================================================

interface RootProps {
  id: string;
  audioSrc: string
  title?: string
  author?: string
  children: ReactNode
  className?: string
}

function Root({ id, audioSrc, title, author, children, className }: RootProps) {

  const audioId = id || useId();

  // Create track object that children will use
  const track: AudioTrack = useMemo(
    () => ({
      id: id,
      src: audioSrc,
      title,
      author,
    }),
    [audioId, audioSrc, title, author]
  )

  return (
    <div className={className} data-audio-track-id={audioId}>
      <RootContext.Provider value={{ track }}>
        {children}
      </RootContext.Provider>
    </div>
  )
}

// Internal context for passing track to children
import { createContext, useContext } from "react"

interface RootContextValue {
  track: AudioTrack
}

const RootContext = createContext<RootContextValue | null>(null)

function useRootContext() {
  const context = useContext(RootContext)
  if (!context) {
    throw new Error("AudioPlayer components must be used within AudioPlayer.Root")
  }
  return context
}

// Hook to check if this component's track is the currently playing track
function useIsCurrentTrack() {
  const { track } = useRootContext()
  const { currentTrack, isPlaying } = useAudio()
  const isCurrentTrack = currentTrack?.id === track.id
  return { isCurrentTrack, isPlayingThisTrack: isCurrentTrack && isPlaying, track }
}

// ============================================================================
// PlayPause Component
// ============================================================================

interface PlayPauseProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "ghost"
}

function PlayPause({ className, size = "md", variant = "primary" }: PlayPauseProps) {
  const { track, isPlayingThisTrack, isCurrentTrack } = useIsCurrentTrack()
  const { playTrack, isBuffering } = useAudio()

  const handleClick = useCallback(() => {
    playTrack(track)
  }, [playTrack, track])

  // Show buffering state only for the current track
  const showBuffering = isCurrentTrack && isBuffering

  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  }

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95",
    ghost: "bg-secondary text-foreground hover:bg-secondary/80",
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-all duration-200",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      aria-label={showBuffering ? "Loading" : isPlayingThisTrack ? "Pause" : "Play"}
    >
      {showBuffering ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : isPlayingThisTrack ? (
        <Pause className={iconSizes[size]} fill="currentColor" />
      ) : (
        <Play className={cn(iconSizes[size], "translate-x-0.5")} fill="currentColor" />
      )}
    </button>
  )
}

// ============================================================================
// Progress Component
// ============================================================================

interface ProgressProps {
  className?: string
  thumbSize?: "sm" | "md" | "lg"
  trackHeight?: "sm" | "md" | "lg"
}

function Progress({ className, thumbSize = "md", trackHeight = "md" }: ProgressProps) {
  const { isCurrentTrack, track } = useIsCurrentTrack()
  const { currentTime, duration, seek, seekImmediate, playTrack } = useAudio()

  // Only show progress for the current track
  const displayTime = isCurrentTrack ? currentTime : 0
  const displayDuration = isCurrentTrack && duration > 0 ? duration : 100

  // Handle value change during drag - only update UI, don't seek audio yet
  // const handleValueChange = useCallback(
  //   (value: number[]) => {
  //     console.log("value change", value[0])
  //     if (isCurrentTrack) {
  //       seek(value[0])
  //     }
  //   },
  //   [seek, isCurrentTrack]
  // )

  // Handle commit when user releases the slider or clicks on it
  // const handleValueCommit = useCallback(
  //   (value: number[]) => {
  //     console.log("on commit", value[0])
  //     if (isCurrentTrack) {
  //       // Seek audio to the final position
  //       seekImmediate(value[0])
  //     } else {
  //       // If not current track, start playing it first
  //       playTrack(track)
  //     }
  //   },
  //   [seekImmediate, isCurrentTrack, playTrack, track]
  // )

  // Handle value change during drag - only update UI, don't seek audio yet
  const handleValueChange = useCallback((value: number[]) => {
    console.log("handleValueChange",  value[0])
      if (isCurrentTrack) { 
        seekImmediate(value[0])
      }
    },
    [isCurrentTrack, seekImmediate]
  )

  // Handle commit when user releases the slider or clicks on it
  const handleValueCommit = useCallback(
    (value: number[]) => {
      // If not current track, start playing it first
      if (!isCurrentTrack) {
        playTrack(track)
      }
    },
    [isCurrentTrack, playTrack, track]
  )

  const thumbStyles = {
    sm: "**:data-[slot=slider-thumb]:h-2.5 **:data-[slot=slider-thumb]:w-2.5",
    md: "**:data-[slot=slider-thumb]:h-3 **:data-[slot=slider-thumb]:w-3",
    lg: "**:data-[slot=slider-thumb]:h-4 **:data-[slot=slider-thumb]:w-4",
  }

  const trackStyles = {
    sm: "**:data-[slot=slider-track]:h-1",
    md: "**:data-[slot=slider-track]:h-1.5",
    lg: "**:data-[slot=slider-track]:h-2",
  }

  return (
    <Slider
      value={[displayTime]}
      min={0}
      max={displayDuration}
      step={0.1}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      className={cn(
        "cursor-pointer **:data-[slot=slider-thumb]:border-primary",
        thumbStyles[thumbSize],
        trackStyles[trackHeight],
        className
      )}
      aria-label="Audio progress"
    />
  )
}

// ============================================================================
// Time Component
// ============================================================================

interface TimeProps {
  className?: string;
  duration: string;
  separator?: string
}

function Time({ duration, className, separator = "/" }: TimeProps) {
  const { isCurrentTrack } = useIsCurrentTrack()
  const { currentTime } = useAudio()

  const displayTime = isCurrentTrack ? currentTime : 0

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground",
        className
      )}
    >
      <span>{formatTime(displayTime)}</span>
      <span>{separator}</span>
      <span>{ duration ? duration : "--:--"}</span>
   
    </div>
  )
}

// ============================================================================
// CurrentTime Component
// ============================================================================

interface CurrentTimeProps {
  className?: string
}

function CurrentTime({ className }: CurrentTimeProps) {
  const { isCurrentTrack } = useIsCurrentTrack()
  const { currentTime } = useAudio()

  const displayTime = isCurrentTrack ? currentTime : 0

  return (
    <span className={cn("text-sm font-medium tabular-nums text-muted-foreground", className)}>
      {formatTime(displayTime)}
    </span>
  )
}

// ============================================================================
// Duration Component
// ============================================================================

interface DurationProps {
  value: string;
  className?: string
}

function Duration({ value, className }: DurationProps) {
  // const { isCurrentTrack } = useIsCurrentTrack()
  // const { duration, isLoaded, formatTime } = useAudio()

  // const showLoaded = isCurrentTrack && isLoaded
  // const displayDuration = isCurrentTrack ? duration : 0

  return (
    <span className={cn("text-sm font-medium tabular-nums text-muted-foreground", className)}>
      { value }
    </span>
  )
}

// ============================================================================
// SeekBackward Component
// ============================================================================

interface SeekBackwardProps {
  className?: string
  seconds?: number
  size?: "sm" | "md" | "lg"
}

function SeekBackward({ className, seconds = 15, size = "md" }: SeekBackwardProps) {
  const { isCurrentTrack, track } = useIsCurrentTrack()
  const { skipBackward, playTrack } = useAudio()

  const handleClick = useCallback(() => {
    if (isCurrentTrack) {
      skipBackward(seconds)
    } else {
      // Start playing the track first if not current
      playTrack(track)
    }
  }, [isCurrentTrack, skipBackward, seconds, playTrack, track])

  const sizeStyles = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground",
        sizeStyles[size],
        className
      )}
      aria-label={`Skip back ${seconds} seconds`}
    >
      <RotateCcw className={iconSizes[size]} />
    </button>
  )
}

// ============================================================================
// SeekForward Component
// ============================================================================

interface SeekForwardProps {
  className?: string
  seconds?: number
  size?: "sm" | "md" | "lg"
}

function SeekForward({ className, seconds = 15, size = "md" }: SeekForwardProps) {
  const { isCurrentTrack, track } = useIsCurrentTrack()
  const { skipForward, playTrack } = useAudio()

  const handleClick = useCallback(() => {
    if (isCurrentTrack) {
      skipForward(seconds)
    } else {
      // Start playing the track first if not current
      playTrack(track)
    }
  }, [isCurrentTrack, skipForward, seconds, playTrack, track])

  const sizeStyles = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground",
        sizeStyles[size],
        className
      )}
      aria-label={`Skip forward ${seconds} seconds`}
    >
      <RotateCw className={iconSizes[size]} />
    </button>
  )
}

// ============================================================================
// Controls Component (wrapper for layout)
// ============================================================================

interface ControlsProps {
  className?: string
  children: ReactNode
}

function Controls({ className, children }: ControlsProps) {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>
}

// ============================================================================
// Export Compound Component
// ============================================================================

export const AudioPlayer = {
  Root,
  PlayPause,
  Progress,
  Time,
  CurrentTime,
  Duration,
  SeekBackward,
  SeekForward,
  Controls,
}
