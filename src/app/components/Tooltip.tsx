import React from 'react';

type SpeechBubbleTooltipProps = {
  children: React.ReactNode;
  text: string;
};

export default function SpeechBubbleTooltip({ children, text }: SpeechBubbleTooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
        <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700 relative whitespace-nowrap">
          {text}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 rotate-45 z-[-1]" />
        </div>
      </div>
    </div>
  );
}
