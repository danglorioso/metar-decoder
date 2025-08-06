import { Search, CloudSnow, Wind } from 'lucide-react';

export default function Reference() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="p-1 bg-gray-700 rounded">
                    <Search className="w-5 h-5 text-gray-300" />
                    </div>
                    Quick Reference Guide
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                    <h4 className="font-medium text-blue-400 flex items-center gap-2 mb-4">
                        <CloudSnow className="w-4 h-4" />
                        Cloud Coverage
                    </h4>
                        <div className="space-y-3">
                            {[
                            { code: 'FEW', desc: 'Few clouds (1-2 oktas)', color: 'text-cyan-400' },
                            { code: 'SCT', desc: 'Scattered clouds (3-4 oktas)', color: 'text-cyan-400' },
                            { code: 'BKN', desc: 'Broken clouds (5-7 oktas)', color: 'text-cyan-400' },
                            { code: 'OVC', desc: 'Overcast (8 oktas)', color: 'text-cyan-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-medium text-green-400 flex items-center gap-2 mb-4">
                            <Wind className="w-4 h-4" />
                            Common Abbreviations
                        </h4>
                        <div className="space-y-3">
                            {[
                            { code: 'KT', desc: 'Knots (wind speed)', color: 'text-green-400' },
                            { code: 'SM', desc: 'Statute Miles (visibility)', color: 'text-yellow-400' },
                            { code: 'Z', desc: 'Zulu (UTC) Time', color: 'text-purple-400' },
                            { code: 'RMK', desc: 'Remarks section', color: 'text-gray-400' }
                            ].map(item => (
                            <div key={item.code} className="flex items-center gap-3">
                                <span className={`font-mono bg-gray-700 px-2 py-1 rounded text-sm ${item.color}`}>
                                {item.code}
                                </span>
                                <span className="text-gray-300">{item.desc}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};