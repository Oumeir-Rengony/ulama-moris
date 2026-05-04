"use client"

import Link from "next/link";
import { AudioPlayer } from "./audio-player"
import { Download, Disc3 } from "lucide-react"
import { toast } from "sonner";

interface AudioDetailPlayerProps {
  id: string;
  duration: string;
  audioSrc: string;
  downloadSrc?: string;
  title: string;
}

export function AudioDetailPlayer({ id, audioSrc, downloadSrc, duration, title }: AudioDetailPlayerProps) {  

  const showToast = () => {
    toast(title, {
      description: "Download started. Check your download folder",
      position: 'bottom-center',
      actionButtonStyle: {
        background: 'var(--primary)',
      },
      action: {
        label: "OK",
        onClick: () => { },
      },
    })
  }
  
  return (
    <AudioPlayer.Root
      id={id}
      audioSrc={audioSrc} 
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/90 via-primary to-primary/80 p-6 shadow-2xl md:p-10"
    >
      {/* Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large blurred circle */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Top Section - Now Playing */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Disc3 className="h-5 w-5 animate-[spin_3s_linear_infinite] text-white" />
          </div>
          <span className="text-sm font-medium uppercase tracking-widest text-white/80">
            Now Playing
          </span>
        </div>

        <div className="mb-6 sm:h-35 flex justify-center">
          <img src="/waves.webp" className="h-full" />
        </div>


        {/* Progress Bar */}
        <div className="mb-3">
          <AudioPlayer.Progress 
            thumbSize="lg" 
            trackHeight="lg" 
            className="**:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:border-white **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:shadow-lg **:data-[slot=slider-track]:bg-white/30"
          />
        </div>

        {/* Time Display */}
        <div className="mb-8 flex items-center justify-between">
          <AudioPlayer.CurrentTime className="text-sm font-medium text-white/80" />
          <AudioPlayer.Duration value={duration} className="text-sm font-medium text-white/80" />
        </div>

        {/* Main Controls */}
        <AudioPlayer.Controls className="flex items-center justify-center gap-6 md:gap-8">
          <AudioPlayer.SeekBackward 
            size="lg" 
            seconds={15} 
            className="h-14 w-14 bg-white/15 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/25 active:scale-95 cursor-pointer"
          />
          <AudioPlayer.PlayPause 
            size="lg" 
            variant="ghost"
            className="h-20 w-20 bg-white text-primary shadow-xl transition-all hover:scale-110 hover:bg-white active:scale-95 md:h-24 md:w-24 [&_svg]:h-8 [&_svg]:w-8 md:[&_svg]:h-10 md:[&_svg]:w-10 cursor-pointer"
          />
          <AudioPlayer.SeekForward 
            size="lg" 
            seconds={15} 
            className="h-14 w-14 bg-white/15 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/25 active:scale-95 cursor-pointer"
          />
        </AudioPlayer.Controls>

        {/* Download Link */}
        <a
          href={downloadSrc}
          download 
          className="mt-8 flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors"
          onClick={showToast}
        >
          <Download className="h-4 w-4" />
          <p className="text-xs font-medium">Download Audio <span className="sr-only">{title}</span></p>
        </a>
      </div>
    </AudioPlayer.Root>
  )
}
