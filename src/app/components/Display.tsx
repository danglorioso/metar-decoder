"use client"

import { useState, useEffect } from 'react';
import { MetarWord } from './Word';
import { getMetarPatterns } from './Decode';
import { Copy, Eye, Info, Check } from 'lucide-react';
import { useAirportData } from '../hooks/useAirportData';
import { MetarArray } from '../types/MetarArray';
import Tooltip from './Tooltip';

type DisplayProps = {
    metarObject: MetarArray | null;
};

export default function Display({ metarObject }: DisplayProps) {
    // useStates
    const [showFullTranslation, setShowFullTranslation] = useState(false);
    const [fullTranslation, setFullTranslation] = useState('');
    const [copiedRaw, setCopiedRaw] = useState(false);
    const [copiedTranslation, setCopiedTranslation] = useState(false);
    const metarText = metarObject ? metarObject.rawOb : '';
    
    // Load airport data
    const { airportsByIcao } = useAirportData();
    const metarPatterns = getMetarPatterns(airportsByIcao);

    // Copy handlers
    const handleCopyRaw = async () => {
        try {
            await navigator.clipboard.writeText(metarText);
            setCopiedRaw(true);
            setTimeout(() => setCopiedRaw(false), 2000);
        } catch (err) {
            console.error('Failed to copy raw text:', err);
        }
    };

    const handleCopyTranslation = async () => {
        try {
            await navigator.clipboard.writeText(fullTranslation);
            setCopiedTranslation(true);
            setTimeout(() => setCopiedTranslation(false), 2000);
        } catch (err) {
            console.error('Failed to copy translation:', err);
        }
    };

    const generateFullTranslation = () => {
        const parts = splitMetarText(metarText);
        interface DecodedMetarPart {
            explanation: string;
        }

        function decodeMetarPart(part: string): DecodedMetarPart | null {
            for (let pattern of metarPatterns) {
                const match = part.match(pattern.pattern);
                if (match) {
                    const explanation = pattern.decode(match[0]);
                    // Only return if explanation is not null/undefined and not empty
                    if (explanation) {
                        return {
                            explanation: explanation,
                        };
                    }
                }
            }
            return null;
        }

        let translation: string[] = [];
        
        parts.forEach(part => {
        const decoded = decodeMetarPart(part);
        if (decoded && decoded.explanation.trim()) {
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

    // Custom function to split METAR text while preserving multi-word patterns
    const splitMetarText = (text: string): string[] => {
        // Define patterns that should not be split
        const multiWordPatterns = [
            /\bPK WND \d{3}\d{2}\/\d{2,4}\b/g, // Peak wind with full data
            /\bWSHFT [012][0-4][0-5]\d\b/g,    // Wind shift with time (HH:MM format validation)
            /\bPK WND\b/g,                     // Peak wind (standalone)
            /\bMOV LTL\b/g,                    // Moving little
            /\bCIG \d{3} (N|NE|E|SE|S|SW|W|NW)\b/g,  // Ceiling, altitude, direction (more specific first)
            /\bCIG \d{3}\b/g,                  // Ceiling and altitude (more general second)
        ];
        
        let workingText = text;
        const preservedPhrases: string[] = [];
        const placeholders: string[] = [];
        
        // Replace multi-word patterns with placeholders
        multiWordPatterns.forEach((pattern, patternIndex) => {
            const matches = [...workingText.matchAll(pattern)];
            
            // Process matches in reverse order to avoid index shifting issues
            matches.reverse().forEach((match) => {
                if (match.index !== undefined) {
                    const placeholder = `__PLACEHOLDER_${patternIndex}_${preservedPhrases.length}__`;
                    preservedPhrases.push(match[0]);
                    placeholders.push(placeholder);
                    
                    // Replace the specific match at its exact position
                    workingText = workingText.slice(0, match.index) + 
                                 placeholder + 
                                 workingText.slice(match.index + match[0].length);
                }
            });
        });
        
        // Split by spaces
        const parts = workingText.split(/\s+/);
        
        // Replace placeholders back with original phrases
        return parts.map(part => {
            const placeholderIndex = placeholders.indexOf(part);
            return placeholderIndex !== -1 ? preservedPhrases[placeholderIndex] : part;
        });
    };    return (
        <div className="max-w-6xl mx-auto md:px-6">
            <div className="max-w-6xl p-4 md:p-6 space-y-4 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Latest METAR Report
                            <Tooltip text={
                                <span>
                                    Weather data sourced from the NOAA National Weather Service –{" "}
                                    <a 
                                        href="https://aviationweather.gov" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline"
                                    >
                                        Aviation Weather Center
                                    </a>
                                    .
                                </span>
                            }>
                                <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors cursor-help" />
                            </Tooltip>
                        </h2>
                        <div className="text-gray-400 text-sm mt-1">
                            <span className="font-semibold">Last updated:</span> {metarObject ? new Date(metarObject.reportTime).toLocaleString() + ' UTC' : 'No METAR data available'}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={handleCopyRaw}
                        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-gray-300"
                    >
                        <div className="transition-all duration-300 ease-in-out">
                            {copiedRaw ? (
                                <Check className="w-4 h-4 text-green-400 animate-in fade-in zoom-in duration-300" />
                            ) : (
                                <Copy className="w-4 h-4 animate-in fade-in zoom-in duration-300" />
                            )}
                        </div>
                        {copiedRaw ? 'Copied!' : 'Copy raw'}
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
                        splitMetarText(metarText).map((word, index) => (
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
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    showFullTranslation 
                        ? 'max-h-screen opacity-100 transform translate-y-0' 
                        : 'max-h-0 opacity-0 transform -translate-y-4'
                }`}>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 md:p-6">
                    <h3 className="font-semibold text-blue-400 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            <div className="text-base md:text-lg">Human-Readable Translation</div>
                        </div>
                        
                        {/* Copy button */}
                        <button
                            onClick={handleCopyTranslation}
                            className="px-4 py-2 text-sm font-normal bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-gray-300 self-start sm:self-auto"
                        >
                            <div className="transition-all duration-300 ease-in-out">
                                {copiedTranslation ? (
                                    <Check className="w-4 h-4 text-green-400 animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <Copy className="w-4 h-4 animate-in fade-in zoom-in duration-300" />
                                )}
                            </div>
                            {copiedTranslation ? 'Copied!' : 'Copy translation'}
                        </button>
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-lg">
                        {fullTranslation}
                    </p>
                    
                    </div>
                </div>
            </div>
        </div>
    );
};