import React, { useState, useEffect, useMemo } from 'react';
import type { GameSettings, GameHistoryItem, Position } from '../types';
import { usePickleballGame } from '../hooks/usePickleballGame';
import Court from './Court';
import PlayerMarker from './PlayerMarker';
import { speakScoreAndServer } from '../services/speechService';
import { useSettings } from '../context/SettingsContext';

interface GameScreenProps {
  settings: GameSettings;
  onReset: () => void;
  onGameOver: (gameData: Omit<GameHistoryItem, 'id' | 'date'>) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, onReset, onGameOver }) => {
  const { players, score, serverState, serverPosition, showSideOut, pointWonBy, scoreToDisplay, winner, winnerData, undoLastMove, isUndoAvailable } = usePickleballGame(settings);
  const [pointAnimation, setPointAnimation] = useState<{team: 1 | 2, key: number} | null>(null);
  const [isGameOverFired, setIsGameOverFired] = useState(false);
  const { settings: appSettings } = useSettings();

  // Effect to call onGameOver once when a winner is determined
  useEffect(() => {
    if (winner && winnerData && !isGameOverFired) {
      onGameOver({
        settings,
        finalScore: winnerData.score,
        winner,
      });
      setIsGameOverFired(true);
    }
  }, [winner, winnerData, onGameOver, settings, isGameOverFired]);


  const handleScoreTap = () => {
    if (winner || !serverPosition) return;
    const servingTeamScore = serverState.team === 1 ? score[0] : score[1];
    const receivingTeamScore = serverState.team === 1 ? score[1] : score[0];

    let servingSide: 'left' | 'right';
    if (settings.mode === 'singles') {
        const serverScore = serverState.team === 1 ? score[0] : score[1];
        servingSide = serverScore % 2 === 0 ? 'right' : 'left';
    } else {
        servingSide = (serverPosition === 'bottomRight' || serverPosition === 'topLeft') ? 'right' : 'left';
    }

    speakScoreAndServer(servingTeamScore, receivingTeamScore, serverState.count, serverState.playerName, servingSide, settings.mode);
  };
  
  const handlePointWon = (team: 1 | 2) => {
    // Animate only if the serving team scores
    if (team === serverState.team) {
        setPointAnimation({ team, key: Date.now() });
        setTimeout(() => setPointAnimation(null), 1000); // Animation duration
    }
    pointWonBy(team);
  }

  const playersToRender = useMemo(() => {
    if (settings.mode === 'doubles') {
      return Object.entries(players);
    } else { // Singles mode logic
      if (!serverPosition) return [];

      const player1Name = settings.players.bottomRight;
      const player2Name = settings.players.topLeft;
      
      let player1Pos: Position;
      let player2Pos: Position;

      const receiverPosition = ((): Position => {
        switch (serverPosition) {
          case 'bottomRight': return 'topLeft';
          case 'bottomLeft':  return 'topRight';
          case 'topLeft':     return 'bottomRight';
          case 'topRight':    return 'bottomLeft';
          // Default case should not be reachable if serverPosition is valid
          default: return 'topLeft';
        }
      })();

      if (serverState.team === 1) { // Player 1 (bottom) is serving
        player1Pos = serverPosition;
        player2Pos = receiverPosition;
      } else { // Player 2 (top) is serving
        player2Pos = serverPosition;
        player1Pos = receiverPosition;
      }
      
      return [
        [player1Pos, player1Name],
        [player2Pos, player2Name],
      ];
    }
  }, [settings.mode, settings.players, players, serverState.team, serverPosition]);


  return (
    <div className="w-full h-full flex flex-col items-center p-2 gap-4">
      <div className="w-full flex justify-between items-center z-10 flex-shrink-0">
        <button onClick={onReset} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Reset Game
        </button>
        <button 
          onClick={undoLastMove}
          disabled={!isUndoAvailable}
          className="bg-pink-600 hover:bg-pink-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Undo
        </button>
      </div>

      <div className="relative w-full flex-grow flex items-center justify-center min-h-0">
        <div className="relative w-full max-h-full aspect-[10/22]">
          <Court>
            {playersToRender.map(([pos, name]) => (
              <PlayerMarker
                key={`${pos}-${name}`}
                name={name as string}
                position={pos as Position}
                isServing={pos === serverPosition}
                serverCount={pos === serverPosition ? serverState.count : null}
                mode={settings.mode}
              />
            ))}
          </Court>
          
          <div 
            onClick={handleScoreTap}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl font-black tracking-widest text-white bg-gray-800/80 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg border-2 border-yellow-400 z-20 cursor-pointer hover:bg-gray-700/80 transition-colors"
            title="Tap to announce score"
          >
            {scoreToDisplay}
          </div>
          
          {pointAnimation && (
              <div 
                  key={pointAnimation.key} 
                  className={`absolute text-5xl font-bold pointer-events-none animate-point-pop z-30 left-1/2 -translate-x-1/2 -translate-y-1/2 ${pointAnimation.team === 1 ? 'top-[58%]' : 'top-[42%]'}`}
                  style={{ color: appSettings.courtColor }}
              >
                  +1
              </div>
          )}


          {!winner && (
              <>
                  <button 
                      onClick={() => handlePointWon(2)}
                      className="absolute top-[25%] left-1/2 -translate-x-1/2 w-32 sm:w-40 h-10 bg-green-500/80 hover:bg-green-500 text-white font-bold rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center transition-transform transform hover:scale-110 text-xs sm:text-sm"
                  >
                      {settings.mode === 'doubles' ? 'Team 2' : 'Player 2'} Won Rally
                  </button>
                  <button 
                      onClick={() => handlePointWon(1)}
                      className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-32 sm:w-40 h-10 bg-green-500/80 hover:bg-green-500 text-white font-bold rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center transition-transform transform hover:scale-110 text-xs sm:text-sm"
                  >
                      {settings.mode === 'doubles' ? 'Team 1' : 'Player 1'} Won Rally
                  </button>
              </>
          )}
        </div>
      </div>

      {showSideOut && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
          <h2 className="text-6xl sm:text-8xl font-black text-white drop-shadow-lg animate-pulse" style={{fontFamily: 'Impact, sans-serif'}}>
            SIDE OUT
          </h2>
        </div>
      )}

      {winner && winnerData && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center z-50 animate-fade-in p-4">
          <h2 className="text-8xl sm:text-9xl drop-shadow-lg mb-4" role="img" aria-label="Game Over">
            🥇
          </h2>
          <p className="text-2xl sm:text-3xl text-white font-semibold">
            {winnerData.players.join(' and ')}
          </p>
          <p className="text-xl sm:text-2xl text-gray-300 mt-2">
            Final Score: {winner === 1 ? winnerData.score[0] : winnerData.score[1]} to {winner === 1 ? winnerData.score[1] : winnerData.score[0]}
          </p>
          <button onClick={onReset} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg sm:text-xl transition-colors">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameScreen;