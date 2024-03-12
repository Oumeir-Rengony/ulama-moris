import { styled } from "../styled-system/jsx";


export interface PulsarProps {
    size?: string,
    background?: string,
    innerbackground?: string,
    duration?: number
}



const Pulsar: React.FC<PulsarProps> = ({
    size='8px',
    innerbackground,
    background,
    duration=1.8
}) => {
    return (
        <StyledWrapper 
            className="pulsar" 
            style={{ 
                width: size, 
                height:size, 
                background,
                animation: `playingDot ${duration}s cubic-bezier(0, 0, 0.58, 1) both infinite`
            }}
        >
            <div className="blob" style={{ width: size, height: size, background: innerbackground }} />
        </StyledWrapper>
    )
}



const StyledWrapper = styled.div`
    position: absolute;
    right: -4px;
    top: -4px;
    padding: 2px;
    opacity: 0.7;
    box-sizing: content-box;
    background-color: #D6E0FF;
    border-radius: 50%;

    & .blob {
        background-color: #4f77eb;
        opacity: 0.7;
        border-radius: 50%;
    }
`;



export default Pulsar;