import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { CanvasCommand } from "./CanvasCommand.js";
import { CanvasResizeCommand } from "./CanvasResizeCommand.js";
import type { ExecutableCommand } from "./ExecutableCommand.js";

export class CanvasCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "canvas";
  readonly usage = "canvas [width] [height]";

  create(args: readonly string[]): ExecutableCommand<EditorSession> {
    if (args.length > 2) {
      throw new Error(`usage: ${this.usage}`);
    }

    if (args.length === 0) {
      return new CanvasCommand();
    }

    const width = this.parseRequiredDimension(args[0], "canvas width");
    const height = this.parseDimension(args[1], "canvas height");
    return new CanvasResizeCommand(width, height);
  }

  private parseRequiredDimension(value: string | undefined, name: string): number {
    const dimension = this.parseDimension(value, name);
    if (dimension === undefined) {
      throw new Error(`${name} is required`);
    }
    return dimension;
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
