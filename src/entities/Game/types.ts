export interface GameIntervalData {
  userCount: number;
  wordCount: number;
  characterCount: number;
  longestWord?: { value: string; by: string };
  player?: {
    id: string;
    name: string;
    color: number;
    score: number;
    row: number;
    col: number;
    x: number;
    y: number;
    position: number;
    solvedWords: string[];
    longestWord: string;
  };
  timeRemaining: number;
  positions: { id: string; row: number; col: number; color: number }[];
  leaderboard: {
    position: number;
    name: string;
    color: number;
    score: number;
  }[];
}

export interface FrameData {
  players: {
    id: string;
    x: number;
    y: number;
    color: number;
    holding?: { id: string; x: number; y: number };
    hovering?: string;
    scrolling?: boolean;
  }[];
  movingTiles: {
    id: string;
    x: number;
    y: number;
    letter: string;
  }[];
}

export interface Emission {
  id: string;
  x: number;
  y: number;
  letter: string;
}
