
import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import HistoryScreen from './components/HistoryScreen';
import ColorCustomizer from './components/ColorCustomizer';
import { SettingsProvider } from './context/SettingsContext';
import type { GameSettings, Players, GameHistoryItem } from './types';

const App: React.FC = () => {
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [lastPlayers, setLastPlayers] = useState<Players | null>(null);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load history from local storage on initial load
    try {
      const storedHistory = localStorage.getItem('pickleScoreHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load game history:", error);
    }

    // Register the service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  const handleGameStart = (settings: GameSettings) => {
    setGameSettings(settings);
    setLastPlayers(settings.players);
  };

  const handleGameReset = () => {
    setGameSettings(null);
  };

  const handleGameOver = (gameData: Omit<GameHistoryItem, 'id' | 'date'>) => {
    const newHistoryItem: GameHistoryItem = {
      ...gameData,
      id: new Date().toISOString(),
      date: new Date().toLocaleString(),
    };
    
    setHistory(prev => {
      const updatedHistory = [newHistoryItem, ...prev];
      try {
        localStorage.setItem('pickleScoreHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save game history:", error);
      }
      return updatedHistory;
    });
  };

  return (
    <SettingsProvider>
      {/* On mobile, this is a simple dark background. On desktop, it centers the phone mockup. */}
      <div className="w-full min-h-screen font-sans bg-gray-900 sm:bg-gray-700 sm:flex sm:items-center sm:justify-center sm:p-4">
        {/* On mobile, this fills the screen. On desktop, it becomes the phone mockup. */}
        <div className="w-full h-screen bg-gray-900 text-white flex flex-col sm:max-w-[420px] sm:h-[calc(100vh-2rem)] sm:max-h-[896px] sm:rounded-3xl sm:shadow-2xl sm:border-4 sm:border-black sm:overflow-hidden">
          <header className="w-full p-4 flex-shrink-0 flex justify-between items-center">
            <div className="flex-1 flex justify-start">
              <button onClick={() => setShowSettings(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Settings</button>
            </div>
            <div className="flex-shrink-0 px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400 whitespace-nowrap text-center">Supr Dupr PickleScore</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <button onClick={() => setShowHistory(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">History</button>
            </div>
          </header>
          <main className="w-full flex-grow flex flex-col items-center py-2 px-2 sm:py-4 sm:px-4 relative min-h-0">
            {!gameSettings ? (
              <SetupScreen onGameStart={handleGameStart} initialPlayers={lastPlayers} />
            ) : (
              <GameScreen settings={gameSettings} onReset={handleGameReset} onGameOver={handleGameOver} />
            )}
          </main>
          {showHistory && <HistoryScreen history={history} onClose={() => setShowHistory(false)} />}
          {showSettings && <ColorCustomizer onClose={() => setShowSettings(false)} />}
        </div>
      </div>
    </SettingsProvider>
  );
};

export default App;
