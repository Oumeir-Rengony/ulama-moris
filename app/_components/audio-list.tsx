"use client"

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AudioCard from "@components/audio-card";
import { AudioManager } from "@components/audio-player/audio-context";


const AudioList = ({ audioList }: {
    audioList: any
}) => {
    // const [currentAudioId, setCurrentAudioId] = useState(null);
    const mountRef = useRef(false);
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const id = searchParams.get("id");
    

    useEffect(() => {

        if (!id || mountRef.current) {
            return
        }

        const cardEl = document?.querySelector(`#card-${id}`);
        const controlsEl = document?.querySelector(`#controls-${id}`);
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

    },[id]);


    const getWhatsAppLink = (id: string) => {

        if(!id){
            return
        }

        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulama-moris.org';

        const queryString = createQueryString("id", id)

        //reset=1 is done so that social media consider it as a new url to refresh their cache
        const fullUrl = `${origin}${pathname}?${queryString.toString()}&reset=1`;
        return encodeURIComponent(fullUrl);
    }
    
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
                            whatsAppLink={`whatsapp://send?text=${getWhatsAppLink(audioItem?.sys?.id)}`}
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