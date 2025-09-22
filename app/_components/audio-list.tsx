"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AudioCard from "@components/AudioCard";
import ReactDOM from "react-dom";

const AudioList = ({ audioList }: {
    audioList: any
}) => {
    const [currentAudioId, setCurrentAudioId] = useState(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if(!audioList && audioList.length <= 0){
            return
        }

        audioList.forEach(item => {
            ReactDOM.preload(item?.audio?.url, { as: "audio", type: "audio/mp4" }as any);
        });
    },[audioList]);

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }

    const onAudioPlay = (id: string) => {
        setCurrentAudioId(id);
        const queryString = createQueryString('id', `${id}`);
        router.push(`${pathname}?${queryString}`, { scroll: false });
    }

    return (
        <div className="audio__list">
            {
                audioList?.map(audioItem => {
                    return (
                        <AudioCard
                            key={audioItem?.sys?.id}
                            index={audioItem?.sys?.id}
                            currentAudioId={currentAudioId}
                            onAudioPlay={() => onAudioPlay(audioItem?.sys?.id)}
                            {...audioItem}
                        />
                    )
                })
            }
        </div>        
    )
}

export default AudioList;