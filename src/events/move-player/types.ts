import { Direction } from "../../types";

export interface MovementData {
  requestID: string;
  movers: Movement[];
  duration: number;
  direction: Direction;
  isPullRequest?: boolean;
}

interface Movement {
  type: "player" | "tile";
  id: string;
  target: {
    row: number;
    col: number;
  };
  instant?: boolean;
}
