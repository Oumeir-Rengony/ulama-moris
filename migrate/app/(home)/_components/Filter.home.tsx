'use client';

import { useContext } from "react";
import FilterComponent from "@components/Filter";
import { IAudioContext, AudioContext } from "../../providers";

const Filter = () => {

    const { setCurrentAudioId } = useContext<IAudioContext>(AudioContext);

    const handleSubmit = () => {
        setCurrentAudioId(null);   
    }

    return (
        <FilterComponent onSubmit={handleSubmit}/>
    )
}


export default Filter;