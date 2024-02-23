import { Socket } from "socket.io";
import Game from "../../Game";
import Word from "../Word/Word";
import Tile from "../Tile/Tile";
import { movePointer } from "./controllers/move-pointer";
import onPointerMove from "./events/on-pointer-move";
import onPointerDown from "./events/on-pointer-down";
import { CELL_SIZE } from "../../../../constants";
import onDoubleClick from "./events/on-double-click";

export class Player {
  socket: Socket;
  game: Game | null = null;
  id: string;
  name: string;
  color: number;
  solvedWords = new Set<Word>();
  uniqueTiles = new Set<Tile>();
  score = 0;
  row = 0;
  col = 0;
  x = 0;
  y = 0;
  isPointerDown: { left: boolean; right: boolean } = {
    left: false,
    right: false,
  };
  isPointerJustDown: { left: boolean; right: boolean } = {
    left: false,
    right: false,
  };
  heldTile: Tile | null = null;
  hoverTile: Tile | null = null;

  //Events
  onPointerMove: (socket: Socket) => void = onPointerMove;
  onPointerDown: (socket: Socket) => void = onPointerDown;
  onDoubleClick: (socket: Socket) => void = onDoubleClick;

  //Controllers
  movePointer: (x: number, y: number) => void = movePointer;

  constructor(
    game: Game,
    socket: Socket,
    id: string,
    name: string,
    color: number
  ) {
    this.id = id;
    this.game = game;
    this.socket = socket;
    this.name = name;
    this.color = color;

    this.onPointerMove(socket);
    this.onPointerDown(socket);
    this.onDoubleClick(socket);
  }
  moveTo(row: number, col: number) {
    if (!this.game) return;
    const { players } = this.game.grid;
    const oldPos = `${this.row},${this.col}`;
    const newPos = `${row},${col}`;
    if (players.get(oldPos) === this) players.delete(oldPos);
    players.set(newPos, this);
    this.row = row;
    this.col = col;
  }
  addWord(word: Word) {
    for (const tile of word.tiles) {
      if (tile.solver === this) {
        this.uniqueTiles.add(tile);
      }
    }
    this.solvedWords.add(word);
    this.updateScore();
  }

  updateScore() {
    let score = 0;
    this.solvedWords = new Set();
    for (const tile of this.uniqueTiles) {
      if (tile.words.some((word) => word?.solver !== this)) {
        this.uniqueTiles.delete(tile);
        continue;
      }
      for (const word of tile.words) {
        this.solvedWords.add(word);
      }
      score += tile.value;
    }
    this.score = score;
  }
  update(delta: number) {
    if (this.isPointerJustDown.left) {
      const row = Math.floor(this.y / CELL_SIZE);
      const col = Math.floor(this.x / CELL_SIZE);
      const tile = this.game?.grid.tiles.get(`${row},${col}`);
      if (tile) {
        this.heldTile = tile;
      }
    }
    if (!this.isPointerDown.left) this.heldTile = null;

    this.isPointerJustDown.left = false;
    this.isPointerJustDown.right = false;
  }
}

declare module "socket.io" {
  interface Socket {
    player: Player;
  }
}
