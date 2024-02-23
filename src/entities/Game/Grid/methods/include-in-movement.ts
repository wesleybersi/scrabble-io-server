import { Cardinal, Direction } from "../../../../types";
import {
  directionToAdjacent,
  directionToCardinal,
} from "../../../../utilities";

import Grid from "../Grid";
import { Player } from "../Player/Player";
import Tile from "../Tile/Tile";

export function moveTiles(
  this: Grid,
  targetTile: Tile,
  direction: Direction,
  movingSet: Set<Tile> = new Set(),
  visitedSet: Set<Tile> = new Set()
): {
  allIncluded: Set<Tile>;
  isObstructed: boolean;
} {
  let isObstructed = false;
  visitedSet.add(targetTile);
  movingSet.add(targetTile);

  const { row: targetRow, col: targetCol } = directionToAdjacent(
    direction,
    targetTile.row,
    targetTile.col
  );

  const position = `${targetRow},${targetCol}`;
  const walls = this.walls;

  if (
    walls.has(position) ||
    targetRow < 0 ||
    targetRow >= this.rows ||
    targetCol < 0 ||
    targetCol >= this.cols
  ) {
    isObstructed = true;
  }

  if (targetTile instanceof Tile) {
    for (const tile of targetTile.shape) {
      visitedSet.add(tile);
      movingSet.add(tile);
    }

    targetTile.detectSurroundings();
    for (const [side, adjacentObject] of Object.entries(
      targetTile.adjacentTiles
    )) {
      if (adjacentObject instanceof Player) continue;
      if (isObstructed) break;
      if (typeof adjacentObject === "boolean") continue; // Wall
      if (!adjacentObject || visitedSet.has(adjacentObject)) continue;
      if (
        !targetTile.connectedTo[side as Cardinal] &&
        directionToCardinal(direction as Direction) !== side
      ) {
        continue;
      }
      isObstructed = this.moveTiles(
        adjacentObject,
        direction,
        movingSet,
        visitedSet
      ).isObstructed;
    }
  }

  if (isObstructed) movingSet.clear();

  return {
    allIncluded: movingSet,
    isObstructed,
  };
}
