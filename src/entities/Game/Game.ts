import { Player } from "./Grid/Player/Player";
import Grid from "./Grid/Grid";
import { Server } from "socket.io";
import { Emission, FrameData, GameIntervalData } from "./types";
import Validator from "./Scrabble/Validator/Validator";
import Tile from "./Grid/Tile/Tile";
import { CELL_SIZE } from "../../constants";

interface GameConfig {
  name: string;
  type: "Free For All";
  language: "Dutch" | "English";
  timer: number;
  minWordLength: number;
  size: { rows: number; cols: number };
  density: { tiles: number; walls: number };
  questionMarks: number;
}

export default class Game {
  io: Server;
  config: GameConfig;
  hasLoaded = false;
  players: Map<string, Player>;
  grid: Grid;
  tilesById: Map<string, Tile> = new Map();
  validator: Validator;
  timeRemaining: number;
  intervalID: NodeJS.Timer | null = null;
  updateID: NodeJS.Timer | null = null;
  emissions: Emission[] = [];
  constructor(io: Server, config: GameConfig) {
    console.log(`Setting up new ${config.type} game.`);
    this.config = config;
    this.io = io;
    this.players = new Map();
    this.grid = new Grid(this, config.size);
    this.grid.populate(config.density);
    this.validator = new Validator(this);
    this.validator.removeInitialWords();
    this.timeRemaining = config.timer * 60;
    this.start();
  }
  start() {
    console.log("Setting a timer of", this.config.timer, "minutes.");
    console.log("Load complete. Starting game.");
    this.hasLoaded = true;

    const FPS = 60;
    let lastTimestamp = performance.now();

    this.updateID = setInterval(() => {
      const currentTimestamp = performance.now();
      const delta = (currentTimestamp - lastTimestamp) / 1000; // Convert to seconds
      lastTimestamp = currentTimestamp;

      this.grid.update(delta);

      const frameData: FrameData = {
        players: [],
        movingTiles: [],
      };

      for (const emission of this.emissions) {
        frameData.movingTiles.push({
          id: emission.id,
          x: emission.x,
          y: emission.y,
          letter: emission.letter,
        });
      }

      for (const [, player] of this.players) {
        player.update(delta);
        frameData.players.push({
          id: player.id,
          x: player.x,
          y: player.y,
          color: player.color,
          holding: player.heldTile
            ? {
                id: player.heldTile.id,
                x: player.heldTile.x,
                y: player.heldTile.y,
              }
            : undefined,
          hovering: player.hoverTile ? player.hoverTile.id : undefined,
          scrolling: player.isPointerDown.right ? true : undefined,
        });
      }

      for (const [, player] of this.players) {
        this.io.to(player.socket.id).emit("Current Frame", frameData);
      }
      this.emissions = [];
    }, 1000 / FPS);

    this.intervalID = setInterval(() => {
      // Decrement the timer by 1 second
      this.timeRemaining--;

      const gameData: GameIntervalData = {
        wordCount: this.validator.activeWords.size,
        characterCount: Array.from(this.validator.activeWords).reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue.tiles.length,
          0
        ),
        longestWord: this.validator.longestWord
          ? {
              value: this.validator.longestWord.value,
              by: this.validator.longestWord.solver.id,
            }
          : undefined,
        userCount: this.players.size,
        timeRemaining: this.timeRemaining,
        positions: [],
        leaderboard: [],
      };

      for (const [, player] of this.players) {
        gameData.positions.push({
          id: player.id,
          row: Math.floor(player.y / CELL_SIZE),
          col: Math.floor(player.x / CELL_SIZE),
          color: player.color,
        });
      }

      const sortedLeaderboard = Array.from(this.players)
        .sort(([, playerA], [, playerB]) => playerA.score - playerB.score)
        .reverse();
      sortedLeaderboard.slice(0, 10).forEach(([id, player], index) => {
        gameData.leaderboard.push({
          position: index + 1,
          name: player.name,
          color: player.color,
          score: player.score,
        });
      });

      // Broadcast game update with countdown time every second
      for (const [, player] of this.players) {
        gameData.player = {
          id: player.id,
          name: player.name,
          color: player.color,
          score: player.score,
          row: player.row,
          col: player.col,
          x: player.x,
          y: player.y,
          position: 1,
          solvedWords: Array.from(player.solvedWords).map((word) => word.value),
          longestWord:
            [...player.solvedWords]
              .sort((wordA, wordB) => wordA.value.length - wordB.value.length)
              .reverse()
              .sort()[0]?.value ?? "",
        };
        this.io.to(player.id).emit("Game Update", gameData);
      }

      // Check if the timer has reached 0
      if (this.timeRemaining <= 0) {
        // Handle timer completion (e.g., end the game)
        this.stop();
      }
    }, 1000);
  }

  stop() {
    if (this.updateID) clearInterval(this.updateID);
    if (this.intervalID) {
      clearInterval(this.intervalID);
      for (const [, player] of this.players) {
        this.io.to(player.id).emit("Game Over");
      }
    }
  }
  emitLog(log: string) {
    for (const [, player] of this.players) {
      this.io.to(player.id).emit("Server Log", log);
    }
  }
}

//First to lay word = Full points
//Word already on board = Half points
