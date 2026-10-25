import { UserInputError } from "../../shared/errors/UserInputError.js";

export interface ParsedCommand {
  readonly name: string;
  readonly args: readonly string[];
}

export class CommandParser {
  parse(line: string): ParsedCommand | null {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      return null;
    }

    const [name, ...args] = this.tokenize(trimmed);
    if (name === undefined) {
      return null;
    }

    return { name, args };
  }

  private tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let tokenStarted = false;
    let inQuotes = false;
    let escaped = false;

    for (const character of line) {
      if (inQuotes) {
        if (escaped) {
          if (character !== '"' && character !== "\\") {
            current += "\\";
          }
          current += character;
          escaped = false;
          tokenStarted = true;
          continue;
        }
        if (character === "\\") {
          escaped = true;
          continue;
        }
        if (character === '"') {
          inQuotes = false;
          tokenStarted = true;
          continue;
        }

        current += character;
        tokenStarted = true;
        continue;
      }

      if (character === '"') {
        inQuotes = true;
        tokenStarted = true;
        continue;
      }
      if (/\s/.test(character)) {
        if (tokenStarted) {
          tokens.push(current);
          current = "";
          tokenStarted = false;
        }
        continue;
      }

      current += character;
      tokenStarted = true;
    }

    if (inQuotes) {
      throw new UserInputError("unterminated quoted argument");
    }
    if (tokenStarted) {
      tokens.push(current);
    }
    return tokens;
  }
}
