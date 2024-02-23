import axios from "axios";
import { dutch } from "./dictionaries/dutch";
import { english } from "./dictionaries/english";

export default class Dictionary {
  root: TrieNode;
  language: "Dutch" | "English";
  constructor(language: "Dutch" | "English") {
    this.language = language;
    this.root = new TrieNode();

    switch (language) {
      case "Dutch":
        console.log("Adding", dutch.length, "Dutch words to the dictionary.");
        for (const word of dutch) {
          this.addWord(word);
        }
        break;
      case "English":
        console.log(
          "Adding",
          english.length,
          "English words to the dictionary."
        );
        for (const word of english) {
          this.addWord(word);
        }
        break;
    }
  }

  async getDefinition(word: string) {
    let lang = "";
    switch (this.language) {
      case "English":
        lang = "en";
        break;
      case "Dutch":
        // lang = "nl";
        lang = "en";
        break;
    }

    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word.toLowerCase()}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  addWord(word: string) {
    const normalizedWord = word
      .toUpperCase()
      .split("")
      .map((char) => this.removeDiacritics(char))
      .join("");

    let node = this.root;

    for (const char of normalizedWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isWord = true;
  }
  wordExists(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isWord;
  }
  removeDiacritics(char: string): string {
    const diacriticMap: Record<string, string> = {
      À: "A",
      Á: "A",
      Â: "A",
      Ã: "A",
      Ä: "A",
      È: "E",
      É: "E",
      Ê: "E",
      Ë: "E",
      Ì: "I",
      Í: "I",
      Î: "I",
      Ï: "I",
      Ò: "O",
      Ó: "O",
      Ô: "O",
      Õ: "O",
      Ö: "O",
      Ù: "U",
      Ú: "U",
      Û: "U",
      Ü: "U",
      Ñ: "N",
      Ç: "C",
      ß: "SS",
      Æ: "AE",
      Œ: "OE",
      Ø: "O",
      Å: "A",
    };

    return diacriticMap[char] || char;
  }
}

class TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}
