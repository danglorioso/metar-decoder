import { useState, useEffect } from 'react';

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  country: string;
  city: string;
  information: string;
}

interface AirportData {
  airports: Airport[];
  airportsByIcao: Map<string, Airport>;
  isLoading: boolean;
  error: string | null;
}

export function useAirportData(): AirportData {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airportsByIcao, setAirportsByIcao] = useState<Map<string, Airport>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAirportData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/airports.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch airports data: ${response.statusText}`);
        }

        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        // Skip header row and parse data
        const parsedAirports: Airport[] = [];
        const icaoMap = new Map<string, Airport>();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines

          // Parse CSV line (handle quoted values)
          const columns = parseCsvLine(line);
          
          if (columns.length >= 6) {
            const airport: Airport = {
              iata: columns[0] || '',
              icao: columns[1] || '',
              name: columns[2] || '',
              country: columns[3] || '',
              city: columns[4] || '',
              information: columns[5] || ''
            };

            parsedAirports.push(airport);
            
            // Only add to ICAO map if ICAO code exists
            if (airport.icao) {
              icaoMap.set(airport.icao, airport);
            }
          }
        }

        setAirports(parsedAirports);
        setAirportsByIcao(icaoMap);
      } catch (err) {
        console.error('Error loading airport data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadAirportData();
  }, []);

  return { airports, airportsByIcao, isLoading, error };
}

// Helper function to parse CSV line with quoted values
function parseCsvLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last column
  columns.push(current.trim());
  
  return columns;
}

// Utility functions for easy access
export function validateIcaoCode(icao: string, airportMap: Map<string, Airport>): boolean {
  return airportMap.has(icao);
}

export function getAirportByIcao(icao: string, airportMap: Map<string, Airport>): Airport | undefined {
  return airportMap.get(icao);
}
