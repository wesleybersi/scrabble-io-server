import { oneIn, randomNum } from "../../../../utilities";
import Game from "../../Game";
import { letterToScrabbleValue } from "./utilities/letter-to-value";

export default class Distributor {
  letterPool: string[] = [];
  wildCardDistribution = 3; //Amount in letterpool
  chanceOfQuestionMark = 0; //One in <num>
  constructor(game: Game) {
    this.chanceOfQuestionMark = game.config.questionMarks;
    for (const letter in letterDistribution) {
      for (let i = 0; i < letterDistribution[letter]; i++) {
        this.letterPool.push(letter);
      }
    }

    for (let i = 0; i < this.wildCardDistribution; i++)
      this.letterPool.push(" ");
  }
  getRandomLetter() {
    const letter = this.letterPool[randomNum(this.letterPool.length)];
    if (oneIn(this.chanceOfQuestionMark)) {
      return "?" + letter;
    } else return letter;
  }
  getLetterValue(letter: string) {
    return letterToScrabbleValue(letter);
  }
}

export const letterDistribution: { [key: string]: number } = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};
