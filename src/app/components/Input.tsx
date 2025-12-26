"use client"

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Copy, RefreshCw, X , Send} from 'lucide-react';
import { useAirportData, validateIcaoCode, getAirportByIcao, Airport } from '../hooks/useAirportData';
import { MetarArray } from '../types/MetarArray';

type InputProps = {
    metarObject: MetarArray | null;
    setMetarObject: (text: MetarArray | null) => void;
};

export default function MetarInput({ metarObject, setMetarObject }: InputProps) {
    const [customMode, setCustomMode] = useState(false);
    const [icao, setICAO] = useState('');
    const [loading, setLoading] = useState(false);
    const [metarText, setMetarText] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    
    // Load airport data
    const { airports, airportsByIcao, isLoading: airportDataLoading, error: airportDataError } = useAirportData();
    
    // Filter airports based on search query (ICAO, name, or city)
    const filteredAirports = useMemo(() => {
        if (!searchQuery.trim() || airportDataLoading) {
            return [];
        }
        
        const query = searchQuery.toLowerCase().trim();
        const results = airports.filter(airport => {
            // Only include airports with ICAO codes
            if (!airport.icao) return false;
            
            const icaoMatch = airport.icao.toLowerCase().includes(query);
            const nameMatch = airport.name.toLowerCase().includes(query);
            const cityMatch = airport.city.toLowerCase().includes(query);
            const iataMatch = airport.iata.toLowerCase().includes(query);
            
            return icaoMatch || nameMatch || cityMatch || iataMatch;
        });
        
        // Limit results to 10 for performance
        return results.slice(0, 10);
    }, [searchQuery, airports, airportDataLoading]);
    
    // Validation logic for ICAO code
    const isIcaoValid = icao && icao.length === 4 && !airportDataLoading && validateIcaoCode(icao, airportsByIcao);
    const canFetch = isIcaoValid && !airportDataError;
    
    // Handle airport selection
    const handleAirportSelect = async (airport: Airport) => {
        setICAO(airport.icao);
        setSearchQuery('');
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (fetchError) {
            setFetchError('');
        }
        
        // Auto-fetch METAR after selection
        setLoading(true);
        try {
            const response = await fetch(`/api/fetchMetar?icao=${airport.icao}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch METAR data');
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0 || !data[0].rawOb) {
                setFetchError('No METAR data available for this airport');
                setMetarObject(null);
            } else {
                setMetarObject(data[0]);
            }
        } catch (error) {
            console.error('Error', error);
            setFetchError('Unable to fetch METAR data. Please try again.');
            setMetarObject(null);
        }
        setLoading(false);
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredAirports.length > 0) {
                setSelectedIndex(prev => 
                    prev < filteredAirports.length - 1 ? prev + 1 : prev
                );
                setShowDropdown(true);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && filteredAirports[selectedIndex]) {
                handleAirportSelect(filteredAirports[selectedIndex]);
            } else if (canFetch && !loading && !airportDataLoading) {
                fetchMetar();
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setSelectedIndex(-1);
        }
    };
    
    // Update dropdown position when input position changes
    useEffect(() => {
        const updateDropdownPosition = () => {
            if (inputContainerRef.current) {
                const rect = inputContainerRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 4, // Fixed positioning uses viewport coordinates
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        if (showDropdown) {
            updateDropdownPosition();
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);
        }

        return () => {
            window.removeEventListener('scroll', updateDropdownPosition, true);
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }, [showDropdown, searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };
        
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    async function handleCustomMetar(metarText: string) {
        setMetarText(metarText);
        
        // Create a minimal MetarArray object for custom METAR
        const customMetarObject: MetarArray = {
            metar_id: 0,
            icaoId: metarText.split(' ')[0] || 'UNKN', // Extract ICAO from first word
            receiptTime: new Date().toISOString(),
            obsTime: Date.now() / 1000,
            reportTime: new Date().toISOString(),
            temp: 0,
            dewp: 0,
            wdir: 0,
            wspd: 0,
            wgst: null,
            visib: 0,
            altim: 0,
            slp: 0,
            qcField: 0,
            wxString: null,
            presTend: null,
            maxT: null,
            minT: null,
            maxT24: null,
            minT24: null,
            precip: null,
            pcp3hr: null,
            pcp6hr: null,
            pcp24hr: null,
            snow: null,
            vertVis: null,
            metarType: "METAR",
            rawOb: metarText, // **
            mostRecent: 1,
            lat: 0,
            lon: 0,
            elev: 0,
            prior: 0,
            name: "Custom METAR",
            clouds: []
        };
        
        setMetarObject(customMetarObject);
    }

    // Called when "Fetch" button is clicked
    async function fetchMetar() {
        setLoading(true);
        setFetchError(''); // Clear any previous errors

        try {
            const response = await fetch(`/api/fetchMetar?icao=${icao}`);
            
            // Check response from API call
            if (!response.ok) {
                throw new Error('Failed to fetch METAR data');
            }

            // Retrieve data and set METAR
            const data = await response.json();

            // Check if data is valid and contains METAR
            if (!Array.isArray(data) || data.length === 0 || !data[0].rawOb) {
                setFetchError('No METAR data available for this airport');
                setMetarObject(null);
            } else {
                setMetarObject(data[0]);
            }
        } catch (error) {
            console.error('Error', error);
            setFetchError('Unable to fetch METAR data. Please try again.');
            setMetarObject(null);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-6xl mx-auto md:px-6 py-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Mode Selection */}
                    <div className="">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Input Mode
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => setCustomMode(false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !customMode 
                                    ? 'bg-blue-600 text-white border border-blue-500' 
                                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                }`}
                                >
                                <div className="flex items-center justify-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Airport Lookup
                                </div>
                            </button>
                            <button
                                onClick={() => setCustomMode(true)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    customMode 
                                    ? 'bg-blue-600 text-white border border-blue-500' 
                                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                }`}
                                >
                                <div className="flex items-center justify-center gap-2">
                                    <Copy className="w-4 h-4" />
                                    Custom METAR
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Airport Input */}
                    {!customMode && (
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Airport Search (ICAO, Name, or City)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 relative">
                            {/* Search Input with Dropdown */}
                            <div ref={inputContainerRef} className="flex-1 relative">
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery || icao}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchQuery(value);
                                            setShowDropdown(value.length > 0);
                                            setSelectedIndex(-1);
                                            
                                            // If it's a 4-character code (case-insensitive), also set ICAO
                                            const upperValue = value.toUpperCase();
                                            if (value.length === 4 && /^[A-Z]{4}$/.test(upperValue)) {
                                                setICAO(upperValue);
                                            } else if (value.length === 0) {
                                                setICAO('');
                                            } else if (value.length < 4) {
                                                // Clear ICAO if user is typing something else
                                                setICAO('');
                                            }
                                            
                                            // Reset fetch error when user changes input
                                            if (fetchError) {
                                                setFetchError('');
                                            }
                                        }}
                                        onFocus={() => {
                                            if (searchQuery || filteredAirports.length > 0) {
                                                setShowDropdown(true);
                                            }
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                                        placeholder="Search by ICAO, name, or city (e.g., KBOS, Boston, Logan)"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setICAO('');
                                                setShowDropdown(false);
                                                searchInputRef.current?.focus();
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Portal for Dropdown - renders at body level */}
                            {typeof window !== 'undefined' && showDropdown && filteredAirports.length > 0 && createPortal(
                                <div
                                    ref={dropdownRef}
                                    className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto z-[9999]"
                                    style={{
                                        top: `${dropdownPosition.top}px`,
                                        left: `${dropdownPosition.left}px`,
                                        width: `${dropdownPosition.width}px`
                                    }}
                                >
                                    {filteredAirports.map((airport, index) => (
                                        <button
                                            key={`${airport.icao}-${index}`}
                                            onClick={() => handleAirportSelect(airport)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                                                index === selectedIndex ? 'bg-gray-700' : ''
                                            } ${index !== filteredAirports.length - 1 ? 'border-b border-gray-700' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-blue-400">{airport.icao}</span>
                                                        {airport.iata && (
                                                            <span className="text-xs text-gray-400">({airport.iata})</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-300 mt-1">{airport.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {airport.city}, {airport.country}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>,
                                document.body
                            )}
                            
                            {/* Portal for No Results Message */}
                            {typeof window !== 'undefined' && showDropdown && searchQuery && filteredAirports.length === 0 && !airportDataLoading && createPortal(
                                <div
                                    className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-gray-400 text-sm z-[9999]"
                                    style={{
                                        top: `${dropdownPosition.top}px`,
                                        left: `${dropdownPosition.left}px`,
                                        width: `${dropdownPosition.width}px`
                                    }}
                                >
                                    No airports found matching "{searchQuery}"
                                </div>,
                                document.body
                            )}

                            {/* Fetch Button */}
                            <button
                                onClick={fetchMetar}
                                disabled={loading || airportDataLoading || !canFetch}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                {(loading || airportDataLoading) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {(loading || airportDataLoading) ? 'Fetching...' : 'Fetch'}
                            </button>
                        </div>

                        {/* Invalid ICAO error message */}
                        {icao && icao.length === 4 && !airportDataLoading && !validateIcaoCode(icao, airportsByIcao) && !searchQuery && (
                            <div className="mt-2">
                                <div className="text-red-400 text-sm">
                                    ICAO code not found.
                                </div>
                            </div>
                        )}
                        
                        {/* Fetch error */}
                        {fetchError && (
                            <div className="mt-2">
                                <div className="text-red-400 text-sm">
                                    {fetchError}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>

                {/* Custom METAR Input */}
                {customMode && (
                    <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Enter METAR Text
                    </label>
                    <div className="flex gap-3">
                        <textarea
                            value={metarText}
                            onChange={(e) => handleCustomMetar(e.target.value.toUpperCase())}
                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-mono"
                            rows={3}
                            placeholder="Paste your METAR report here..."
                        />
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
};