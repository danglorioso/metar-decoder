import {
  Bubbles,
  CircleAlert,
  CircleGauge,
  Cloud,
  CloudAlert,
  CloudHail,
  CloudRainWind,
  CloudSnow,
  Clock,
  Compass,
  Droplet,
  Eye,
  Gauge,
  NotebookPen,
  Plane,
  PlaneLanding,
  Snowflake,
  Thermometer,
  Tornado,
  Waves,
  Wind,
  Zap
} from 'lucide-react';

import { validateIcaoCode } from '@/app/hooks/useAirportData';

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
    // *** General & Utility ***
    {
      pattern: /^[A-Z]{4}$/,
      type: 'station',
      icon: Plane,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        // Only decode if it's a valid ICAO code in database
        if (airportsByIcao && validateIcaoCode(match, airportsByIcao)) {
          const airport = airportsByIcao.get(match);
          if (airport) {
            return `Airport: ${airport.name} (${match}) - ${airport.city}, ${airport.country}`;
          }
          return `Airport: ${match} (ICAO identifier)`;
        }
        
        // Return null if not a valid ICAO code, so it won't be highlighted
        return null;
      }
    },
    {
      pattern: /\d{6}Z/,
      type: 'time',
      icon: Clock,
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
      pattern: /RMK/,
      type: 'remarks',
      icon: NotebookPen,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      decode: () => 'Remarks section begins'
    },
    {
      pattern: /\$$/,
      type: 'maintenance',
      icon: null,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: () => 'Automated station requires maintenance'
    },
    {
      pattern: /\bAUTO\b/,
      type: 'auto',
      icon: null,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20 border-rose-500/30',
      decode: () => 'Fully automated report'
    },
    {
      pattern: /\bNOSIG\b/,
      type: 'no-change',
      icon: null,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'No significant change'
    },
    {
      pattern: /\bCOR\b/,
      type: 'correction',
      icon: CircleAlert,
      color: 'text-amber-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: () => 'Correction to a previously disseminated observation'
    },
    {
      pattern: /\bLAST\b/,
      type: 'last',
      icon: CircleAlert,
      color: 'text-orange-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: () => 'Last observation before a break in coverage'
    },
    {
      pattern: /\bRWY\d{2}[LCR]?\b/,
      type: 'runway',
      icon: PlaneLanding,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      decode: (match: string) => {
        const runwayNum = match.slice(3, 5);
        const dir = match.slice(5, 6); // Get the optional L/C/R character
        
        let dirName = '';
        if (dir === 'L') {
          dirName = ' Left';
        } else if (dir === 'C') {
          dirName = ' Center';
        } else if (dir === 'R') {
          dirName = ' Right';
        }
        
        return `Runway ${runwayNum}${dirName}`;
      }
    },

    // *** Temperature ***
    {
      pattern: /\b\d{2}\/\d{2}\b|\b\d{2}\/M\d{2}\b|\bM\d{2}\/\d{2}\b|\bM\d{2}\/M\d{2}\b/,
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
      pattern: /(?:^|(?<=\s))1[01]\d{3}(?=\s|$)/,
      type: '6hr-max-temp',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: (match: string) => {
        const signDigit = match[1];
        const tempDigits = match.slice(2);
        const sign = signDigit === '0' ? 1 : -1;
        const tempValue = (parseInt(tempDigits) / 10) * sign;
        
        return `6-hour maximum temperature: ${tempValue.toFixed(1)}°C`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))2[01]\d{3}(?=\s|$)/,
      type: '6hr-min-temp',
      icon: Thermometer,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const signDigit = match[1];
        const tempDigits = match.slice(2);
        const sign = signDigit === '0' ? 1 : -1;
        const tempValue = (parseInt(tempDigits) / 10) * sign;
        
        return `6-hour minimum temperature: ${tempValue.toFixed(1)}°C`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))4[01]\d{3}[01]\d{3}(?=\s|$)/,
      type: '24hr-min-max-temp',
      icon: Thermometer,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        // Format: 4 + sign/temp digits for max + sign/temp digits for min
        const maxTempBlock = match.slice(1, 5); // Positions 1-4: max temperature
        const minTempBlock = match.slice(5, 9); // Positions 5-8: min temperature
        
        // Decode maximum temperature (first block)
        const maxSign = maxTempBlock[0] === '0' ? 1 : -1;
        const maxTempDigits = maxTempBlock.slice(1);
        const maxTemp = (parseInt(maxTempDigits) / 10) * maxSign;
        
        // Decode minimum temperature (second block)
        const minSign = minTempBlock[0] === '0' ? 1 : -1;
        const minTempDigits = minTempBlock.slice(1);
        const minTemp = (parseInt(minTempDigits) / 10) * minSign;
        
        return `24-hour temperature: Maximum ${maxTemp.toFixed(1)}°C, Minimum ${minTemp.toFixed(1)}°C`;
      }
    },

    // *** Percipitation Utility ***
    {
      pattern: /\bPWINO\b/,
      type: 'percip-no',
      icon: null,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      decode: () => 'Precipitation identifier sensor not available'
    },
    {
      pattern: /\bPNO\b/,
      type: 'percip-amt-no',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Percipitation amount not available'
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

    // *** Percipitation Types ("Weather phenomena") ***
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?(SH)?RA(?=\s|$)/,
      type: 'rain',
      icon: Droplet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        let remainingMatch = match;
        
        // Check for vicinity prefix
        const isVicinity = remainingMatch.includes('VC');
        if (isVicinity) {
          remainingMatch = remainingMatch.replace('VC', '');
        }
        
        // Check for intensity prefix (comes first)
        let intensity = '';
        if (remainingMatch.startsWith('-')) {
          intensity = 'Light ';
          remainingMatch = remainingMatch.slice(1); // Remove the - 
        } else if (remainingMatch.startsWith('+')) {
          intensity = 'Heavy ';
          remainingMatch = remainingMatch.slice(1); // Remove the +
        } else {
          intensity = 'Moderate ';
        }
        
        // Check for showers descriptor
        const isShowers = remainingMatch.includes('SH');
        
        // Build the description
        let description = `${intensity}rain`;
        
        if (isShowers) {
          description += ' showers';
        }
        
        if (isVicinity) {
          description += ' in the vicinity';
        }
        
        return description;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?DZ(?=\s|$)/,
      type: 'drizzle',
      icon: Droplet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const drizzlePart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (drizzlePart.startsWith('-')) {
          intensity = 'Light ';
        } else if (drizzlePart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}drizzle${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))[-+]?GS(?=\s|$)/,
      type: 'snow-pellets',
      icon: CloudHail,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (match.startsWith('-')) {
          return 'Light snow pellets';
        } else if (match.startsWith('+')) {
          return 'Heavy snow pellets';
        } else {
          return 'Moderate snow pellets';
        }
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?(BL)?SN(?=\s|$)/,
      type: 'snow',
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const isBlowing = match.includes('BL');
        const snowPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (snowPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (snowPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        const blowingSuffix = isBlowing ? 'Blowing ' : '';
        // If blowing, don't show intensity
        if (isBlowing) {
          return `${blowingSuffix}snow${vicinitySuffix}`;
        }
        return `${intensity}snow${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))[-+]?IC(?=\s|$)/,
      type: 'ice-crystals',
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (match.startsWith('-')) {
          return 'Light ice crystals';
        } else if (match.startsWith('+')) {
          return 'Heavy ice crystals';
        } else {
          return 'Moderate ice crystals';
        }
      }
    },
    {
      pattern: /(?:^|(?<=\s))[-+]?GR(?=\s|$)/,
      type: 'hail',
      icon: CloudHail,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (match.startsWith('-')) {
          return 'Light hail';
        } else if (match.startsWith('+')) {
          return 'Heavy hail';
        } else {
          return 'Moderate hail';
        }
      }
    },
    {
      pattern: /(?:^|(?<=\s))[-+]?SG(?=\s|$)/,
      type: 'snow-grain',
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (match.startsWith('-')) {
          return 'Light snow grains';
        } else if (match.startsWith('+')) {
          return 'Heavy snow grains';
        } else {
          return 'Moderate snow grains';
        }
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?PL(?=\s|$)/,
      type: 'ice-pellets',
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const icePart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (icePart.startsWith('-')) {
          intensity = 'Light ';
        } else if (icePart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}ice pellets${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?SQ(?=\s|$)/,
      type: 'squall',
      icon: Wind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}squalls${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?DS(?=\s|$)/,
      type: 'duststorm',
      icon: Tornado,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}duststorm${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?SS(?=\s|$)/,
      type: 'sandstorm',
      icon: Tornado,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}sandstorm${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?PO(?=\s|$)/,
      type: 'sand-whirls',
      icon: Tornado,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}dust/sand whirls${vicinitySuffix}`;
      }
    },
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?FC(?=\s|$)/,
      type: 'funnel-cloud',
      icon: Tornado,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        let tornado = false;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
          const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
          return `Tornado${vicinitySuffix}`;
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}funnel clouds${vicinitySuffix}`;
      }
    },
    {
      pattern: /\bVIRGA\b/,
      type: 'virga',
      icon: Bubbles,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Precipitation evaporating before reaching the ground'
    },
    {
      pattern: /\bDU\b/,
      type: 'widespread-dust',
      icon: Tornado,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Widespread dust'
    },
    {
      pattern: /\bUP\b/,
      type: 'unknown-perc',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Unknown percipitation'
    },

    // TODO: add this as a prefix for rain
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?SH(?=\s|$)/,
      type: 'showers',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const squallPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (squallPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (squallPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}shower${vicinitySuffix}`;
      }
    },

    // *** Percipitation Rate ***
    {
      pattern: /\bP\d{4}\b/,
      type: 'percip-rate',
      icon: Droplet,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/20 border-lime-500/30',
      decode: (match: string) => {
        const pressure = (parseInt(match.slice(1)) / 100).toFixed(2);
        return `Hourly Precipitation Rate: ${pressure} inches`;
      }
    },
    {
      pattern: /6\d{4}|6\/\/\/\//,
      type: 'precip-3hr',
      icon: Droplet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        if (match === '6////') {
          return '3-hour precipitation amount: Missing or unavailable data';
        }
        const amount = (parseInt(match.slice(1)) / 100).toFixed(3);
        return `3-hour precipitation amount: ${amount} inches`;
      }
    },

    // *** Percipitation Timing ***
    {
      pattern: /RAB\d{2}E\d{2}/,
      type: 'rain-begin-end',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const beginMinutes = parseInt(match.slice(3, 5));
        const endMinutes = parseInt(match.slice(6, 8));
        
        const beginText = beginMinutes === 1 ? '1 minute' : `${beginMinutes} minutes`;
        const endText = endMinutes === 1 ? '1 minute' : `${endMinutes} minutes`;
        
        return `Rain began ${beginText} after the hour and ended ${endText} after the hour`;
      }
    },
    {
      pattern: /RAB\d{2}/,
      type: 'rain-begin',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Rain began 1 minute after the hour';
        } else {
          return `Rain began ${minutes} minutes after the hour`;
        }
      }
    },
    {
      pattern: /RAE\d{2}/,
      type: 'rain-end',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Rain ending 1 minute after the hour';
        } else {
          return `Rain ending ${minutes} minutes after the hour`;
        }
      }
    },
    {
      pattern: /DZB\d{2}/,
      type: 'drizzle-begin',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Drizzle began 1 minute after the hour';
        } else {
          return `Drizzle began ${minutes} minutes after the hour`;
        }
      }
    },
    {
      pattern: /DZE\d{2}/,
      type: 'drizzle-end',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Drizzle ending 1 minute after the hour';
        } else {
          return `Drizzle ending ${minutes} minutes after the hour`;
        }
      }
    },

    // *** Thunderstorm Events ***
    {
      pattern: /(?:^|(?<=\s))(VC)?[-+]?TS([-+]?RA)?(GR)?(?=\s|$)/,
      type: 'thunderstorm',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const thunderstormPart = isVicinity ? match.slice(2) : match;
        
        let thunderstormIntensity = '';
        let rainIntensity = '';
        let hasRain = false;
        let hasHail = false;
        
        // Check for hail
        if (thunderstormPart.includes('GR')) {
          hasHail = true;
        }
        
        // Check if there's rain and extract intensities
        if (thunderstormPart.includes('RA')) {
          hasRain = true;
          
          // Find where RA starts
          const raIndex = thunderstormPart.indexOf('RA');
          const beforeRA = thunderstormPart.substring(0, raIndex);
          const raWithModifier = thunderstormPart.substring(raIndex - 1); // Include potential modifier before RA
          
          // Check for thunderstorm intensity (before TS)
          if (beforeRA.startsWith('-TS')) {
            thunderstormIntensity = 'light ';
          } else if (beforeRA.startsWith('+TS')) {
            thunderstormIntensity = 'heavy ';
          } else {
            thunderstormIntensity = ''; // No intensity = moderate
          }
          
          // Check for rain intensity (before RA)
          if (raWithModifier.startsWith('-RA')) {
            rainIntensity = 'light ';
          } else if (raWithModifier.startsWith('+RA')) {
            rainIntensity = 'heavy ';
          } else {
            rainIntensity = 'moderate ';
          }
        } else {
          // No rain, check thunderstorm intensity
          if (thunderstormPart.startsWith('-TS')) {
            thunderstormIntensity = 'light ';
          } else if (thunderstormPart.startsWith('+TS')) {
            thunderstormIntensity = 'heavy ';
          } else {
            thunderstormIntensity = ''; // No intensity = moderate
          }
        }
        
        const vicinityPrefix = isVicinity ? ' in the vicinity ' : '';
        
        // Build description based on what's present
        if (hasRain && hasHail) {
          if (thunderstormIntensity) {
            return `${thunderstormIntensity.charAt(0).toUpperCase() + thunderstormIntensity.slice(1)}thunderstorm with ${rainIntensity}rain and hail${vicinityPrefix}`;
          } else {
            return `Thunderstorm with ${rainIntensity}rain and hail${vicinityPrefix}`;
          }
        } else if (hasRain) {
          if (thunderstormIntensity) {
            return `${thunderstormIntensity.charAt(0).toUpperCase() + thunderstormIntensity.slice(1)}thunderstorm with ${rainIntensity}rain${vicinityPrefix}`;
          } else {
            return `Thunderstorm with ${rainIntensity}rain${vicinityPrefix}`;
          }
        } else if (hasHail) {
          if (thunderstormIntensity) {
            return `${thunderstormIntensity.charAt(0).toUpperCase() + thunderstormIntensity.slice(1)}thunderstorm with hail${vicinityPrefix}`;
          } else {
            return `Thunderstorm with hail${vicinityPrefix}`;
          }
        } else {
          if (thunderstormIntensity) {
            return `${thunderstormIntensity.charAt(0).toUpperCase() + thunderstormIntensity.slice(1)}thunderstorm${vicinityPrefix}`;
          } else {
            return `Thunderstorm${vicinityPrefix}`;
          }
        }
      }
    },
    {
      pattern: /\bVCTS\b/,
      type: 'vicinity-thunderstorm',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Thunderstorm in the vicinity'
    },
    {
      pattern: /TSB\d{2}/,
      type: 'thudnerstorm-began',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Thunderstorm began 1 minute after the hour';
        } else {
          return `Thunderstorm began ${minutes} minutes after the hour`;
        }
      }
    },
    {
      pattern: /TSE\d{2}/,
      type: 'thudnerstorm-end',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const minutes = parseInt(match.slice(3));
        if (minutes == 1) {
          return 'Thunderstorm ending 1 minute after the hour';
        } else {
          return `Thunderstorm ending ${minutes} minutes after the hour`;
        }
      }
    },
    {
      pattern: /\bTSNO\b/,
      type: 'thunderstorm-no',
      icon: null,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      decode: () => 'Thunderstorm information not available'
    },

    // *** Lightning *** 
    {
      pattern: /\bFRQ\b/,
      type: 'frq-lightning',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Frequent'
    },
    {
      pattern: /\bMDT\b/,
      type: 'moderate',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Moderate'
    },
    {
      pattern: /\bLTG\b|LTG(CG|CC|IC)+\b/,
      type: 'lightning',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      decode: (match: string) => {
        if (match === 'LTG') {
          return 'Lightning detected';
        }
        
        const suffix = match.slice(3); // Get characters after LTG
        const types = [];
        
        // Parse the suffix to identify individual lightning types
        if (suffix.includes('CG')) {
          types.push('Cloud-to-Ground');
        }
        if (suffix.includes('CC')) {
          types.push('Cloud-to-Cloud');
        }
        if (suffix.includes('IC')) {
          types.push('Intra-Cloud');
        }
        
        if (types.length === 0) {
          return `Lightning detected (${suffix})`;
        } else if (types.length === 1) {
          return `${types[0]} lightning`;
        } else if (types.length === 2) {
          return `${types.join(' and ')} lightning`;
        } else {
          return `Lightning detected (${types.join(', ')})`;
        }
      }
    },

    // *** Visibility Observations ***
    {
      pattern: /\bFU\b/,
      type: 'smoke',
      icon: null,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: () => 'Smoke'
    },    
    {
      pattern: /\bHZ\b/,
      type: 'haze',
      icon: null,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20 border-violet-500/30',
      decode: () => 'Haze'
    },
    {
      pattern: /\bBR\b/,
      type: 'mist',
      icon: null,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20 border-violet-500/30',
      decode: () => 'Mist'
    },
    {
      pattern: /(?:^|(?<=\s))(BC)?FG(?=\s|$)/,
      type: 'fog',
      icon: null,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: (match: string) => {
        const isPatchy = match.includes('BC');

        if (isPatchy) {
          return 'Patchy fog'
        } else {
          return 'Fog'
        }
      }
    },
    {
      pattern: /\bVA\b/,
      type: 'volcanic-ash',
      icon: CloudAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      decode: () => 'Volcanic ash'
    },
    {
      pattern: /\bVISNO\b/,
      type: 'thunderstorm-no',
      icon: null,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      decode: () => 'Visibility at secondary location not available'
    },

    // *** Direction ***
    {
      pattern: /(?<!CIG \d{3} )\b(N|NE|E|SE|S|SW|W|NW)(-(?:N|NE|E|SE|S|SW|W|NW))?\b/,
      type: 'direction',
      icon: Compass,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20 border-rose-500/30',
      decode: (match: string) => {
        const directionMap: Record<string, string> = {
          'N': 'North',
          'NE': 'Northeast',
          'E': 'East',
          'SE': 'Southeast',
          'S': 'South',
          'SW': 'Southwest',
          'W': 'West',
          'NW': 'Northwest'
        };
        
        if (match.includes('-')) {
          // Handle directional ranges like E-S
          const [from, to] = match.split('-');
          return `From ${directionMap[from]} to ${directionMap[to]}`;
        } else {
          // Handle single directions
          return directionMap[match] || match;
        }
      }
    },
    {
      pattern: /\bALQDS\b/,
      type: 'all-quads',
      icon: null,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20 border-rose-500/30',
      decode: () => 'In all quadrants'
    },
    {
      pattern: /OBSC[GNEWSAL]+/,
      type: 'obscured',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const suffix = match.slice(4); // Get characters after OBSC
        const directionMap: Record<string, string> = {
          'G': 'due to Ground/Terrain',
          'N': 'to the North',
          'E': 'to the East',
          'W': 'to the West',
          'S': 'to the South',
          'NE': 'to the Northeast',
          'NW': 'to the Northwest',
          'SE': 'to the Southeast',
          'SW': 'to the Southwest',
          'AL': 'All Around'
        };
        const direction = directionMap[suffix] || `Unknown direction (${suffix})`;
        return `Obscuration ${direction}`;
      }
    },

    // *** Clouds & Sky Conditions ***
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
        return `${coverageMap[coverage]} at ${altitude.toLocaleString()} feet`;
      }
    },
    {
      pattern: /\bCB\b/,
      type: 'cumulonimbus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Cumulonimbus clouds'
    },
    {
      pattern: /\bCU\b/,
      type: 'cumulus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Cumulus clouds'
    },
    {
      pattern: /\bCIG \d{3} (N|NE|E|SE|S|SW|W|NW)\b/,
      type: 'ceiling-alt-dir',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: (match: string) => {
        const parts = match.split(' ');
        const alt = parts[1]; // Get the 3-digit altitude
        const dir = parts[2]; // Get the direction
        const altitude = parseInt(alt) * 100;
        
        const directionMap: Record<string, string> = {
          'N': 'North',
          'NE': 'Northeast',
          'E': 'East',
          'SE': 'Southeast',
          'S': 'South',
          'SW': 'Southwest',
          'W': 'West',
          'NW': 'Northwest'
        };
        
        const directionName = directionMap[dir] || dir;
        return `Ceiling at ${altitude.toLocaleString()} feet to the ${directionName}`;
      }
    },
    {
      pattern: /\bCIG \d{3}\b/,
      type: 'ceiling-alt',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: (match: string) => {
        const alt = match.slice(4, 7);
        const altitude = parseInt(alt) * 100;
        return `Ceiling at ${altitude.toLocaleString()} feet`;
      }
    },
    {
      pattern: /\bCIG\b/,
      type: 'ceiling',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Ceiling'
    },
    {
      pattern: /\bTCU\b/,
      type: 'towering-cumulus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Towering cumulus clouds'
    },
    {
      pattern: /\bACSL\b/,
      type: 'altocumulus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Altocumulus standing lenticular clouds'
    },
    {
      pattern: /\bACC\b/,
      type: 'altocumulus-castellanus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Altocumulus castellanus clouds'
    },
    {
      pattern: /\bCCSL\b/,
      type: 'cirrocumulus-lenticular',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Cirrocumulus standing lenticular clouds'
    },
    {
      pattern: /\bCBMAM\b/,
      type: 'cirrocumulus-mammatus',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Cumulonimbus mammatus clouds'
    },
    {
      pattern: /\bSCSL\b/,
      type: 'stratocumulus-lenticular',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Stratocumulus standing lenticular clouds'
    },
    {
      pattern: /\bBINOVC\b/,
      type: 'breaks-in-overcase',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Breaks in overcast'
    },
    {
      pattern: /\bBOVC\b/,
      type: 'base-of-overcast',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Base of overcast'
    },
    {
      pattern: /\bCHINO\b/,
      type: 'chino',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Sky conditions at secondary location not available'
    },
    {
      pattern: /\bBKN\b/,
      type: 'broken',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Broken clouds'
    },
    {
      pattern: /\bSCT\b/,
      type: 'scattered',
      icon: Cloud,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Scattered clouds'
    },

    // *** Wind ***
    {
      pattern: /\d{5}KT|\d{3}\d{2}G\d{2}KT|VRB\d{2}KT|VRB\d{2}G\d{2}KT/,
      type: 'wind',
      icon: Wind,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: (match: string) => {
        if (match.includes('G') && !match.includes('VRB')) {
          const dir = match.slice(0, 3);
          const speed = match.slice(3, 5);
          const gust = match.slice(6, 8);
          return `Wind: ${dir}° at ${speed} knots, gusting to ${gust} knots`;
        } else if (match.includes('G') && match.includes('VRB')) {
          const speed = match.slice(3,5);
          const gust = match.slice(6,8);
          return `Wind: variable at ${speed} knots, gusting to ${gust} knots`;
        } else if (match.includes('VRB')) {
          const speed = match.slice(3,5);
          return `Wind: variable at ${speed} knots`;
        } else {
          const dir = match.slice(0, 3);
          const speed = match.slice(3, 5);
          return `Wind: ${dir}° at ${speed} knots`;
        }
      }
    },
    {
      pattern: /\d{3}V\d{3}/,
      type: 'wind-dir',
      icon: Gauge,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const min_dir = match.slice(0, 3);
        const max_dir = match.slice(4, 7);
        return `Winds varying from ${min_dir}° to ${max_dir}°`;
      }
    },
    {
      pattern: /PK WND \d{3}\d{2}\/\d{2,4}/,
      type: 'peak-wind-full',
      icon: Wind,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: (match: string) => {
        // Format: PK WND DDDSS/TT or PK WND DDDSS/TTTT
        const parts = match.split(' ');
        const windAndTime = parts[2]; // Get "DDDSS/TT" part
        const [windPart, timePart] = windAndTime.split('/');
        
        const direction = windPart.slice(0, 3);
        const speed = windPart.slice(3, 5);
        
        let timeStr = '';
        if (timePart.length === 2) {
          timeStr = `${timePart} minutes past the hour`;
        } else if (timePart.length === 4) {
          const hour = timePart.slice(0, 2);
          const minute = timePart.slice(2, 4);
          timeStr = `${hour}:${minute} UTC`;
        }
        
        return `Peak wind from ${direction}° at ${speed} knots, occurring at ${timeStr}`;
      }
    },
    {
      pattern: /\bPK WND\b/,
      type: 'peak',
      icon: Wind,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: () => 'Peak wind'
    },
    {
      pattern: /\bWND\b/,
      type: 'wind',
      icon: null,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: () => 'Wind'
    },
    {
      pattern: /WSHFT \d{4}/,
      type: 'wind-shift',
      icon: Wind,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: (match: string) => {
        const timeStr = match.slice(6); // Get the 4 digits after "WSHFT "
        const hour = timeStr.slice(0, 2);
        const minute = timeStr.slice(2, 4);
        return `Wind shift at ${hour}:${minute} UTC`;
      }
    },
    {
      pattern: /\bPK\b/,
      type: 'peak',
      icon: null,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: () => 'Peak'
    },

    // *** Movement & Proximity ***
    {
      pattern: /\bMOV LTL\b/,
      type: 'moving-little',
      icon: null,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
      decode: () => 'Moving little'
    },
    {
      pattern: /\bMOV\b/,
      type: 'moving',
      icon: null,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
      decode: () => 'Moving'
    },
    {
      pattern: /\bMOVG\b/,
      type: 'movg',
      icon: null,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
      decode: () => 'Moving'
    },
    {
      pattern: /\bSTNRY\b/,
      type: 'stationary',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Stationary'
    },
    {
      pattern: /\bALF\b/,
      type: 'aloft',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Aloft'
    },
    {
      pattern: /\bVC\b/,
      type: 'vicinity',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'In the vicinity'
    },
    {
      pattern: /\bDSNT\b/,
      type: 'distant',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Distant'
    },
    {
      pattern: /\bDSIPTD\b/,
      type: 'dissipated',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Dissipated'
    },
    {
      pattern: /\bV\b/,
      type: 'variable',
      icon: null,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Variable'
    },
    {
      pattern: /\bOHD\b/,
      type: 'overhead',
      icon: null,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20 border-pink-500/30',
      decode: () => 'Overhead'
    },

    // *** Frequency & Duration ***
    {
      pattern: /\bOCNL\b/,
      type: 'occasional',
      icon: null,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      decode: () => 'Occasional'
    },
    {
      pattern: /\bCONS\b/,
      type: 'continuous',
      icon: null,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
      decode: () => 'Continuous'
    },

    // *** Pressure ***
    {
      pattern: /A\d{4}/,
      type: 'altimeter',
      icon: Gauge,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        const pressure = (parseInt(match.slice(1)) / 100).toFixed(2);
        return `Altimeter: ${pressure} inHg`;
      }
    },
    {
      pattern: /5(\d)(\d{3})/,
      type: 'pressure',
      icon: Gauge,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: (match: string) => {
        const trendCode = match[1];
        const pressureChange = parseInt(match.slice(2)) / 10;
        const trendMap: Record<string, string> = {
          '0': 'increasing, then decreasing',
          '1': 'increasing more slowly',
          '2': 'increasing',
          '3': 'increasing then steady',
          '4': 'steady',
          '5': 'decreasing then increasing',
          '6': 'decreasing more slowly',
          '7': 'decreasing',
          '8': 'decreasing then steady'
        };
        return `Pressure ${trendMap[trendCode] || 'Unknown trend'}, Δ${pressureChange.toFixed(1)} hPa in past 3 hours`;
      }
    },
    {
      pattern: /SLP\d{3}|SLPNO/,
      type: 'slp',
      icon: Waves,
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
      pattern: /PRESRR/,
      type: 'pressure-rapid',
      icon: CircleGauge,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Pressure rising rapidly'
    },

    // *** Other ***
    {
      pattern: /\bMETAR\b/,
      type: 'metar',
      icon: null,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      decode: () => 'METAR'
    },
    {
      pattern: /\bBNK\b/,
      type: 'bank',
      icon: null,
      color: 'text-stone-400',
      bgColor: 'bg-stone-500/20 border-stone-500/30',
      decode: () => 'Bank'
    },
    {
      pattern: /\bLGT\b/,
      type: 'light',
      icon: null,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/20 border-lime-500/30',
      decode: () => 'Light'
    },
    {
      pattern: /\bMTNS\b/,
      type: 'mountains',
      icon: null,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Mountains'
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
      pattern: /\bVIS\b/,
      type: 'vis',
      icon: Eye,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30',
      decode: () => `Visibility`
    },
    {
      pattern: /R\d{2}[LRC]\/\d{4}VP\d{4}FT/,
      type: 'runway-visibility',
      icon: Eye,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30',
      decode: (match: string) => {
        const [runway, vis] = match.split('/');

        const runwayNum = runway.slice(1, 3);
        const dir = match.slice(3, 4); // Get the L/C/R character
        
        let dirName = '';
        if (dir === 'L') {
          dirName = ' Left';
        } else if (dir === 'C') {
          dirName = ' Center';
        } else if (dir === 'R') {
          dirName = ' Right';
        }

        const minDist = vis.slice(0, 4);
        const maxDist = vis.slice(6, 10);

        return `Runway ${runwayNum}${dirName}: ${minDist}-${maxDist}ft visibility`;
      }
    },
    {
      pattern: /\bAND\b/,
      type: 'and',
      icon: null,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      decode: () => 'And'
    },
    {
      pattern: /\bTHRU\b/,
      type: 'thru',
      icon: null,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      decode: () => 'Through'
    },
    {
      pattern: /\bSPECI\b/,
      type: 'special',
      icon: CircleAlert,
      color: 'text-orange-100',
      bgColor: 'bg-amber-500/20 border-orange-200/30',
      decode: () => 'Special report'
    }
  ];
};
