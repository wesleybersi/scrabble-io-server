import { Socket } from "socket.io";
import { Player } from "../../entities/Game/Grid/Player/Player";
import Game from "../../entities/Game/Game";
import { InitialData, JoinRequest } from "./types";
import { io } from "../../server";
import { randomNum } from "../../utilities";

export default function onJoinGame(socket: Socket, game: Game) {
  socket.on("Join Game", (req: JoinRequest) => {
    const { row: startRow, col: startCol } = game.grid.getNearestEmptyCell(
      randomNum(game.grid.rows),
      randomNum(game.grid.cols)
    );

    socket.player = new Player(game, socket, socket.id, req.name, req.color);
    socket.player.row = startRow;
    socket.player.col = startCol;
    socket.player.game = game;

    game.players.set(socket.id, socket.player);
    game.grid.players.set(`${startRow},${startCol}`, socket.player);

    const playerArr = [];
    for (const [, player] of game.players) {
      playerArr.push({
        id: player.id,
        name: player.name,
        color: player.color,
        row: player.row,
        col: player.col,
      });
    }

    const tileArr = [];
    for (const [, tile] of game.grid.tiles) {
      const {
        id,
        row,
        col,
        letter,
        value,
        connectedTo,
        color,
        isQuestionMark,
      } = tile;

      tileArr.push({
        id,
        row,
        col,
        letter: isQuestionMark ? "?" : letter,
        value,
        color,
        isSolved: tile.words.length > 0,
        top: connectedTo.top ? true : undefined,
        bottom: connectedTo.bottom ? true : undefined,
        left: connectedTo.left ? true : undefined,
        right: connectedTo.right ? true : undefined,
      });
    }

    const initialData: InitialData = {
      id: socket.id,
      players: playerArr,
      grid: {
        rows: game.grid.rows,
        cols: game.grid.cols,
        walls: [...game.grid.walls],
        tiles: tileArr,
        words: [],
      },
    };
    console.log(socket.player.name, "has joined the game.");
    console.log(game.players.size, "players total.");
    socket.emit("Initial Game Data", initialData);
    io.emit("Player Joined", {
      id: socket.player.id,
      name: socket.player.name,
      color: socket.player.color,
      row: socket.player.row,
      col: socket.player.col,
    });
  });
}
