import { Plane } from 'lucide-react';

export default function Header() {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-blue-900/20 to-gray-900 border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Plane className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                        METAR Decoder
                    </h1>
                </div>
                <p className="text-gray-400 text-md">Decode aviation weather reports with interactive hover translations.</p>
                </div>
            </div>
        </div>
    );
}