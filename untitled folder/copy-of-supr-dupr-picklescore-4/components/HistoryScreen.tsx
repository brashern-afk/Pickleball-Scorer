import React from 'react';
import type { GameHistoryItem } from '../types';

interface HistoryScreenProps {
  history: GameHistoryItem[];
  onClose: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-300">Game History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>
        <div className="p-4 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No games played yet.</p>
          ) : (
            <ul className="space-y-4">
              {history.map(item => {
                const team1Players = item.settings.mode === 'doubles' 
                  ? `${item.settings.players.bottomRight} & ${item.settings.players.bottomLeft}`
                  : item.settings.players.bottomRight;
                const team2Players = item.settings.mode === 'doubles'
                  ? `${item.settings.players.topLeft} & ${item.settings.players.topRight}`
                  : item.settings.players.topLeft;

                // Correctly assign scores. finalScore[0] is always Team 1, finalScore[1] is always Team 2.
                const team1Score = item.finalScore[0];
                const team2Score = item.finalScore[1];

                const team1IsWinner = item.winner === 1;
                const team2IsWinner = item.winner === 2;

                return (
                  <li key={item.id} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">{item.date}</span>
                      <span className="text-xs font-semibold uppercase bg-gray-600 px-2 py-0.5 rounded">{item.settings.mode}</span>
                    </div>
                    <div className="text-lg space-y-1">
                      <p>
                        <span className="text-gray-300">{item.settings.mode === 'doubles' ? 'Team 1: ' : 'P1: '}</span>
                        <span className={team1IsWinner ? 'font-bold text-yellow-300' : 'text-red-400'}>{team1Players}</span>
                        {' - '}
                        <span className="font-mono">{team1Score}</span>
                      </p>
                      <p>
                        <span className="text-gray-300">{item.settings.mode === 'doubles' ? 'Team 2: ' : 'P2: '}</span>
                        <span className={team2IsWinner ? 'font-bold text-yellow-300' : 'text-red-400'}>{team2Players}</span>
                        {' - '}
                        <span className="font-mono">{team2Score}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;