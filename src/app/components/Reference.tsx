import { Search, CloudSnow, Wind, Zap, Droplet, Thermometer } from 'lucide-react';

export default function Reference() {
    return (
        <div className="max-w-6xl mx-auto md:px-6 py-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="p-1 bg-gray-700 rounded">
                    <Search className="w-5 h-5 text-gray-300" />
                    </div>
                    Quick Reference Guide
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div className="space-y-4">
                    <h4 className="font-medium text-blue-400 flex items-center gap-2 mb-4">
                        <CloudSnow className="w-4 h-4" />
                        Cloud Coverage
                    </h4>
                        <div className="space-y-3">
                            {[
                            { code: 'CLR', desc: 'Clear, no clouds (0 oktas)', color: 'text-cyan-400' },
                            { code: 'FEW', desc: 'Few clouds (1-2 oktas)', color: 'text-cyan-400' },
                            { code: 'SCT', desc: 'Scattered clouds (3-4 oktas)', color: 'text-cyan-400' },
                            { code: 'BKN', desc: 'Broken clouds (5-7 oktas)', color: 'text-cyan-400' },
                            { code: 'OVC', desc: 'Overcast (8 oktas)', color: 'text-cyan-400' },
                            { code: 'CB', desc: 'Cumulonimbus clouds', color: 'text-orange-400' },
                            { code: 'TCU', desc: 'Towering cumulus', color: 'text-orange-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300 text-sm">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-medium text-green-400 flex items-center gap-2 mb-4">
                            <Wind className="w-4 h-4" />
                            Common Units
                        </h4>
                        <div className="space-y-3">
                            {[
                            { code: 'KT', desc: 'Knots (wind speed)', color: 'text-green-400' },
                            { code: 'SM', desc: 'Statute Miles (visibility)', color: 'text-yellow-400' },
                            { code: 'hPa', desc: 'Hectopascals (pressure)', color: 'text-red-400' },
                            { code: 'Z', desc: 'Zulu (UTC) Time', color: 'text-purple-400' },
                            { code: 'AUTO', desc: 'Fully automated report', color: 'text-rose-400' },
                            { code: 'COR', desc: 'Correction to report', color: 'text-amber-400' },
                            { code: 'RMK', desc: 'Remarks section begins', color: 'text-gray-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300 text-sm">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-blue-400 flex items-center gap-2 mb-4">
                            <Droplet className="w-4 h-4" />
                            Weather Phenomena
                        </h4>
                        <div className="space-y-3">
                            {[
                            { code: 'RA', desc: 'Rain', color: 'text-blue-400' },
                            { code: 'SN', desc: 'Snow', color: 'text-blue-400' },
                            { code: 'DZ', desc: 'Drizzle', color: 'text-blue-400' },
                            { code: 'TS', desc: 'Thunderstorm', color: 'text-orange-400' },
                            { code: 'SH', desc: 'Showers', color: 'text-blue-400' },
                            { code: 'FG', desc: 'Fog', color: 'text-slate-400' },
                            { code: 'BR', desc: 'Mist', color: 'text-violet-400' },
                            { code: 'HZ', desc: 'Haze', color: 'text-violet-400' },
                            { code: 'GR', desc: 'Hail', color: 'text-blue-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300 text-sm">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-red-400 flex items-center gap-2 mb-4">
                            <Thermometer className="w-4 h-4" />
                            Intensity & Modifiers
                        </h4>
                        <div className="space-y-3">
                            {[
                            { code: '-', desc: 'Light intensity', color: 'text-cyan-400' },
                            { code: '+', desc: 'Heavy intensity', color: 'text-cyan-400' },
                            { code: 'VC', desc: 'In vicinity (5-10SM)', color: 'text-orange-400' },
                            { code: 'BL', desc: 'Blowing', color: 'text-cyan-400' },
                            { code: 'BC', desc: 'Patchy', color: 'text-cyan-400' },
                            { code: 'VRB', desc: 'Variable wind direction', color: 'text-green-400' },
                            { code: 'G', desc: 'Wind gusts (in wind)', color: 'text-green-400' },
                            { code: 'M', desc: 'Minus (negative temp)', color: 'text-red-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300 text-sm">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};