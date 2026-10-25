import type { EditorSession } from "../EditorSession.js";
import type { TreeSnapshotBuilder } from "../queries/TreeSnapshotBuilder.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";

export class TreeCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  constructor(
    private readonly snapshotBuilder: TreeSnapshotBuilder,
    private readonly rootId?: string
  ) {}

  validate(session: EditorSession): void {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }
    if (this.rootId !== undefined && !document.hasShape(this.rootId)) {
      throw new Error(`no such shape: ${this.rootId}`);
    }
  }

  execute(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return {
      success: true,
      message: "",
      affectedIds: [],
      view: {
        kind: "tree",
        snapshot: this.snapshotBuilder.build(document, this.rootId)
      }
    };
  }
}
