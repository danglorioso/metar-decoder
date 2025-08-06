"use client"

import { useState } from 'react';
import { Search, Copy, RefreshCw } from 'lucide-react';

type InputProps = {
    metarText: string;
  setMetarText: (text: string) => void;
};

export default function MetarInput({ metarText, setMetarText }: InputProps) {
    const [customMode, setCustomMode] = useState(false);
    const [icao, setICAO] = useState('');
    const [loading, setLoading] = useState(false);

    async function fetchMetar() {
        setLoading(true);

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
                console.error("No valid METAR found in data:", data);
                setMetarText("No METAR found");
            } else {
                setMetarText(data[0].rawOb);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Mode Selection */}
                    <div className="">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Input Mode
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCustomMode(false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !customMode 
                                    ? 'bg-blue-600 text-white border border-blue-500' 
                                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                }`}
                                >
                                <div className="flex items-center gap-2">
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
                                <div className="flex items-center gap-2">
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
                        <input
                            type="text"
                            value={icao}
                            onChange={(e) => setICAO(e.target.value.toUpperCase())}
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="KBOS"
                            maxLength={4} // ICAO codes are 4 chars
                        />
                        <button
                            onClick={fetchMetar}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Fetch
                        </button>
                        </div>
                    </div>
                    )}
                </div>

                {/* Custom METAR Input */}
                {customMode && (
                    <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Enter METAR Text
                    </label>
                    <textarea
                        value={metarText}
                        onChange={(e) => setMetarText(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-mono"
                        rows={3}
                        placeholder="Paste your METAR report here..."
                    />
                    </div>
                )}
            </div>
        </div>
    );
};