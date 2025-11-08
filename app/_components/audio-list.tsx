"use client"

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AudioCard from "@components/card/audio-card";
import { createQueryString } from "@services/utils/utils.service";
import { AudioManager } from "@components/audio-player/audio-context";


const AudioList = ({ audioList }: {
    audioList: any
}) => {
    const mountRef = useRef(false);
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const queryParamId = searchParams.get("id");
    

    useEffect(() => {

        if (!queryParamId || mountRef.current) {
            return
        }

        const cardEl = document?.querySelector(`#card-${queryParamId}`);
        const controlsEl = document?.querySelector(`#controls-${queryParamId}`);
        mountRef.current = true; // prevent reruns

        if(!cardEl && !controlsEl){
            return
        }

        const isInViewport = (element) => {
            if(!element){
                return
            }

            const rect = element?.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        if (!isInViewport(controlsEl)) {
            cardEl.scrollIntoView({ behavior: 'smooth' });
        }

    },[queryParamId]);


    // const generateWhatsAppLink = (id: string) => {
    //     const queryString = createQueryString(searchParams, { name: "id", value: id});
    //     return getWhatsAppLink(pathname, queryString)
    // }

    const onAudioPlay = (id: string) => {
        const queryString = createQueryString(searchParams, { name: "id", value: id});
        router.push(`${pathname}?${queryString}`, { scroll: false });
    }

    return (
        <div className="audio__list">
            <AudioManager>
            {
                audioList?.map((audioItem) => {
                    return (
                        <AudioCard
                            key={audioItem?.sys?.id}
                            index={audioItem?.sys?.id}
                            onAudioPlay={() => onAudioPlay(audioItem?.sys?.id)}
                            // whatsAppLink={`whatsapp://send?text=${generateWhatsAppLink(audioItem?.sys?.id)}`}
                            whatsAppLink={`whatsapp://send?text=${process.env.NEXT_PUBLIC_SITE_URL}/audio/${audioItem?.slug}`}
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