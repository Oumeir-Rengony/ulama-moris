"use client"

import { useCallback, useEffect, useRef } from "react"

interface UseVisualizerOptions {
   audioRef: React.RefObject<HTMLAudioElement>
   canvasRef: React.RefObject<HTMLCanvasElement>
   barCount?: number
   barColor?: string
   barGap?: number
   smoothingFactor?: number
}
export function useVisualizer({
   audioRef,
   canvasRef,
   barCount = 128,
   barColor = "#3b82f6",
   barGap = 2,
   smoothingFactor = 0.8,
}: UseVisualizerOptions) {
   const audioContextRef = useRef<AudioContext | null>(null)
   const analyserRef = useRef<AnalyserNode | null>(null)
   const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
   const animationIdRef = useRef<number | null>(null)
   const smoothedHeightsRef = useRef<number[]>(new Array(barCount).fill(0))
   const initializedRef = useRef(false);


   const initialize = useCallback(() => {
      if (initializedRef.current) return
      if (!audioRef.current || !canvasRef.current) return


      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = smoothingFactor

      const source = audioContext.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source
      initializedRef.current = true
   }, [audioRef, canvasRef, smoothingFactor])

   const draw = useCallback(() => {
      const analyser = analyserRef.current
      const canvas = canvasRef.current
      if (!analyser || !canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const barWidth = (canvas.width / barCount) * 2.5
      const step = Math.floor(bufferLength / barCount)

      const render = () => {
         animationIdRef.current = requestAnimationFrame(render)
         analyser.getByteFrequencyData(dataArray)
         ctx.clearRect(0, 0, canvas.width, canvas.height)

         // for (let i = 0; i < barCount; i++) {
         //    const value = dataArray[i * step] / 255
         //    smoothedHeightsRef.current[i] =
         //       smoothedHeightsRef.current[i] * smoothingFactor + value * (1 - smoothingFactor)
         //    const barHeight = smoothedHeightsRef.current[i] * canvas.height * 0.9
         //    const x = i * (barWidth + barGap)
         //    const y = canvas.height - barHeight
         //    // ctx.fillStyle = barColor
         //    const baseGreen = 120 // hue = green
         //    const lightness = 30 + (i / barCount) * 40 // 30–70%
         //    ctx.fillStyle = `hsl(${baseGreen}, 100%, ${lightness}%)`
            
         //    ctx.fillRect(x, y, barWidth, barHeight)
         // }
         

         for (let i = 0; i < barCount; i++) {
            const dataIndex = i * step
            const value = dataArray[dataIndex] / 255

            // Apply exponential smoothing
            smoothedHeightsRef.current[i] =
               smoothedHeightsRef.current[i] * smoothingFactor + value * (1 - smoothingFactor)

            // Compute smoothed height
            const height = Math.max(4, smoothedHeightsRef.current[i] * canvas.height * 0.8)

            // Center vertically
            const x = i * barWidth
            const y = (canvas.height - height) / 2

            // const gradient = ctx.createLinearGradient(0, y, 0, y + height)
            // gradient.addColorStop(0, "red")
            // gradient.addColorStop(1, "blue")
            // ctx.fillStyle = gradient

            const opacity = 0.72 + smoothedHeightsRef.current[i] * (1 - 0.42)
            ctx.fillStyle = `rgba(133, 208, 61, ${opacity.toFixed(2)})`;

            ctx.fillRect(x, y, barWidth - 2, height);
         }
        

      }

      render()
   }, [barCount, barGap, barColor, smoothingFactor])

   const start = useCallback(async () => {
      initialize()

      const ctx = audioContextRef.current
      if (!ctx) return

      if (ctx.state === "suspended") {
         await ctx.resume()
      }

      cancelAnimationFrame(animationIdRef.current ?? 0)
      draw()
   }, [initialize, draw])

   const stop = useCallback(async () => {
      if (animationIdRef.current) {
         cancelAnimationFrame(animationIdRef.current)
         animationIdRef.current = null
      }

      if (audioContextRef.current?.state === "running") {
         await audioContextRef.current.suspend()
      }

      const canvas = canvasRef.current
      if (canvas) {
         const ctx = canvas.getContext("2d")
         if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      smoothedHeightsRef.current.fill(0)
   }, [canvasRef])

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
         if (audioContextRef && audioContextRef?.current?.state !== "closed") {
            audioContextRef?.current?.close()
         }
         sourceRef?.current?.disconnect();
         analyserRef?.current?.disconnect()

      }
   }, [])

   return { start, stop }
}