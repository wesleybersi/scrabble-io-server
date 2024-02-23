import Game from "../../Game";

import {
  directionToAdjacent,
  directionToCardinal,
  getOppositeSide,
} from "../../../../utilities";
import { Cardinal, Direction } from "../../../../types";
import Word from "../Word/Word";
import { Player } from "../Player/Player";
import { CELL_SIZE, MOVEMENT_SPEED } from "../../../../constants";

export default class Tile {
  game: Game;
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  target: { x: number; y: number; row: number; col: number } | null = null;
  shape: Set<Tile> = new Set();
  letter!: string;
  value!: number;
  color?: number;
  speed: number = MOVEMENT_SPEED;
  adjacentTiles!: {
    top: Tile | Player | boolean;
    bottom: Tile | Player | boolean;
    left: Tile | Player | boolean;
    right: Tile | Player | boolean;
  };
  connectedTo!: {
    top: Tile | undefined;
    bottom: Tile | undefined;
    left: Tile | undefined;
    right: Tile | undefined;
  };
  words: Word[] = [];
  solver: Player | null = null;
  firstInteraction: { player: Player; at: number } | null = null;
  lastInteraction: { player: Player; at: number } | null = null;
  moveCount: number = 0;
  isWildCard = false;
  isQuestionMark = false;
  isMoving = false;
  isInContention = false;
  constructor(game: Game, id: string, row: number, col: number) {
    this.game = game;
    this.id = id;
    this.row = row;
    this.col = col;
    this.x = col * CELL_SIZE + CELL_SIZE / 2;
    this.y = row * CELL_SIZE + CELL_SIZE / 2;
    this.setRandomLetter();
    this.connectedTo = {
      top: undefined,
      bottom: undefined,
      left: undefined,
      right: undefined,
    };
    this.adjacentTiles = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
    this.game.tilesById.set(this.id, this);
    this.game.grid.tiles.set(`${this.row},${this.col}`, this);
  }
  update(delta: number) {
    this.isMoving = true;
    if (this.game.grid.tiles.get(`${this.row},${this.col}`) === this) {
      this.game.grid.tiles.delete(`${this.row},${this.col}`);
    }
    if (this.target) {
      if (
        Math.abs(this.x - this.target.x) <= 5 &&
        Math.abs(this.y - this.target.y) <= 5
      ) {
        this.x = this.target.x;
        this.y = this.target.y;
        this.row = this.target.row;
        this.col = this.target.col;
        this.game.grid.tiles.set(`${this.row},${this.col}`, this);
        if (this.isQuestionMark) this.isQuestionMark = false;
        this.isMoving = false;
        this.moveCount++;
      } else {
        if (this.target.x > this.x) {
          this.x += delta * this.speed;
        } else if (this.target.x < this.x) {
          this.x -= delta * this.speed;
        }

        if (this.target.y > this.y) {
          this.y += delta * this.speed;
        } else if (this.target.y < this.y) {
          this.y -= delta * this.speed;
        }
      }
    }
  }
  emit() {
    this.game.emissions.push({
      id: this.id,
      x: this.x,
      y: this.y,
      letter: this.isQuestionMark ? "?" : this.letter,
    });
  }
  setRandomLetter() {
    const { distributor } = this.game.grid;
    this.letter = distributor.getRandomLetter();
    if (this.letter.startsWith("?")) {
      this.letter = this.letter.slice(1);
      this.isQuestionMark = true;
    }
    if (this.letter !== " ") {
      this.value = distributor.getLetterValue(this.letter);
    }
  }
  detectSurroundings = () => {
    const grid = this.game.grid;
    this.adjacentTiles = {
      top: grid.getObjectInPlace(this.row - 1, this.col),
      bottom: grid.getObjectInPlace(this.row + 1, this.col),
      left: grid.getObjectInPlace(this.row, this.col - 1),
      right: grid.getObjectInPlace(this.row, this.col + 1),
    };
  };
  connectShape(at?: string[]) {
    this.detectSurroundings();
    const shape = this.shape;

    for (const [side, object] of Object.entries(this.adjacentTiles)) {
      if (object instanceof Player || typeof object === "boolean") continue;
      const tile = object;
      if (at && !at.includes(side as Cardinal)) continue;
      if (!tile) {
        this.connectedTo[side as Cardinal] = undefined;
        continue;
      }
      for (const part of Array.from(tile.shape)) {
        shape.add(part);
      }

      tile.connectedTo[getOppositeSide(side as Cardinal)] = this;
      this.connectedTo[side as Cardinal] = tile;
    }
    for (const letter of shape) {
      letter.shape = shape;
    }

    this.shape = shape;
  }

  remove() {
    this.shape.delete(this);
    this.game.grid.tiles.delete(`${this.row},${this.col}`);
    this.game.tilesById.delete(this.id);
  }
}
