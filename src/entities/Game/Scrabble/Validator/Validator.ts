import { io } from "../../../../server";
import Game from "../../Game";
import { Player } from "../../Grid/Player/Player";
import Tile from "../../Grid/Tile/Tile";
import Word from "../../Grid/Word/Word";
import Dictionary from "./Dictionary/Dictionary";
import { getSequencesFromTile } from "./methods/get-sequences";
import { isWordApproved } from "./methods/is-word-approved";
import { removeInitialWords } from "./methods/remove-initial-words";
import { sequencesToWords } from "./methods/sequences-to-words";
import { LetterSequence, WordEmitData } from "./types";

export default class Validator {
  game: Game;
  dictionary: Dictionary;
  activeWords = new Set<Word>();
  uniqueWords = new Set<string>();
  longestWord: Word | null = null;
  invalidSequenceMemo = new Set<string>();
  removeInitialWords: () => void = removeInitialWords;
  getSequencesFromTile: (
    tile: Tile,
    processed: { horizontal: Set<Tile>; vertical: Set<Tile> }
  ) => {
    horizontal: Tile[];
    vertical: Tile[];
  } = getSequencesFromTile;
  sequencesToWords: (
    horizontalSequences: Set<LetterSequence>,
    verticalSequences: Set<LetterSequence>,
    log?: boolean
  ) => LetterSequence[] = sequencesToWords;
  isWordApproved: (word: LetterSequence) => boolean = isWordApproved;
  constructor(game: Game) {
    console.log("Setting up word validator");
    this.game = game;
    this.dictionary = new Dictionary(game.config.language);
  }
  analyzeUpdatedPositions(id: string, player: Player, tiles: Set<Tile>) {
    const horizontalSequences = new Set<LetterSequence>();
    const verticalSequences = new Set<LetterSequence>();

    const processed = {
      horizontal: new Set<Tile>(),
      vertical: new Set<Tile>(),
    };

    for (const tile of tiles) {
      const { horizontal, vertical } = this.getSequencesFromTile(
        tile,
        processed
      );
      const horizontalValue = horizontal.map((tile) => tile.letter).join("");
      const verticalValue = vertical.map((tile) => tile.letter).join("");
      for (const tile of horizontal) processed.horizontal.add(tile);
      for (const tile of vertical) processed.vertical.add(tile);

      if (
        this.invalidSequenceMemo.has(horizontalValue) ||
        this.invalidSequenceMemo.has(verticalValue)
      ) {
        console.log("Already analysed this sequence as invalid.");
      }

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
    if (horizontalSequences.size === 0 && verticalSequences.size === 0) return;

    const words = this.sequencesToWords(
      horizontalSequences,
      verticalSequences,
      true
    );

    for (const word of words) {
      if (!this.isWordApproved(word)) continue;
      const { value, direction, tiles } = word;
      const validWord = new Word(
        this,
        value,
        direction,
        player,
        tiles,
        Date.now()
      );

      console.log("Word:", word.value, "has been formed by", player.name);

      const wordData: WordEmitData = {
        solver: validWord.solver.id,
        value: validWord.value,
        tiles: [],
      };

      for (const tile of validWord.tiles) {
        wordData.tiles.push({
          id: tile.id,
          letter: tile.letter,
          solver: tile.solver?.id ?? "",
          color: tile.color,
          top: tile.connectedTo.top ? true : undefined,
          bottom: tile.connectedTo.bottom ? true : undefined,
          left: tile.connectedTo.left ? true : undefined,
          right: tile.connectedTo.right ? true : undefined,
        });
      }

      const movingTilesMap = this.game.grid.movingTiles.get(id);

      if (movingTilesMap) {
        movingTilesMap.wordData = wordData;
      }

      io.emit("Word Solved", wordData);
    }
  }
}
