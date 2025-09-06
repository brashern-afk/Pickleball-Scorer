import React, { useState, useMemo } from 'react';
import type { GameSettings, Players, Position, GameMode } from '../types';

interface SetupScreenProps {
  onGameStart: (settings: GameSettings) => void;
  initialPlayers?: Players | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onGameStart, initialPlayers }) => {
  const [mode, setMode] = useState<GameMode>('doubles');
  const [assignments, setAssignments] = useState<Players>(initialPlayers || {
    topLeft: 'Player 3',
    topRight: 'Player 4',
    bottomLeft: 'Player 2',
    bottomRight: 'Player 1',
  });
  const [firstServingTeam, setFirstServingTeam] = useState<1 | 2>(1);
  const [winScore, setWinScore] = useState<9 | 11>(11);
  const [error, setError] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<Position | null>(null);

  const handleAssignmentChange = (position: keyof Players, name: string) => {
    setAssignments(prev => ({ ...prev, [position]: name }));
    if (error) setError(null);
  };

  const isSetupValid = useMemo(() => {
    const namesToValidate = mode === 'doubles' 
      ? Object.values(assignments) 
      : [assignments.bottomRight, assignments.topLeft];
      
    if (namesToValidate.some(name => name.trim() === '')) return false;
    const uniqueNames = new Set(namesToValidate);
    return uniqueNames.size === namesToValidate.length;
  }, [assignments, mode]);

  const handleStartClick = () => {
    if (!isSetupValid) {
      setError(`Each player must have a unique, non-empty name. (${mode === 'doubles' ? 4 : 2} required)`);
      return;
    }
    setError(null);
    onGameStart({
      players: assignments,
      firstServingTeam,
      winScore,
      mode,
    });
  };

  // When switching modes, adjust default names if they haven't been changed by the user
  const handleModeChange = (newMode: GameMode) => {
    if (mode === newMode) return;
    setMode(newMode);

    // If initial players are passed from a previous game, don't change anything
    if (initialPlayers) return;

    // A simple logic to swap defaults between modes without overwriting user input
    setAssignments(prev => {
        const newAssignments = {...prev};
        if (newMode === 'singles' && prev.topLeft === 'Player 3') {
            newAssignments.topLeft = 'Player 2';
        } else if (newMode === 'doubles' && prev.topLeft === 'Player 2') {
            newAssignments.topLeft = 'Player 3';
        }
        return newAssignments;
    });
  };

  const getLabelForActiveInput = (position: Position): string => {
    if (mode === 'singles') {
        if (position === 'bottomRight') return 'Editing Player 1';
        if (position === 'topLeft') return 'Editing Player 2';
    }
    // Doubles labels
    switch (position) {
        case 'bottomRight': return 'Editing Team 1 / Player 1';
        case 'bottomLeft': return 'Editing Team 1 / Player 2';
        case 'topLeft': return 'Editing Team 2 / Player 3';
        case 'topRight': return 'Editing Team 2 / Player 4';
    }
    return 'Editing Player';
  };

  const inputClasses = "w-full bg-gray-900 text-white text-base border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors";

  return (
    <>
      {activeInput && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 bg-gray-900 border-2 border-yellow-400 p-4 rounded-lg shadow-xl z-50 w-11/12 max-w-sm animate-fade-in">
          <label className="text-sm text-yellow-400 mb-1 block font-semibold">
            {getLabelForActiveInput(activeInput)}
          </label>
          <div className="text-2xl text-white font-bold break-words min-h-[32px]">
            {assignments[activeInput] || <span className="text-gray-500">Typing...</span>}
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full mx-auto animate-fade-in max-w-md flex flex-col gap-4 pb-8">
        <h2 className="text-3xl font-bold text-center text-yellow-300">Game Setup</h2>
        
        {error && <div className="bg-red-500 text-white p-3 rounded-md my-1 text-center font-semibold animate-shake">{error}</div>}

        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center">
            <span className="mr-4 text-gray-300 font-semibold">Play to:</span>
            <div className="flex rounded-lg bg-gray-700 p-1">
              <button onClick={() => setWinScore(9)} className={`px-4 py-1 text-sm font-bold rounded-md transition-colors ${winScore === 9 ? 'bg-yellow-400 text-black' : 'text-white'}`}>9</button>
              <button onClick={() => setWinScore(11)} className={`px-4 py-1 text-sm font-bold rounded-md transition-colors ${winScore === 11 ? 'bg-yellow-400 text-black' : 'text-white'}`}>11</button>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-gray-300 font-semibold">Mode:</span>
            <div className="flex rounded-lg bg-gray-700 p-1">
              <button onClick={() => handleModeChange('doubles')} className={`px-4 py-1 text-sm font-bold rounded-md transition-colors ${mode === 'doubles' ? 'bg-yellow-400 text-black' : 'text-white'}`}>Doubles</button>
              <button onClick={() => handleModeChange('singles')} className={`px-4 py-1 text-sm font-bold rounded-md transition-colors ${mode === 'singles' ? 'bg-yellow-400 text-black' : 'text-white'}`}>Singles</button>
            </div>
          </div>
        </div>

        {mode === 'doubles' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-center text-white">Team 1 (Starts Bottom)</h3>
              <div>
                <label htmlFor="bottomRight" className="text-sm text-gray-400 mb-1 block">Right Side (Player 1) {firstServingTeam === 1 && <span className="text-yellow-400 font-semibold">(1st Server)</span>}</label>
                <input id="bottomRight" type="text" value={assignments.bottomRight} onChange={(e) => handleAssignmentChange('bottomRight', e.target.value)} onFocus={() => setActiveInput('bottomRight')} onBlur={() => setActiveInput(null)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="bottomLeft" className="text-sm text-gray-400 mb-1 block">Left Side (Player 2)</label>
                <input id="bottomLeft" type="text" value={assignments.bottomLeft} onChange={(e) => handleAssignmentChange('bottomLeft', e.target.value)} onFocus={() => setActiveInput('bottomLeft')} onBlur={() => setActiveInput(null)} className={inputClasses} />
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-center text-white">Team 2 (Starts Top)</h3>
              <div>
                <label htmlFor="topLeft" className="text-sm text-gray-400 mb-1 block">Right Side (Player 3) {firstServingTeam === 2 && <span className="text-yellow-400 font-semibold">(1st Server)</span>}</label>
                <input id="topLeft" type="text" value={assignments.topLeft} onChange={(e) => handleAssignmentChange('topLeft', e.target.value)} onFocus={() => setActiveInput('topLeft')} onBlur={() => setActiveInput(null)} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="topRight" className="text-sm text-gray-400 mb-1 block">Left Side (Player 4)</label>
                <input id="topRight" type="text" value={assignments.topRight} onChange={(e) => handleAssignmentChange('topRight', e.target.value)} onFocus={() => setActiveInput('topRight')} onBlur={() => setActiveInput(null)} className={inputClasses} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-center text-white">
                Player 1 (Starts Bottom)
                {firstServingTeam === 1 && <span className="text-yellow-400 font-semibold text-sm block mt-1">(1st Server)</span>}
              </h3>
              <input aria-label="Player 1 Name" type="text" value={assignments.bottomRight} onChange={(e) => handleAssignmentChange('bottomRight', e.target.value)} onFocus={() => setActiveInput('bottomRight')} onBlur={() => setActiveInput(null)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-center text-white">
                Player 2 (Starts Top)
                {firstServingTeam === 2 && <span className="text-yellow-400 font-semibold text-sm block mt-1">(1st Server)</span>}
              </h3>
              <input aria-label="Player 2 Name" type="text" value={assignments.topLeft} onChange={(e) => handleAssignmentChange('topLeft', e.target.value)} onFocus={() => setActiveInput('topLeft')} onBlur={() => setActiveInput(null)} className={inputClasses} />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <span className="text-gray-300 font-semibold">Who serves first?</span>
          <div className="flex rounded-lg bg-gray-700 p-1">
            <button onClick={() => setFirstServingTeam(1)} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${firstServingTeam === 1 ? 'bg-yellow-400 text-black' : 'text-white'}`}>{mode === 'doubles' ? 'Team 1' : 'Player 1'}</button>
            <button onClick={() => setFirstServingTeam(2)} className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${firstServingTeam === 2 ? 'bg-yellow-400 text-black' : 'text-white'}`}>{mode === 'doubles' ? 'Team 2' : 'Player 2'}</button>
          </div>
        </div>
        
        <button
          onClick={handleStartClick}
          disabled={!isSetupValid}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold text-2xl py-3 rounded-lg transition-transform duration-200 transform hover:scale-105"
        >
          Start Game
        </button>
      </div>
    </>
  );
};

export default SetupScreen;
