import { Socket } from "socket.io";
import { sockets } from "../server";
import { io } from "../server";

export default function onDisconnect(socket: Socket) {
  socket.on("disconnect", () => {
    console.log(socket.id, "has disconnected");
    if (socket.player?.game) {
      socket.player.game.players.delete(socket.player.id);
      socket.player.game.grid.players.delete(
        `${socket.player.row},${socket.player.col}`
      );
      for (const [id] of socket.player.game.players) {
        io.to(id).emit("Player Left", socket.id);
      }
    }
    sockets.delete(socket);
    console.log("Total connections:", sockets.size);
  });
}
