import type { EditorSession } from "../EditorSession.js";
import type { Command } from "./Command.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { InitDocumentCommand } from "./InitDocumentCommand.js";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

export class InitCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "init";

  create(args: readonly string[]): Command<EditorSession> {
    if (args.length > 2) {
      throw new Error("usage: init [width] [height]");
    }

    return new InitDocumentCommand(
      this.parseDimension(args[0], DEFAULT_WIDTH, "width"),
      this.parseDimension(args[1], DEFAULT_HEIGHT, "height")
    );
  }

  private parseDimension(
    rawValue: string | undefined,
    fallback: number,
    name: string
  ): number {
    if (rawValue === undefined) {
      return fallback;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`canvas ${name} must be a positive number`);
    }

    return value;
  }
}
