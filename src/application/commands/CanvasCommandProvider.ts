import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { CanvasCommand } from "./CanvasCommand.js";
import type { DocumentCommand } from "./ExecutableCommand.js";

export class CanvasCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "canvas";
  readonly usage = "canvas [width] [height]";

  create(args: readonly string[]): DocumentCommand<EditorSession> {
    if (args.length > 2) {
      throw new Error(`usage: ${this.usage}`);
    }

    return new CanvasCommand(
      this.parseDimension(args[0], "canvas width"),
      this.parseDimension(args[1], "canvas height")
    );
  }

  private parseDimension(
    value: string | undefined,
    name: string
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${name} must be a positive number`);
    }
    return parsed;
  }
}
