import Tile from "../../../Grid/Tile/Tile";
import Validator from "../Validator";

export function getSequencesFromTile(
  this: Validator,
  tile: Tile,
  processed: { horizontal: Set<Tile>; vertical: Set<Tile> }
): { vertical: Tile[]; horizontal: Tile[] } {
  const tiles = this.game.grid.tiles;
  const defineHorizontal = (): Tile[] => {
    const horizontal = [tile];
    const moveLeft = (row: number, col: number) => {
      const tile = tiles.get(`${row},${col}`);
      if (tile && !tile.isQuestionMark) {
        horizontal.unshift(tile);
        moveLeft(row, col - 1);
      }
    };
    const moveRight = (row: number, col: number) => {
      const tile = tiles.get(`${row},${col}`);
      if (tile && !tile.isQuestionMark) {
        horizontal.push(tile);
        moveRight(row, col + 1);
      }
    };
    moveLeft(tile.row, tile.col - 1);
    moveRight(tile.row, tile.col + 1);
    return horizontal;
  };

  const defineVertical = (): Tile[] => {
    const vertical = [tile];
    const moveUp = (row: number, col: number) => {
      const tile = tiles.get(`${row},${col}`);
      if (tile && !tile.isQuestionMark) {
        vertical.unshift(tile);
        moveUp(row - 1, col);
      }
    };
    const moveDown = (row: number, col: number) => {
      const tile = tiles.get(`${row},${col}`);
      if (tile && !tile.isQuestionMark) {
        vertical.push(tile);
        moveDown(row + 1, col);
      }
    };
    moveUp(tile.row - 1, tile.col);
    moveDown(tile.row + 1, tile.col);
    return vertical;
  };

  return {
    horizontal: !processed.horizontal.has(tile) ? defineHorizontal() : [],
    vertical: !processed.vertical.has(tile) ? defineVertical() : [],
  };
}
