import Tile from "../../entities/Game/Grid/Tile/Tile";

export interface JoinRequest {
  name: string;
  color: number;
}

export interface InitialData {
  id: string;
  players: {
    id: string;
    name: string;
    color: number;
    row: number;
    col: number;
  }[];
  grid: {
    rows: number;
    cols: number;
    walls: string[];
    tiles: {
      id: string;
      row: number;
      col: number;
      letter: string;
      value: number;
      isQuestionMark?: boolean;
      isSolved?: boolean;
      color?: number;
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
    }[];
    words: {
      word: string;
      tiles: { row: number; col: number };
      formedBy: string;
    }[];
  };
}

export interface NewPlayer {
  id: string;
  name: string;
  color: number;
  row: number;
  col: number;
}
