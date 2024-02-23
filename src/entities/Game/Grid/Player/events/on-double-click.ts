import { Socket } from "socket.io";
import { Player } from "../Player";
import { CELL_SIZE } from "../../../../../constants";
import Tile from "../../Tile/Tile";
import { AxiosResponse } from "axios";
import moment from "moment";

export default async function onDoubleClick(this: Player, socket: Socket) {
  socket.on("Double Click", () => {
    const tile = this.game?.grid.getObjectInPlace(
      Math.floor(this.y / CELL_SIZE),
      Math.floor(this.x / CELL_SIZE)
    );
    if (tile && tile instanceof Tile) {
      const tileInfo: TileInfo = {
        id: Number(tile.id),
        letter: tile.isQuestionMark ? "?" : tile.letter,
        value: tile.value,
        row: tile.row,
        col: tile.col,
        solver: tile.solver
          ? {
              name: tile.solver.name,
              color: tile.solver.color,
            }
          : undefined,
        moveCount: tile.moveCount,
        firstInteraction: tile.firstInteraction
          ? {
              name: tile.firstInteraction.player.name,
              color: tile.firstInteraction.player.color,
              at: moment(tile.firstInteraction.at).fromNow(),
            }
          : undefined,
        lastInteraction: tile.lastInteraction
          ? {
              name: tile.lastInteraction.player.name,
              color: tile.lastInteraction.player.color,
              at: moment(tile.lastInteraction.at).fromNow(),
            }
          : undefined,
        words: tile.words.map((word) => {
          return {
            position: word.tiles.indexOf(tile) + 1,
            word: word.value,
            solver: {
              name: word.solver.name,
              color: word.solver.color,
              at: moment(word.moment).fromNow(),
            },
            description: [],
          };
        }),
      };

      console.log(`--------------TILE #${tile.id}--------------`);
      console.log(
        "Letter:",
        tile.letter,
        "-",
        "Value:",
        tile.value,
        "-",
        "Row:",
        tile.row,
        "-",
        "Col:",
        "-",
        tile.col
      );
      if (tile.solver) {
        console.log("Tile belongs to:", tile.solver.name);
      }
      console.log(
        "Tile has moved a total of",
        tile.moveCount,
        tile.moveCount === 1 ? "time" : "times"
      );
      if (tile.firstInteraction) {
        console.log(
          "Tile was first moved",
          moment(tile.firstInteraction?.at).fromNow(),
          "by",
          tile.firstInteraction?.player.name
        );
      }
      if (tile.lastInteraction) {
        console.log(
          "Tile was last moved",
          moment(tile.lastInteraction?.at).fromNow(),
          "by",
          tile.lastInteraction?.player.name
        );
      }
      // const wordDefinitions: (
      //   | Promise<AxiosResponse<any, any> | undefined>
      //   | undefined
      // )[] = [];
      if (tile.words.length > 0) {
        console.log(
          "Tile is part of",
          tile.words.length,
          tile.words.length === 1 ? "word:" : "words:"
        );
      }
      for (const word of tile.words) {
        // const response = this.game?.validator.dictionary.getDefinition(
        //   word.value
        // );

        console.log(
          "Position",
          word.tiles.indexOf(tile) + 1,
          "in",
          word.value,
          "a",
          word.value.length,
          "letter word",
          "solved",
          moment(word.moment).fromNow(),
          "by",
          word.solver.name
        );

        // wordDefinitions.push(response);
      }
      console.log("--------------------------------------");

      // Promise.all(wordDefinitions)
      //   .then((resolvedResponses) => {
      //     socket.emit("New Dictionary Definitions", resolvedResponses);
      //   })
      //   .catch((error) => {
      //     console.error("Error:", error);
      //   });

      socket.emit("Tile Information", tileInfo);
    }
  });
}

interface TileInfo {
  id: number;
  letter: string;
  value: number;
  row: number;
  col: number;
  moveCount: number;
  solver?: { name: string; color: number };
  firstInteraction?: { name: string; color: number; at: string };
  lastInteraction?: { name: string; color: number; at: string };
  words: {
    position: number;
    word: string;
    solver: { name: string; color: number; at: string };
    description: string[];
  }[];
}
