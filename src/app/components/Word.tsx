import React from 'react';
import Tooltip from './Tooltip';

type WordProps = {
  word: string;
  index: number;
  metarPatterns: Array<{
    pattern: RegExp;
    type: string;
    icon: React.ComponentType<any> | null;
    color: string;
    bgColor: string;
    decode: (match: string) => string | null;
  }>;
}

export const MetarWord = ({ word, index, metarPatterns }: WordProps) => {
  const decodeMetarPart = (part: string) => {
    for (let pattern of metarPatterns) {
      const match = part.match(pattern.pattern);
      if (match) {
        const explanation = pattern.decode(match[0]);
        // Only return decoded object if explanation is not null
        if (explanation !== null) {
          return {
            type: pattern.type,
            icon: pattern.icon,
            color: pattern.color,
            bgColor: pattern.bgColor,
            explanation: explanation,
            matched: match[0]
          };
        }
      }
    }
    return null;
  };

  const decoded = decodeMetarPart(word);
  const Icon = decoded?.icon;
  
  const content = (
    <span
      className={`inline-block px-2 py-1 mx-1 my-1 rounded-md transition-all duration-200 font-mono ${
        decoded
          ? `${decoded.bgColor} border hover:scale-105 cursor-help shadow-sm hover:shadow-md`
          : 'text-gray-300 hover:bg-gray-800/50'
      }`}
    >
      <span className={`flex items-center gap-1 ${decoded ? decoded.color : ''}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {word}
      </span>
    </span>
  );

  return decoded ? (
    <Tooltip text={decoded.explanation}>
      {content}
    </Tooltip>
  ) : (
    content
  );
};
