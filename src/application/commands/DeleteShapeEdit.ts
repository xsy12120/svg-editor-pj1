import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class DeleteShapeEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly shape: Shape,
    private readonly placement: ShapePlacement
  ) {}

  apply(session: EditorSession): CommandResult {
    const removed = requireDocument(session).detachShape(this.shape.id);
    if (removed !== this.shape) {
      throw new Error(`no such shape: ${this.shape.id}`);
    }

    return {
      success: true,
      message: `${this.shape.id} deleted`,
      affectedIds: [this.shape.id]
    };
  }

  revert(session: EditorSession): CommandResult {
    requireDocument(session).insertShapeAt(
      this.shape,
      this.placement.parent,
      this.placement.index
    );

    return {
      success: true,
      message: `${this.shape.id} restored`,
      affectedIds: [this.shape.id]
    };
  }
}
