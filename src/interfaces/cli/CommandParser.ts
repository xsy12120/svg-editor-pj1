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

    const [name, ...args] = trimmed.split(/\s+/);
    if (name === undefined) {
      return null;
    }

    return { name, args };
  }
}
