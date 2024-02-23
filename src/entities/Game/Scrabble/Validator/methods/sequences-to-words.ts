import { spliceString } from "../../../../../utilities";
import Game from "../../../Game";
import Tile from "../../../Grid/Tile/Tile";
import Dictionary from "../Dictionary/Dictionary";
import Validator from "../Validator";
import { LetterSequence } from "../types";

export function sequencesToWords(
  this: Validator,
  horizontal: Set<LetterSequence>,
  vertical: Set<LetterSequence>,
  log?: boolean
): LetterSequence[] {
  const matchingWords: LetterSequence[] = [];
  const sequences = [...horizontal, ...vertical];
  if (log) console.log("Analysing letter sequences:");

  // //Get overlapping wildcards
  //TODO
  // const wildcards = new Set();
  // const overlappingWildcards = new Map<Tile, string>();
  // for (const sequence of sequences) {
  //   for (const tile of sequence.tiles) {
  //     if (tile.letter === " ") {
  //       if (wildcards.has(tile)) {
  //         overlappingWildcards.set(tile, "");
  //         continue;
  //       }
  //       wildcards.add(tile);
  //     }
  //   }
  // }

  for (const sequence of sequences) {
    if (log) console.log(sequence.direction + ":", sequence.value);
    let wordWasFound = false;
    let tileIndex = 0;
    for (const tile of sequence.tiles) {
      if (wordWasFound) break;
      for (
        let length = sequence.tiles.length;
        length >= this.game.config.minWordLength;
        length--
      ) {
        //Create possible words from each letter --> Ascending
        //Word will always be the longest word this way
        const currentSequenceLength = length - tileIndex;
        const tiles: Tile[] = [];
        let value = "";
        if (currentSequenceLength >= this.game.config.minWordLength) {
          for (let i = tileIndex; i < length; i++) {
            value += sequence.tiles[i].letter;
            tiles.push(sequence.tiles[i]);
          }

          if (value.includes(" ")) {
            value = getWildCardSequence(this.dictionary, value);
          }

          const sequenceIsAWord = this.dictionary.wordExists(value);
          if (sequenceIsAWord) {
            if (log) console.log(`${value} is a valid word!`);
            matchingWords.push({
              value: value,
              tiles: tiles,
              direction: sequence.direction,
            });
            if (!tiles[0].solver) wordWasFound = true;
            break;
          } else {
            console.log("Marking this sequence as invalid.");
            this.invalidSequenceMemo.add(sequence.value);
          }
        }
      }
      tileIndex++;
    }
  }
  if (log && matchingWords.length === 0) {
    console.log("No words found in sequences.");
  }
  return matchingWords;
}

export function getWildCardSequence(
  dictionary: Dictionary,
  initialValue: string
): string {
  let foundWord = "";
  const tryAllLetters = (value: string) => {
    const alphabet = shuffledAlphabet();
    const position = value.indexOf(" ");
    const hasMoreEmptySpaces = value.lastIndexOf(" ") !== position;
    for (const letter of alphabet) {
      if (foundWord) return;
      const sequence = spliceString(value, position, 1, letter);
      console.log(sequence);
      if (hasMoreEmptySpaces) {
        //Increase depth if more wildcards in sequence
        tryAllLetters(sequence);
      } else {
        if (dictionary.wordExists(sequence)) {
          foundWord = sequence;
        }
      }
    }
  };
  tryAllLetters(initialValue);
  return foundWord;
}

function shuffledAlphabet() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const shuffledAlphabet = shuffleString(alphabet);

  function shuffleString(string: string) {
    const array = string.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  }
  return shuffledAlphabet;
}
