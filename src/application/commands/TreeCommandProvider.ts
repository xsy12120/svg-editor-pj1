import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { TreeSnapshotBuilder } from "../queries/TreeSnapshotBuilder.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import { TreeCommand } from "./TreeCommand.js";

export class TreeCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "tree";
  readonly usage = "tree [shapeId]";

  constructor(private readonly snapshotBuilder: TreeSnapshotBuilder) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length > 1) {
      throw new Error(`usage: ${this.usage}`);
    }

    return new TreeCommand(this.snapshotBuilder, args[0]);
  }
}
