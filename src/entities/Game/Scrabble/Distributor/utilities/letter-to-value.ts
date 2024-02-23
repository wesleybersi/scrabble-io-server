export function letterToScrabbleValue(letter: string): number {
  letter = letter.toLowerCase();
  switch (letter) {
    case "a":
    case "e":
    case "i":
    case "o":
    case "l":
    case "n":
    case "s":
    case "t":
    case "r":
      return 1;
    case "d":
    case "g":
      return 2;
    case "b":
    case "c":
    case "p":
      return 3;
    case "m":
    case "f":
    case "h":
    case "v":
    case "w":
    case "y":
      return 4;
    case "k":
      return 5;
    case "j":
    case "x":
      return 8;
    case "q":
    case "z":
      return 10;
  }
  return 0;
}
