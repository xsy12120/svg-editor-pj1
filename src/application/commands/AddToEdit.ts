import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import type { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class AddToEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly target: ContainerShape,
    private readonly shape: Shape,
    private readonly originalPlacement: ShapePlacement
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (document.detachShape(this.shape.id) !== this.shape) {
      throw new Error(`no such shape: ${this.shape.id}`);
    }
    this.target.addChild(this.shape);

    return {
      success: true,
      message: `${this.shape.id} added to g#${this.target.id}`,
      affectedIds: [this.shape.id, this.target.id]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (document.detachShape(this.shape.id) !== this.shape) {
      throw new Error(`no such shape: ${this.shape.id}`);
    }
    document.insertShapeAt(
      this.shape,
      this.originalPlacement.parent,
      this.originalPlacement.index
    );

    return {
      success: true,
      message: `${this.shape.id} restored`,
      affectedIds: [this.shape.id]
    };
  }
}
