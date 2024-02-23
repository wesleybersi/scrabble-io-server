import Tile from "../../Grid/Tile/Tile";

export interface LetterSequence {
  value: string;
  tiles: Tile[];
  direction: "vertical" | "horizontal";
}

export interface WordEmitData {
  value: string;
  solver: string;
  tiles: {
    id: string;
    letter: string;
    solver: string;
    color?: number;
    top?: boolean;
    bottom?: boolean;
    right?: boolean;
    left?: boolean;
  }[];
}
