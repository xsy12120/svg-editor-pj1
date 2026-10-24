import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import type { DocumentTreeRenderer } from "../ports/DocumentTreeRenderer.js";
import { TreeCommand } from "./TreeCommand.js";

export class TreeCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "tree";

  constructor(private readonly renderer: DocumentTreeRenderer) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length > 0) {
      throw new Error("usage: tree");
    }

    return new TreeCommand(this.renderer);
  }
}
