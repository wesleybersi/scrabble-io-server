import { connected } from "process";
import { io } from "../../server";
import { Socket } from "socket.io";
import Game from "../../entities/Game/Game";
import { MovementData } from "./types";
import { MOVE_DURATION } from "../../constants";
import Tile from "../../entities/Game/Grid/Tile/Tile";

import { Direction } from "../../types";
import { Player } from "../../entities/Game/Grid/Player/Player";

export default function onMoveTile(socket: Socket, game: Game) {
  socket.on(
    "Move Tile Request",
    (from: { row: number; col: number }, to: { row: number; col: number }) => {
      const tile = game.grid.getObjectInPlace(from.row, from.col);

      if (tile instanceof Tile) {
        if (tile.isMoving) return;
        for (const word of tile.words) {
          for (const tile of word.tiles) {
            console.log(tile.isMoving);
            if (tile.isMoving) return;
          }
        }

        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;
        let direction: Direction = "up";
        if (rowDiff === -1) direction = "up";
        if (rowDiff === 1) direction = "down";
        if (colDiff === -1) direction = "left";
        if (colDiff === 1) direction = "right";

        if (rowDiff + colDiff !== 1 && rowDiff + colDiff !== -1) {
          console.log("Invalid movement");
          return;
        }

        const movementData: MovementData = {
          requestID: socket.player.id ?? "",
          movers: [],
          duration: MOVE_DURATION,
          direction,
        };

        // if (tile.words.length > 0) {
        //   for (const word of tile.words) {
        //     for (const tile of word.tiles) {
        //       movingTiles.add(tile);
        //     }
        //   }
        // }
        // if (targetCell instanceof Tile) {

        const movingTiles = new Set<Tile>([tile]);

        if (tile.words.length > 0) {
          for (const word of tile.words) {
            for (const tile of word.tiles) {
              const { allIncluded, isObstructed } = game.grid.moveTiles(
                tile,
                direction
              );
              for (const tile of allIncluded) {
                movingTiles.add(tile);
              }
              if (isObstructed) return;
            }
          }
        } else {
          const { allIncluded, isObstructed } = game.grid.moveTiles(
            tile,
            direction
          );
          for (const tile of allIncluded) {
            movingTiles.add(tile);
          }
          if (isObstructed) return;
        }

        for (const tile of movingTiles) {
          if (tile instanceof Tile) {
            game.grid.tiles.delete(`${tile.row},${tile.col}`);
            tile.isQuestionMark = false;
            tile.isMoving = true;
            tile.lastInteraction = {
              player: socket.player,
              at: Date.now(),
            };
          }
        }

        for (const tile of movingTiles) {
          if (tile instanceof Tile) {
            movementData.movers.push({
              type: "tile",
              id: tile.id,
              target: { row: tile.row + rowDiff, col: tile.col + colDiff },
            });
            tile.row += rowDiff;
            tile.col += colDiff;
            game.grid.tiles.set(`${tile.row},${tile.col}`, tile);
          }
        }

        movementData.duration =
          MOVE_DURATION + (movingTiles.size * MOVE_DURATION) / 6;

        io.emit("New Movement", movementData);

        setTimeout(() => {
          for (const object of movingTiles) {
            if (object instanceof Tile) {
              const tile = object;
              if (!tile.isInContention) {
                tile.isMoving = false;
              }
            }
          }
        }, movementData.duration - 10);

        game.validator.analyzeUpdatedPositions(
          socket.player,
          movingTiles as Set<Tile>,
          movementData.duration
        );
      }
    }
    // }
  );
}
