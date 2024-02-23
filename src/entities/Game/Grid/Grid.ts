import { Player } from "./Player/Player";
import { oneIn, randomNum } from "../../../utilities";
import Distributor from "../Scrabble/Distributor/Distributor";
import Game from "../Game";
import Tile from "./Tile/Tile";
import { moveTiles } from "./methods/include-in-movement";
import { Direction } from "../../../types";
import { getNearestEmptyCell } from "./methods/get-nearest-empty-cell";
import { getAdjacentCells } from "./methods/get-adjacent-cells";
import { WordEmitData } from "../Scrabble/Validator/types";
import { CELL_SIZE } from "../../../constants";
import { toASCII } from "punycode";

export default class Grid {
  game: Game;
  rows: number;
  cols: number;
  players: Map<string, Player>;
  tiles: Map<string, Tile>;
  walls: Set<string>;
  distributor: Distributor;
  tileMatrix: string[][] = [];
  movingTiles: Map<
    string,
    { tiles: Set<Tile>; wordData: WordEmitData | null }
  > = new Map();

  moveTiles: (
    targetTile: Tile,
    direction: Direction,
    movingSet?: Set<Tile>,
    visitedSet?: Set<Tile>
  ) => {
    allIncluded: Set<Tile>;
    isObstructed: boolean;
  } = moveTiles;
  getNearestEmptyCell: (
    row: number,
    col: number,
    checked?: Set<string>
  ) => {
    row: number;
    col: number;
  } = getNearestEmptyCell;
  getAdjacentCells: (
    row: number,
    col: number
  ) => { [key: string]: { row: number; col: number } } = getAdjacentCells;
  constructor(game: Game, size: { rows: number; cols: number }) {
    console.log(
      "Forming new grid of",
      size.rows,
      "rows by",
      size.cols,
      "columns"
    );
    this.game = game;
    this.rows = size.rows;
    this.cols = size.cols;
    this.players = new Map();
    this.tiles = new Map();
    this.walls = new Set();
    this.distributor = new Distributor(this.game);
  }
  populate(density: { walls: number; tiles: number }) {
    this.walls = new Set();
    this.tiles = new Map();
    console.log(
      "Populating grid with a wall density of 1 in",
      density.walls,
      "and a tile density of 1 in",
      density.tiles
    );
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (
          row === 0 ||
          row === this.rows - 1 ||
          col === 0 ||
          col === this.cols - 1 ||
          oneIn(density.walls)
        ) {
          this.walls.add(`${row},${col}`);
        } else {
          if (oneIn(density.tiles)) {
            const ID = row * this.cols + col;
            this.tiles.set(
              `${row},${col}`,
              new Tile(this.game, ID.toString(), row, col)
            );
          }
        }
      }
    }
  }
  update(delta: number) {
    for (const [id, { tiles }] of this.movingTiles) {
      for (const tile of tiles) {
        tile.update(delta);
      }
    }

    for (const [id, { tiles, wordData }] of this.movingTiles) {
      let stillMoving = false;
      let lastInteraction = null;
      for (const tile of tiles) {
        lastInteraction = tile.lastInteraction?.player;
        if (tile.isMoving) stillMoving = true;
        tile.emit();
      }
      if (stillMoving) break;

      if (lastInteraction) {
        this.game.validator.analyzeUpdatedPositions(id, lastInteraction, tiles);
        for (const tile of tiles) tile.emit();
      }
      this.movingTiles.delete(id);
    }

    //No movers. Analyse words
  }
  getObjectInPlace(row: number, col: number) {
    const pos = `${row},${col}`;
    return this.players.get(pos) ?? this.tiles.get(pos) ?? this.walls.has(pos);
  }
}
