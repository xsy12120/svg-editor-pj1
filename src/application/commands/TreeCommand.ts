import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import type { DocumentTreeRenderer } from "../ports/DocumentTreeRenderer.js";

export class TreeCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  constructor(private readonly renderer: DocumentTreeRenderer) {}

  validate(session: EditorSession): void {
    if (session.document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }
  }

  execute(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return {
      success: true,
      message: this.renderer.render(document),
      affectedIds: []
    };
  }
}
