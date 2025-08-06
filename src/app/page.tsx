"use client"

import { useState } from 'react';
import Input from './components/Input';
import Display from './components/Display'

type DisplayProps = {
  metarText: string;
};

export default function Home() {
  const [metarText, setMetarText] = useState('');
  
  return (
    <div className="px-8 mx-auto min-h-screen bg-gray-900 bg-aero-chart bg-cover bg-center bg-blend-overlay">
      <Input setMetarText={setMetarText} />
      <Display metarText={metarText} />
    </div>
  );
}
