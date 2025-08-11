"use client"

import { useState } from 'react';
import { Search, Copy, RefreshCw } from 'lucide-react';
import { useAirportData, validateIcaoCode, getAirportByIcao } from '../hooks/useAirportData';
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
    
    // Load airport data
    const { airportsByIcao, isLoading: airportDataLoading, error: airportDataError } = useAirportData();
    
    // Validation logic for ICAO code
    const isIcaoValid = icao && icao.length === 4 && !airportDataLoading && validateIcaoCode(icao, airportsByIcao);
    const canFetch = isIcaoValid && !airportDataError;

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
        <div className="max-w-6xl mx-auto md:px-6 py-8">
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
                        Airport Code (ICAO)
                        </label>
                        <div className="flex gap-3">

                        {/* ICAO Input */}
                        <input
                            type="text"
                            value={icao}
                            onChange={(e) => {
                                // Remove spaces from input
                                const valueWithoutSpaces = e.target.value.replace(/\s/g, '');
                                setICAO(valueWithoutSpaces.toUpperCase());
                                // Reset fetch error when user changes input
                                if (fetchError) {
                                    setFetchError('');
                                }
                            }}
                            onKeyDown={(e) => {
                                // Prevent space key
                                if (e.key === ' ') {
                                    e.preventDefault();
                                    return;
                                }
                                if (e.key === 'Enter' && canFetch && !loading && !airportDataLoading) {
                                    fetchMetar();
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="KBOS"
                            maxLength={4} // ICAO codes are 4 chars
                        />

                        {/* Fetch Button */}
                        <button
                            onClick={fetchMetar}
                            disabled={loading || airportDataLoading || !canFetch}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            {(loading || airportDataLoading) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {airportDataLoading ? 'Loading...' : 'Fetch'}
                        </button>
                        </div>

                        {/* Invalid ICAO error message */}
                        {icao && icao.length === 4 && !airportDataLoading && !validateIcaoCode(icao, airportsByIcao) && (
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