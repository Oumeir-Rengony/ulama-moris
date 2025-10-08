import { Slider, SliderValue } from "@heroui/slider";
import { styled } from "styled-system/jsx";

const AudioSlider = ({
   mediaTime, 
   duration, 
   onSliderChange, 
   onThumbClick 
}: {
   mediaTime: number, 
   duration: number, 
   onSliderChange: (value: SliderValue) => void;
   onThumbClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
   
   return (

      <StyledWrapper>
         <Slider
            aria-label="audio"
            value={mediaTime}
            minValue={0}
            defaultValue={0}
            maxValue={duration}
            step={0.01}
            renderThumb={(props) => <div {...props} onClick={onThumbClick} />}
            onChange={onSliderChange}
            classNames={{
               base: "slider-base",
               track: "slider-track",
               thumb: "slider-thumb",
            }}
         />
      </StyledWrapper>
   )
}


const StyledWrapper = styled.div`

  & .slider-base {
   padding-bottom: 12px;
  }

  & .slider-track {
    margin-bottom: 16px;
    cursor: pointer;
  }

  & .slider-thumb {
    width: 22px;
    height: 22px;
  }
  
  & .slider-thumb:after {
    width: 18px !important;
    height: 18px !important;
  }

  & .slider-thumb:before {
    width: 18px !important;
    height: 32px !important;
    border-radius: unset !important;
  }
  

`;

export default AudioSlider;