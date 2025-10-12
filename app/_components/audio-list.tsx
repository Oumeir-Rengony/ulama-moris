"use client"

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AudioCard from "@components/audio-card";
import { AudioManager } from "@components/audio-player/audio-context";


const AudioList = ({ audioList }: {
    audioList: any
}) => {
    // const [currentAudioId, setCurrentAudioId] = useState(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    
    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }

    const onAudioPlay = (id: string) => {
        // setCurrentAudioId(id);
        const queryString = createQueryString('id', `${id}`);
        router.push(`${pathname}?${queryString}`, { scroll: false });
    }

    return (
        <div className="audio__list">
            <AudioManager>
            {
                audioList?.map(audioItem => {
                    return (
                        <AudioCard
                            key={audioItem?.sys?.id}
                            index={audioItem?.sys?.id}
                            // currentAudioId={currentAudioId}
                            onAudioPlay={() => onAudioPlay(audioItem?.sys?.id)}
                            {...audioItem}
                        />
                    )
                })
            }
            </AudioManager>
        </div>        
    )
}

export default AudioList;