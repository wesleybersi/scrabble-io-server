import { Player } from "../Player";

export function movePointer(this: Player, x: number, y: number) {
  this.x = x;
  this.y = y;
}
