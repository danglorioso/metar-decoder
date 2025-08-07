import { Plane, Wind, Eye, CloudSnow, Thermometer } from 'lucide-react';

// Define the Airport type locally to avoid circular dependencies
interface Airport {
  iata: string;
  icao: string;
  name: string;
  country: string;
  city: string;
  information: string;
}

export const getMetarPatterns = (airportsByIcao?: Map<string, Airport>) => {
  return [
    {
      pattern: /^[A-Z]{4}$/,
      type: 'station',
      icon: Plane,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (airportsByIcao) {
          const airport = airportsByIcao.get(match);
          if (airport) {
            return `Airport: ${airport.name} (${match}) - ${airport.city}, ${airport.country}`;
          }
        }
        return `Airport: ${match} (ICAO identifier)`;
      }
    },
    {
      pattern: /\d{6}Z/,
      type: 'time',
      icon: null,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500/30',
      decode: (match: string) => {
        const day = match.slice(0, 2);
        const hour = match.slice(2, 4);
        const min = match.slice(4, 6);
        return `Time: Day ${day}, ${hour}:${min} UTC (Zulu time)`;
      }
    },
    {
      pattern: /\d{5}KT|\d{3}\d{2}G\d{2}KT/,
      type: 'wind',
      icon: Wind,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: (match: string) => {
        if (match.includes('G')) {
          const dir = match.slice(0, 3);
          const speed = match.slice(3, 5);
          const gust = match.slice(6, 8);
          return `Wind: ${dir}° at ${speed} knots, gusting to ${gust} knots`;
        } else {
          const dir = match.slice(0, 3);
          const speed = match.slice(3, 5);
          return `Wind: ${dir}° at ${speed} knots`;
        }
      }
    },
    {
      pattern: /\d+SM/,
      type: 'visibility',
      icon: Eye,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30',
      decode: (match: string) => {
        const vis = match.replace('SM', '');
        return `Visibility: ${vis} statute miles`;
      }
    },
    {
      pattern: /FEW\d{3}|SCT\d{3}|BKN\d{3}|OVC\d{3}|CLR/,
      type: 'clouds',
      icon: CloudSnow,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: (match: string) => {
        if (match === 'CLR') {
          return 'Clear skies, no clouds';
        }
        
        const coverage = match.slice(0, 3);
        const altitude = parseInt(match.slice(3)) * 100;
        const coverageMap: Record<string, string> = {
          'FEW': 'Few clouds',
          'SCT': 'Scattered clouds',
          'BKN': 'Broken clouds',
          'OVC': 'Overcast'
        };
        return `${coverageMap[coverage]} at ${altitude} feet`;
      }
    },
    {
      pattern: /\d{2}\/\d{2}|\d{2}\/M\d{2}|M\d{2}\/\d{2}|M\d{2}\/M\d{2}/,
      type: 'temperature',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: (match: string) => {
        const [tempStr, dewStr] = match.split('/');
        
        // Parse temperature
        const temp = tempStr.startsWith('M') ? -parseInt(tempStr.slice(1)) : parseInt(tempStr);
        
        // Parse dewpoint
        const dew = dewStr.startsWith('M') ? -parseInt(dewStr.slice(1)) : parseInt(dewStr);
        
        return `Temperature: ${temp}°C, Dewpoint: ${dew}°C`;
      }
    },
    {
      pattern: /A\d{4}/,
      type: 'altimeter',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const pressure = (parseInt(match.slice(1)) / 100).toFixed(2);
        return `Altimeter: ${pressure} inHg`;
      }
    },
    {
      pattern: /RMK/,
      type: 'remarks',
      icon: null,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      decode: () => 'Remarks section begins'
    },
    {
      pattern: /AO2|AO1/,
      type: 'perc-discriminator',
      icon: null,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20 border-indigo-500/30',
      decode: (match: string) => {
        const desc =
          match === 'AO2'
            ? 'Automated station with precipitation discriminator'
            : match === 'AO1'
            ? 'Automated station without precipitation discriminator'
            : 'Unknown precipitation discriminator';
        return desc;
      }
    },
    {
      pattern: /SLP\d{3}|SLPNO/,
      type: 'slp',
      icon: null,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20 border-teal-500/30',
      decode: (match: string) => {
        if (match === 'SLPNO') {
          return 'Sea-level pressure not available';
        }
        
        const digits = match.slice(3); // Get the 3 digits after SLP
        const partial = parseInt(digits);
        
        // Calculate both possible values
        const with9 = 900 + partial / 10;  // 9xx.x format
        const with10 = 1000 + partial / 10; // 10xx.x format
        
        // Choose the value closest to standard sea-level pressure (1013.2 hPa)
        const standardPressure = 1013.2;
        const diff9 = Math.abs(with9 - standardPressure);
        const diff10 = Math.abs(with10 - standardPressure);
        
        const actualPressure = diff9 < diff10 ? with9 : with10;
        
        return `Sea-level pressure: ${actualPressure.toFixed(1)} hPa`;
      }
    },
    {
      pattern: /T[01]\d{3}[01]\d{3}/,
      type: 'precise-temp',
      icon: Thermometer,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/20 border-fuchsia-500/30',
      decode: (match: string) => {
        // Format: T + 4 digits temp + 4 digits dewpoint
        const tempBlock = match.slice(1, 5); // First 4 digits after T
        const dewBlock = match.slice(5, 9);  // Last 4 digits
        
        // Decode temperature
        const tempSign = tempBlock[0] === '0' ? 1 : -1;
        const tempValue = (parseInt(tempBlock.slice(1)) / 10) * tempSign;
        
        // Decode dewpoint
        const dewSign = dewBlock[0] === '0' ? 1 : -1;
        const dewValue = (parseInt(dewBlock.slice(1)) / 10) * dewSign;
        
        return `Precise temperature: ${tempValue.toFixed(1)}°C, Dewpoint: ${dewValue.toFixed(1)}°C`;
      }
    },
    {
      pattern: /\$$/,
      type: 'maintenance',
      icon: null,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: () => 'Automated station requires maintenance.'
    },
  ];
};
