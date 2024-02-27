import { styled, keyframes } from "styled-components"

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
    duration
}) => {
    return (
        <StyledWrapper 
            className="pulsar" 
            $duration={duration} 
            style={{ width: size, height:size, background }}
        >
            <div className="blob" style={{ width: size, height: size, background: innerbackground }} />
        </StyledWrapper>
    )
}

const pulseAnim = keyframes`
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.9);
    }

    100% {
        transform: scale(1);
    } 
`

const StyledWrapper = styled.div<{
    $duration?: number
}>`
&.pulsar {
    position: absolute;
    right: -4px;
    top: -4px;
    animation: ${pulseAnim} ${ ({$duration}) => $duration ? $duration : '1.8s'} cubic-bezier(0, 0, 0.58, 1) both infinite;
    padding: 2px;
    opacity: 0.7;
    box-sizing: content-box;
    background-color: #D6E0FF;
    border-radius: 50%;

    .blob {
        background-color: #4f77eb;
        opacity: 0.7;
        border-radius: 50%;
    }
}
`;


export default Pulsar;