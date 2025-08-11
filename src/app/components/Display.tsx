"use client"

import { useState, useEffect } from 'react';
import { MetarWord } from './Word';
import { getMetarPatterns } from './Decode';
import { Copy, Eye } from 'lucide-react';
import { useAirportData } from '../hooks/useAirportData';
import { MetarArray } from '../types/MetarArray';

type DisplayProps = {
    metarObject: MetarArray | null;
};

export default function Display({ metarObject }: DisplayProps) {
    // useStates
    const [showFullTranslation, setShowFullTranslation] = useState(false);
    const [fullTranslation, setFullTranslation] = useState('');
    const metarText = metarObject ? metarObject.rawOb : '';
    
    // Load airport data
    const { airportsByIcao } = useAirportData();
    const metarPatterns = getMetarPatterns(airportsByIcao);

    const generateFullTranslation = () => {
        const parts = metarText.split(/\s+/);
        interface DecodedMetarPart {
            explanation: string;
        }

        function decodeMetarPart(part: string): DecodedMetarPart | null {
            for (let pattern of metarPatterns) {
                const match = part.match(pattern.pattern);
                if (match) {
                    return {
                        explanation: pattern.decode(match[0]) ?? '',
                    };
                }
            }
            return null;
        }

        let translation: string[] = [];
        
        parts.forEach(part => {
        const decoded = decodeMetarPart(part);
        if (decoded) {
            translation.push(decoded.explanation);
        } else {
            // If no decode available, use the actual word
            translation.push(part);
        }
        });
        
        const full_translation = translation.join('. ') +'.';
        return full_translation;
    };

    // Generate translation when metarText changes
    useEffect(() => {
        if (metarText) {
            const translation = generateFullTranslation();
            setFullTranslation(translation);
        }
    }, [metarText, metarPatterns]);

    return (
        <div className="max-w-6xl mx-auto md:px-6">
            <div className="max-w-6xl p-4 md:p-6 space-y-4 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Latest METAR Report
                        </h2>
                        <div className="text-gray-400 text-sm mt-1">
                            <span className="font-semibold">Last updated:</span> {metarObject ? new Date(metarObject.reportTime).toLocaleString() + ' UTC' : 'No METAR data available'}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={() => navigator.clipboard.writeText(metarText)}
                        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-gray-300"
                    >
                        <Copy className="w-4 h-4" />
                        Copy raw
                    </button>
                    <button
                        onClick={() => setShowFullTranslation(!showFullTranslation)}
                        className="px-4 py-2 text-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200"
                    >
                        {showFullTranslation ? 'Hide' : 'Show'} Translation
                    </button>
                    </div>
                </div>

                {/* METAR Display */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 md:p-4 mb-6">
                    <div className="text-base md:text-lg leading-relaxed flex flex-wrap items-center gap-1">
                    {metarText &&
                        metarText.split(/\s+/).map((word, index) => (
                        <MetarWord
                            key={index}
                            word={word}
                            index={index}
                            metarPatterns={metarPatterns}
                        />
                        ))}
                    </div>
                </div>

                {/* Tooltip legend */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
                    {/* Different text depending on device (desktop, then mobile) */}
                    <span className="hidden lg:inline">Hover over highlighted words for detailed explanations</span> 
                    <span className="inline lg:hidden">Tap on highlighted words for detailed explanations</span>
                </div>

                {/* Optional Translation */}
                {showFullTranslation && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 md:p-6">
                    <h3 className="font-semibold text-blue-400 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            <div className="text-base md:text-lg">Human-Readable Translation</div>
                        </div>
                        
                        {/* Copy button */}
                        <button
                            onClick={() => navigator.clipboard.writeText(fullTranslation)}
                            className="px-4 py-2 text-sm font-normal bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-gray-300 self-start sm:self-auto"
                        >
                            <Copy className="w-4 h-4" />
                            Copy translation
                        </button>
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
                        {fullTranslation}
                    </p>
                    
                    </div>
                )}
            </div>
        </div>
    );
};