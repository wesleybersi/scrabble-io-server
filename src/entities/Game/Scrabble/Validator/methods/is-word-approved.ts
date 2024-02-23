import Validator from "../Validator";
import { LetterSequence } from "../types";

export function isWordApproved(this: Validator, word: LetterSequence) {
  let invalid = false;
  for (const tile of word.tiles) {
    if (invalid) break;
    for (const wordInPlace of tile.words) {
      if (!wordInPlace) continue;
      if (
        //Another word already exists on board and this word does not extend it
        !word.value.includes(wordInPlace.value) &&
        word.direction === wordInPlace.direction
      ) {
        console.log(
          "Another word already exists on board and this word does not extend it"
        );
        return false;
      }

      if (
        //Word already exists on board
        wordInPlace.value === word.value &&
        wordInPlace.direction === word.direction
      ) {
        console.log("Word already exists on board");
        return false;
      }
    }
  }

  return true;
}
