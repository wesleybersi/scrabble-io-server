import { Socket } from "socket.io";
import { Player } from "../Player";
import { CELL_SIZE } from "../../../../../constants";

export default function onPointerDown(this: Player, socket: Socket) {
  socket.on("Pointer Down", (button: "left" | "right", isDown: boolean) => {
    if (button === "left") {
      this.isPointerDown.left = isDown;
      this.isPointerJustDown.left = isDown;
    } else if (button === "right") {
      this.socket.emit("Tile Information", null);
      this.isPointerDown.right = isDown;
      this.isPointerJustDown.right = isDown;
    }
  });
}
