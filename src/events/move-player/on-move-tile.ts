import { Socket } from "socket.io";
import Game from "../../entities/Game/Game";
import { CELL_SIZE, MOVEMENT_SPEED } from "../../constants";
import Tile from "../../entities/Game/Grid/Tile/Tile";

import { Direction } from "../../types";

export default function onMoveTile(socket: Socket, game: Game) {
  socket.on("Pointer Move", (x: number, y: number) => {
    let tile: Tile | undefined = undefined;

    const row = Math.floor(y / CELL_SIZE);
    const col = Math.floor(x / CELL_SIZE);

    if (socket.player?.heldTile) {
      tile = socket.player.heldTile;
      if (Math.abs(tile.row - row) > 2 || Math.abs(tile.col - col) > 2) {
        socket.player.heldTile = null;
        return;
      }
    }

    const hoverTile = game.grid.getObjectInPlace(row, col);
    if (hoverTile instanceof Tile) {
      socket.player.hoverTile = hoverTile;
    } else {
      socket.player.hoverTile = null;
    }

    if (tile instanceof Tile) {
      if (row === tile.row && col === tile.col) return;

      for (const [id, map] of game.grid.movingTiles) {
        if (map.tiles.has(tile)) return;
      }

      if (tile.isMoving) return;
      for (const word of tile.words) {
        for (const tile of word.tiles) {
          console.log(tile.isMoving);
          for (const [id, map] of game.grid.movingTiles) {
            if (map.tiles.has(tile)) return;
          }
          if (tile.isMoving) return;
        }
      }

      let rowDiff = row - tile.row;
      let colDiff = col - tile.col;

      let direction: Direction = "up";
      if (rowDiff < 0) {
        direction = "up";
        rowDiff = -1;
      }
      if (rowDiff > 0) {
        rowDiff = 1;
        direction = "down";
      }
      if (colDiff < 0) {
        colDiff = -1;
        direction = "left";
      }
      if (colDiff > 0) {
        colDiff = 1;
        direction = "right";
      }

      if (rowDiff !== 0 && colDiff !== 0) {
        console.log("Invalid diagonal movement");
        return;
      }

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

      const speed = Math.max(MOVEMENT_SPEED - movingTiles.size * 25, 50);

      for (const tile of movingTiles) {
        if (tile instanceof Tile) {
          tile.speed = speed;
          game.grid.tiles.delete(`${tile.row},${tile.col}`);
          tile.isMoving = true;
          tile.lastInteraction = {
            player: socket.player,
            at: Date.now(),
          };
          if (!tile.firstInteraction) {
            tile.firstInteraction = { ...tile.lastInteraction };
          }
          tile.target = {
            y: tile.y + rowDiff * CELL_SIZE,
            x: tile.x + colDiff * CELL_SIZE,
            col: tile.col + colDiff,
            row: tile.row + rowDiff,
          };
        }
      }

      const id = "id" + Math.random().toString(16).slice(2);
      game.grid.movingTiles.set(id, {
        tiles: movingTiles,
        wordData: null,
      });
    }
  });
}
