import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { ShapeDetailsSnapshotBuilder } from "../queries/ShapeDetailsSnapshotBuilder.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import { ShowCommand } from "./ShowCommand.js";

export class ShowCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "show";
  readonly usage = "show <shapeId>";

  constructor(private readonly snapshotBuilder: ShapeDetailsSnapshotBuilder) {}

  create(args: readonly string[]): QueryCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error(`usage: ${this.usage}`);
    }
    return new ShowCommand(args[0], this.snapshotBuilder);
  }
}
