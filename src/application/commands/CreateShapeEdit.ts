import type { EditorSession } from "../EditorSession.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";

export class CreateShapeEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly typeName: string,
    private readonly shape: Shape
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    document.addShape(this.shape);

    return {
      success: true,
      message: `${this.typeName}#${this.shape.id} created`,
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
      message: `${this.typeName}#${this.shape.id} deleted`,
      affectedIds: [this.shape.id]
    };
  }
}
