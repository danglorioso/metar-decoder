import { Plane, Wind, Eye, CloudSnow, Thermometer, Gauge, Clock, CloudRainWind, Waves, CircleAlert, NotebookPen, Droplet, Snowflake, Zap, CloudHail, CircleGauge } from 'lucide-react';
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

    // *** Temperature ***
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
      pattern: /1[01]\d{3}/,
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
      pattern: /2[01]\d{3}/,
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
      pattern: /4[01]\d{3}[01]\d{3}/,
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
      pattern: /(?:^|(?<=\s))(VC)?[-+]?RA(?=\s|$)/,
      type: 'rain',
      icon: Droplet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
        const rainPart = isVicinity ? match.slice(2) : match;
        
        let intensity = '';
        if (rainPart.startsWith('-')) {
          intensity = 'Light ';
        } else if (rainPart.startsWith('+')) {
          intensity = 'Heavy ';
        } else {
          intensity = 'Moderate ';
        }
        
        const vicinitySuffix = isVicinity ? ' in the vicinity ' : '';
        return `${intensity}rain${vicinitySuffix}`;
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
      pattern: /(?:^|(?<=\s))(VC)?[-+]?SN(?=\s|$)/,
      type: 'snow',
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: (match: string) => {
        const isVicinity = match.startsWith('VC');
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
      pattern: /\bUP\b/,
      type: 'unknown-perc',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Unknown percipitation'
    },
    // TODO: add this as a prefix for rain
    {
      pattern: /\bSH\b/,
      type: 'showers',
      icon: CloudRainWind,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      decode: () => 'Showers'
    },

    // *** Percipitation Rate ***
    {
      pattern: /P\d{4}/,
      type: 'percip-rate',
      icon: null,
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
      pattern: /(?:^|(?<=\s))[-+]?TS(RA)?(?=\s|$)/,
      type: 'thunderstorm',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: (match: string) => {
        let intensity = '';
        let hasRain = false;
        
        // Check for intensity prefix
        if (match.startsWith('-')) {
          intensity = 'Light ';
        } else if (match.startsWith('+')) {
          intensity = 'Heavy';
        } else {
          intensity = 'Moderate';
        }
        
        // Check for rain
        if (match.includes('RA')) {
          hasRain = true;
        }
        
        if (hasRain) {
          return `${intensity} thunderstorm with rain`;
        } else {
          return `${intensity} thunderstorm`;
        }
      }
    },
    {
      pattern: /\bVCTS\b/,
      type: 'vicinity-thunderstorm',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 border-orange-500/30',
      decode: () => 'Vicinity thunderstorm'
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
      pattern: /\bFG\b/,
      type: 'fog',
      icon: null,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20 border-slate-500/30',
      decode: () => 'Fog'
    },

    // *** Direction ***
    {
      pattern: /\b(N|NE|E|SE|S|SW|W|NW)(-(?:N|NE|E|SE|S|SW|W|NW))?\b/,
      type: 'direction',
      icon: null,
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
      decode: () => 'All quadrants'
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
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Cumulonimbus clouds'
    },
    {
      pattern: /\bTCU\b/,
      type: 'towering-cumulus',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Towering cumulus clouds'
    },
    {
      pattern: /\bACSL\b/,
      type: 'altocumulus',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Altocumulus standing lenticular clouds'
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

    // *** Wind ***    
    {
      pattern: /\bWND\b/,
      type: 'wind',
      icon: null,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: () => 'Wind'
    },
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
      pattern: /\bPK WND\b/,
      type: 'peak',
      icon: null,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 border-cyan-500/30',
      decode: () => 'Peak wind'
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
      pattern: /\bMOV\b/,
      type: 'moving',
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
      icon: null,
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
      pattern: /\bCIG\b/,
      type: 'ceiling',
      icon: null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20 border-sky-500/30',
      decode: () => 'Ceiling'
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
    // {
    //   pattern: /\bAND\b/,
    //   type: 'and',
    //   icon: null,
    //   color: 'text-gray-400',
    //   bgColor: 'bg-gray-500/20 border-gray-500/30',
    //   decode: () => 'And'
    // },
  ];
};
