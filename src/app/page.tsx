"use client"

import { useState } from 'react';
import Input from './components/Input';
import Display from './components/Display'
import Reference from './components/Reference';
import ReportBugModal from './components/ReportBug';
import { MetarArray } from "./types/MetarArray";
import { Bug } from 'lucide-react';

export default function Home() {
  const [metarObject, setMetarObject] = useState<MetarArray | null>(null);
  const [isReportBugOpen, setIsReportBugOpen] = useState(false);
  
  return (
    <div className="px-8 mx-auto min-w-screen bg-gray-900 bg-aero-chart bg-fixed bg-center bg-no-repeat bg-blend-overlay">
      {/* Fixed Report Bug Button */}
      <button
        onClick={() => setIsReportBugOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2 z-40"
      >
        <Bug className="w-4 h-4" />
        Feedback
      </button>

      <Input metarObject={metarObject} setMetarObject={setMetarObject} />
      <Display metarObject={metarObject} />
      <Reference />

      {/* Report Bug Modal */}
      <ReportBugModal 
        isOpen={isReportBugOpen} 
        onClose={() => setIsReportBugOpen(false)} 
      />
    </div>
  );
}
