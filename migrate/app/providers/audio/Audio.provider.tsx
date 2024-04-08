'use client'

import { createContext, useState } from 'react';
import type { SetStateAction, Dispatch } from "react";


export interface IAudioContext {
    currentAudioId: string;
    setCurrentAudioId: Dispatch<SetStateAction<string>>;
}


export const AudioContext = createContext<IAudioContext>({
    currentAudioId: null,
    setCurrentAudioId: () => {},
});


const AudioProvider = ({ children }: { children: React.ReactNode}) => {

    const [currentAudioId, setCurrentAudioId] = useState<string>(null);

    return(
        <AudioContext.Provider 
            value={{
                currentAudioId,
                setCurrentAudioId,
            }}
        >
            {children}

        </AudioContext.Provider>
    );
};

export default AudioProvider;