import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import type { DocumentTreeRenderer } from "../ports/DocumentTreeRenderer.js";
import { TreeCommand } from "./TreeCommand.js";

export class TreeCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "tree";
  readonly usage = "tree [shapeId]";

  constructor(private readonly renderer: DocumentTreeRenderer) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length > 1) {
      throw new Error(`usage: ${this.usage}`);
    }

    return new TreeCommand(this.renderer, args[0]);
  }
}
