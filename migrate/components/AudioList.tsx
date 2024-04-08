import AudioCard, { AudioCardProps } from '@components/AudioCard';


export interface AudioListProps {
    audioList: {  items: Array<AudioCardProps | any>  }
    onAudioPlay: Function;
    currentAudioId: string;
}

const AudioList: React.FC<AudioListProps> = ({
    audioList,
    currentAudioId,
    onAudioPlay
}) => {
    return (
        <div className="audio__list">
            {
                audioList?.items.map(audio => {
                return (
                    <AudioCard 
                        key={audio?.sys?.id} 
                        index={audio?.sys?.id}
                        currentAudioId={currentAudioId}
                        onAudioPlay={() => onAudioPlay(audio)}
                        {...audio}
                    />
                )
                })
            }
        </div>
    )
}

export default AudioList;