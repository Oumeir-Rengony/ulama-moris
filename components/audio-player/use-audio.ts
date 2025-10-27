import { SliderValue } from "@heroui/slider";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const useAudio = () => {

   const internalAudioRef = useRef<HTMLAudioElement | null>(null);

   // const [isPlaying, setIsPlaying] = useState(false);
   const [duration, setDuration] = useState(0);
   const [mediaTime, setMediaTime] = useState(0);
   const [isLoading, setIsLoading] = useState(false);


   const lastSkipTimeRef = useRef<dayjs.Dayjs | null>(null);
   const hasSliderChangedRef = useRef<boolean>(false);


   useEffect(() => {

      const audioEl = internalAudioRef.current;

      if (!audioEl) {
         return
      }

      const onLoadedMetadata = () => {
         setDuration(audioEl?.duration);
      }

      const onTimeUpdate = () => {
         setMediaTime(audioEl?.currentTime);
      };

      const handlePlay = () => {
         // setIsPlaying(true);
         setIsLoading(true);
      }

      const handlePause = () => {
         // setIsPlaying(false);
         setIsLoading(false);
      }

      // buffering/loading
      const handleWaiting = () => {
         setIsLoading(true);
      }

      // actually started
      const handlePlaying = () => {
         setIsLoading(false);
      }


      if (audioEl) {
         audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
         audioEl.addEventListener('timeupdate', onTimeUpdate);
         audioEl.addEventListener('play', handlePlay);
         audioEl.addEventListener('pause', handlePause);
         audioEl.addEventListener("waiting", handleWaiting);
         audioEl.addEventListener("playing", handlePlaying);
      }

      return () => {
         if (audioEl) {
            audioEl.removeEventListener('loadedMetadata', onLoadedMetadata);
            audioEl.removeEventListener('timeUpdate', onTimeUpdate);
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
            audioEl.removeEventListener("waiting", handleWaiting);
            audioEl.removeEventListener("playing", handlePlaying);
         }

      }

   }, [])


   // const togglePlay = () => {
   //    if(!internalAudioRef.current){
   //       return;
   //    }

   //    if (!isPlaying) {
   //       // Try to play and catch interruption
   //       internalAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {/*ignore*/ });
   //    } else {
   //       internalAudioRef.current.pause();
   //       setIsPlaying(false);
   //    }

   // };

   const onSliderChange = (value: SliderValue) => {
      if (!value && !internalAudioRef.current) return;
      hasSliderChangedRef.current = true;
      setMediaTime(value as number);
      internalAudioRef.current.currentTime = value as number;
   }

   const handleSkip = (skipValue: number) => {
      
      if (!internalAudioRef.current) return;

      const { currentTime } = internalAudioRef.current;

      let newTime = currentTime + skipValue;

      // Ensure newTime is not below 0
      if (newTime < 0) {
         newTime = 0;
      }

      // Ensure newTime is not above the duration
      if (newTime > duration) {
         newTime = duration;
      }
      setMediaTime(newTime);
      internalAudioRef.current.currentTime = newTime;

   }

   const onThumbClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasSliderChangedRef.current) {
         hasSliderChangedRef.current = false;
         return
      }

      const thumbRect = e.currentTarget.getBoundingClientRect();
      const thumbCenter = thumbRect.left + thumbRect.width / 2;
      const mouseX = e.clientX;

      const cooldown = 200; // ms

      // respect cooldown
      if (lastSkipTimeRef.current && dayjs().diff(lastSkipTimeRef.current, "ms") < cooldown) {
         return;
      }

      if (mouseX < thumbCenter) {
         handleSkip(-15);
      }
      else {
         handleSkip(15);
      }

      lastSkipTimeRef.current = dayjs();

   }

   return {
      internalAudioRef,
      // isPlaying,
      duration,
      mediaTime,
      isLoading,
      // togglePlay,
      onSliderChange,
      handleSkip,
      onThumbClick
   }
}

export default useAudio;