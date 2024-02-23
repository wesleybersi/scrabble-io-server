import { Socket } from "socket.io";
import { Player } from "../Player";

export default function onPointerMove(this: Player, socket: Socket) {
  socket.on("Pointer Move", (x: number, y: number) => {
    this.movePointer(x, y);
  });
}
