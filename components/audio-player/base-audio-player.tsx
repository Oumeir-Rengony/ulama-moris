import { MutableRefObject, useEffect } from "react";

const BaseAudioPlayer = ({
  id,
  internalAudioRef,
  registerAudio,
  unregisterAudio,
  src,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  crossOrigin,
  children
}: {
  id: string;
  internalAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  registerAudio: (id: string, ref: MutableRefObject<HTMLAudioElement | null>) => void;
  unregisterAudio:(id: string) => void;
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: () => void;
  onEnded?: () => void;
  children: React.ReactNode;
  crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
}) => {


  useEffect(() => {

    if(!internalAudioRef.current && id){
      return
    }
    
    registerAudio(id, internalAudioRef);
    
    return () => unregisterAudio(id);

  }, [id, registerAudio, unregisterAudio, internalAudioRef]);


  return (
    <>
      {children}
      <audio
        ref={internalAudioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onPlay={onPlay ? onPlay : undefined}
        onPause={onPause ? onPause : undefined}
        controls={false}
        style={{ display: 'none' }}
        crossOrigin={crossOrigin || ""}
      />
    </>
  )
}

export default BaseAudioPlayer;