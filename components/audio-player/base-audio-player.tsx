import { MutableRefObject, useEffect } from "react";

export function mergeRefs<T = any>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        // @ts-ignore
        ref.current = value;
      }
    });
  };
}

const BaseAudioPlayer = ({
  id,
  internalAudioRef,
  externalAudioRef,
  registerAudio,
  unregisterAudio,
  src,
  onPlay,
  onPause,
  children
}: {
  id: string;
  internalAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  externalAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  registerAudio: (id: string, ref: MutableRefObject<HTMLAudioElement | null>) => void;
  unregisterAudio:(id: string) => void;
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  children: React.ReactNode
}) => {


  useEffect(() => {

    if(!internalAudioRef.current && id){
      return
    }
    
    registerAudio(id, internalAudioRef);
    
    return () => unregisterAudio(id);

  }, [id, internalAudioRef]);

  return (
    <>
      {children}
      <audio
        ref={mergeRefs(internalAudioRef, externalAudioRef)}
        src={src}
        preload="metadata"
        onPlay={onPlay ? onPlay : null}
        onPause={onPause ? onPause : null}
        controls={false}
        style={{ display: 'none' }}
      />
    </>
  )
}

export default BaseAudioPlayer;