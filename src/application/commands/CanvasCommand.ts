import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class CanvasCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  validate(session: EditorSession): void {
    requireDocument(session);
  }

  execute(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    return {
      success: true,
      message: `canvas ${document.width}x${document.height}`,
      affectedIds: []
    };
  }
}
