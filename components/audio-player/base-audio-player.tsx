const BaseAudioPlayer = ({
   audioRef,
   src,
   children
}: {
   audioRef: React.MutableRefObject<HTMLAudioElement | null>;
   src: string;
   children: React.ReactNode
}) => {

   return (
      <>
         {children}
         <audio ref={audioRef} src={src} preload="metadata" style={{display: 'none'}}/>
      </>
   )
}

export default BaseAudioPlayer;