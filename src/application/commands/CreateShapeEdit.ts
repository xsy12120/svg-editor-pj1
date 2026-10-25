import type { EditorSession } from "../EditorSession.js";
import type { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { ShapeFeedback } from "./ShapeFeedback.js";

export class CreateShapeEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly shape: Shape,
    private readonly parent: ContainerShape | null,
    private readonly index: number
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    document.insertShapeAt(this.shape, this.parent, this.index);

    return {
      success: true,
      message: ShapeFeedback.created(this.shape, this.parent),
      affectedIds: [this.shape.id]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null || document.removeShape(this.shape.id) === undefined) {
      throw new Error(`no such shape: ${this.shape.id}`);
    }

    return {
      success: true,
      message: ShapeFeedback.deleted(this.shape),
      affectedIds: [this.shape.id]
    };
  }
}
