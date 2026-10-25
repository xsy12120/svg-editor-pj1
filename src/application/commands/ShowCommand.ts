import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { QueryCommand } from "./ExecutableCommand.js";
import type { ShapeDetailsRenderer } from "../ports/ShapeDetailsRenderer.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class ShowCommand implements QueryCommand<EditorSession> {
  readonly kind = "query";

  constructor(
    private readonly shapeId: string,
    private readonly renderer: ShapeDetailsRenderer
  ) {}

  validate(session: EditorSession): void {
    const document = requireDocument(session);
    if (!document.hasShape(this.shapeId)) {
      throw new Error(`no such shape: ${this.shapeId}`);
    }
  }

  execute(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const shape = document.findShape(this.shapeId);
    const placement = document.findPlacement(this.shapeId);
    if (shape === undefined || placement === undefined) {
      throw new Error(`no such shape: ${this.shapeId}`);
    }

    return {
      success: true,
      message: this.renderer.render(shape, placement.parent),
      affectedIds: []
    };
  }
}
