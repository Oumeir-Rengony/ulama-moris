import { useRef, useState } from "react";
import { ChevronsRight, ChevronsLeft } from "lucide-react";


interface SkipButtonProps {
  type: "forward" | "rewind";
  size?: number;
  color?: string;
  onSkip?: (value: number) => void;
}

function SkipButton({ type, size, color, onSkip }: SkipButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

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
      <button onClick={handleClick} className={`control-btn btn-skip`}>
         { type === "forward" && <ChevronsRight size={size || 24} color={color || "#53606c"}/> }
         { type === "rewind" && <ChevronsLeft size={size || 24} color={color || "#53606c"}/> }
         { 
            <span className={`skip-text ${isVisible ? 'visible-skip' : ''}`}>
               { type === "forward" ? "+15" : "-15"  }
            </span> 
         }
      </button>
  )
}

export default SkipButton;