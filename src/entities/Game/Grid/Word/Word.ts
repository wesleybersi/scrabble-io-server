import { letterToScrabbleValue } from "../../Scrabble/Distributor/utilities/letter-to-value";
import Validator from "../../Scrabble/Validator/Validator";
import { Player } from "../Player/Player";
import Tile from "../Tile/Tile";

export default class Word {
  value: string;
  direction: "horizontal" | "vertical";
  tiles: Tile[];
  solver: Player;
  moment: number;
  constructor(
    validator: Validator,
    value: string,
    direction: "horizontal" | "vertical",
    solver: Player,
    tiles: Tile[],
    moment: number
  ) {
    this.value = value;
    this.direction = direction;
    this.tiles = tiles;
    this.solver = solver;
    this.moment = moment;
    validator.activeWords.add(this);
    if (validator.longestWord) {
      if (this.tiles.length > validator.longestWord.tiles.length) {
        validator.longestWord = this;
      }
    } else {
      validator.longestWord = this;
    }

    this.tiles.forEach((tile, index) => {
      let replaceIndex = -1;
      tile.words.forEach((word, index) => {
        if (
          word &&
          this.value.includes(word.value) &&
          word.direction === this.direction
        ) {
          replaceIndex = index;
          validator.activeWords.delete(word);
        }
      });
      if (replaceIndex >= 0) {
        tile.words.splice(replaceIndex, 1);
      }
      tile.words.push(this);

      //Wildcard becomes letter
      if (tile.letter === " ") {
        tile.letter = this.value[index];
        tile.value = letterToScrabbleValue(tile.letter);
      }

      if (!tile.solver) {
        tile.solver = this.solver;
        tile.color = this.solver.color;
        tile.solver.uniqueTiles.add(tile);
      }
      tile.solver.updateScore();
      //Connect tile
      if (index === 0) {
        this.direction === "horizontal"
          ? tile.connectShape(["right"])
          : tile.connectShape(["bottom"]);
      } else if (index === this.value.length - 1) {
        this.direction === "horizontal"
          ? tile.connectShape(["left"])
          : tile.connectShape(["top"]);
      } else {
        this.direction === "horizontal"
          ? tile.connectShape(["left", "right"])
          : tile.connectShape(["top", "bottom"]);
      }
    });
  }
}
