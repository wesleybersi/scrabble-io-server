import Grid from "../Grid";

export function getNearestEmptyCell(
  this: Grid,
  row: number,
  col: number,
  checked: Set<string> = new Set()
): { row: number; col: number } {
  const occupiedCell = this.getObjectInPlace(row, col);
  if (
    !occupiedCell &&
    row > 0 &&
    col > 0 &&
    row < this.rows - 1 &&
    col < this.cols - 1
  ) {
    console.log("Maxrows:", this.rows - 1, "This row:", row);
    console.log("Maxcols:", this.cols - 1, "This col:", col);
    return { row, col };
  } else {
    checked.add(`${row},${col}`);
    const positions = this.getAdjacentCells(row, col);
    console.log(positions);
    for (const position of Object.values(positions).sort(
      () => Math.random() - 0.5
    )) {
      if (checked.has(`${position.row},${position.col}`)) continue;
      return this.getNearestEmptyCell(position.row, position.col, checked);
    }
  }
  return { row, col };
}
