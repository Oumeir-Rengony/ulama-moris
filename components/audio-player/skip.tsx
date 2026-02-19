import { useRef, useState } from "react";
import { ChevronsRight, ChevronsLeft } from "lucide-react";
import { styled } from "styled-system/jsx";


interface SkipButtonProps {
  type: "forward" | "rewind";
  size?: number;
  color?: string;
  onSkip?: (value: number) => void;
  className?: string;
}

function SkipButton({ type, size, color, onSkip, className }: SkipButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {

    // Clear any existing timeout to prevent premature fade-out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show the text if not already visible
    if (!isVisible) {
      setIsVisible(true);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 800);

    // Call the callback if provided
    if (onSkip) {
      const value = type === "forward" ? 15 : -15
      onSkip(value);
    }
  }

  return (
    <StyledButton onClick={handleClick} className={`btn-skip ${className}`}>
      {type === "forward" && <ChevronsRight size={size || 24} color={color || "#53606c"} />}
      {type === "rewind" && <ChevronsLeft size={size || 24} color={color || "#53606c"} />}
      {
        <span className={`skip-text ${isVisible ? 'visible-skip' : ''}`}>
          {type === "forward" ? "+15" : "-15"}
        </span>
      }
    </StyledButton>
  )
}

const StyledButton = styled.button`
  position: relative;
  border-radius: 50%;
  background: #e4e6e7;
  padding: 8px;

  &:hover {
    background: #d8dadb;
  }

  &:active {
    background: #c7c9ca;
  }

  & .skip-text {
    position: absolute; 
    top: -32px; 
    line-height: 2rem; 
    font-weight: 700; 
    color: #2563EB; 
    opacity: 0;
    transform : translateY(8px);
    pointer-events: none;
    transition-property: all;
    transition-duration: 300ms; 
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); 
  }

  & .visible-skip {
    opacity: 100%;
    transform : translateY(0px);
    pointer-events: unset;
  }

`

export default SkipButton;