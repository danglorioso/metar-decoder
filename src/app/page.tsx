"use client"

import { useState } from 'react';
import Input from './components/Input';
import Display from './components/Display'
import Reference from './components/Reference';
import { MetarArray } from "./types/MetarArray";

export default function Home() {
  const [metarObject, setMetarObject] = useState<MetarArray | null>(null);
  
  return (
    <div className="px-8 mx-auto min-h-screen bg-gray-900 bg-aero-chart bg-cover bg-center bg-blend-overlay">
      <Input metarObject={metarObject} setMetarObject={setMetarObject} />
      <Display metarObject={metarObject} />
      <Reference />
    </div>
  );
}
