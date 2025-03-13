import { styled } from "styled-system/jsx";

const loading = () => {
    return (
        <StyledWrapper className="loading-background" style={{ background: 'rgba(236, 240, 241, 0.7)' }}>
          <div className="loading-bar" >
            <div className="loading-circle-1" style={{background: '#0070f0'}} />
            <div className="loading-circle-2" style={{background: '#0070f0'}} />
          </div>
        </StyledWrapper>
    )
};

const StyledWrapper = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    cursor: progress;

    & .loading-bar {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 50px;
        height: 50px;
        transform: translate(-50%, -50%);
    }

    & .loading-circle-1,
    & .loading-circle-2 {
        content: " ";
        width: 100%;
        height: 100%;
        border-radius: 50%;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 0;
        -webkit-animation: loading 2s infinite ease-in-out;
        animation: loading 2s infinite ease-in-out;
    }

    & .loading-circle-2 {
        animation-delay: -1s;
    }

`;

export default loading;