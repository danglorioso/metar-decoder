import React, { useState, useRef, useEffect } from 'react';

type SpeechBubbleTooltipProps = {
  children: React.ReactNode;
  text: string | React.ReactNode;
};

export default function SpeechBubbleTooltip({ children, text }: SpeechBubbleTooltipProps) {
  const [adjustPosition, setAdjustPosition] = useState<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current || !tooltipRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Calculate centered position
      const centerX = containerRect.left + containerRect.width / 2;
      const tooltipHalfWidth = tooltipRect.width / 2;
      
      let adjustment = 0;
      
      // Only adjust if tooltip would actually go off-screen
      if (centerX - tooltipHalfWidth < 8) {
        // Adjust right just enough to stay on screen
        adjustment = 8 - (centerX - tooltipHalfWidth);
      } else if (centerX + tooltipHalfWidth > viewportWidth - 8) {
        // Adjust left just enough to stay on screen
        adjustment = (viewportWidth - 8) - (centerX + tooltipHalfWidth);
      }
      
      setAdjustPosition(adjustment);
    };

    const handleMouseEnter = () => {
      setTimeout(updatePosition, 10);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
      }
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative group inline-block w-max">
      {children}
      <div 
        ref={tooltipRef} 
        className="absolute bottom-full left-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50"
        style={{ transform: `translateX(calc(-50% + ${adjustPosition}px))` }}
      >
        <div className="bg-gray-800 text-white text-lg px-3 py-2 rounded-lg shadow-lg border border-gray-700 relative min-w-max max-w-[calc(100vw-2rem)] sm:max-w-[80vw] break-words text-center font-normal whitespace-normal sm:whitespace-nowrap">
          {text}
          <div 
            className="absolute bottom-[-6px] w-3 h-3 bg-gray-800 border-l border-t border-gray-700 rotate-45 z-[-1]" 
            style={{ left: `calc(50% - ${adjustPosition}px - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
}