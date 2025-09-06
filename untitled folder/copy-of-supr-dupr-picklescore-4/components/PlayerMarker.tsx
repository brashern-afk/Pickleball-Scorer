import React from 'react';
import type { Position, GameMode } from '../types';

interface PlayerMarkerProps {
  name: string;
  position: Position;
  isServing: boolean;
  serverCount: 1 | 2 | null;
  mode: GameMode;
}

const positionClasses: Record<Position, string> = {
  // Top player's right side (viewer's left)
  topLeft: 'top-[5%] left-[25%] -translate-x-1/2',
  // Top player's left side (viewer's right)
  topRight: 'top-[5%] left-[75%] -translate-x-1/2',
  // Bottom player's left side
  bottomLeft: 'bottom-[5%] left-[25%] -translate-x-1/2',
  // Bottom player's right side
  bottomRight: 'bottom-[5%] left-[75%] -translate-x-1/2',
};

const PlayerMarker: React.FC<PlayerMarkerProps> = ({ name, position, isServing, serverCount, mode }) => {
  const baseClasses = "absolute flex items-center justify-center p-2 rounded-lg transition-all duration-300 text-center";
  const servingClasses = "bg-yellow-400 text-black font-bold rounded-full w-24 h-24 shadow-2xl ring-4 ring-white z-20 flex-col";
  const defaultClasses = "bg-gray-900/70 text-white font-semibold min-w-[80px] shadow-lg";

  return (
    <div className={`${baseClasses} ${isServing ? servingClasses : defaultClasses} ${positionClasses[position]}`}>
      {isServing ? (
        <>
          <span className="text-lg leading-tight">{name}</span>
          <span className="text-xs font-normal uppercase tracking-widest">Serve</span>
          {mode === 'doubles' && (
            <span className="absolute -top-2 -right-2 bg-gray-900 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold border-2 border-yellow-400">{serverCount}</span>
          )}
        </>
      ) : (
        name
      )}
    </div>
  );
};

export default PlayerMarker;