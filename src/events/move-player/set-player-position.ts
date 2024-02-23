import { io } from "../../server";
import { Socket } from "socket.io";
import Game from "../../entities/Game/Game";

export default function onSetPlayerPosition(socket: Socket, game: Game) {
  socket.on("Position Request", (row, col) => {
    if (!socket.player) return;
    // const { row: newRow, col: newCol } = game.grid.getNearestEmptyCell(
    //   row,
    //   col
    // );

    socket.player.moveTo(row, col);
    io.emit("New Movement", {
      movers: [
        {
          type: "player",
          id: socket.id,
          target: { row, col },
          instant: true,
        },
      ],
    });
  });
}
