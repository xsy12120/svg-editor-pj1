import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { ShapeDetailsRenderer } from "../ports/ShapeDetailsRenderer.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import { ShowCommand } from "./ShowCommand.js";

export class ShowCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "show";
  readonly usage = "show <shapeId>";

  constructor(private readonly renderer: ShapeDetailsRenderer) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error(`usage: ${this.usage}`);
    }
    return new ShowCommand(args[0], this.renderer);
  }
}
