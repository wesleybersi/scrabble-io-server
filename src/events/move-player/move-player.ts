// import { io } from "../../server";
// import { Socket } from "socket.io";
// import Game from "../../entities/Game/Game";
// import { MovementData } from "./types";
// import { MOVE_DURATION } from "../../constants";
// import Tile from "../../entities/Game/Grid/Tile/Tile";

// import { Player } from "../../entities/Game/Grid/Player/Player";

// export default function onMovePlayer(socket: Socket, game: Game) {
//   socket.on("Move Request", (direction, isPull?: boolean) => {
//     if (!socket.player) return;
//     const row = socket.player.row;
//     const col = socket.player.col;

//     let rowDiff = 0;
//     let colDiff = 0;

//     switch (direction) {
//       case "up":
//         rowDiff--;
//         break;
//       case "down":
//         rowDiff++;
//         break;
//       case "left":
//         colDiff--;
//         break;
//       case "right":
//         colDiff++;
//     }

//     let targetCell = game.grid.getObjectInPlace(row - rowDiff, col - colDiff);
//     if (isPull) {
//       if (targetCell instanceof Tile && targetCell.isMoving) return;
//       const oppositeCell = game.grid.getObjectInPlace(
//         row + rowDiff,
//         col + colDiff
//       );
//       if (oppositeCell) return;
//     } else {
//       targetCell = game.grid.getObjectInPlace(row + rowDiff, col + colDiff);
//       if (targetCell instanceof Tile && targetCell.isMoving) return;
//       const isWall = targetCell === true;
//       if (isWall) return;
//     }

//     const movementData: MovementData = {
//       requestID: socket.player.id,
//       movers: [
//         {
//           type: "player",
//           id: socket.player.id,
//           target: { row: row + rowDiff, col: col + colDiff },
//         },
//       ],
//       duration: MOVE_DURATION,
//       direction,
//     };

//     if (!targetCell) {
//       socket.player.moveTo(row + rowDiff, col + colDiff);
//       io.emit("New Movement", movementData);
//     } else {
//       if (typeof targetCell === "boolean") return;
//       const { allIncluded, isObstructed } = game.grid.includeInMovement(
//         targetCell,
//         direction
//       );
//       if (isObstructed) return; //If is obstructed, just don't do anything, no need to communicate

//       for (const object of allIncluded) {
//         if (object instanceof Tile) {
//           const tile = object;
//           game.grid.tiles.delete(`${tile.row},${tile.col}`);
//           tile.isQuestionMark = false;
//           tile.isMoving = true;
//           tile.lastInteraction = {
//             player: socket.player,
//             at: Date.now(),
//           };
//         }
//       }

//       for (const object of allIncluded) {
//         if (object instanceof Tile) {
//           const tile = object;
//           movementData.movers.push({
//             type: "tile",
//             id: tile.id,
//             target: { row: tile.row + rowDiff, col: tile.col + colDiff },
//           });
//           tile.row += rowDiff;
//           tile.col += colDiff;
//           game.grid.tiles.set(`${tile.row},${tile.col}`, tile);
//         } else if (object instanceof Player) {
//           const player = object;
//           movementData.movers.push({
//             type: "player",
//             id: player.id,
//             target: { row: player.row + rowDiff, col: player.col + colDiff },
//           });
//           player.moveTo(player.row + rowDiff, player.col + colDiff);
//         }
//       }

//       movementData.duration =
//         MOVE_DURATION + (allIncluded.size * MOVE_DURATION) / 6;

//       socket.player.moveTo(row + rowDiff, col + colDiff);

//       if (isPull) {
//         movementData.isPullRequest = true;
//       }

//       io.emit("New Movement", movementData);

//       setTimeout(() => {
//         for (const object of allIncluded) {
//           if (object instanceof Tile) {
//             const tile = object;
//             if (!tile.isInContention) {
//               tile.isMoving = false;
//             }
//           }
//         }
//       }, movementData.duration - 10);

//       for (const object of allIncluded) {
//         if (object instanceof Player) {
//           allIncluded.delete(object);
//         }
//       }

//       game.validator.analyzeUpdatedPositions(
//         socket.player,
//         allIncluded as Set<Tile>,
//         movementData.duration
//       );
//     }
//   });
// }
