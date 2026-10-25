import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import type { DocumentTreeRenderer } from "../ports/DocumentTreeRenderer.js";

export class TreeCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  constructor(
    private readonly renderer: DocumentTreeRenderer,
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
      message: this.renderer.render(document, this.rootId),
      affectedIds: []
    };
  }
}
