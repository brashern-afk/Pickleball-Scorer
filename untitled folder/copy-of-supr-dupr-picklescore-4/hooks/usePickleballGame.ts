import { useState, useEffect, useCallback } from 'react';
import type { GameSettings, Players, Position } from '../types';
import { speak, speakScore, speakWinner } from '../services/speechService';

type ServerState = {
  team: 1 | 2;
  playerName: string;
  count: 1 | 2;
};

type WinnerData = { players: string[], score: [number, number] };

type GameState = {
  players: Players;
  score: [number, number];
  serverState: ServerState;
  isFirstServeOfGame: boolean;
  winner: 1 | 2 | null;
  winnerData: WinnerData | null;
  isGameFinishing: boolean;
};

export const usePickleballGame = (settings: GameSettings) => {
  const [players, setPlayers] = useState<Players>(settings.players);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [serverState, setServerState] = useState<ServerState>(() => {
    const servingPlayerName = settings.firstServingTeam === 1 
      ? settings.players.bottomRight 
      : settings.players.topLeft;
    return {
      team: settings.firstServingTeam,
      playerName: servingPlayerName,
      count: settings.mode === 'doubles' ? 2 : 1, // First serve is #2 in doubles, #1 in singles
    };
  });
  const [isFirstServeOfGame, setIsFirstServeOfGame] = useState(settings.mode === 'doubles');
  const [showSideOut, setShowSideOut] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null);
  const [isGameFinishing, setIsGameFinishing] = useState(false);
  const [history, setHistory] = useState<GameState[]>([]);

  useEffect(() => {
    // Announce the initial score
    speakScore(0, 0, serverState.count, settings.mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkForWinner = useCallback((newScore: [number, number]) => {
    const [score1, score2] = newScore;
    const { winScore } = settings;
    let newWinner: 1 | 2 | null = null;

    if (score1 >= winScore && score1 >= score2 + 2) {
      newWinner = 1;
    } else if (score2 >= winScore && score2 >= score1 + 2) {
      newWinner = 2;
    }

    if (newWinner) {
      setIsGameFinishing(true);
      const getWinningPlayers = () => {
        if (settings.mode === 'singles') {
          return newWinner === 1 ? [settings.players.bottomRight] : [settings.players.topLeft];
        }
        return newWinner === 1 
          ? [settings.players.bottomRight, settings.players.bottomLeft]
          : [settings.players.topLeft, settings.players.topRight];
      };
      const winningPlayers = getWinningPlayers();
      
      setWinnerData({ players: winningPlayers, score: newScore });

      setTimeout(() => {
        setWinner(newWinner);
        const finalAnnounceScore = newWinner === 1 ? newScore : [newScore[1], newScore[0]] as [number, number];
        
        setTimeout(() => speakWinner(winningPlayers, finalAnnounceScore), 500);
      }, 2500);
    }
  }, [settings]);


  const handleSideOut = useCallback(() => {
    setShowSideOut(true);
    speak('Side out');
    setTimeout(() => {
      setShowSideOut(false);
      const nextServingTeam: 1 | 2 = serverState.team === 1 ? 2 : 1;
      // FIX: Use the 'players' state to get the current player on the right side,
      // not the initial 'settings.players'.
      const nextServerName = nextServingTeam === 1 
        ? players.bottomRight 
        : players.topLeft;
      
      const newServerState = {
        team: nextServingTeam,
        playerName: nextServerName,
        count: 1 as const,
      };
      setServerState(newServerState);

      const servingTeamScore = nextServingTeam === 1 ? score[0] : score[1];
      const receivingTeamScore = nextServingTeam === 1 ? score[1] : score[0];
      speakScore(servingTeamScore, receivingTeamScore, 1, settings.mode);

    }, 2500);
  }, [score, serverState.team, players, settings.mode]);

  const pointWonBy = useCallback((winningTeam: 1 | 2) => {
    if (winner || isGameFinishing) return;

    setHistory(prev => [...prev, { players, score, serverState, isFirstServeOfGame, winner, winnerData, isGameFinishing }]);

    if (winningTeam === serverState.team) { // Serving team scored
      const newScore = [...score] as [number, number];
      newScore[winningTeam - 1]++;
      setScore(newScore);

      if (settings.mode === 'doubles') {
        // Swap players on serving team
        if (winningTeam === 1) {
          setPlayers(p => ({ ...p, bottomLeft: p.bottomRight, bottomRight: p.bottomLeft }));
        } else {
          setPlayers(p => ({ ...p, topLeft: p.topRight, topRight: p.topLeft }));
        }
      }
      
      const servingTeamScore = serverState.team === 1 ? newScore[0] : newScore[1];
      const receivingTeamScore = serverState.team === 1 ? newScore[1] : newScore[0];
      speakScore(servingTeamScore, receivingTeamScore, serverState.count, settings.mode);

      checkForWinner(newScore);

    } else { // Receiving team won - fault
      if (settings.mode === 'singles') {
        handleSideOut();
        return;
      }
      // Doubles logic below
      if (isFirstServeOfGame) {
        setIsFirstServeOfGame(false);
        handleSideOut();
        return;
      }
      if (serverState.count === 1) {
        const teamPlayers = serverState.team === 1 
          ? [players.bottomLeft, players.bottomRight] 
          : [players.topLeft, players.topRight];
        const nextServerName = teamPlayers.find(p => p !== serverState.playerName) || '';
        const newServerState = { ...serverState, playerName: nextServerName, count: 2 as const };
        setServerState(newServerState);
        
        const servingTeamScore = serverState.team === 1 ? score[0] : score[1];
        const receivingTeamScore = serverState.team === 1 ? score[1] : score[0];
        speakScore(servingTeamScore, receivingTeamScore, 2, settings.mode);

      } else {
        handleSideOut();
      }
    }
  }, [winner, isGameFinishing, serverState, isFirstServeOfGame, score, players, handleSideOut, checkForWinner, winnerData, settings.mode]);
  
  const undoLastMove = useCallback(() => {
    if (history.length === 0) return;
    window.speechSynthesis.cancel();
    const lastState = history[history.length - 1];
    setPlayers(lastState.players);
    setScore(lastState.score);
    setServerState(lastState.serverState);
    setIsFirstServeOfGame(lastState.isFirstServeOfGame);
    setWinner(lastState.winner);
    setWinnerData(lastState.winnerData);
    setIsGameFinishing(lastState.isGameFinishing);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  const serverPosition = ((): Position | null => {
    if (settings.mode === 'singles') {
      const serverScore = serverState.team === 1 ? score[0] : score[1];
      if (serverState.team === 1) {
        return serverScore % 2 === 0 ? 'bottomRight' : 'bottomLeft';
      } else { // Team 2
        return serverScore % 2 === 0 ? 'topLeft' : 'topRight';
      }
    }
    // Doubles
    const playerEntries = Object.entries(players) as [Position, string][];
    const entry = playerEntries.find(([, name]) => name === serverState.playerName);
    return entry ? entry[0] : null;
  })();

  const scoreToDisplay = (() => {
    const servingScore = serverState.team === 1 ? score[0] : score[1];
    const receivingScore = serverState.team === 1 ? score[1] : score[0];
    if (settings.mode === 'singles') {
      return `${servingScore}-${receivingScore}`;
    }
    return `${servingScore}-${receivingScore}-${serverState.count}`;
  })();

  return { players, score, serverState, serverPosition, showSideOut, pointWonBy, scoreToDisplay, winner, winnerData, undoLastMove, isUndoAvailable: history.length > 0 };
};
