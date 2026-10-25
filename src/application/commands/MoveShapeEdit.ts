import type { EditorSession } from "../EditorSession.js";
import type { GeometryState } from "../../domain/shapes/GeometryState.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";

export class MoveShapeEdit implements PreparedEdit<EditorSession> {
  private readonly originalGeometry: GeometryState;

  constructor(
    private readonly shape: Shape,
    private readonly dx: number,
    private readonly dy: number
  ) {
    this.originalGeometry = shape.captureGeometryState();
  }

  apply(): CommandResult {
    this.shape.move(this.dx, this.dy);
    const descriptor = this.shape.toDescriptor();
    const location =
      this.shape.anchor === undefined
        ? `moved by (${this.dx},${this.dy})`
        : `moved to (${this.shape.anchor.x},${this.shape.anchor.y})`;
    return {
      success: true,
      message: `${descriptor.typeName}#${this.shape.id} ${location}`,
      affectedIds: [this.shape.id]
    };
  }

  revert(): CommandResult {
    this.originalGeometry.restore();
    return {
      success: true,
      message: `${this.shape.id} move reverted`,
      affectedIds: [this.shape.id]
    };
  }
}
