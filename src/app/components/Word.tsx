import React from 'react';

type WordProps = {
  word: string;
  index: number;
  metarPatterns: Array<{
    pattern: RegExp;
    type: string;
    icon: React.ComponentType<any> | null;
    color: string;
    bgColor: string;
    decode: (match: string) => string;
  }>;
}

export const MetarWord = ({ word, index, metarPatterns }: WordProps) => {
  const decodeMetarPart = (part: string) => {
    for (let pattern of metarPatterns) {
      const match = part.match(pattern.pattern);
      if (match) {
        return {
          type: pattern.type,
          icon: pattern.icon,
          color: pattern.color,
          bgColor: pattern.bgColor,
          explanation: pattern.decode(match[0]),
          matched: match[0]
        };
      }
    }
    return null;
  };

  const decoded = decodeMetarPart(word);
  const Icon = decoded?.icon;
  
  return (
    <span
      key={index}
      className={`relative inline-block px-2 py-1 mx-1 my-1 rounded-md transition-all duration-200 font-mono ${
        decoded 
          ? `${decoded.bgColor} border hover:scale-105 cursor-help shadow-sm hover:shadow-md` 
          : 'text-gray-300 hover:bg-gray-800/50'
      }`}
      title={decoded ? decoded.explanation : ''}
    >
      <span className={`flex items-center gap-1 ${decoded ? decoded.color : ''}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {word}
      </span>
      {decoded && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl min-w-max">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-blue-400" />}
            <span>{decoded.explanation}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
};
