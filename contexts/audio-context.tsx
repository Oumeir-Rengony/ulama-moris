"use client"

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import CONFIG from "@/config/config.json";

// Types
export interface AudioTrack {
  id: string
  src: string
  title?: string
  author?: string
}

interface AudioContextValue {
  // Current track state
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  isBuffering: boolean

  // Control methods
  playTrack: (track: AudioTrack) => void
  toggle: () => void
  pause: () => void
  seek: (time: number) => void
  seekImmediate: (time: number) => void
  skipBackward: (seconds?: number) => void
  skipForward: (seconds?: number) => void
}

const AudioContext = createContext<AudioContextValue | null>(null)


const STORAGE_KEY = CONFIG.localstorageKey.audioTime;


type ProgressMap = Record<string, number>

function getProgressMap(): ProgressMap {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveProgress(trackId: string, time: number) {
  const map = getProgressMap()
  map[trackId] = time
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function removeProgress(trackId: string) {
  const map = getProgressMap()
  delete map[trackId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function getTrackProgress(trackId: string): number {
  const map = getProgressMap()
  return map[trackId] || 0
}


// AudioProvider - Single global audio element
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Track state
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  

  // Initialize audio element once on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create audio element only once
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    // Event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
    }

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
    }

    const handleCanPlay = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
      setIsBuffering(false)
    }

    const handleCanPlayThrough = () => {
      setIsBuffering(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }
    

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }

    const handleError = (e: Event) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
      setIsLoaded(false)
      setIsBuffering(false)
    }

    // Attach event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    // Cleanup on unmount
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, []);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return
  

    const interval = setInterval(() => {
      const audio = audioRef.current
      if (!audio) return

      // Only save if meaningful progress
      if (audio.currentTime > 0 && !audio.paused) {
        saveProgress(currentTrack.id, audio.currentTime)
      }
    }, 3000);

    const handleEnded = () => {
      if (currentTrack) {
        removeProgress(currentTrack.id) 
      }
    }

    audioRef?.current?.addEventListener("ended", handleEnded)
  
    return () => {
      clearInterval(interval);
      audioRef?.current?.removeEventListener("ended", handleEnded)
    }

  }, [currentTrack])



  // Play a track (or toggle if same track)
  // const playTrack = useCallback((track: AudioTrack) => {
  //   const audio = audioRef.current
  //   if (!audio) return

  //   // If same track, toggle play/pause
  //   if (currentTrack?.id === track.id) {
  //     if (audio.paused) {
  //       audio.play().catch((err) => {
  //         console.error("Audio play failed:", err)
  //       })
  //     } else {
  //       audio.pause()
  //     }
  //     return
  //   }

  //   // New track: reset state and load
  //   setIsLoaded(false)
  //   setCurrentTime(0)
  //   setDuration(0)
  //   setCurrentTrack(track)

  //   // Set new source and load
  //   audio.src = track.src
  //   audio.load()

  //   // Play after loading
  //   audio.play().catch((err) => {
  //     console.error("Audio play failed:", err)
  //   })
  // }, [currentTrack?.id])

  const playTrack = useCallback((track: AudioTrack) => {
    const audio = audioRef.current
    if (!audio) return

    // Same track → toggle
    if (currentTrack?.id === track.id) {
      if (audio.paused) {
        audio.play().catch(console.error)
      } else {
        audio.pause()
      }
      return
    }

    setIsLoaded(false)
    setCurrentTime(0)
    setDuration(0)
    setCurrentTrack(track)

    audio.src = track.src
    audio.load()

    // ✅ NEW: restore progress
    const savedTime = getTrackProgress(track.id)

    if (savedTime > 0) {
      // Wait until metadata is loaded before seeking
      const handleLoaded = () => {
        audio.currentTime = savedTime
        setCurrentTime(savedTime)
        audio.removeEventListener("loadedmetadata", handleLoaded)
      }

      audio.addEventListener("loadedmetadata", handleLoaded)
    }

    audio.play().catch(console.error)
  }, [currentTrack?.id])


  // Toggle play/pause for current track
  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Audio play failed:", err)
      })
    } else {
      audio.pause()
    }
  }, [currentTrack])

  // Pause current playback
  const pause = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
    }
  }, [])

  // Seek to specific time (used during drag - only updates UI, doesn't seek audio yet)
  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return

    // isSeeking.current = true
    const maxDuration = audio.duration && isFinite(audio.duration) ? audio.duration : 0
    const clampedTime = Math.max(0, Math.min(time, maxDuration))
    
    // Update UI immediately for responsiveness (but don't seek audio yet)
    setCurrentTime(clampedTime)
  }, [])

  // Seek immediately - commits the seek to audio (for final commit after drag or click)
  const seekImmediate = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return

    const maxDuration = audio.duration && isFinite(audio.duration) ? audio.duration : 0
    const clampedTime = Math.max(0, Math.min(time, maxDuration))
    
    // Update UI immediately
    setCurrentTime(clampedTime)
    
    audio.currentTime = clampedTime
  }, [])



  // Skip backward
  const skipBackward = useCallback((seconds: number = 15) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.max(0, audio.currentTime - seconds)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  // Skip forward
  const skipForward = useCallback((seconds: number = 15) => {
    const audio = audioRef.current
    if (!audio) return

    const maxTime = audio.duration || Infinity
    const newTime = Math.min(maxTime, audio.currentTime + seconds)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [])


  const value: AudioContextValue = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    isBuffering,
    playTrack,
    toggle,
    pause,
    seek,
    seekImmediate,
    skipBackward,
    skipForward,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

// Keep old hook name for backwards compatibility during migration
export const useAudioContext = useAudio