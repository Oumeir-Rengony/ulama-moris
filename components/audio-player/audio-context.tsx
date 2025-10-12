"use client";

import React, {
   createContext,
   useRef,
   useState,
   useCallback,
   MutableRefObject,
} from "react";

interface IAudioContext {
   audioRefs: React.MutableRefObject<Map<string, HTMLAudioElement>>;
   currentId: string | null;
   currentAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
   registerAudio: (id: string, ref: MutableRefObject<HTMLAudioElement | null>) => void;
   unregisterAudio: (id: string) => void;
   togglePlay: (id: string) => void;
   setActiveAudio: (id: string) => void;
   pauseCurrent: () => void;
   isActive: (id: string) => boolean;
}

export const AudioContext = createContext<IAudioContext>({
   audioRefs: { current: new Map() },
   currentId: null,
   currentAudioRef: { current: null },
   registerAudio: () => { },
   unregisterAudio: () => { },
   togglePlay: () => { },
   setActiveAudio: () => { },
   pauseCurrent: () => { },
   isActive: () => false,
});


export const AudioManager = ({ children }: { children: React.ReactNode }) => {
   const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
   const currentAudioRef = useRef<HTMLAudioElement | null>(null);
   const [currentId, setCurrentId] = useState<string | null>(null);

   /** register a ref */
   const registerAudio = useCallback((id: string, ref: MutableRefObject<HTMLAudioElement | null>) => {
      if (ref.current) {
         audioRefs.current.set(id, ref.current);
      }
   }, []);

   /** unregister a ref */
   const unregisterAudio = useCallback((id: string) => {
      audioRefs.current.delete(id);
      if (currentId === id) {
         setCurrentId(null);
         currentAudioRef.current = null;
      }
   }, [currentId]);


   const pauseCurrent = useCallback(() => {
      if (currentAudioRef.current) {
         currentAudioRef.current.pause();
      }
   }, []);


   const setActiveAudio = useCallback((id: string) => {
      const target = audioRefs.current.get(id);
      if (!target) return;

      // pause previous
      if (currentAudioRef.current && currentAudioRef.current !== target) {
         currentAudioRef.current.pause();
      }

      currentAudioRef.current = target;
      setCurrentId(id);

      // optionally start playback (you can remove this if you want manual play control)
      target.play().catch(() => { });
   }, []);


   const handleActiveAudio = (target: HTMLAudioElement) => {
      if (!target) return;

      if (target.paused) {
            // Resume if paused
         target.play().catch(() => { });
      } else {
         // Pause if playing
         target.pause();
         // Clear active tracking so UI resets
         currentAudioRef.current = null;
         setCurrentId(null);
      }
   };

   const togglePlay = useCallback((id: string) => {
      const target = audioRefs.current.get(id);
      if (!target) return;

      // If it's the active audio (Active means the one currently selected, playing or paused)
      if (currentId === id) {
         handleActiveAudio(target);  
      } else {
         // Switch to another audio
         setActiveAudio(id);
      }
   }, [currentId, setActiveAudio]);


   /** helper */
   const isActive = useCallback((id: string) => currentId === id, [currentId]);

   return (
      <AudioContext.Provider
         value={{
            audioRefs,
            currentId,
            currentAudioRef,
            registerAudio,
            unregisterAudio,
            togglePlay,
            setActiveAudio,
            pauseCurrent,
            isActive,
         }}
      >
         {children}
      </AudioContext.Provider>
   );
};