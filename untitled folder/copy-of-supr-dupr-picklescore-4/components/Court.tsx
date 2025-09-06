import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface CourtProps {
  children: React.ReactNode;
}

const Court: React.FC<CourtProps> = ({ children }) => {
  const { settings } = useSettings();

  return (
    <div className="w-full h-full relative p-2" style={{ backgroundColor: settings.courtColor }}>
      {/* Main court container */}
      <div className="w-full h-full relative">
        {/* Top Kitchen (NVZ) */}
        <div className="absolute top-[calc(50%-16%)] left-0 right-0 h-[16%] z-0" style={{ backgroundColor: settings.kitchenColor }}></div>
        
        {/* Bottom Kitchen (NVZ) */}
        <div className="absolute top-1/2 left-0 right-0 h-[16%] z-0" style={{ backgroundColor: settings.kitchenColor }}></div>

        {/* Kitchen Lines */}
        <div className="absolute top-[calc(50%-16%)] left-0 right-0 h-0.5 bg-white z-0"></div>
        <div className="absolute bottom-[calc(50%-16%)] left-0 right-0 h-0.5 bg-white z-0"></div>

        {/* Net */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white z-10 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-[-10px] right-[-10px] h-3 bg-gray-700 z-10 -translate-y-1/2 border-y-2 border-gray-900"></div>

        {/* Center Service Line (Top) */}
        <div className="absolute top-0 h-[calc(50%-16%)] left-1/2 w-0.5 bg-white z-0 -translate-x-1/2"></div>
        {/* Center Service Line (Bottom) */}
        <div className="absolute bottom-0 h-[calc(50%-16%)] left-1/2 w-0.5 bg-white z-0 -translate-x-1/2"></div>

        {/* Baselines */}
        <div className="absolute top-0 left-0 right-0 h-0 border-t-2 border-white"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0 border-b-2 border-white"></div>
        
        {/* Sidelines */}
        <div className="absolute top-0 bottom-0 left-0 w-0 border-l-2 border-white"></div>
        <div className="absolute top-0 bottom-0 right-0 w-0 border-r-2 border-white"></div>
        
        {/* Children (Players) are rendered on top */}
        {children}
      </div>
    </div>
  );
};

export default Court;