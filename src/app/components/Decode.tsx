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
      pattern: /FEW\d{3}|SCT\d{3}|BKN\d{3}|OVC\d{3}/,
      type: 'clouds',
      icon: CloudSnow,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: (match: string) => {
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
      pattern: /\d{2}\/\d{2}/,
      type: 'temperature',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: (match: string) => {
        const [temp, dew] = match.split('/').map(t => 
          t.startsWith('M') ? -parseInt(t.slice(1)) : parseInt(t)
        );
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
    }
  ];
};
