'use client';

import AudioListComponent from "@components/AudioList";
import { useContext } from "react";
import { IAudioContext, AudioContext } from "../../providers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createSearchParams } from "@services/utils";

const AudioList= ({
  audioList,
}) => {
  const { currentAudioId, setCurrentAudioId } = useContext<IAudioContext>(AudioContext);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = new URLSearchParams(useSearchParams());

  const onAudioPlay = (audio) => {
    setCurrentAudioId(audio.sys.id);

    const queryParams = {
      ...Object.fromEntries(searchParams),
      id: audio.sys.id
    }

    const newParams = createSearchParams(queryParams).toString();

    router.replace(`${pathname}?${newParams}`, { scroll: false });
  }

  return (
    <AudioListComponent
      currentAudioId={currentAudioId}
      audioList={audioList}
      onAudioPlay={onAudioPlay}
    />
  )
}


export default AudioList;