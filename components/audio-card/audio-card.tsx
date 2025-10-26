import Pulsar from "@components/pulsar";
import { useRef, useState } from "react";
import { styled } from "styled-system/jsx";

import { Card } from "@components/audio-card/base-card";
import AudioPlayer from "@components/audio-player/audio-player";

interface Asset {
  title: string;
  description: string;
  url: string;
  contentType?: string;
  fileName?: string;
  size?: string;
  width?: string;
  height?: string;
}

export interface AudioCardProps {
  title: string;
  index?: string;
  onAudioPlay?: () => void;
  onAudioPause?: () => void;
  onShare?: () => void;
  className?: string;
  description: HTMLElement | string;
  location: string;
  masjid: string;
  date: string;
  author: string;
  audio: Asset;
  duration?: string;
  tag?: string;
  showPulsar?: boolean;
  whatsAppLink?: string;
}


const AudioCard: React.FC<AudioCardProps> = ({
  title,
  index,
  onAudioPlay,
  onAudioPause,
  className = "",
  description,
  location,
  masjid,
  date,
  author,
  audio,
  whatsAppLink,
  tag,
}) => {
  const [showPulsar, setShowPulsar] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const onPlay = () => {
    setShowPulsar(true);
    console.log("play");

    if (onAudioPlay) {
      onAudioPlay();
    }
  }


  const onPause = () => {
    setShowPulsar(false);

    if (onAudioPause) {
      onAudioPause();
    }
  }

  return (
    <StyledWrapper className={`audio__card ${className}`} ref={cardRef} id={`card-${index}`}>
      <Card>

        {showPulsar && <Pulsar />}

        {tag && <Card.Tag tag={tag} />}
        
        <Card.Title title={title} />

        <figure className="figure">
          <figcaption className="figure__caption">
            {description && <Card.Description description={description} />}
            <Card.MediaInfo author={author} masjid={masjid} location={location} date={date} />
          </figcaption>

          <AudioPlayer id={index} src={audio?.url} onPlay={onPlay} onPause={onPause} />
        </figure>

       { whatsAppLink && <Card.Footer whatsAppLink={whatsAppLink}/>}

      </Card>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.article`

`;

export default AudioCard;