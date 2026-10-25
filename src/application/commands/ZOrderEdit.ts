import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export type ZOrderDirection = "front" | "back";

export class ZOrderEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly shape: Shape,
    private readonly originalPlacement: ShapePlacement,
    private readonly direction: ZOrderDirection
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    document.detachShape(this.shape.id);
    const siblings =
      this.originalPlacement.parent === null
        ? document.shapes
        : this.originalPlacement.parent.children;
    const index = this.direction === "front" ? siblings.length : 0;
    document.insertShapeAt(
      this.shape,
      this.originalPlacement.parent,
      index
    );

    return {
      success: true,
      message: `${this.shape.id} moved to ${this.direction}`,
      affectedIds: [this.shape.id]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    document.detachShape(this.shape.id);
    document.insertShapeAt(
      this.shape,
      this.originalPlacement.parent,
      this.originalPlacement.index
    );

    return {
      success: true,
      message: `${this.shape.id} z-order restored`,
      affectedIds: [this.shape.id]
    };
  }
}
