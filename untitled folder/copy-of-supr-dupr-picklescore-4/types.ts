
export type Position = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export const ALL_POSITIONS: Position[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export type Players = Record<Position, string>;

export type GameMode = 'doubles' | 'singles';

export type GameSettings = {
  players: Players;
  firstServingTeam: 1 | 2;
  winScore: 9 | 11;
  mode: GameMode;
};

export type GameHistoryItem = {
  id: string;
  date: string;
  settings: GameSettings;
  finalScore: [number, number];
  winner: 1 | 2;
};