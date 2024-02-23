import Tile from "../../../Grid/Tile/Tile";
import Validator from "../Validator";
import { LetterSequence } from "../types";

export function removeInitialWords(this: Validator) {
  console.log(
    "Detecting all words formed during initial grid populating process."
  );
  const horizontalSequences = new Set<LetterSequence>();
  const verticalSequences = new Set<LetterSequence>();

  const processed = {
    horizontal: new Set<Tile>(),
    vertical: new Set<Tile>(),
  };

  for (const [, tile] of this.game.grid.tiles) {
    const { horizontal, vertical } = this.getSequencesFromTile(tile, processed);
    for (const tile of horizontal) processed.horizontal.add(tile);
    for (const tile of vertical) processed.vertical.add(tile);
    const horizontalValue = horizontal.map((tile) => tile.letter).join("");
    const verticalValue = vertical.map((tile) => tile.letter).join("");
    if (
      horizontal.length >= this.game.config.minWordLength &&
      !this.invalidSequenceMemo.has(horizontalValue)
    ) {
      horizontalSequences.add({
        direction: "horizontal",
        tiles: horizontal,
        value: horizontalValue,
      });
    }
    if (
      vertical.length >= this.game.config.minWordLength &&
      !this.invalidSequenceMemo.has(verticalValue)
    ) {
      verticalSequences.add({
        direction: "vertical",
        tiles: vertical,
        value: verticalValue,
      });
    }
  }

  const words = this.sequencesToWords(horizontalSequences, verticalSequences);

  console.log("Removing", words.length, "words");
  for (const word of words) {
    for (const tile of word.tiles) {
      tile.remove();
    }
  }
}
